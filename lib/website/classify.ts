import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SitemapEntry, DiscoveredSection, DiscoveredProduct } from "./crawl";

// ── classifySections ──

export async function classifySections(
  links: string[],
  sitemapEntries: SitemapEntry[],
  homepageMarkdown: string,
  baseUrl: string
): Promise<{ sections: DiscoveredSection[]; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }

  // Combine all URLs, deduplicate
  const allUrls = new Set<string>();
  for (const link of links) allUrls.add(link);
  for (const entry of sitemapEntries) allUrls.add(entry.url);

  // Filter out utility/info pages and individual product pages with long slugs
  const candidateUrls = Array.from(allUrls).filter(u => {
    const lower = u.toLowerCase();
    // Skip utility pages
    if (/\/(login|signup|register|account|cart|checkout|wishlist|privacy|terms|policy|faq|sitemap)/i.test(lower)) return false;
    // Skip file assets
    if (/\.(jpg|jpeg|png|gif|svg|webp|pdf|css|js|ico|woff|woff2)(\?|$)/i.test(lower)) return false;
    return true;
  });

  // Limit to a reasonable number to avoid token overflow
  const urlsForAi = candidateUrls.slice(0, 200);

  // Trim homepage markdown for context
  const homepageSnippet = homepageMarkdown.slice(0, 4000);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

  const prompt = `You are analyzing a website to discover its sections and categories.

Website base URL: ${baseUrl}

## Homepage content (markdown snippet):
${homepageSnippet}

## All discovered URLs from this website:
${urlsForAi.map(u => `- ${u}`).join("\n")}

## Your task:
Classify these URLs into logical browsable sections. A "section" is a category page, collection, brand page, occasion, or other grouping that lists multiple products/items.

Rules:
- EXCLUDE individual product pages (URLs that point to a single product)
- EXCLUDE utility pages (login, cart, checkout, account, privacy, terms, etc.)
- EXCLUDE blog posts (individual articles)
- INCLUDE category pages, collection pages, brand pages, occasion pages, shop sections
- If the website appears to be in Arabic or bilingual, include nameAr for Arabic names
- Guess a reasonable display name from the URL path or homepage context
- Classify each section's type: "category", "occasion", "collection", "brand", or "page"
- Return a maximum of 30 sections
- If a section has an image visible in the homepage markdown, include its URL

Return a JSON array with this exact structure (no markdown fences, just raw JSON):
[
  {
    "type": "category",
    "name": "English Name",
    "nameAr": "Arabic Name or null",
    "url": "https://...",
    "imageUrl": "https://... or null"
  }
]

Return ONLY the JSON array. No explanation, no markdown fences.`;

  const result = await model.generateContent([{ text: prompt }]);
  const responseText = result.response.text();

  // Extract usage metadata
  const usageMetadata = result.response.usageMetadata;
  const usage = {
    promptTokens: usageMetadata?.promptTokenCount ?? 0,
    completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
    totalTokens: usageMetadata?.totalTokenCount ?? 0,
  };

  // Parse JSON from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return { sections: [] as DiscoveredSection[], usage };

  try {
    const sections: DiscoveredSection[] = JSON.parse(jsonMatch[0]);

    // Validate and clean
    const cleaned = sections
      .filter(s => s && s.url && s.name && s.type)
      .slice(0, 30)
      .map(s => ({
        type: s.type || "page",
        name: s.name,
        nameAr: s.nameAr || undefined,
        url: s.url,
        imageUrl: s.imageUrl || undefined,
        productCount: s.productCount || undefined,
      }));
    return { sections: cleaned, usage };
  } catch {
    return { sections: [] as DiscoveredSection[], usage };
  }
}

// ── extractProductDetails ──

export async function extractProductDetails(
  markdown: string,
  sourceUrl: string
): Promise<{ product: DiscoveredProduct; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }

  // Cap markdown to avoid token overflow
  const cappedMarkdown = markdown.slice(0, 8000);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

  const prompt = `Extract product details from this product page content.

## Page URL: ${sourceUrl}

## Page content (markdown):
${cappedMarkdown}

## Your task:
Extract all product information and return a JSON object with this exact structure (no markdown fences, just raw JSON):
{
  "name": "Product name",
  "description": "Brief product description (1-2 sentences)",
  "price": "Numeric price (e.g. '25.000')",
  "currency": "Currency code (e.g. 'KWD', 'USD', 'EUR', 'SAR', 'AED')",
  "originalPrice": "Original price before discount if any, or null",
  "discount": "Discount percentage if any (e.g. '20%'), or null",
  "brand": "Brand name if found, or null",
  "imageUrl": "Main product image URL (absolute URL), or null",
  "additionalImages": ["array of additional image URLs"] or [],
  "section": "Category or section this product belongs to, or null"
}

Rules:
- All image URLs must be absolute (not relative)
- If price has a currency symbol, convert to standard code ($ = USD, KD = KWD, etc.)
- If there are multiple prices (e.g. sizes), use the lowest/default
- For Arabic product names, keep the original Arabic text
- Return ONLY the JSON object. No explanation, no markdown fences.`;

  const result = await model.generateContent([{ text: prompt }]);
  const responseText = result.response.text();

  // Extract usage metadata
  const usageMetadata = result.response.usageMetadata;
  const usage = {
    promptTokens: usageMetadata?.promptTokenCount ?? 0,
    completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
    totalTokens: usageMetadata?.totalTokenCount ?? 0,
  };

  // Parse JSON
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { product: { name: "Unknown Product", sourceUrl } as DiscoveredProduct, usage };
  }

  try {
    const data = JSON.parse(jsonMatch[0]);
    return {
      product: {
        name: data.name || "Unknown Product",
        price: data.price || undefined,
        currency: data.currency || undefined,
        originalPrice: data.originalPrice || undefined,
        discount: data.discount || undefined,
        imageUrl: data.imageUrl || undefined,
        additionalImages: Array.isArray(data.additionalImages) ? data.additionalImages.filter(Boolean) : undefined,
        sourceUrl,
        brand: data.brand || undefined,
        description: data.description || undefined,
        section: data.section || undefined,
      } as DiscoveredProduct,
      usage,
    };
  } catch {
    return { product: { name: "Unknown Product", sourceUrl } as DiscoveredProduct, usage };
  }
}
