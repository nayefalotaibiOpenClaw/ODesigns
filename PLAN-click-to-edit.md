# Plan: Click-to-Edit with Contextual Toolbar

## Overview

Replace the global edit mode toggle with a click-to-select system. Clicking a post makes it editable. Clicking an element inside shows a contextual toolbar with relevant actions. All changes are stored as JSON overrides — the AI-generated code stays untouched.

## Data Model

```typescript
interface PostConfigOverrides {
  bgImage?: string;      // replacement background URL
  bgColor?: string;      // hex color
  bgGradient?: string;   // CSS gradient string
  elements?: {
    [configKey: string]: {
      text?: string;       // override text content
      color?: string;      // individual text/icon color
      fontSize?: string;   // "text-4xl" | "text-5xl" | "text-6xl"
      imageSrc?: string;   // for mockups/images
      hidden?: boolean;    // soft-delete (hide element)
    };
  };
}
```

Stored as `configOverrides: v.optional(v.string())` (JSON) in Convex `posts` table.

## Design Decisions

1. **Overrides as JSON, not code mutation** — AI code stays pristine, user can reset any change
2. **Per-post selection** — click a post to edit it, click outside to deselect (no global toggle)
3. **Context-based** — overrides flow through React context, existing components read from it
4. **No re-compilation needed** — overrides apply at render time via context, DynamicPost's useMemo on code string is unaffected

---

## Phase 1: MVP — Post Selection + Text Toolbar

### Step 1: Create OverrideContext
- **New file**: `app/components/OverrideContext.tsx`
- Define `PostConfigOverrides` interface
- Create `OverrideContext` providing `{ overrides, setOverride(path, value) }`
- Create `useOverrides()` and `useSetOverride()` hooks

### Step 2: Add configOverrides to Convex
- **Modify**: `convex/schema.ts` — add `configOverrides: v.optional(v.string())` to `posts` table
- **Modify**: `convex/posts.ts` — add `updateOverrides({ id, configOverrides })` mutation

### Step 3: Replace global edit mode with post selection
- **Modify**: `app/design/page.tsx`
- Remove `editMode` state and Settings toggle button
- Add `selectedPostId` state (string | null)
- Clicking a post sets `selectedPostId`
- Clicking outside clears it
- Selected post gets blue ring visual indicator
- Only selected post gets `<EditContext.Provider value={true}>`

### Step 4: Create SelectedElementContext
- **New file**: `app/components/SelectedElementContext.tsx`
- `selectedElementKey: string | null`
- `selectedElementType: 'text' | 'background' | 'mockup' | 'card' | 'image' | 'section' | null`
- `setSelectedElement(key, type)` function

### Step 5: Enhance EditableText with overrides
- **Modify**: `app/components/EditableText.tsx`
- Add `configKey?: string` prop
- Read override values from OverrideContext (color, fontSize, text)
- Apply overrides as inline styles
- On click in edit mode, set as selected element
- On blur, save text content to overrides

### Step 6: Create ContextualToolbar
- **New file**: `app/components/ContextualToolbar.tsx`
- Floating toolbar (portal to body)
- Reads `selectedElementType` from context
- For `text`: color picker, font size dropdown (text-3xl → text-7xl)
- Calls `setOverride()` on changes

### Step 7: Wire overrides into DynamicPost
- **Modify**: `app/components/DynamicPost.tsx`
- Accept `overrides?: PostConfigOverrides` prop
- Wrap rendered `<Component />` in `<OverrideContext.Provider value={overrides}>`

### Step 8: Load/save overrides in design page
- **Modify**: `app/design/page.tsx`
- Load `configOverrides` from Convex post data
- Parse JSON → PostConfigOverrides
- Wrap selected post in OverrideContext.Provider
- Debounced auto-save on override changes

---

## Phase 2: Background + Image Editing

### Step 9: Background selection
- Click background area (not on any element) → selects background
- Toolbar shows: color picker, image upload, gradient presets
- Override keys: `bgImage`, `bgColor`, `bgGradient`

### Step 10: Mockup screenshot replacement
- **Modify**: `app/components/shared/IPhoneMockup.tsx`, `IPadMockup.tsx`, `DesktopMockup.tsx`
- Read `imageSrc` override from OverrideContext for the mockup's config key
- Toolbar shows upload button for mockup type
- Uploaded image stored as data URL or Convex storage URL

### Step 11: Section visibility (delete/hide)
- **Modify**: `app/components/DraggableWrapper.tsx`
- Read `hidden` override from OverrideContext
- If hidden: faded preview in edit mode, fully hidden on export
- Toolbar shows "Hide" button for any selected element

---

## Phase 3: AI Awareness

### Step 12: Update AI prompt for config-aware code
- **Modify**: `app/api/generate/route.ts`
- Update prompt examples to generate `configKey` props on EditableText and DraggableWrapper
- New posts become immediately compatible with override system

---

## Element Types & Toolbar Actions

| Element Type | Toolbar Actions |
|---|---|
| **Background** | Change image (upload), change color, change gradient, change pattern |
| **Text (headline)** | Change color, change size (text-4xl/5xl/6xl), edit content |
| **Text (body)** | Change color, change size, edit content |
| **Device Mockup** | Replace screenshot (upload), change device type |
| **FloatingCard** | Change icon, change values, delete |
| **Image** | Replace image (upload), resize, delete |
| **Any section** | Delete (hide), duplicate, move up/down |

## Files Changed Summary

| File | Phase | Action |
|---|---|---|
| `app/components/OverrideContext.tsx` | 1 | NEW |
| `app/components/SelectedElementContext.tsx` | 1 | NEW |
| `app/components/ContextualToolbar.tsx` | 1 | NEW |
| `convex/schema.ts` | 1 | MODIFY |
| `convex/posts.ts` | 1 | MODIFY |
| `app/design/page.tsx` | 1 | MODIFY |
| `app/components/EditableText.tsx` | 1 | MODIFY |
| `app/components/DynamicPost.tsx` | 1 | MODIFY |
| `app/components/shared/IPhoneMockup.tsx` | 2 | MODIFY |
| `app/components/shared/IPadMockup.tsx` | 2 | MODIFY |
| `app/components/shared/DesktopMockup.tsx` | 2 | MODIFY |
| `app/components/DraggableWrapper.tsx` | 2 | MODIFY |
| `app/api/generate/route.ts` | 3 | MODIFY |
