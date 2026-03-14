import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { useCases } from "@/lib/seo/use-cases";
import { templatePages } from "@/lib/seo/templates";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config";

function localizedUrl(baseUrl: string, path: string, locale: string): string {
  return locale === DEFAULT_LOCALE ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
}

function withAlternates(baseUrl: string, path: string) {
  return {
    languages: Object.fromEntries(
      LOCALES.map((l) => [l, localizedUrl(baseUrl, path, l)])
    ) as Record<string, string>,
  };
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
  ];

  // Generate entries for each locale for static pages
  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap(({ path, changeFrequency, priority }) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(baseUrl, path || "/", locale),
      lastModified: new Date(),
      changeFrequency,
      priority: locale === DEFAULT_LOCALE ? priority : priority * 0.9,
      alternates: withAlternates(baseUrl, path || "/"),
    }))
  );

  // Use case pages (all locales)
  const useCasePages: MetadataRoute.Sitemap = useCases.flatMap((uc) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(baseUrl, `/use-cases/${uc.slug}`, locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: locale === DEFAULT_LOCALE ? 0.7 : 0.6,
      alternates: withAlternates(baseUrl, `/use-cases/${uc.slug}`),
    }))
  );

  // Template pages (all locales)
  const templateSitemapPages: MetadataRoute.Sitemap = templatePages.flatMap((tp) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(baseUrl, `/templates/${tp.slug}`, locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: locale === DEFAULT_LOCALE ? 0.7 : 0.6,
      alternates: withAlternates(baseUrl, `/templates/${tp.slug}`),
    }))
  );

  // Dynamic blog pages — only generate for the blog's own language
  // English blogs get the default locale URL, Arabic blogs get /ar/ prefix
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogs = await fetchQuery(api.blogs.list, {});
    blogPages = blogs.map((blog) => {
      const blogLocale = blog.language || "en";
      const path = `/blogs/${blog.slug}`;
      return {
        url: localizedUrl(baseUrl, path, blogLocale === "en" ? DEFAULT_LOCALE : blogLocale),
        lastModified: new Date(blog.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });
  } catch {
    // If Convex is unavailable during build, return static pages only
  }

  return [
    ...staticPages,
    ...useCasePages,
    ...templateSitemapPages,
    ...blogPages,
  ];
}
