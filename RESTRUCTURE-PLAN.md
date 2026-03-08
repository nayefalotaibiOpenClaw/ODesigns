# Modular Monolith Restructure Plan

## Goals

1. **Feature-based organization** — Group by domain, not file type
2. **Eliminate duplication** — Shared sidebar, grid, download, fonts, palettes extracted once
3. **Thin API routes** — Business logic in `lib/`, routes are just handlers
4. **Separated post templates** — 70+ components grouped by brand, not dumped flat
5. **Shared types** — One source of truth for TypeScript interfaces
6. **Scalable for new brands** — Adding a brand = new folder + registry entry

---

## Target Structure

```
app/
├── (marketing)/                          # Route group: public pages
│   ├── page.tsx                          # Landing page (current app/page.tsx)
│   └── layout.tsx                        # Minimal layout (no auth)
│
├── (auth)/                               # Route group: auth pages
│   ├── login/page.tsx                    # Google OAuth login
│   └── layout.tsx                        # Auth layout (no sidebar)
│
├── (dashboard)/                          # Route group: authenticated pages
│   ├── layout.tsx                        # Dashboard shell (auth guard)
│   ├── workspaces/page.tsx               # Workspace list
│   └── design/page.tsx                   # Main editor (thin — imports from features/)
│
├── api/
│   ├── generate/route.ts                 # Thin handler → delegates to lib/ai/
│   └── fetch-website/route.ts            # Thin handler → delegates to lib/website/
│
├── layout.tsx                            # Root layout (fonts, providers)
└── globals.css

features/                                 # Feature modules
├── posts/                                # Post template system
│   ├── templates/
│   │   ├── sylo/                         # ~38 Sylo brand posts
│   │   │   ├── CloudPOSPost.tsx
│   │   │   ├── AnalyticsPost.tsx
│   │   │   ├── ... (all Sylo posts)
│   │   │   └── index.ts                  # export { default as CloudPOSPost } from './CloudPOSPost'
│   │   └── seasons/                      # ~27 Seasons brand posts
│   │       ├── SeasonsHeroPost.tsx
│   │       ├── SeasonsGiftPost.tsx
│   │       ├── ... (all Seasons posts)
│   │       └── index.ts
│   ├── editor/                           # Post editing infrastructure
│   │   ├── EditableText.tsx
│   │   ├── DraggableWrapper.tsx
│   │   ├── DynamicPost.tsx
│   │   └── PostWrapper.tsx
│   ├── shared/                           # Post building blocks
│   │   ├── PostHeader.tsx
│   │   ├── PostFooter.tsx
│   │   ├── FloatingCard.tsx
│   │   ├── IPhoneMockup.tsx
│   │   ├── IPadMockup.tsx
│   │   ├── DesktopMockup.tsx
│   │   └── index.ts
│   └── registries/                       # Post catalogs
│       ├── sylo.ts                       # { id, filename, component }[]
│       ├── seasons.ts                    # { id, filename, component }[]
│       └── types.ts                      # PostRegistryEntry type
│
├── design-editor/                        # Design editor UI
│   ├── components/
│   │   ├── Sidebar.tsx                   # Icon rail + expandable panel
│   │   ├── SettingsPanel.tsx             # Edit/reorder/select modes, aspect ratio, grid
│   │   ├── ThemePanel.tsx                # Palette picker, color editor, font selector
│   │   ├── UploadsPanel.tsx              # Image upload + gallery
│   │   ├── GeneratePanel.tsx             # AI prompt + generated list
│   │   ├── PostGrid.tsx                  # Grid/list renderer with drag, select, download
│   │   └── DownloadBar.tsx               # Floating selection download bar
│   ├── hooks/
│   │   ├── usePostGrid.ts               # Grid state (order, drag, select, download)
│   │   └── useGenerate.ts               # AI generation state
│   └── constants/
│       ├── fonts.ts                      # FONTS array (shared across all pages)
│       └── palettes.ts                   # PALETTES array (shared across all pages)
│
├── workspace/                            # Workspace management
│   ├── components/
│   │   ├── WorkspaceCard.tsx             # Single workspace card
│   │   ├── WorkspaceForm.tsx             # Create/edit modal
│   │   └── WorkspaceStats.tsx            # Mini stats (collections, branding)
│   └── hooks/
│       └── useWorkspace.ts               # Workspace CRUD logic
│
└── auth/                                 # Auth module
    └── components/
        └── Providers.tsx                 # ConvexAuth + Theme provider wrapper

lib/                                      # Shared business logic (non-UI)
├── ai/
│   ├── prompts/
│   │   ├── system-prompt.ts              # SYSTEM_PROMPT constant
│   │   ├── examples.ts                   # Few-shot example components
│   │   ├── copy-angles.ts                # COPY_ANGLES array
│   │   └── layout-blueprints.ts          # LAYOUT_BLUEPRINTS array
│   ├── build-prompt.ts                   # buildDynamicPrompt() + buildExamplesSection()
│   ├── clean-code.ts                     # cleanCode() helper
│   └── types.ts                          # AssetInfo, WebsiteInfo, GenerationContext
├── website/
│   └── extract-text.ts                   # extractBodyText() from HTML
└── export/
    └── download.ts                       # Shared zip download logic (used by 3 pages)

contexts/                                 # React contexts (cross-feature)
├── EditContext.tsx                        # Edit mode, aspect ratio, selected ID
└── ThemeContext.tsx                       # Theme colors + font

convex/                                   # Backend (no structural changes)
├── schema.ts
├── auth.ts / auth.config.ts / http.ts
├── users.ts
├── workspaces.ts
├── branding.ts
├── assets.ts
├── collections.ts
├── posts.ts
├── generations.ts
└── seedAll.ts

public/                                   # Static assets (no changes)
├── seasons/                              # Seasons brand images
├── sylo-logo.jpg
├── pos-screen.jpg
└── ...
```

