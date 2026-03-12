# Dark/Light Mode — Site-Wide Implementation Plan

## Context
oDesigns currently has no site-wide dark/light mode. Some pages (pricing, billing, admin) are already dark-themed independently. The rest of the site is hardcoded light (bg-white, text-slate-900, etc.). This plan adds a unified dark mode toggle across the entire website.

## Phase 1: Infrastructure Setup
**Files:** `package.json`, `app/globals.css`, `app/layout.tsx`, `app/components/Providers.tsx`

1. Install `next-themes`
2. Tailwind v4 dark mode — globals.css already has CSS variables with `prefers-color-scheme: dark` but they're unused. Update to use `@variant dark (&:where(.dark, .dark *))` for class-based dark mode (Tailwind v4 syntax)
3. Wrap app with `next-themes` ThemeProvider in `Providers.tsx` (attribute="class", defaultTheme="system")
4. Add `suppressHydrationWarning` to `<html>` in layout.tsx

## Phase 2: Dark Mode Toggle
**File:** `app/components/FloatingNav.tsx`

- Add a Sun/Moon toggle button in the nav bar
- Use `useTheme()` from `next-themes` to switch
- FloatingNav already has `variant="light" | "dark"` — make it auto-detect from next-themes instead of prop

## Phase 3: Marketing Pages (dark: classes)
**Files to update:**
- `app/(marketing)/versions/V0Original.tsx` — hero, sections, footer
- `app/(marketing)/versions/HeroDemo.tsx` — auto-detect theme instead of prop
- `app/(marketing)/blogs/page.tsx`
- `app/(marketing)/blogs/[slug]/page.tsx`
- `app/(marketing)/contact/page.tsx`
- `app/(marketing)/privacy/page.tsx`
- `app/(marketing)/terms/page.tsx`

**Pattern:** Add `dark:` counterparts:
- `bg-white` → `bg-white dark:bg-slate-950`
- `text-slate-900` → `text-slate-900 dark:text-white`
- `text-slate-500` → `text-slate-500 dark:text-slate-400`
- `bg-slate-50` → `bg-slate-50 dark:bg-slate-900`
- `border-slate-100` → `border-slate-100 dark:border-slate-800`
- `bg-slate-100` → `bg-slate-100 dark:bg-slate-800`

## Phase 4: Auth & Dashboard Pages
**Files:**
- `app/(auth)/login/page.tsx` — right panel only (left is already dark)
- `app/(dashboard)/workspaces/page.tsx`
- `app/(dashboard)/design/page.tsx` — large file, complex editor

**Skip (already dark):**
- `app/(dashboard)/pricing/page.tsx` ✓
- `app/(dashboard)/billing/page.tsx` ✓
- `app/(admin)/admin/page.tsx` ✓

## Phase 5: Design Editor Components
**Files:**
- `features/design-editor/components/Sidebar.tsx`
- `features/design-editor/components/DownloadBar.tsx`
- `features/design-editor/components/ThemePanel.tsx`
- `features/design-editor/components/SettingsPanel.tsx`
- `features/design-editor/components/AssetsPanel.tsx`
- `features/design-editor/components/BrandPanel.tsx`
- `features/design-editor/components/GeneratePanel.tsx`
- `features/design-editor/components/PublishPanel.tsx`
- `features/design-editor/components/MobileNavMenu.tsx`

## Phase 6: Gallery Pages
**Files:**
- `app/sylo-posts/page.tsx`
- `app/seasons/page.tsx`
- `app/odesigns/page.tsx`
- `app/food-drink/page.tsx`
- `app/engines/page.tsx`

## Verification
1. Toggle between light/dark in nav — all pages should switch
2. Refresh — theme persists (localStorage via next-themes)
3. System preference detection works on first visit
4. No flash of wrong theme (suppressHydrationWarning + next-themes script)
5. Post previews in editor remain unaffected (they use their own ThemeContext for brand colors)
6. Already-dark pages (pricing, billing, admin) stay dark in both modes
