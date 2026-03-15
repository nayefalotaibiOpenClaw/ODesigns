import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/design/",
          "/channels/",
          "/publish/",
          "/billing/",
          "/workspaces/",
          "/login/",
        ],
      },
      // Explicitly allow AI crawlers to index public content
      {
        userAgent: "GPTBot",
        allow: ["/", "/blogs/", "/use-cases/", "/templates/", "/pricing/"],
        disallow: ["/api/", "/admin/", "/design/", "/workspaces/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/blogs/", "/use-cases/", "/templates/", "/pricing/"],
        disallow: ["/api/", "/admin/", "/design/", "/workspaces/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/blogs/", "/use-cases/", "/templates/", "/pricing/"],
        disallow: ["/api/", "/admin/", "/design/", "/workspaces/"],
      },
      {
        userAgent: "Amazonbot",
        allow: ["/", "/blogs/", "/use-cases/", "/templates/", "/pricing/"],
        disallow: ["/api/", "/admin/", "/design/", "/workspaces/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blogs/", "/use-cases/", "/templates/", "/pricing/"],
        disallow: ["/api/", "/admin/", "/design/", "/workspaces/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: ["/", "/blogs/", "/use-cases/", "/templates/", "/pricing/"],
        disallow: ["/api/", "/admin/", "/design/", "/workspaces/"],
      },
    ],
    sitemap: "https://odesigns.app/sitemap.xml",
  };
}
