import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// ─── FEW-SHOT EXAMPLES (real components stripped to essentials) ───────────────
// These teach the AI by showing REAL working code, not abstract descriptions.

const EXAMPLE_DARK_MOCKUP = `// EXAMPLE A: Dark bg + iPhone mockup + floating stats
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { Cloud, Zap, Globe } from 'lucide-react';

export default function CloudPOSPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: \`linear-gradient(to bottom right, \${t.primary}, \${t.primaryDark})\` }} />
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: \`radial-gradient(\${t.primaryLight} 1px, transparent 1px)\`, backgroundSize: '30px 30px'}} />
      <div className="absolute -top-20 -left-20 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full"
        style={{ backgroundColor: t.accentLime }} />
      <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full"
        style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="cloud-pos" subtitle="CLOUD TECHNOLOGY" badge={<><Cloud size={12}/> LIVE SYNC</>} variant="dark" />

        <DraggableWrapper id="headline" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>نظامك السحابي</EditableText><br/>
            <span style={{ color: t.accentLime }}><EditableText>في كل مكان</EditableText></span>
          </h2>
        </DraggableWrapper>

        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup" className={\`relative z-20 \${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}\`}>
            <IPhoneMockup src="/pos-screen.jpg" />
          </DraggableWrapper>
          <FloatingCard id="stat1" icon={<Zap size={16} style={{ color: t.accentLime }} />} label="السرعة" value="100%" className="absolute -left-4 top-20" rotate={-5} />
          <FloatingCard id="stat2" icon={<Globe size={16} style={{ color: t.accent }} />} label="وصول عالمي" value="24/7" className="absolute -right-8 bottom-32" rotate={8} />
        </div>

        <PostFooter id="cloud-pos" label="SYLO POS" text="أدر مطعمك من أي مكان في العالم" variant="dark" />
      </div>
    </div>
  );
}`;

const EXAMPLE_HERO_IMAGE = `// EXAMPLE B: Full-bleed image + cinematic gradient + bottom text
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter } from './shared';
import { Heart, Sparkles } from 'lucide-react';

export default function HeroPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      <img src="/seasons/2.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="hero" subtitle="PREMIUM FLOWERS" badge={<><Sparkles size={12}/> LUXURY</>} variant="dark" />
        <div className="flex-1 flex flex-col justify-end mb-12">
          <DraggableWrapper id="headline" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight">
              <EditableText>أجمل اللحظات</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>تبدأ بوردة</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-4 opacity-90">
              <EditableText>تشكيلات راقية لكل مناسباتكم السعيدة</EditableText>
            </p>
          </DraggableWrapper>
        </div>
        <PostFooter id="hero" label="SEASONS FLOWERS" text="نحتفل معكم بكل لحظة" icon={<Heart size={24} fill="currentColor"/>} variant="dark" />
      </div>
    </div>
  );
}`;

const EXAMPLE_LIGHT_CREATIVE = `// EXAMPLE C: Light bg + circular image + subscription style
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter } from './shared';
import { Calendar, Sparkles } from 'lucide-react';

export default function SubscriptionPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#fff', fontFamily: t.font }}>
      <div className="absolute inset-0 opacity-[0.4]"
        style={{ background: \`linear-gradient(to bottom, \${t.primaryLight}, white)\` }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.05] rounded-full blur-[100px]"
           style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="sub" subtitle="SUBSCRIPTIONS" badge={<><Calendar size={12}/> WEEKLY FRESH</>} variant="light" />
        <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup" className={\`relative z-20 \${isTall ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]'}\`}>
             <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-black/5">
                <img src="/seasons/3.jpg" className="w-full h-full object-cover" alt="Product" />
             </div>
          </DraggableWrapper>
          <DraggableWrapper id="stat" className="absolute -right-4 bottom-24 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 rotate-6" dir="rtl">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: t.accentLight }}>
                   <Sparkles size={20} style={{ color: t.accent }} />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>الاشتراك</p>
                   <p className="text-sm font-black" style={{ color: t.primary }}>يبدأ من 15 د.ك</p>
                </div>
             </div>
          </DraggableWrapper>
        </div>
        <DraggableWrapper id="headline" className="mt-8 text-right" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>جدد منزلك</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>بالورد الطبيعي</EditableText></span>
          </h2>
          <p className="text-lg font-bold opacity-70 mt-4" style={{ color: t.primary }}>
            <EditableText>اشتراكات أسبوعية تصلك طازجة إلى باب بيتك</EditableText>
          </p>
        </DraggableWrapper>
        <PostFooter id="sub" label="SEASONS SUBSCRIPTIONS" text="الجمال المستمر في حياتك" variant="light" />
      </div>
    </div>
  );
}`;

