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

// Currency patterns: KD, KWD, $, USD, EUR, SAR, AED, GBP, Arabic symbols (د.ك, ر.س, د.إ), etc.
const PRICE_REGEX = /(?:(?:KW?D|SAR|AED|USD|EUR|GBP|QAR|BHD|OMR|JOD|EGP|TRY|د\.ك|د\.إ|ر\.س|ر\.ق|د\.ب|ر\.ع|د\.أ|ج\.م|ل\.ت)\s*[\d,.]+|[\d,.]+\s*(?:KW?D|SAR|AED|USD|EUR|GBP|QAR|BHD|OMR|JOD|EGP|TRY|د\.ك|د\.إ|ر\.س|ر\.ق|د\.ب|ر\.ع|د\.أ|ج\.م|ل\.ت)|[$\u20AC\u00A3\u00A5\u20B9]\s*[\d,.]+|[\d,.]+\s*[$\u20AC\u00A3\u00A5\u20B9])/gi;

const CURRENCY_MAP: Record<string, string> = {
  KD: "KWD", KWD: "KWD", SAR: "SAR", AED: "AED", USD: "USD",
  EUR: "EUR", GBP: "GBP", QAR: "QAR", BHD: "BHD", OMR: "OMR",
  JOD: "JOD", EGP: "EGP", TRY: "TRY",
  "$": "USD", "\u20AC": "EUR", "\u00A3": "GBP", "\u00A5": "JPY", "\u20B9": "INR",
  // Arabic currency symbols
  "د.ك": "KWD", "د.إ": "AED", "ر.س": "SAR", "ر.ق": "QAR",
  "د.ب": "BHD", "ر.ع": "OMR", "د.أ": "JOD", "ج.م": "EGP", "ل.ت": "TRY",
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

// Common navigation / UI element patterns to skip
const NAV_UI_PATTERNS = [
  /^(express|same[- ]?day)\s+delivery$/i,
  /^(no\s+)?address\s+hassle$/i,
  /^(premium|free)\s+(flowers|gifts|shipping)/i,
  /^(view|edit)\s+(my\s+)?profile$/i,
  /^my\s+(orders?|subscriptions?|account|wishlist|addresses?|wallet|notifications?)$/i,
  /^(sign\s+in|log\s+in|sign\s+up|register|log\s+out|sign\s+out)$/i,
  /^(cart|shopping\s+cart|bag|checkout)$/i,
  /^(menu|search|close|back|home|share|copy|print)$/i,
  /^(notifications?|settings?|preferences?)$/i,
  /^(flag|logo|icon|badge|banner|arrow|chevron)$/i,
  /^(download|install)\s+(the\s+)?app$/i,
  /^(follow\s+us|connect|social)$/i,
  /^(terms|privacy|policy|faq|help|support|about|contact)$/i,
  /^(customer\s+service|live\s+chat)$/i,
  /^[\w-]+[-_](icon|logo|badge)$/i,      // e.g. "cartIcon", "cart-icon"
  /^(icon|logo|img|image)\s*\d*$/i,       // "icon", "Image", "img2"
  /^category$/i,                           // generic "Category" alt text
  /^(explore|discover|browse|view\s+all)$/i,
  /^(delivery\s+to|ship\s+to|location)$/i,
];

const NAV_UI_IMAGE_PATTERNS = [
  /\/(icon|icons|logo|logos|badge|badges|sprite|sprites|favicon)\//i,
  /[-_](icon|logo|badge|sprite|favicon)\./i,
  /\.(svg)(\?|$)/i,    // SVGs are almost always icons/UI
  /\/static\/(media|icons)\//i,
  /\/assets\/(icons|logos)\//i,
  /\/nav[-_/]/i,
  /\/header[-_/]/i,
  /\/footer[-_/]/i,
  /\bflag[-_.]?\b/i,
  /\bcart[-_.]icon/i,
  /\bdelivery[-_.]icon/i,
];

/**
 * Clean Jina alt-text artifacts.
 * Jina Reader adds prefixes like "Image 1:", "list-item", etc.
 */
function cleanAltText(alt: string): string {
  return alt
    .replace(/^Image\s+\d+:\s*/i, "")   // "Image 1: Product" → "Product"
    .replace(/^list-item/i, "")           // "list-itemFlowers" → "Flowers"
    .trim();
}

function isNavOrUiElement(name: string, imageUrl?: string): boolean {
  const trimmedName = name.trim();

  // Check name against nav/UI patterns
  for (const pattern of NAV_UI_PATTERNS) {
    if (pattern.test(trimmedName)) return true;
  }

  // Very short names (1-2 chars) are likely icons
  if (trimmedName.length <= 2) return true;

  // Check image URL against nav/UI image patterns
  if (imageUrl) {
    for (const pattern of NAV_UI_IMAGE_PATTERNS) {
      if (pattern.test(imageUrl)) return true;
    }
  }

  return false;
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
      // Skip navigation/UI elements
      if (isNavOrUiElement(currentName, currentImage)) {
        currentImage = undefined;
        currentName = undefined;
        currentPrices = [];
        return;
      }

      const price = currentPrices[0];
      const originalPrice = currentPrices.length > 1 ? currentPrices[1] : undefined;

      let discount: string | undefined;
      if (price && originalPrice) {
        const p = parseFloat(extractNumericPrice(price).replace(/,/g, ""));
        const o = parseFloat(extractNumericPrice(originalPrice).replace(/,/g, ""));
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

    // Blank line or separator → product boundary
    if (trimmed === "" || trimmed === "---") {
      if (currentName) flushProduct();
      continue;
    }

    // Extract all parts from the line in one pass.
    // Many e-commerce sites (via Jina) put image + price + heading on a single line, e.g.:
    //   [![Image 98: Product Name](img_url) KWD 90 ### Product Name](link)
    // We need to extract image, price, and heading from the same line.

    let remaining = trimmed;

    // 1. Extract image if present (anywhere in line)
    const imgMatch = remaining.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      const altText = cleanAltText(imgMatch[1] || "");
      const imgUrl = imgMatch[2].trim();

      // New image means new product — flush any buffered one
      if (currentName) flushProduct();

      currentImage = imgUrl;
      // Use cleaned alt text as fallback name
      if (altText) {
        currentName = altText;
      }

      // Remove the image markdown from remaining text so we can parse price/heading
      remaining = remaining.replace(imgMatch[0], " ");
    }

    // 2. Extract heading from remaining text (### Name or **Name**)
    // Capture everything after ### until end of string, then clean trailing link syntax
    const headingMatch = remaining.match(/#{1,4}\s+(.+)/) || remaining.match(/\*\*(.+?)\*\*/);
    if (headingMatch) {
      const text = headingMatch[1].trim()
        // Strip trailing markdown link syntax e.g. "](https://...)" or just "]"
        .replace(/\]\([^)]*\)\s*$/, "")
        .replace(/\]\s*$/, "")
        .trim();
      if (text.length >= 3 && text.length <= 120) {
        // Heading is a better name than alt text — prefer it
        currentName = text;
      }
      // Remove heading from remaining
      remaining = remaining.replace(headingMatch[0], " ");
    }

    // 3. Extract prices from remaining text
    const priceMatches = remaining.match(PRICE_REGEX);
    if (priceMatches && currentName) {
      currentPrices.push(...priceMatches);
    }

    // 4. If this line had no image but looks like a standalone heading (at line start)
    if (!imgMatch && !headingMatch) {
      const standaloneHeading = trimmed.match(/^#{1,4}\s+(.+)/);
      if (standaloneHeading) {
        const text = standaloneHeading[1].trim();
        if (text.length >= 3 && text.length <= 120) {
          if (currentName && currentName !== text) flushProduct();
          currentName = text;
        }
        continue;
      }

      const standaloneBold = trimmed.match(/^\*\*(.+?)\*\*/);
      if (standaloneBold) {
        const text = standaloneBold[1].trim();
        if (text.length >= 3 && text.length <= 120) {
          if (currentName && currentName !== text) flushProduct();
          currentName = text;
        }
        continue;
      }

      // Standalone price line (no image or heading on this line)
      if (priceMatches && currentName) {
        // Prices already captured above
        continue;
      }
    }
  }

  // Flush last product
  flushProduct();

  return products;
}
