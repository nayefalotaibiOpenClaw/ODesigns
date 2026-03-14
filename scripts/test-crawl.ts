/**
 * Test script for the crawl pipeline — calls crawl + classify functions directly.
 * No auth needed, no dev server needed.
 *
 * Usage: npx tsx scripts/test-crawl.ts
 *
 * Requires GOOGLE_AI_API_KEY in .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (no dotenv dependency)
try {
  const envPath = resolve(import.meta.dirname || __dirname, "../.env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not found — rely on existing env vars
}
import { fetchPageViaJina, extractLinks, fetchSitemap } from "../lib/website/crawl";
import { classifySections, extractProductsFromPage } from "../lib/website/classify";

const ALL_SITES = [
  { name: "Floward", url: "https://floward.com/en-kw" },
  { name: "TrySeasons", url: "https://tryseasons.co" },
  { name: "Cocoanut (Ordable)", url: "https://cocoanut.ordable.com" },
  { name: "Hassans", url: "https://hassans.com" },
  { name: "Lenskart", url: "https://www.lenskart.com" },
  { name: "Ounass Kuwait", url: "https://kuwait.ounass.com" },
  { name: "Teeela", url: "https://teeela.com" },
];

// Pass a number arg to limit sites: npx tsx scripts/test-crawl.ts 3
const siteLimit = parseInt(process.argv[2] || "0", 10);
const SITES = siteLimit > 0 ? ALL_SITES.slice(0, siteLimit) : ALL_SITES;

async function testSite(site: { name: string; url: string }) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔍 ${site.name} — ${site.url}`);
  console.log("=".repeat(60));

  const parsedUrl = new URL(site.url);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

  // Step 1: Fetch homepage via Jina
  console.log("\n📡 Fetching homepage via Jina...");
  let homepageMarkdown = "";
  try {
    homepageMarkdown = await fetchPageViaJina(site.url);
    console.log(`  ✅ Got ${homepageMarkdown.length} chars`);
  } catch (err) {
    console.log(`  ❌ Jina failed: ${err instanceof Error ? err.message : err}`);
    return;
  }

  // Step 2: Extract links
  let homepageLinks: string[] = [];
  try {
    homepageLinks = await extractLinks(homepageMarkdown, baseUrl);
    console.log(`  🔗 ${homepageLinks.length} links extracted`);
  } catch {
    console.log(`  ⚠️ Link extraction failed`);
  }

  // Step 3: Fetch sitemap
  let sitemapEntries: Awaited<ReturnType<typeof fetchSitemap>> = [];
  try {
    sitemapEntries = await fetchSitemap(baseUrl);
    console.log(`  🗺️ ${sitemapEntries.length} sitemap entries`);
  } catch {
    console.log(`  ⚠️ No sitemap`);
  }

  // Step 4: AI — classify sections + extract homepage products (parallel)
  console.log("\n🧠 AI: Classifying sections + extracting products...");
  let sections: Awaited<ReturnType<typeof classifySections>>["sections"] = [];
  let homepageProducts: Awaited<ReturnType<typeof extractProductsFromPage>>["products"] = [];

  try {
    const [classifyResult, productsResult] = await Promise.all([
      classifySections(homepageLinks, sitemapEntries, homepageMarkdown, baseUrl),
      extractProductsFromPage(homepageMarkdown, site.url, 10),
    ]);
    sections = classifyResult.sections;
    homepageProducts = productsResult.products;
    console.log(`  ✅ ${sections.length} sections, ${homepageProducts.length} homepage products`);
    console.log(`     Tokens: ${classifyResult.usage.totalTokens + productsResult.usage.totalTokens}`);
  } catch (err) {
    console.log(`  ❌ AI failed: ${err instanceof Error ? err.message : err}`);
  }

  // Show sections
  if (sections.length > 0) {
    console.log(`\n  📂 Sections (first 5):`);
    sections.slice(0, 5).forEach((s, i) => {
      console.log(`     ${i + 1}. [${s.type}] ${s.name}${s.nameAr ? ` (${s.nameAr})` : ""}`);
      console.log(`        ${s.url}`);
    });
  }

  // Show homepage products
  if (homepageProducts.length > 0) {
    console.log(`\n  🛍️ Homepage Products (first 5):`);
    homepageProducts.slice(0, 5).forEach((p, i) => {
      console.log(`     ${i + 1}. ${p.name} | ${p.price || "-"} ${p.currency || ""} ${p.discount ? `(${p.discount})` : ""}`);
      if (p.imageUrl) console.log(`        img: ${p.imageUrl.slice(0, 80)}...`);
    });
  }

  // Step 5: Fetch first section and extract products with AI
  if (sections.length > 0) {
    const section = sections[0];
    console.log(`\n📡 Fetching section: "${section.name}" → ${section.url}`);

    try {
      const sectionMarkdown = await fetchPageViaJina(section.url);
      console.log(`  ✅ Got ${sectionMarkdown.length} chars`);

      const sectionResult = await extractProductsFromPage(sectionMarkdown, section.url, 6);
      console.log(`  🛍️ AI found ${sectionResult.products.length} products (${sectionResult.usage.totalTokens} tokens)`);

      if (sectionResult.products.length > 0) {
        sectionResult.products.forEach((p, i) => {
          console.log(`     ${i + 1}. ${p.name} | ${p.price || "-"} ${p.currency || ""} ${p.discount ? `(${p.discount})` : ""}`);
          if (p.imageUrl) console.log(`        img: ${p.imageUrl.slice(0, 80)}...`);
        });
      } else {
        console.log(`  ⚠️ No products found in section`);
      }
    } catch (err) {
      console.log(`  ❌ Section fetch failed: ${err instanceof Error ? err.message : err}`);
    }
  }
}

async function main() {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error("❌ GOOGLE_AI_API_KEY not set. Add it to .env.local");
    process.exit(1);
  }

  console.log("🚀 Testing crawl pipeline against real e-commerce sites");
  console.log(`   Sites: ${SITES.length}\n`);

  // Run sequentially to avoid rate limits
  for (const site of SITES) {
    try {
      await testSite(site);
    } catch (err) {
      console.log(`\n  💥 Unexpected error: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ All tests complete");
}

main().catch(console.error);