const EXAMPLE_DARK_CORPORATE = `// EXAMPLE D: Dark cinematic + half-image + left-aligned text
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from './shared';
import { Briefcase, Building2 } from 'lucide-react';

export default function CorporatePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#111', fontFamily: t.font }}>
      <img src="/seasons/2.jpg" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" alt="Corporate" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 100%)' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="corp" subtitle="CORPORATE GIFTS" badge={<><Briefcase size={12}/> BUSINESS</>} variant="dark" />
        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <DraggableWrapper id="text" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight">
               <EditableText>هدايا شركات</EditableText><br/>
               <span style={{ color: t.accentLime }}><EditableText>بلمسة احترافية</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-6 opacity-70">
               <EditableText>حلول متكاملة لهدايا الموظفين والعملاء</EditableText>
            </p>
          </DraggableWrapper>
          <div className="flex gap-4 mt-8">
             <FloatingCard id="card1" icon={<Building2 size={16} />} label="توصيل" value="للمكاتب" className="mt-4" rotate={-3} />
          </div>
        </div>
        <PostFooter id="corp" label="SEASONS BUSINESS" text="ارتقِ بعلاقاتك المهنية" variant="dark" />
      </div>
    </div>
  );
}`;

const EXAMPLE_DESKTOP_ANALYTICS = `// EXAMPLE E: Light bg + Desktop mockup + analytics focus
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { DesktopMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

export default function MenuEngineeringPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{backgroundImage: \`radial-gradient(\${t.primary} 2px, transparent 2px)\`, backgroundSize: '20px 20px'}} />
      <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] opacity-[0.1] blur-[100px] rounded-full"
        style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="menu-eng" subtitle="RESTAURANT ANALYTICS" badge={<><TrendingUp size={12}/> PROFIT MAX</>} variant="light" />
        <DraggableWrapper id="headline" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>هندسة المنيو</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>لأرباح أعلى</EditableText></span>
          </h2>
        </DraggableWrapper>
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup" className={\`relative z-20 \${isTall ? 'w-full h-[350px]' : 'w-[360px] h-[240px]'}\`}>
            <DesktopMockup src="/pos-screen.jpg" url="admin.sylo.com/analytics" />
          </DraggableWrapper>
          <FloatingCard id="stat1" icon={<BarChart3 size={16} />} label="نمو الأرباح" value="+22%" className="absolute -right-4 top-4" rotate={5} />
          <FloatingCard id="stat2" icon={<PieChart size={16} />} label="الأكثر مبيعًا" value="برجر دبل" className="absolute -left-4 bottom-12" rotate={-5} />
        </div>
        <PostFooter id="menu-eng" label="SYLO ANALYTICS" text="حلل أداء أصنافك وارفع هوامش ربحك" variant="light" />
      </div>
    </div>
  );
}`;

// ─── CREATIVE COPY ANGLES (rotated per post for variety) ─────────────────────

const COPY_ANGLES = [
  { angle: "Emotional storytelling", instruction: "Tell a micro-story. Use 'imagine...', 'picture this...', create an emotional scenario the viewer relates to. Focus on feelings, not features." },
  { angle: "Bold provocation", instruction: "Challenge the status quo. Use a provocative question or surprising stat. Make them stop scrolling. 'Still doing X? There's a better way.' style." },
  { angle: "Aspirational vision", instruction: "Paint the dream outcome. Focus on the transformation, not the tool. 'From X to Y' narrative. Make them see their better future." },
  { angle: "Social proof / authority", instruction: "Imply trust and scale. Use impressive numbers, community size, years of experience. 'Trusted by...', 'Join thousands who...', '+X% growth'." },
  { angle: "Urgency / scarcity", instruction: "Create FOMO. Limited offer, seasonal, exclusive. Time-sensitive language. 'Only this week', 'Exclusive collection', 'While supplies last'." },
  { angle: "Behind the scenes", instruction: "Show the craft, the process, the care. 'Handpicked...', 'Carefully curated...', 'Every detail matters'. Artisanal, premium feel." },
  { angle: "Comparison / contrast", instruction: "Before vs after. Old way vs new way. Without us vs with us. Create a visual or textual contrast that makes the value obvious." },
  { angle: "Celebration / joy", instruction: "Celebrate moments, milestones, seasons. Festive, warm, joyful tone. 'Celebrate with...', 'Make every moment...', 'Share the joy'." },
];

