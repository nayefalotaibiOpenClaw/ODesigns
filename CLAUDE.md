# Sylo Social Posts

Social media post kit built with Next.js, Tailwind CSS, and lucide-react icons.

## Project Structure

- `app/page.tsx` — Main grid/list view of all posts
- `app/components/` — Individual post components (one per file)
- `app/components/EditableText.tsx` — Wrapper for inline-editable text (uses EditContext)
- `app/components/EditContext.tsx` — React context for edit mode state
- `app/customize/page.tsx` — Font and color palette picker (outputs JSON config)
- `app/generate/page.tsx` — Form to build AI prompts for post generation
- `app/layout.tsx` — Root layout with font loading
- `public/` — Static assets (screenshots, logos)

## Post Component Conventions

Every post component MUST follow these rules:

1. **Square aspect ratio**: `max-w-[600px] aspect-square` on the root div
2. **Self-contained**: Each post is one file in `app/components/`
3. **EditableText**: ALL visible text wrapped with `<EditableText>` (import from `./EditableText`)
   - Use `as="h2"`, `as="p"`, `as="h3"` for semantic tags
   - Default renders as `<span>`
4. **Font**: Applied via `style={{ fontFamily: "'FontName', sans-serif" }}` on root div, or via `font-sans` class
5. **Icons**: Only from `lucide-react`
6. **No external images** unless explicitly provided (logo, screenshots in /public)
7. **CSS-only visuals**: Mockups, charts, decorations all done with Tailwind classes

## Colors

Posts use a consistent palette. Current default:
- Primary: `#1B4332` (dark green)
- Secondary: `#40916C` (medium green)
- Accent: `#52B788` (light green)
- Background: `#EAF4EE` (very light green)
- Text: `#1B4332`

## Custom Commands

- `/generate-posts` — AI generates new post components from config, URL, screenshots, and features
