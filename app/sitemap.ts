import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config";

// Revalidate every hour so dynamic pages from Convex stay fresh
export const revalidate = 3600;

function localizedUrl(baseUrl: string, path: string, locale: string): string {
  return locale === DEFAULT_LOCALE ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
}

function withAlternates(baseUrl: string, path: string) {
  return {
    languages: {
      ...Object.fromEntries(
        LOCALES.map((l) => [l, localizedUrl(baseUrl, path, l)])
      ),
      "x-default": localizedUrl(baseUrl, path, DEFAULT_LOCALE),
    } as Record<string, string>,
  };
}

function roundPriority(priority: number): number {
  return Math.round(priority * 100) / 100;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://odesigns.app";

  // Static pages with all locale variants
  const staticPaths: { path: string; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/blogs", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
    { path: "/use-cases", changeFrequency: "monthly", priority: 0.8 },
    { path: "/templates", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/data-deletion", changeFrequency: "yearly", priority: 0.2 },
  ];

  // Generate entries for each locale for static pages
  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap(({ path, changeFrequency, priority }) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(baseUrl, path || "/", locale),
      lastModified: new Date(),
      changeFrequency,
      priority: roundPriority(locale === DEFAULT_LOCALE ? priority : priority * 0.9),
      alternates: withAlternates(baseUrl, path || "/"),
    }))
  );

  // Dynamic use-case and template pages from DB
  let useCasePages: MetadataRoute.Sitemap = [];
  let templateSitemapPages: MetadataRoute.Sitemap = [];
  try {
    const useCases = await fetchQuery(api.blogs.listByType, { type: "use-case", language: "en" });
    const uniqueUseCaseSlugs = [...new Set(useCases.map((uc) => uc.slug))];
    useCasePages = uniqueUseCaseSlugs.flatMap((slug) =>
      LOCALES.map((locale) => ({
        url: localizedUrl(baseUrl, `/use-cases/${slug}`, locale),
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: locale === DEFAULT_LOCALE ? 0.7 : 0.6,
        alternates: withAlternates(baseUrl, `/use-cases/${slug}`),
      }))
    );

    const templates = await fetchQuery(api.blogs.listByType, { type: "template", language: "en" });
    const uniqueTemplateSlugs = [...new Set(templates.map((tp) => tp.slug))];
    templateSitemapPages = uniqueTemplateSlugs.flatMap((slug) =>
      LOCALES.map((locale) => ({
        url: localizedUrl(baseUrl, `/templates/${slug}`, locale),
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: locale === DEFAULT_LOCALE ? 0.7 : 0.6,
        alternates: withAlternates(baseUrl, `/templates/${slug}`),
      }))
    );
  } catch (error) {
    console.error("[sitemap] Failed to fetch use-cases/templates:", error);
  }

  // Dynamic blog pages — group by slug to link alternates across languages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogs = await fetchQuery(api.blogs.list, {});
    // Group blogs by slug to find cross-language alternates
    const blogsBySlug = new Map<string, { language: string; publishedAt: number }[]>();
    for (const blog of blogs) {
      const existing = blogsBySlug.get(blog.slug) || [];
      existing.push({ language: blog.language || "en", publishedAt: blog.publishedAt });
      blogsBySlug.set(blog.slug, existing);
    }

    blogPages = blogs.map((blog) => {
      const blogLocale = blog.language || "en";
      const path = `/blogs/${blog.slug}`;
      const variants = blogsBySlug.get(blog.slug) || [];
      // If this slug exists in multiple languages, add alternates
      const alternates = variants.length > 1
        ? {
            languages: {
              ...Object.fromEntries(
                variants.map((v) => [v.language, localizedUrl(baseUrl, path, v.language === "en" ? DEFAULT_LOCALE : v.language)])
              ),
              "x-default": localizedUrl(baseUrl, path, DEFAULT_LOCALE),
            } as Record<string, string>,
          }
        : undefined;
      return {
        url: localizedUrl(baseUrl, path, blogLocale === "en" ? DEFAULT_LOCALE : blogLocale),
        lastModified: new Date(blog.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        ...(alternates && { alternates }),
      };
    });
  } catch (error) {
    console.error("[sitemap] Failed to fetch blogs:", error);
  }

  return [
    ...staticPages,
    ...useCasePages,
    ...templateSitemapPages,
    ...blogPages,
  ];
}
