// ── Types ──

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  type: string; // "page", "product", "category", "brand", etc.
}

export interface DiscoveredSection {
  type: string; // "category", "occasion", "collection", "brand", "page"
  name: string;
  nameAr?: string;
  url: string;
  imageUrl?: string;
  productCount?: number;
}

export interface DiscoveredProduct {
  name: string;
  price?: string;
  currency?: string;
  originalPrice?: string;
  discount?: string;
  imageUrl?: string;
  additionalImages?: string[];
  sourceUrl: string;
  brand?: string;
  description?: string;
  section?: string;
}

// ── URL classification helpers ──

const URL_TYPE_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /\/(product|item|sku|goods)\b/i, type: "product" },
  { pattern: /\/(category|categories|department|departments)\b/i, type: "category" },
  { pattern: /\/(collection|collections|shop)\b/i, type: "collection" },
  { pattern: /\/(brand|brands|vendor|vendors)\b/i, type: "brand" },
  { pattern: /\/(occasion|occasions|event|events)\b/i, type: "occasion" },
  { pattern: /\/(blog|article|news|post)\b/i, type: "blog" },
  { pattern: /\/(faq|help|support|contact|about|terms|privacy|policy)\b/i, type: "info" },
  { pattern: /\/(login|signup|register|account|cart|checkout|wishlist)\b/i, type: "utility" },
];

function classifyUrlType(url: string): string {
  for (const { pattern, type } of URL_TYPE_PATTERNS) {
    if (pattern.test(url)) return type;
  }
  return "page";
}

function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

// ── fetchSitemap ──

export async function fetchSitemap(baseUrl: string): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  // Normalize base URL
  const base = baseUrl.replace(/\/+$/, "");

  // Try sitemap.xml directly
  let xml = await fetchXml(`${base}/sitemap.xml`);

  // If not found, check robots.txt for Sitemap directive
  if (!xml) {
    try {
      const robotsRes = await fetch(`${base}/robots.txt`, {
        signal: AbortSignal.timeout(10000),
      });
      if (robotsRes.ok) {
        const robotsTxt = await robotsRes.text();
        const sitemapMatch = robotsTxt.match(/^Sitemap:\s*(.+)$/im);
        if (sitemapMatch) {
          xml = await fetchXml(sitemapMatch[1].trim());
        }
      }
    } catch {
      // robots.txt not available
    }
  }

  if (!xml) return entries;

  // Check if this is a sitemap index (contains <sitemap> elements)
  const sitemapIndexUrls: string[] = [];
  const sitemapIndexRegex = /<sitemap[^>]*>[\s\S]*?<loc>\s*(.*?)\s*<\/loc>[\s\S]*?<\/sitemap>/gi;
  let sitemapIndexMatch: RegExpExecArray | null;
  while ((sitemapIndexMatch = sitemapIndexRegex.exec(xml)) !== null) {
    sitemapIndexUrls.push(sitemapIndexMatch[1].trim());
  }

  if (sitemapIndexUrls.length > 0) {
    // Fetch up to 5 child sitemaps in parallel
    const childXmls = await Promise.all(
      sitemapIndexUrls.slice(0, 5).map(u => fetchXml(u))
    );
    for (const childXml of childXmls) {
      if (childXml) {
        entries.push(...parseUrlsFromSitemapXml(childXml));
      }
    }
  } else {
    entries.push(...parseUrlsFromSitemapXml(xml));
  }

  return entries;
}

async function fetchXml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SyloCrawler/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Basic check that it looks like XML
    if (!text.includes("<url") && !text.includes("<sitemap")) return null;
    return text;
  } catch {
    return null;
  }
}

function parseUrlsFromSitemapXml(xml: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const urlBlocks = xml.match(/<url[^>]*>[\s\S]*?<\/url>/gi) || [];

  for (const block of urlBlocks) {
    const loc = block.match(/<loc>\s*([\s\S]*?)\s*<\/loc>/i)?.[1]?.trim();
    if (!loc) continue;

    const lastmod = block.match(/<lastmod>\s*([\s\S]*?)\s*<\/lastmod>/i)?.[1]?.trim();

    entries.push({
      url: loc,
      lastmod: lastmod || undefined,
      type: classifyUrlType(loc),
    });
  }

  return entries;
}

// ── fetchPageViaJina ──