---

## Migration Phases

### Phase 1: Extract Shared Constants & Types (Low Risk)

**Goal**: Remove duplication without moving any components yet.

**Steps**:
1. Create `features/design-editor/constants/fonts.ts` — move FONTS array (duplicated in 2 pages)
2. Create `features/design-editor/constants/palettes.ts` — move PALETTES array (duplicated in 2 pages)
3. Create `lib/ai/types.ts` — extract `AssetInfo`, `WebsiteInfo`, `GenerationContext` from route
4. Create `lib/ai/clean-code.ts` — extract `cleanCode()` from route
5. Create `lib/website/extract-text.ts` — extract `extractBodyText()` from route
6. Update imports in existing files

**Files changed**: 4 existing, 5 new
**Risk**: Zero — just moving constants and utils

---

### Phase 2: Extract AI Prompts (Low Risk)

**Goal**: Break up the 670-line API route into focused files.

**Steps**:
1. Create `lib/ai/prompts/system-prompt.ts` — move SYSTEM_PROMPT
2. Create `lib/ai/prompts/examples.ts` — move 5 EXAMPLE_ constants
3. Create `lib/ai/prompts/copy-angles.ts` — move COPY_ANGLES
4. Create `lib/ai/prompts/layout-blueprints.ts` — move LAYOUT_BLUEPRINTS
5. Create `lib/ai/build-prompt.ts` — move `buildDynamicPrompt()` + `buildExamplesSection()`
6. Slim down `app/api/generate/route.ts` to ~60 lines (just the handler)
7. Slim down `app/api/fetch-website/route.ts` (use extracted `extractBodyText`)

**Files changed**: 2 existing, 6 new
**Risk**: Low — AI generation tested by running `/generate-posts`

---

### Phase 3: Move Contexts (Low Risk)

**Goal**: Centralize React contexts.

**Steps**:
1. Move `app/components/EditContext.tsx` → `contexts/EditContext.tsx`
2. Move `app/components/ThemeContext.tsx` → `contexts/ThemeContext.tsx`
3. Update all imports (grep for `./EditContext`, `./ThemeContext`, `../components/EditContext`, etc.)

**Files changed**: ~70+ import updates (all post components + pages)
**Risk**: Low — search-and-replace, but many files touched

---

### Phase 4: Organize Post Templates by Brand (Medium Risk)

**Goal**: Group 70+ post components into brand folders.

**Steps**:
1. Create `features/posts/templates/sylo/` — move all non-Seasons posts (~38 files)
2. Create `features/posts/templates/seasons/` — move all Seasons* posts (~27 files)
3. Create barrel exports (`index.ts`) in each brand folder
4. Move shared components: `features/posts/shared/` (PostHeader, PostFooter, etc.)
5. Move editor components: `features/posts/editor/` (EditableText, DraggableWrapper, etc.)
6. Create `features/posts/registries/sylo.ts` — extract POST_REGISTRY from sylo-posts/page.tsx
7. Create `features/posts/registries/seasons.ts` — extract SEASONS_POSTS from seasons/page.tsx
8. Update all imports in post components (they import from `./EditableText`, `./shared`, etc.)

**Files changed**: ~70 moved, ~70 import updates
**Risk**: Medium — many file moves, but mostly mechanical import updates

---

### Phase 5: Extract Design Editor Components (Medium Risk)

**Goal**: Break up the 700+ line page files into reusable components.