// ─── LAYOUT BLUEPRINTS (detailed structure, not just hints) ──────────────────

const LAYOUT_BLUEPRINTS = [
  {
    name: "Device Showcase",
    structure: "Dark gradient bg → dot/grid pattern overlay → 2 glow circles → PostHeader → headline (text-5xl with accent color second line) → centered device mockup (isTall responsive) → 2 FloatingCards at opposite corners → PostFooter",
    decorations: "radial-gradient dots OR linear-gradient grid, 2 blur glow circles (accentLime + accent), gradient bg (primary → primaryDark)",
  },
  {
    name: "Hero Image Cinematic",
    structure: "Full-bleed <img> → gradient overlay (bottom-heavy) → PostHeader → flex-1 justify-end for bottom text → headline text-5xl → subtitle text-xl → PostFooter",
    decorations: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(0,0,0,0.4)). Image covers entire post, text floats at bottom.",
  },
  {
    name: "Light Product Showcase",
    structure: "White/primaryLight bg → soft gradient overlay → subtle glow circle → PostHeader → centered circular image frame (rounded-full, thick white border, ring) → absolute-positioned stat card → headline below image → PostFooter",
    decorations: "Soft gradient (primaryLight → white), one glow blob, clean white borders, drop shadows",
  },
  {
    name: "Bold Typography Only",
    structure: "Dark bg → pattern (dots or grid) → 2 glow circles → PostHeader → massive centered text (text-5xl to text-6xl) with accentLime keyword → decorative icon cluster → subtle body text → PostFooter",
    decorations: "Grid or dot pattern, 2+ glow circles, NO device mockups. Pure typography power. Maybe a subtle CSS-only shape.",
  },
  {
    name: "Split Cinematic",
    structure: "Half-visible background image (opacity-30, grayscale) → directional gradient (left-to-right) → PostHeader → flex-col justify-center max-w-sm → headline + body + FloatingCard row → PostFooter",
    decorations: "Image as subtle bg, strong directional gradient, text on one side, image bleeds through on other",
  },
  {
    name: "Card Grid Feature",
    structure: "Light bg → dot pattern → PostHeader → headline → 2x2 or 3-column grid of feature cards (each with icon + label + desc, themed borders) → PostFooter",
    decorations: "Each card: bg-white, shadow-lg, rounded-2xl, border with theme color, icon in colored circle. Subtle bg pattern.",
  },
  {
    name: "Magazine Cover",
    structure: "Full-bleed image → heavy bottom gradient → PostHeader transparent over image → large whitespace in middle → bottom section: headline + CTA badge → PostFooter",
    decorations: "Cinematic feel. Minimal text. Image is the star. Text at bottom like a magazine title.",
  },
  {
    name: "Geometric Abstract",
    structure: "Dark bg → abstract CSS shapes (rotated divs, circles, diagonal lines using transforms) → PostHeader → centered content → headline with creative word emphasis → icon accents → PostFooter",
    decorations: "CSS-only art: rotated rectangles with opacity, overlapping circles, diagonal stripes. Bold, modern, editorial feel.",
  },
];

// ─── UNIFIED SYSTEM PROMPT (replaces V1/V2/V3) ──────────────────────────────