export async function fetchPageViaJina(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const res = await fetch(jinaUrl, {
    headers: {
      Accept: "text/markdown",
    },
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    throw new Error(`Jina Reader returned ${res.status} for ${url}`);
  }

  return res.text();
}

// ── extractLinks ──

export async function extractLinks(markdown: string, baseUrl: string): Promise<string[]> {
  const seen = new Set<string>();
  const results: string[] = [];

  // Match markdown links: [text](url) and ![alt](url)
  const linkPattern = /!?\[(?:[^\]]*)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const href = match[1].trim();
    // Skip anchors, mailto, tel, javascript, data URIs
    if (/^(#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;

    const resolved = resolveUrl(href, baseUrl);
    if (!resolved) continue;

    // Only keep links from the same domain
    try {
      const resolvedHost = new URL(resolved).hostname;
      const baseHost = new URL(baseUrl).hostname;
      if (resolvedHost !== baseHost) continue;
    } catch {
      continue;
    }

    // Strip fragments
    const clean = resolved.split("#")[0];
    if (!seen.has(clean)) {
      seen.add(clean);
      results.push(clean);
    }
  }

  return results;
}

// ── extractProductsFromMarkdown ──

// Currency patterns: KD, KWD, $, USD, EUR, SAR, AED, GBP, etc.
const PRICE_REGEX = /(?:(?:KW?D|SAR|AED|USD|EUR|GBP|QAR|BHD|OMR|JOD|EGP|TRY)\s*[\d,.]+|[\d,.]+\s*(?:KW?D|SAR|AED|USD|EUR|GBP|QAR|BHD|OMR|JOD|EGP|TRY)|[$\u20AC\u00A3\u00A5\u20B9]\s*[\d,.]+|[\d,.]+\s*[$\u20AC\u00A3\u00A5\u20B9])/gi;

const CURRENCY_MAP: Record<string, string> = {
  KD: "KWD", KWD: "KWD", SAR: "SAR", AED: "AED", USD: "USD",
  EUR: "EUR", GBP: "GBP", QAR: "QAR", BHD: "BHD", OMR: "OMR",
  JOD: "JOD", EGP: "EGP", TRY: "TRY",
  "$": "USD", "\u20AC": "EUR", "\u00A3": "GBP", "\u00A5": "JPY", "\u20B9": "INR",
};

function extractCurrency(priceStr: string): string | undefined {
  for (const [symbol, code] of Object.entries(CURRENCY_MAP)) {
    if (priceStr.includes(symbol)) return code;
  }
  return undefined;
}

function extractNumericPrice(priceStr: string): string {
  const nums = priceStr.match(/[\d,.]+/);
  return nums ? nums[0] : priceStr;
}

export async function extractProductsFromMarkdown(
  markdown: string,
  baseUrl: string
): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];
  const lines = markdown.split("\n");

  let currentImage: string | undefined;
  let currentName: string | undefined;
  let currentPrices: string[] = [];

  const flushProduct = () => {
    if (currentName && (currentImage || currentPrices.length > 0)) {
      const price = currentPrices[0];
      const originalPrice = currentPrices.length > 1 ? currentPrices[1] : undefined;

      let discount: string | undefined;
      if (price && originalPrice) {
        const p = parseFloat(extractNumericPrice(price).replace(",", ""));
        const o = parseFloat(extractNumericPrice(originalPrice).replace(",", ""));
        if (o > p && o > 0) {
          discount = `${Math.round(((o - p) / o) * 100)}%`;
        }
      }

      products.push({
        name: currentName,
        price: price ? extractNumericPrice(price) : undefined,
        currency: price ? extractCurrency(price) : undefined,
        originalPrice: originalPrice ? extractNumericPrice(originalPrice) : undefined,
        discount,
        imageUrl: currentImage ? (resolveUrl(currentImage, baseUrl) || currentImage) : undefined,
        sourceUrl: baseUrl,
      });
    }
    currentImage = undefined;
    currentName = undefined;
    currentPrices = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Image line
    const imgMatch = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      // If we already have a name buffered, flush before starting new product
      if (currentName) flushProduct();
      currentImage = imgMatch[2].trim();
      // Use alt text as fallback name
      if (imgMatch[1] && !currentName) {
        currentName = imgMatch[1].trim();
      }
      continue;
    }

    // Heading or bold text (product name)
    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)/) || trimmed.match(/^\*\*(.+?)\*\*/);
    if (headingMatch) {
      const text = headingMatch[1].trim();
      // Skip very long "headings" — likely descriptions
      if (text.length <= 120) {
        if (currentName && currentName !== text) flushProduct();
        currentName = text;
      }
      continue;
    }

    // Price line
    const priceMatches = trimmed.match(PRICE_REGEX);
    if (priceMatches && currentName) {
      currentPrices.push(...priceMatches);
      continue;
    }

    // Blank line or separator can indicate product boundary
    if (trimmed === "" || trimmed === "---") {
      if (currentName) flushProduct();
    }
  }

  // Flush last product
  flushProduct();

  return products;
}
