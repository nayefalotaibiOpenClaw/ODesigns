import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Social Media Post Templates — AI-Generated Designs | oDesigns",
  description:
    "Browse AI-generated social media post templates. Product showcases, restaurant menus, app store graphics, carousel posts, and brand announcements — all customized to your brand.",
  keywords: [
    "social media post templates",
    "AI design templates",
    "Instagram post templates",
    "social media templates free",
    "product post template",
    "restaurant social media template",
  ],
  openGraph: {
    title: "Social Media Post Templates — AI-Generated Designs",
    description:
      "AI-generated social media post templates for every need. Customized to your brand.",
    url: "https://odesigns.app/templates",
    type: "website",
  },
  alternates: generateAlternates("/templates"),
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
