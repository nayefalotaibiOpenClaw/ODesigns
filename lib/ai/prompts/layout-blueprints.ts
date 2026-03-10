export const LAYOUT_BLUEPRINTS = [
  {
    name: "Device Showcase",
    structure: "Dark gradient bg → dot/grid pattern overlay → 2 glow circles → PostHeader → headline (isTall ? text-5xl : text-4xl, with accent color second line) → flex-1 min-h-0 centered device-aware mockup via useDeviceType() (isTall responsive) → 2 FloatingCards at opposite corners → PostFooter. Content wrapper MUST have overflow-hidden.",
    decorations: "radial-gradient dots OR linear-gradient grid, 2 blur glow circles (accentLime + accent), gradient bg (primary → primaryDark)",
  },
  {
    name: "Hero Image Cinematic",
    structure: "Full-bleed <img> → gradient overlay (bottom-heavy) → PostHeader → flex-1 min-h-0 justify-end for bottom text → headline (isTall ? text-5xl : text-4xl) → subtitle text-lg → PostFooter. Works well at all ratios since image covers everything.",
    decorations: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(0,0,0,0.4)). Image covers entire post, text floats at bottom.",
  },
  {
    name: "Light Product Showcase",
    structure: "White/primaryLight bg → soft gradient overlay → subtle glow circle → PostHeader → flex-1 min-h-0 centered circular image frame (isTall ? w-[400px] h-[400px] : w-[280px] h-[280px], rounded-full, thick white border, ring) → absolute-positioned stat card → headline below image → PostFooter. Content wrapper MUST have overflow-hidden.",
    decorations: "Soft gradient (primaryLight → white), one glow blob, clean white borders, drop shadows",
  },
  {
    name: "Bold Typography Only",
    structure: "Dark bg → pattern (dots or grid) → 2 glow circles → PostHeader → flex-1 min-h-0 flex items-center justify-center → massive centered text (isTall ? text-6xl : text-5xl) with accentLime keyword → decorative icon cluster (max 3 icons) → subtle body text → PostFooter. NO cards. Minimal content — typography is the star.",
    decorations: "Grid or dot pattern, 2+ glow circles, NO device mockups. Pure typography power. Maybe a subtle CSS-only shape.",
  },
  {
    name: "Split Cinematic",
    structure: "Half-visible background image (opacity-30, grayscale) → directional gradient (left-to-right) → PostHeader → flex-1 min-h-0 flex-col justify-center max-w-sm → headline + body + 1 FloatingCard → PostFooter. Keep content minimal — just headline, subtitle, and one card.",
    decorations: "Image as subtle bg, strong directional gradient, text on one side, image bleeds through on other",
  },
  {
    name: "Card Grid Feature",
    structure: "Light bg → dot pattern → PostHeader → headline → flex-1 min-h-0 grid of feature cards: use {isTall ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-2'}. CRITICAL: MAX 2 cards for 1:1/4:3, MAX 4 cards for 9:16/3:4. Each card: compact (p-3), icon + label + short desc. → PostFooter. Content wrapper MUST have overflow-hidden.",
    decorations: "Each card: bg-white, shadow-lg, rounded-2xl, border with theme color, icon in colored circle. Subtle bg pattern.",
  },
  {
    name: "Magazine Cover",
    structure: "Full-bleed image → heavy bottom gradient → PostHeader transparent over image → flex-1 → bottom section: headline + CTA badge → PostFooter. Minimal text — works at all ratios since image fills space.",
    decorations: "Cinematic feel. Minimal text. Image is the star. Text at bottom like a magazine title.",
  },
  {
    name: "Geometric Abstract",
    structure: "Dark bg → abstract CSS shapes (rotated divs, circles, diagonal lines using transforms) → PostHeader → flex-1 min-h-0 flex items-center justify-center → headline with creative word emphasis → icon accents (max 3) → PostFooter. Content wrapper MUST have overflow-hidden.",
    decorations: "CSS-only art: rotated rectangles with opacity, overlapping circles, diagonal stripes. Bold, modern, editorial feel.",
  },
];