const SYSTEM_PROMPT = `You are an elite social media post designer. Generate a SINGLE visually stunning React/TSX component. Study the examples below carefully — they show the EXACT quality, structure, and patterns you must match.

## CRITICAL RULES
1. EVERY post must use useAspectRatio() and conditionally size elements with isTall
2. EVERY visible text must be wrapped in <EditableText>
3. EVERY content section must be wrapped in <DraggableWrapper>
4. NEVER hardcode colors — always use the theme system via style props
5. Root div: className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}
6. Content wrapper: className="relative z-10 w-full h-full flex flex-col p-8"
7. Text sizing: MINIMUM text-4xl for headlines, text-lg for body. NEVER text-sm or text-xs for visible content.
8. Export exactly ONE component: export default function PostName() { ... }

## IMPORTS
\`\`\`tsx
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, IPadMockup, DesktopMockup, PostHeader, PostFooter, FloatingCard } from './shared';
// Import only the lucide-react icons you use:
// import { Heart, Star, ... } from 'lucide-react';
\`\`\`

## THEME (MANDATORY)
\`\`\`tsx
const t = useTheme();
// t.primary (dark), t.primaryLight (light bg), t.primaryDark (darkest)
// t.accent (medium), t.accentLight, t.accentLime (bright), t.accentGold, t.accentOrange
// t.border, t.font (font family string)
// Apply ONLY via: style={{ backgroundColor: t.primary, color: t.primaryLight }}
// NEVER use Tailwind color classes like bg-[#1B4332]. NEVER hardcode hex colors.
\`\`\`

## ASPECT RATIO (MANDATORY — makes posts responsive across 1:1, 9:16, etc.)
\`\`\`tsx
const ratio = useAspectRatio();
const isTall = ratio === '9:16' || ratio === '3:4';
// USE isTall to conditionally size mockups, images, and spacing:
// className={isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}  // iPhone
// className={isTall ? 'w-[340px] h-[230px]' : 'w-[300px] h-[200px]'}  // Desktop
// className={isTall ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]'}  // Circular image
\`\`\`

## SHARED COMPONENTS
- **<PostHeader>** — Props: id, title (brand name), subtitle, badge (JSX), variant ("dark"|"light"), logoUrl
- **<PostFooter>** — Props: id, label (BRAND NAME), text, icon (JSX), variant ("dark"|"light")
- **<FloatingCard>** — Props: id, icon, label, value, className (use absolute positioning), rotate (number), borderColor, animation ("float"|"float-slow"|"none")
- **<IPhoneMockup>** — Props: src (image URL), alt, notch ("pill"|"notch"). Wrap in: className={isTall ? 'w-[200px] h-[400px]' : 'w-[180px] h-[340px]'}
- **<IPadMockup>** — Props: src, alt, orientation. Landscape: isTall ? 'w-[320px] h-[230px]' : 'w-[280px] h-[200px]'
- **<DesktopMockup>** — Props: src, alt, url, trafficLights. Size: isTall ? 'w-[340px] h-[230px]' : 'w-[300px] h-[200px]'
- **<EditableText>** — Props: as ("h2"|"p"|"span"|"h3"), className, style. Wrap ALL visible text.
- **<DraggableWrapper>** — Props: id (unique), className, variant ("mockup"), dir ("rtl" for Arabic). Wrap ALL sections.

## ASSET RULES
- **background** → \`<img src={url} className="absolute inset-0 w-full h-full object-cover" />\` + gradient overlay. NEVER in mockups.
- **screenshot/iphone** → ONLY inside <IPhoneMockup>
- **screenshot/ipad** → ONLY inside <IPadMockup>
- **screenshot/desktop** → ONLY inside <DesktopMockup>
- **product** → \`<img className="w-64 h-64 object-contain drop-shadow-2xl" />\`
- **logo** → Pass to PostHeader via logoUrl prop
- NEVER put background images in device mockups.

## DECORATION TOOLKIT (pick 1-3 per post, combine creatively)
\`\`\`tsx
// Gradient bg
<div className="absolute inset-0" style={{ background: \`linear-gradient(to bottom right, \${t.primary}, \${t.primaryDark})\` }} />
// Dot pattern
<div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: \`radial-gradient(\${t.primaryLight} 1px, transparent 1px)\`, backgroundSize: '30px 30px'}} />
// Grid pattern
<div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: \`linear-gradient(\${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, \${t.primaryLight} 0.5px, transparent 0.5px)\`, backgroundSize: '30px 30px'}} />
// Glow circle
<div className="absolute -top-20 -left-20 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full" style={{ backgroundColor: t.accentLime }} />
// Image overlay
<div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))' }} />
\`\`\`

## CANVAS (540px base, exports 2x)
- 1:1 → 540×540 (1080×1080), 4:5 → 540×675, 9:16 → 540×960, 16:9 → 960×540

## OUTPUT
Return ONLY the raw component code. No markdown fences, no backticks, no explanation. Start with imports.`;

// ─── REFERENCE EXAMPLES SECTION ──────────────────────────────────────────────

function buildExamplesSection(hasAssets: boolean, assetTypes: string[]): string {
  const examples: string[] = [];

  // Always include at least 2 examples for variety
  // Pick examples based on available assets
  const hasMockupAssets = assetTypes.some(t => ['iphone', 'screenshot', 'ipad', 'desktop'].includes(t));
  const hasBackgroundAssets = assetTypes.includes('background');
  const hasProductAssets = assetTypes.includes('product');

  if (hasMockupAssets) {
    examples.push(EXAMPLE_DARK_MOCKUP);
    examples.push(EXAMPLE_DESKTOP_ANALYTICS);
  } else if (hasBackgroundAssets || hasProductAssets) {
    examples.push(EXAMPLE_HERO_IMAGE);
    examples.push(EXAMPLE_LIGHT_CREATIVE);
    examples.push(EXAMPLE_DARK_CORPORATE);
  } else {
    // No assets — show variety of CSS-only + mockup patterns
    examples.push(EXAMPLE_DARK_MOCKUP);
    examples.push(EXAMPLE_LIGHT_CREATIVE);
    examples.push(EXAMPLE_DARK_CORPORATE);
  }

  return `## REFERENCE EXAMPLES — Study these. Match this quality level.\n${examples.join('\n\n')}`;
}

