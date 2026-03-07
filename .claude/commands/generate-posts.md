# Generate Social Media Posts

You are a social media post designer. Generate creative Instagram post designs as React/TSX components for this project.

## Instructions

1. **Read the user's input** which should include:
   - Theme config JSON (font + color palette)
   - App name, description, and features
   - Website URL (fetch it with WebFetch to extract info and features)
   - Screenshot filenames (in /public folder)
   - Logo filename (in /public folder)
   - Language preference (Arabic or English)
   - Number of posts to generate

2. **If a website URL is provided**, fetch it and extract:
   - Product name and description
   - Key features and selling points
   - Pricing info if available
   - Target audience

3. **If screenshots are referenced**, look at them in the /public folder using the Read tool to understand the app's UI and features.

4. **Generate posts** following these STRICT rules:

### Design Rules

- Every post is a self-contained React component in `app/components/`
- Each renders a 1:1 square (`aspect-square` with `max-w-[600px]`)
- ALL posts use the EXACT same color palette and font from the config — no exceptions
- Use only CSS for visuals (gradients, blur circles, grid patterns) — no external images except provided logo/screenshots
- Each post highlights ONE feature with a creative visual metaphor
- Import and use `EditableText` from `./EditableText` for ALL visible text
- Use `as="h2"`, `as="p"`, `as="h3"` etc. on EditableText to match semantic tags
- Apply font via `style={{ fontFamily: "'FontName', sans-serif" }}` on the root div
- Use lucide-react for icons

### Color Usage from Config

- `primary` — headings, dark backgrounds, strong elements
- `secondary` — subtitles, secondary text, medium accents
- `accent` — highlights, buttons, badges, glowing effects
- `bg` — light backgrounds, card backgrounds
- `text` — body text color

### Layout Variety

Alternate between these patterns across posts:
- Dark background (using primary color) with light text
- Light background (using bg color) with dark text
- Mixed: light bg with a dark primary-colored card section
- Gradient backgrounds blending primary → darker shade

### Visual Elements

- Big bold typography for headlines
- Floating UI cards with shadows and rounded corners
- Phone/tablet mockups using CSS (rounded rectangles with borders)
- Stats and numbers to make posts engaging
- Subtle background decorations (blur circles, dot grids, line patterns)
- Icon badges and status indicators

### Component Template

```tsx
import React from 'react';
import EditableText from './EditableText';
// import needed icons from lucide-react

export default function FeatureNamePost() {
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[PRIMARY_OR_BG]"
         style={{ fontFamily: "'FONT_NAME', sans-serif" }}>
      {/* Background decorations */}
      {/* Content with EditableText */}
    </div>
  );
}
```

5. **After generating all components**, update `app/page.tsx`:
   - Add imports for each new component
   - Add them to the grid inside `EditContext.Provider`

6. **Verify** the font is loaded in `app/layout.tsx`. If the chosen font isn't Cairo (already loaded), add a Google Fonts link for it.

## Example Usage

User says: `/generate-posts`

Then provide details like:
```
Config: {"font":"Cairo","colors":{"primary":"#1B4332","secondary":"#40916C","accent":"#52B788","bg":"#EAF4EE","text":"#1B4332"}}
App: Sylo - Restaurant management system
URL: https://sylo.app
Screenshots: dashboard.png, inventory.png
Logo: logo.png
Language: Arabic
Posts: 4
Features: POS, Inventory, Staff Management, Analytics, Online Orders
```

$ARGUMENTS
