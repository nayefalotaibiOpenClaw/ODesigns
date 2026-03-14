import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { generateAlternates } from "@/lib/i18n/seo";
import TemplatePageClient from "./TemplatePageClient";

const BASE_URL = "https://odesigns.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const template = await fetchQuery(api.blogs.getBySlugAndType, {
      slug,
      type: "template",
      language: "en",
    });

    if (!template) {
      return { title: "Not Found | oDesigns" };
    }

    const metaTitle = template.metaTitle || template.title;
    const metaDescription = template.excerpt;

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: template.keywords,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${BASE_URL}/templates/${template.slug}`,
        siteName: "oDesigns",
        type: "website",
        images: [
          {
            url: `${BASE_URL}/og-image.png`,
            width: 1200,
            height: 1200,
            alt: template.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: [`${BASE_URL}/og-image.png`],
      },
      alternates: generateAlternates(`/templates/${template.slug}`),
    };
  } catch {
    return {
      title: "Template | oDesigns",
      description: "Explore AI-powered social media post templates.",
    };
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let template = null;
  try {
    template = await fetchQuery(api.blogs.getBySlugAndType, {
      slug,
      type: "template",
      language: "en",
    });
  } catch {
    // If Convex is unavailable during build, 404
  }

  if (!template) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: template.title,
    description: template.excerpt,
    url: `${BASE_URL}/templates/${template.slug}`,
    publisher: {
      "@type": "Organization",
      name: "oDesigns",
      url: BASE_URL,
    },
  };

  // Safe: structured data built from server-fetched Convex DB records, not user input
  const structuredData = JSON.stringify(jsonLd);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <TemplatePageClient slug={slug} />
    </>
  );
}
