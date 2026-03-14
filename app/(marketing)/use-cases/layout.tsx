import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Use Cases — AI Social Media Design for Every Industry | oDesigns",
  description:
    "See how small businesses, restaurants, real estate agents, freelancers, e-commerce brands, and agencies use oDesigns to create professional social media posts with AI.",
  keywords: [
    "social media use cases",
    "AI design tool use cases",
    "social media for small business",
    "social media for restaurants",
    "social media for real estate",
  ],
  openGraph: {
    title: "Use Cases — AI Social Media Design for Every Industry",
    description:
      "See how businesses use oDesigns to create professional social media posts with AI.",
    url: "https://odesigns.app/use-cases",
    type: "website",
  },
  alternates: generateAlternates("/use-cases"),
};

export default function UseCasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