// ─── DYNAMIC CONTEXT BUILDER ─────────────────────────────────────────────────

interface AssetInfo {
  id: string;
  url: string;
  type: string;
  label?: string;
  description?: string;
  aiAnalysis?: string;
}

interface WebsiteInfo {
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

interface GenerationContext {
  brandName?: string;
  tagline?: string;
  website?: string;
  industry?: string;
  language: "en" | "ar";
  logoUrl?: string;
  websiteInfo?: WebsiteInfo;
  assets: AssetInfo[];
}

function buildDynamicPrompt(context: GenerationContext): string {
  const {
    brandName = "Brand",
    tagline,
    website,
    industry,
    language,
    logoUrl,
    websiteInfo,
    assets,
  } = context;

  const isArabic = language === "ar";
  const sections: string[] = [];

  // ── Brand context ──
  const brandLines: string[] = [`- Brand name: ${brandName}`];
  if (tagline) brandLines.push(`- Tagline: ${tagline}`);
  if (industry) brandLines.push(`- Industry: ${industry}`);
  if (website) brandLines.push(`- Website: ${website}`);
  brandLines.push(
    `- Language: ${
      isArabic
        ? "Arabic for ALL text (headings, body, labels). English only for numbers/stats. Add dir=\"rtl\" to DraggableWrapper elements. Use className=\"text-right\" on text containers."
        : "English for all text"
    }`
  );

  sections.push(`## BRAND\n${brandLines.join("\n")}`);

  // ── Logo ──
  if (logoUrl) {
    sections.push(
      `## LOGO (MANDATORY)\nURL: ${logoUrl}\nPass to PostHeader: <PostHeader id="..." title="${brandName}" logoUrl="${logoUrl}" ... />`
    );
  }

  // ── Available assets — grouped by type ──
  const assetTypes: string[] = [];
  if (assets && assets.length > 0) {
    const grouped: Record<string, AssetInfo[]> = {};
    for (const a of assets) {
      const key = a.type || "other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
      if (!assetTypes.includes(key)) assetTypes.push(key);
    }

    const assetSections: string[] = [];

    for (const [type, items] of Object.entries(grouped)) {
      const lines = items.map((a) => {
        let line = `  - URL: ${a.url}`;
        if (a.label) line += `\n    Label: ${a.label}`;
        if (a.description) line += `\n    Description: ${a.description}`;
        if (a.aiAnalysis) line += `\n    AI Analysis: ${a.aiAnalysis}`;
        return line;
      }).join("\n");

      let usage = "";
      switch (type) {
        case "background":
          usage = "USE AS: Full-bleed <img> with gradient overlay on top. NEVER in device mockups.";
          break;
        case "iphone":
        case "screenshot":
          usage = "USE AS: Inside <IPhoneMockup src={url} /> only. Wrap mockup in isTall-responsive div.";
          break;
        case "ipad":
          usage = "USE AS: Inside <IPadMockup src={url} /> only. Wrap in isTall-responsive div.";
          break;
        case "desktop":
          usage = "USE AS: Inside <DesktopMockup src={url} /> only. Wrap in isTall-responsive div.";
          break;
        case "product":
          usage = "USE AS: Hero product <img> with drop-shadow, positioned creatively.";
          break;
        case "logo":
          usage = "USE AS: Pass to PostHeader via logoUrl prop.";
          break;
        default:
          usage = "USE AS: Best placement based on the analysis.";
      }

      assetSections.push(`### ${type.toUpperCase()} (${items.length}):\n${usage}\n${lines}`);
    }

    sections.push(
      `## ASSETS (use these — NEVER use /1.jpg or hardcoded paths)\n${assetSections.join("\n\n")}`
    );
  } else {
    sections.push(
      `## ASSETS\nNone uploaded. Create CSS-only visuals — gradients, shapes, icons, patterns. No device mockups needed.`
    );
  }

  // ── Reference examples based on asset types ──
  sections.push(buildExamplesSection(assets && assets.length > 0, assetTypes));

  // ── Company info — INSPIRATION ONLY ──
  if (websiteInfo) {
    const infoLines: string[] = [];
    if (websiteInfo.companyName) infoLines.push(`Company: ${websiteInfo.companyName}`);
    if (websiteInfo.description) infoLines.push(`What they do: ${websiteInfo.description}`);
    if (websiteInfo.industry) infoLines.push(`Industry: ${websiteInfo.industry}`);
    if (websiteInfo.features && websiteInfo.features.length > 0) {
      infoLines.push(`Their features/services: ${websiteInfo.features.join(", ")}`);
    }
    if (websiteInfo.targetAudience) infoLines.push(`Audience: ${websiteInfo.targetAudience}`);
    if (websiteInfo.tone) infoLines.push(`Brand tone: ${websiteInfo.tone}`);
    if (infoLines.length > 0) {
      sections.push(
        `## COMPANY CONTEXT (INSPIRATION ONLY — do NOT copy this text)\nUse this to understand the brand, then write your OWN creative copy. Never repeat these words verbatim.\n${infoLines.join("\n")}`
      );
    }
  }

  // ── Final layout conventions ──
  const conventionLines = [
    `- Brand name in header: "${brandName}"`,
    `- PostHeader: title="${brandName}"${logoUrl ? ` logoUrl="${logoUrl}"` : ""}`,
    `- PostFooter: label="${brandName.toUpperCase()}" — NEVER use "SYLO" unless that IS the brand`,
  ];
  if (isArabic) {
    conventionLines.push(`- dir="rtl" on ALL DraggableWrapper elements`);
    conventionLines.push(`- className="text-right" on text containers`);
  }
  conventionLines.push(`- Write ORIGINAL creative copy — catchy headlines, not feature lists`);

  sections.push(`## LAYOUT RULES\n${conventionLines.join("\n")}`);

  return sections.join("\n\n");
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function cleanCode(raw: string): string {
  return raw.replace(/^```(?:tsx?|jsx?|javascript|typescript)?\n?/gm, '').replace(/```$/gm, '').trim();
}

// ─── API ROUTE ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { prompt, context, count = 1 } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);

    const dynamicSection = context
      ? buildDynamicPrompt(context as GenerationContext)
      : "";
    const systemPrompt = dynamicSection
      ? `${SYSTEM_PROMPT}\n\n${dynamicSection}`
      : SYSTEM_PROMPT;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    // Select creative angles and layouts for each post
    const shuffledAngles = [...COPY_ANGLES].sort(() => Math.random() - 0.5);
    const shuffledLayouts = [...LAYOUT_BLUEPRINTS].sort(() => Math.random() - 0.5);

    if (postCount === 1) {
      const angle = shuffledAngles[0];
      const layout = shuffledLayouts[0];

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Generate a social media post for: ${prompt}

## YOUR CREATIVE DIRECTION
Layout: "${layout.name}" — ${layout.structure}
Decorations: ${layout.decorations}

## YOUR COPY ANGLE: ${angle.angle}
${angle.instruction}

Create something stunning and original. Match the quality of the reference examples.` },
      ]);
      const code = cleanCode(result.response.text());
      return NextResponse.json({ code, codes: [code] });
    }

    const promises = Array.from({ length: postCount }, (_, i) => {
      const angle = shuffledAngles[i % shuffledAngles.length];
      const layout = shuffledLayouts[i % shuffledLayouts.length];

      return model.generateContent([
        { text: systemPrompt },
        { text: `Generate a social media post for: ${prompt}

## YOUR CREATIVE DIRECTION (Post ${i + 1}/${postCount})
Layout: "${layout.name}" — ${layout.structure}
Decorations: ${layout.decorations}

## YOUR COPY ANGLE: ${angle.angle}
${angle.instruction}

Post ${i + 1}/${postCount} — MUST be visually distinct from other posts. Different layout, different copy angle, different decorations. Match the quality of the reference examples.` },
      ]).then(r => cleanCode(r.response.text()))
        .catch(err => {
          console.error(`Generation ${i + 1} failed:`, err);
          return null;
        });
    });

    const results = await Promise.all(promises);
    const codes = results.filter((c): c is string => c !== null);

    if (codes.length === 0) {
      return NextResponse.json({ error: "All generations failed" }, { status: 500 });
    }

    return NextResponse.json({ code: codes[0], codes });
  } catch (error: unknown) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
