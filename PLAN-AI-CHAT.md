# AI Chat Post Generator — Plan

## Overview
A chat sidebar where users describe a post idea, AI generates live JSX code, and it renders instantly in the browser. Users can iterate via chat ("make it darker", "switch to iPad mockup").

## Architecture

```
User Chat Input
    ↓
Next.js API Route (/api/generate)
    ↓
AI Provider (Claude / Gemini / OpenAI — user picks)
    ↓
JSX Code String
    ↓
react-live (LiveProvider + LivePreview)
    ↓
Rendered Post Preview
```

## Key Components

### 1. Chat Sidebar (`app/components/ChatSidebar.tsx`)
- Slide-out panel from right side
- Chat messages (user + AI)
- Text input + send button
- Model selector dropdown (Claude / Gemini / OpenAI)
- API key input (stored in localStorage, never sent to our server)
- "Save as Post" button to export generated code as a file
- "Add to Grid" button to add the live post to the main grid

### 2. API Route (`app/api/generate/route.ts`)
- Accepts: `{ prompt, model, apiKey, history[] }`
- Routes to correct provider based on model selection:
  - `claude` → Anthropic SDK (`@anthropic-ai/sdk`)
  - `gemini` → Google AI SDK (`@google/generative-ai`)
  - `openai` → OpenAI SDK (`openai`)
- System prompt includes:
  - All shared component docs (IPhoneMockup, IPadMockup, DesktopMockup, PostHeader, PostFooter, FloatingCard)
  - Theme system (t.primary, t.accent, etc.)
  - DraggableWrapper + EditableText usage
  - Design rules (aspect-square, max-w-[600px], CSS-only visuals)
  - Available screenshots in /public
- Returns: `{ code: string }` — the JSX code string
- API key passed from client (never stored server-side)

### 3. Live Preview (`app/components/LivePostPreview.tsx`)
- Uses `react-live` package
- `LiveProvider` with scope containing all shared components:
  ```
  scope = {
    React, useState, useEffect,
    IPhoneMockup, IPadMockup, DesktopMockup,
    PostHeader, PostFooter, FloatingCard,
    EditableText, DraggableWrapper,
    useTheme, useAspectRatio,
    // All lucide-react icons
    ...lucideIcons
  }
  ```
- `LivePreview` renders the post
- `LiveEditor` (optional) for manual code tweaks
- `LiveError` shows compilation errors

### 4. Model Provider Config (`app/lib/ai-providers.ts`)
- Abstract interface for all providers:
  ```ts
  interface AIProvider {
    name: string;
    models: string[];
    generate(apiKey: string, systemPrompt: string, messages: Message[]): Promise<string>;
  }
  ```
- Providers:
  - **Claude**: claude-sonnet-4-20250514 (default), claude-opus-4-20250514
  - **Gemini**: gemini-2.0-flash, gemini-2.5-pro
  - **OpenAI**: gpt-4o, gpt-4o-mini

### 5. System Prompt (`app/lib/post-system-prompt.ts`)
- Extracted from `.claude/commands/generate-posts.md`
- Contains all shared component docs, theme system, conventions
- Instructs AI to return ONLY the JSX render body (no imports, no export)
- Example output format:
  ```jsx
  // AI returns this:
  () => {
    const t = useTheme();
    const ratio = useAspectRatio();
    const isTall = ratio === '9:16' || ratio === '3:4';
    return (
      <div className="relative w-full max-w-[600px] aspect-square ...">
        ...
      </div>
    );
  }
  ```

## UI Flow

1. User clicks "Generate" button in header → opens chat sidebar
2. User selects model + enters API key (saved to localStorage)
3. User types: "Create a post about customer loyalty program with iPhone mockup"
4. AI generates JSX → renders live in preview panel
5. User iterates: "make the background darker" / "add a floating card with 95% retention"
6. When happy → "Save as Post" exports to a .tsx file + adds to page.tsx
7. "Add to Grid" adds it as a live-rendered post in the main grid

## Packages to Install

```bash
npm install react-live @anthropic-ai/sdk openai @google/generative-ai
```

## File Structure

```
app/
  api/
    generate/
      route.ts          # Multi-provider AI endpoint
  components/
    ChatSidebar.tsx     # Chat UI + model selector
    LivePostPreview.tsx # react-live renderer
  lib/
    ai-providers.ts     # Provider abstraction
    post-system-prompt.ts # System prompt for post generation
  page.tsx              # Add chat toggle button
```

## Security

- API keys stored in localStorage only, never in server env
- API keys sent per-request to our API route, used once, not logged
- No server-side storage of keys
- react-live sandboxes execution (no access to window, fetch, etc.)

## Edge Cases

- AI returns invalid JSX → LiveError shows error, user can ask AI to fix
- Missing imports → all components pre-loaded in scope, AI doesn't need import statements
- Large responses → stream the response for better UX
- Rate limits → show error message, user can retry

## Future Enhancements

- Save generated posts to a library (localStorage)
- Share generated posts via URL (base64 encoded config)
- Image upload in chat (describe screenshot → AI uses it)
- Template gallery (pre-built prompts like "loyalty post", "analytics post")
- Code editor toggle to manually edit generated code
