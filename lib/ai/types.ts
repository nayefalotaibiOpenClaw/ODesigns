export interface AssetInfo {
  id: string;
  url: string;
  type: string;
  label?: string;
  description?: string;
  aiAnalysis?: string;
}

export interface WebsiteInfo {
  companyName?: string;
  description?: string;
  industry?: string;
  features?: string[];
  targetAudience?: string;
  tone?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    socialMedia?: string[];
  };
  content?: string;
}

export interface GenerationContext {
  brandName?: string;
  tagline?: string;
  website?: string;
  industry?: string;
  language: "en" | "ar";
  logoUrl?: string;
  websiteInfo?: WebsiteInfo;
  assets: AssetInfo[];
  /** When true, skip the general ASSETS section — context assets handle it */
  hasSelectedAssets?: boolean;
  /** Actual theme hex values so AI can make contrast-aware decisions */
  themeColors?: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    accentLime: string;
    accentGold: string;
    accentOrange: string;
    border: string;
  };
}
