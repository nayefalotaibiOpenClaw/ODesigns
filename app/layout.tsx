import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { cookies, headers } from "next/headers";
import "./globals.css";
import Providers from "./components/Providers";
import { LOCALES, DEFAULT_LOCALE, RTL_LOCALES, type Locale } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["400", "600", "700", "900"],
});

const BASE_URL = "https://odesigns.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "oDesigns — AI Social Media Post Generator & Design Tool",
    template: "%s | oDesigns",
  },
  description:
    "Create stunning social media posts in seconds with AI. Generate on-brand designs, schedule across Instagram, Facebook, Threads, and Twitter from one dashboard.",
  keywords: [
    "AI social media post generator",
    "social media design tool",
    "AI post maker",
    "Instagram post generator",
    "social media scheduling",
    "brand design tool",
    "AI content creation",
    "social media automation",
    "AI design tool 2026",
    "social media AI",
    "auto post generator",
    "AI marketing tool",
  ],
  category: "Design",
  creator: "oDesigns",
  publisher: "oDesigns",
  openGraph: {
    title: "oDesigns — AI Social Media Post Generator",
    description:
      "Create stunning social media posts in seconds with AI. Generate on-brand designs and publish across all platforms from one dashboard.",
    url: BASE_URL,
    siteName: "oDesigns",
    locale: "en_US",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "oDesigns — AI-powered social media post generator and design tool",
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "oDesigns — AI Social Media Post Generator",
    description:
      "Create stunning social media posts in seconds with AI. Design, schedule, and publish from one dashboard.",
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      ...Object.fromEntries(
        LOCALES.map((l) => [l, l === DEFAULT_LOCALE ? BASE_URL : `${BASE_URL}/${l}`])
      ),
      "x-default": BASE_URL,
    },
  },
  other: {
    "fb:app_id": "810967764709045",
    "ai:content_class": "product_landing",
    "ai:llms_txt": `${BASE_URL}/llms.txt`,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieStore = await cookies();

  // Locale from middleware x-locale header (preferred), then cookie, then default
  const localeFromHeader = headerStore.get("x-locale");
  const localeFromCookie = cookieStore.get("locale")?.value;
  const locale: Locale =
    (LOCALES as readonly string[]).includes(localeFromHeader ?? "")
      ? (localeFromHeader as Locale)
      : (LOCALES as readonly string[]).includes(localeFromCookie ?? "")
        ? (localeFromCookie as Locale)
        : DEFAULT_LOCALE;
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "oDesigns",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/og-image.png`,
      width: 1200,
      height: 630,
    },
    description:
      "AI-powered social media post generator. Create, schedule, and publish stunning designs across Instagram, Facebook, Threads, and Twitter.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${BASE_URL}/contact`,
      availableLanguage: ["English", "Arabic", "Spanish", "Portuguese", "French", "Turkish", "Indonesian"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "oDesigns",
    url: BASE_URL,
    description:
      "AI-powered social media post generator and design tool.",
    publisher: { "@id": `${BASE_URL}/#organization` },
    inLanguage: ["en", "ar", "es", "pt", "fr", "tr", "id"],
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#software`,
    name: "oDesigns",
    url: BASE_URL,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "AI-powered social media post generator and design tool. Create on-brand posts, schedule publishing, and manage multiple social accounts from one dashboard.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "49",
      priceCurrency: "USD",
      offerCount: "3",
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          description: "Free plan with limited generations",
        },
      ],
    },
    featureList: [
      "AI social media post generation",
      "Multi-platform publishing (Instagram, Facebook, Threads, Twitter/X)",
      "Brand management (colors, fonts, logos)",
      "Template library",
      "Bulk scheduling with calendar view",
      "PNG/ZIP export",
      "Multi-language support (7 languages)",
      "Aspect ratio adaptation",
      "Workspace management for agencies",
    ],
    screenshot: `${BASE_URL}/og-image.png`,
    author: { "@id": `${BASE_URL}/#organization` },
  };

  // JSON-LD structured data (static constants, no user input)
  const structuredData = JSON.stringify([organizationJsonLd, websiteJsonLd, softwareJsonLd]);

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale} dir={dir} suppressHydrationWarning>
        <head>
          <link rel="author" href={`${BASE_URL}/llms.txt`} />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger -- Safe: static constants only, no user input
            dangerouslySetInnerHTML={{ __html: structuredData }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased`}
        >
          <Providers initialLocale={locale}>{children}</Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