**Steps**:
1. Extract `features/design-editor/components/Sidebar.tsx` — icon rail + panel shell
2. Extract `features/design-editor/components/SettingsPanel.tsx` — modes, aspect ratio, grid cols
3. Extract `features/design-editor/components/ThemePanel.tsx` — palette picker, color editor, fonts
4. Extract `features/design-editor/components/UploadsPanel.tsx` — upload + gallery
5. Extract `features/design-editor/components/GeneratePanel.tsx` — AI prompt + results
6. Extract `features/design-editor/components/PostGrid.tsx` — grid rendering + drag/select
7. Extract `features/design-editor/components/DownloadBar.tsx` — floating selection bar
8. Extract `features/design-editor/hooks/usePostGrid.ts` — grid state management
9. Extract `features/design-editor/hooks/useGenerate.ts` — generation state
10. Slim down `design/page.tsx` to ~50 lines (just composition)
11. Slim down `sylo-posts/page.tsx` to ~30 lines (uses same components)
12. Slim down `seasons/page.tsx` to ~30 lines (uses same components)

**Files changed**: 3 pages slimmed, ~10 new components/hooks
**Risk**: Medium — UI refactor, needs visual testing

---

### Phase 6: Extract Workspace Components (Low Risk)

**Goal**: Break up workspaces page into smaller components.

**Steps**:
1. Extract `features/workspace/components/WorkspaceCard.tsx`
2. Extract `features/workspace/components/WorkspaceForm.tsx` (create/edit modal)
3. Extract `features/workspace/components/WorkspaceStats.tsx` (already a component, just move)
4. Slim down `workspaces/page.tsx` to ~40 lines

**Files changed**: 1 page slimmed, 3 new components
**Risk**: Low — straightforward extraction

---

### Phase 7: Route Groups (Low Risk)

**Goal**: Organize pages with Next.js route groups.

**Steps**:
1. Move `app/page.tsx` → `app/(marketing)/page.tsx`
2. Create `app/(marketing)/layout.tsx` — minimal (no auth checks)
3. Move `app/login/page.tsx` → `app/(auth)/login/page.tsx`
4. Create `app/(auth)/layout.tsx` — redirect if already authenticated
5. Move `app/workspaces/page.tsx` → `app/(dashboard)/workspaces/page.tsx`
6. Move `app/design/page.tsx` → `app/(dashboard)/design/page.tsx`
7. Create `app/(dashboard)/layout.tsx` — auth guard, redirect to login if not authenticated
8. Move auth redirect logic from individual pages into layout

**Files changed**: 4 pages moved, 3 layouts created
**Risk**: Low — Next.js route groups don't change URLs

---

### Phase 8: Shared Export Logic (Low Risk)

**Goal**: Deduplicate download/zip logic across 3 pages.

**Steps**:
1. Create `lib/export/download.ts` — `downloadPostsAsZip(postRefs, selectedIds, filename)`
2. Replace duplicate logic in `design/page.tsx`, `sylo-posts/page.tsx`, `seasons/page.tsx`

**Files changed**: 3 existing, 1 new
**Risk**: Low — utility extraction

---

## Migration Order (Recommended)

```
Phase 1 (constants/types)     → 30 min   — safe, no UI changes
Phase 2 (AI prompts)          → 30 min   — safe, test with /generate-posts
Phase 3 (contexts)            → 20 min   — many imports but mechanical
Phase 8 (export logic)        → 15 min   — small, safe
Phase 6 (workspace)           → 20 min   — small page
Phase 4 (post templates)      → 60 min   — biggest phase, many files
Phase 5 (design editor)       → 45 min   — UI refactor
Phase 7 (route groups)        → 20 min   — final organization
```

**Total estimated effort**: ~4 hours of focused work

---

## Validation Checklist (per phase)

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes
- [ ] All pages render correctly (/, /login, /workspaces, /design, /sylo-posts, /seasons)
- [ ] AI generation works (`/api/generate`)
- [ ] Theme switching works across all post pages
- [ ] Post editing (EditableText, DraggableWrapper) works
- [ ] Download/export works
- [ ] No broken imports (check browser console for errors)

---

## Files to Delete After Migration

These become empty shells or are fully replaced:
- `app/components/` (entire folder — contents moved to `features/` and `contexts/`)
- `app/design/page-hardcoded.tsx` (legacy, unused)

---

## Import Path Convention

```tsx
// Features (domain logic + UI)
import { CloudPOSPost } from '@/features/posts/templates/sylo'
import { Sidebar } from '@/features/design-editor/components/Sidebar'
import { FONTS } from '@/features/design-editor/constants/fonts'

// Lib (business logic, no UI)
import { buildDynamicPrompt } from '@/lib/ai/build-prompt'
import { cleanCode } from '@/lib/ai/clean-code'
import type { AssetInfo } from '@/lib/ai/types'

// Contexts
import { useTheme } from '@/contexts/ThemeContext'
import { useAspectRatio } from '@/contexts/EditContext'

// Convex
import { api } from '@/convex/_generated/api'
```

Requires `tsconfig.json` path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## What We're NOT Changing

- **Convex backend** — Already well-organized, one file per table
- **Public assets** — No moves needed
- **package.json / config** — No new dependencies
- **Middleware** — Stays at root
- **`.claude/commands/`** — Stays as-is
