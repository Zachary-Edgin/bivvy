# Bivvy — Technical Brief for Collaborators

**Last updated:** February 20, 2026
**Author:** Zach (via Claude)
**Purpose:** Bring a collaborator (Nick) up to speed on the Bivvy codebase so their AI assistant can make informed contributions, particularly to the design system.

---

## What is Bivvy?

Bivvy is an AI-powered **component design tool** — think Figma Make, but focused on individual UI components rather than full pages. Users can:

1. Create components via natural language prompts or drawing tools
2. Select any element (or sub-element) on the canvas
3. Describe changes in natural language → AI generates style variations
4. Preview variations live on the canvas, then apply with one click
5. Enforce design system constraints (tokens, rules) to keep everything consistent

The core loop is: **create → select → iterate → validate → export**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| State Management | Zustand (single store) |
| Styling | Tailwind CSS + inline styles for canvas elements |
| AI | Anthropic Claude API (Sonnet) |
| Icons | Lucide React |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Export | html2canvas, Prism.js (code highlighting) |

### Running locally

```bash
npm install
# Create .env.local with: ANTHROPIC_API_KEY=sk-ant-your-key
npm run dev
# → http://localhost:3000
```

---

## File Structure

```
bivvy/
├── app/
│   ├── page.tsx                    # Main layout: left panel, canvas, right panel
│   ├── layout.tsx                  # Root layout + font loading
│   └── api/
│       ├── ai-update/route.ts      # Chat-based AI (create/edit components)
│       ├── ai-variations/route.ts  # Variation generation (style diffs)
│       └── extract-tokens/route.ts # AI-powered token extraction from CSS, Tailwind, SCSS, images, or text
├── components/
│   ├── Canvas.tsx                  # ★ Core canvas — rendering, selection, drag, resize, deep nesting
│   ├── PropertiesPanel.tsx         # Right panel — design properties for selected element
│   ├── AIVariationGenerator.tsx    # AI button, dialog, variation cards, canvas preview system
│   ├── DesignTokensPanel.tsx       # ★ Design system UI — tokens, component defs, guidelines
│   ├── ConstraintValidationPanel.tsx # Validates components against active design system
│   ├── LayerTree.tsx               # Left panel — layer hierarchy with drag reorder
│   ├── SelectionBreadcrumb.tsx     # Breadcrumb path: Canvas > Div > Button
│   ├── AutoLayoutPanel.tsx         # Figma-style auto layout controls (flex, alignment, gaps)
│   ├── CanvasToolbar.tsx           # Bottom toolbar — drawing tools, zoom, undo/redo
│   ├── WorkspaceBar.tsx            # Top bar — workspace tabs
│   ├── ExportPanel.tsx             # Export to JSON, HTML, SVG, code
│   ├── LibraryPanel.tsx            # Component library browser
│   ├── IconBrowser.tsx             # Icon picker (Lucide)
│   ├── IconRenderer.tsx            # Renders Lucide icons by name
│   ├── InspectOverlay.tsx          # Dev inspect mode (spacing, colors)
│   ├── KeyboardShortcuts.tsx       # Global keyboard shortcut handler
│   ├── OnboardingTour.tsx          # First-run walkthrough
│   ├── ResponsivePreview.tsx       # Responsive breakpoint preview
│   ├── BivvyMenu.tsx              # Hamburger menu
│   └── Toast.tsx                   # Toast notification system
├── store/
│   └── componentStore.ts           # ★ Zustand store — ALL state, actions, types
├── lib/
│   ├── designSystemDefaults.ts     # ★ Built-in token definitions, component defs, mappings
│   ├── aiTokenContext.ts           # Builds design system context string for AI prompts
│   ├── constraintValidator.ts      # Client-side constraint validation engine
│   ├── serverConstraintValidator.ts # Server-side validation (for AI variation output)
│   ├── componentLibrary.ts         # Pre-built component templates
│   ├── assetLibrary.ts             # Asset/image library
└── utils/
    └── fontLoader.ts               # Google Fonts dynamic loader
```

**★ = files Nick will most likely need to modify or understand**

---

## Core Data Model

### ComponentElement (the fundamental unit)

Every element on the canvas — from a top-level card to a deeply nested button — is a `ComponentElement`:

```typescript
interface ComponentElement {
  id: string;
  type: 'div' | 'button' | 'input' | 'text' | 'image' | 'icon' | 'line' | 'arrow';
  content?: string;               // Text content, icon name, or image URL
  styles: Record<string, any>;    // CSS-like styles (camelCase keys)
  position: { x: number; y: number };  // Canvas position (top-level only)
  size: { width: number; height: number };
  children?: ComponentElement[];   // Nested elements (recursive)
  
  // Component states
  hoverStyles?: Record<string, any>;
  activeStyles?: Record<string, any>;
  disabledStyles?: Record<string, any>;
  focusedStyles?: Record<string, any>;
  loadingStyles?: Record<string, any>;
  
  // Design system linking
  componentDefId?: string;                // Links to ComponentDefinition
  variantProps?: Record<string, string>;  // e.g. { size: "md", variant: "primary" }
  typeStyle?: string;                     // Links to typography token
  
  // Auto layout
  layoutSizing?: {
    widthMode: 'fixed' | 'hug' | 'fill';
    heightMode: 'fixed' | 'hug' | 'fill';
  };
  
  // Annotations, animation, visibility, lock state...
}
```

Key insight: **children are nested ComponentElements**. A pricing card might be:
```
Div (top-level, has position/size)
  └── Div (row container)
       ├── Div (card 1)
       │    ├── Text "Starter"
       │    ├── Text "$9"
       │    ├── Div (feature list)
       │    │    ├── Text "5 projects"
       │    │    └── Text "Basic analytics"
       │    └── Button "Get Started"
       ├── Div (card 2) ...
       └── Div (card 3) ...
```

Only top-level components have `position` and `size`. Children are laid out via CSS flexbox/grid within their parent.

---

## Design System Architecture

This is the area Nick will be working on most. Here's the current state:

### DesignSystem interface (in componentStore.ts)

```typescript
interface DesignSystem {
  // Legacy flat tokens (still used by validator + UI)
  colors: { name: string; value: string }[];
  fonts: string[];
  images: { name: string; url: string }[];
  tokens: {
    enabled: boolean;
    fontSizes: number[];
    fontWeights: number[];
    lineHeights: number[];
    letterSpacing: string[];
    spacing: number[];
    maxWidths: number[];
    borderRadius: number[];
    borderWidths: number[];
    borderStyles: string[];
    shadows: string[];
    opacities: number[];
    iconSizes: number[];
    minHeights: number[];
  };
  
  // ★ Named token system (structured tokens with themes)
  namedTokens: DesignToken[];
  
  // ★ Component variant definitions
  componentDefs: ComponentDefinition[];
  
  // ★ Token mappings (component + variant + state → token)
  tokenMappings: ComponentTokenMapping[];
  
  // Guidelines (soft rules)
  guidelines: {
    enabled: boolean;
    rules: string[];
    referenceLibrary: boolean;
  };
  
  // Whether a custom system was imported
  imported: boolean;
}
```

### Named Tokens (DesignToken)

The token system has two layers:

1. **Primitives** — raw values with no semantic meaning
   - `blue-500: #1976d2`, `gray-100: #f5f5f5`, `space-4: 16px`

2. **Semantics** — named references that point to primitives, themed
   - `color-background-primary` (dark: `#0a0a0a`, light: `#ffffff`)
   - `color-text-primary` (dark: `#f5f5f5`, light: `#212121`)
   - `color-interactive-primary` (dark: `#1976d2`, light: `#1976d2`)

```typescript
interface DesignToken {
  id: string;
  name: string;            // e.g. "color-background-primary"
  type: 'color' | 'spacing' | 'fontSize' | 'fontWeight' | 'lineHeight' | 
        'letterSpacing' | 'borderRadius' | 'borderWidth' | 'shadow' | 
        'opacity' | 'fontFamily' | 'composed';
  value: string;           // The actual CSS value
  referenceId?: string;    // Points to a primitive token ID
  category: 'primitive' | 'semantic';
  theme: 'light' | 'dark' | null;  // null for primitives
  description: string;
}
```

### Component Definitions (ComponentDefinition)

These define what a "Button" or "Card" is in the design system:

```typescript
interface ComponentDefinition {
  id: string;
  name: string;             // "Button"
  description: string;
  properties: {             // Designer-configurable options
    name: string;           // "variant"
    options: string[];      // ["primary", "secondary", "destructive"]
    default: string;        // "primary"
  }[];
  states: string[];         // ["default", "hover", "active", "disabled", "focused"]
  slots: { name: string; required: boolean; description: string }[];
  guidelines: string;       // Usage notes
  accessibility: string;    // ARIA/keyboard notes
}
```

### Token Mappings (ComponentTokenMapping)

These wire component variants to tokens:

```typescript
interface ComponentTokenMapping {
  id: string;
  componentDefId: string;   // links to ComponentDefinition
  propertyCombo: string;    // "size:md,variant:primary"
  state: string;            // "default", "hover", etc.
  cssProperty: string;      // "backgroundColor"
  tokenId: string;          // links to DesignToken
}
```

Example: Button (primary, md, default) → backgroundColor → `color-interactive-primary` → `#1976d2`

### Current defaults (lib/designSystemDefaults.ts)

The built-in system includes:
- ~50 color tokens (primitives + dark/light semantics)
- Typography tokens (4 sizes, 3 weights, line heights, letter spacing)
- Spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 96)
- Border radius scale (0, 2, 4, 8, 12, 16, 9999)
- 3 component definitions: Button, Input, Card
- ~80 token mappings wiring variants to tokens

### How tokens flow to the canvas

1. User selects a component linked to a `componentDefId`
2. `resolveMappingsToCSS()` in designSystemDefaults.ts looks up the correct tokens for the component's current variant + state
3. Resolved CSS values are merged into the component's inline styles
4. Theme switching swaps dark ↔ light semantic tokens via `buildThemeSwapMap()`

### Design system UI (DesignTokensPanel.tsx)

Currently provides:
- Toggle to enable/disable token enforcement
- Editable token value arrays (font sizes, spacing, colors, etc.)
- Named token browser with primitive/semantic grouping
- Component definition viewer
- Token mapping editor
- Import from file (JSON) or image (AI-extracted)
- Guidelines editor with rule list

**What Nick will likely want to change:** The overall look and experience of browsing/editing the design system. Currently it's functional but basic — comma-separated inputs, flat lists. Nick's goal is to make it feel like a proper design system explorer (think Figma's local styles panel or a dedicated tool like Tokens Studio).

---

## AI System

### Two AI routes

1. **`/api/ai-update`** — Chat-based. User describes what to create or edit. Returns a streaming JSON response with component data. Used for:
   - Creating new components from scratch
   - Editing selected components via natural language

2. **`/api/ai-variations`** — Variation generation. Takes existing component data + a prompt, returns N style variations as diffs. Used for:
   - "Change the font" → 4 variations with different fonts
   - "Make it dark mode" → 4 dark-themed variations
   - Full restyle requests

### How variations work

1. User selects element → clicks AI button → types prompt
2. `AIVariationGenerator.tsx` sends component tree + prompt to `/api/ai-variations`
3. AI returns `{ variations: [{ id, name, description, changes: [{ id, styles }] }] }`
4. Changes are **diffs** — only the properties that changed
5. `diffToFull()` merges diffs with original component data
6. Variations appear as cards below the canvas
7. Hover a card → live preview on canvas. Click "Apply" → permanent change.

### Scope awareness (recent fix)

The AI prompt now respects the user's intent: "change font" only changes font properties, not colors/backgrounds/borders. Previously it would over-modify everything.

### Contrast safety (recent fix)

After AI returns variations, a server-side post-processor checks every text element's color against its container's background using luminance calculations. If text would be invisible (white on white, dark on dark), it auto-corrects.

---

## Selection & Interaction Model

### Three-level interaction

1. **Canvas level** — Click empty canvas to deselect. Pan/zoom.
2. **Component level** — Click a top-level component to select it. Drag to move, handles to resize.
3. **Sub-element level** — Click inside a selected component to drill into children. Each click selects the deepest element under the cursor.

### Key state variables

```typescript
selectedIds: string[]        // Currently selected component(s)
selectedId: string | null    // First selected (convenience alias)
editingParentId: string | null  // Which component we're "inside" (sub-element mode)
```

When `editingParentId` is set:
- The parent component shows a dashed blue outline
- Children become clickable and hoverable
- An "Exit" button appears above the component
- Other components are dimmed
- Press Escape to exit back to parent level

### Deep nesting (recent fix)

Components can be nested 4+ levels deep (Div → Row → Card → Button). The canvas now uses `data-bivvy-id` attributes and `onMouseDown`/`onClick` handlers with `stopPropagation()` at every depth level to ensure clicks reach the deepest element.

---

## Canvas Variations System

Variations are displayed as cards below the main canvas area. The system stores:

```typescript
canvasVariations: {
  sourceComponents: ComponentElement[]  // Original state (for reverting)
  variations: Variation[]               // Generated alternatives
  livePreviewId: string | null          // Which variation is being previewed
  generationIndex: number               // Current generation (for history)
  generationHistory: GenerationEntry[]  // All previous generations
}
```

Hovering or clicking "Preview" on a variation card calls `livePreviewCanvasVariation()` which:
1. Restores original styles from `sourceComponents`
2. Applies the variation's component changes via `replaceComponent()`

"Apply" makes the change permanent and clears the variation state.

---

## Constraint Validation

When a design system is loaded with `imported: true`:

1. **Client-side** (`lib/constraintValidator.ts`) — Validates component styles against token lists. Reports violations like "fontSize 17px not in scale [12, 14, 16, 18, 20, 24]"
2. **Server-side** (`lib/serverConstraintValidator.ts`) — Validates AI-generated variations before returning them. Can auto-fix some violations.
3. **Accessibility checks** (always active) — WCAG AA contrast ratio (4.5:1 normal text, 3.0:1 large text), minimum font sizes, and touch target sizes. Thresholds adapt to the active platform (web: 36px, iOS: 44px, Android: 48px).

The validation panel (`ConstraintValidationPanel.tsx`) shows per-component violation lists with "Fix" and "Fix All" buttons.

---

## Platform-Aware AI Generation

Bivvy supports three target platforms: **Web**, **iOS**, **Android**. Selected via the toolbar pill selector.

When a platform is active:
- **AI system prompts** include platform-specific defaults (fonts, touch targets, spacing grids, color conventions)
- **Accessibility validation** uses platform-appropriate thresholds
- The platform value is stored in `designSystem.platform` and persists across sessions

| Platform | Default Font | Touch Target | Spacing Grid | Primary Action |
|----------|-------------|-------------|-------------|----------------|
| Web | Inter / system-ui | 36px | 4/8/12/16/24/32 | Flexible |
| iOS | SF Pro / -apple-system | 44px | 8pt grid | #007AFF |
| Android | Roboto / system-ui | 48px | 4pt grid | Material tonal |

---

## Code → Design Import

The "Create with AI" dialog (⌘K) has two modes:
- **Describe** — Type a natural language prompt to generate components from scratch
- **Import Code** — Paste HTML, React/JSX, or any frontend code. AI reconstructs it as editable Bivvy components on the canvas, preserving visual structure, text, colors, and layout.

This enables reverse workflow: developers paste existing code and iterate on it visually.

---

## State Management (componentStore.ts)

Single Zustand store (~2100 lines). Key slices:

| Slice | What it manages |
|-------|----------------|
| `components` | Array of all top-level ComponentElements |
| `selectedIds` / `editingParentId` | Selection state |
| `designSystem` | All tokens, component defs, mappings, guidelines |
| `messages` | AI chat history |
| `history` / `historyIndex` | Undo/redo (50 levels) |
| `canvasVariations` | Variation preview state |
| `workspaces` | Multi-workspace support |
| `toasts` | Notification queue |

Key actions:
- `addComponent()` / `updateComponent()` / `deleteComponent()` / `replaceComponent()`
- `selectComponent()` / `enterComponent()` / `exitComponent()`
- `findComponent(id)` — recursive search through entire tree
- `updateDesignSystem()` / `loadBuiltinDesignSystem()`
- `pushHistory()` / `undo()` / `redo()`

---

## What Nick Should Know for Design System Work

### Files to focus on

1. **`store/componentStore.ts`** — DesignSystem interface, DesignToken type, ComponentDefinition type, store actions
2. **`components/DesignTokensPanel.tsx`** — The UI for browsing/editing the design system (this is what you'll redesign)
3. **`lib/designSystemDefaults.ts`** — Built-in token definitions (you'll create a real product-based one)
4. **`lib/aiTokenContext.ts`** — How design system data gets passed to AI prompts
5. **`lib/constraintValidator.ts`** — How constraints are checked

### Current state of design system UI

The Tokens tab in the right panel currently shows:
- A toggle to enable/disable constraint enforcement
- Flat input fields for token arrays (font sizes, spacing, etc.)
- A named token section with expandable groups
- Component definition cards
- An import section (paste JSON or upload screenshot)
- A guidelines section

It's functional but visually basic. Nick's job is to make this look and feel like a professional design system explorer — possibly inspired by Figma's local variables panel, Tokens Studio, or similar tools.

### How to add a real design system

Replace the contents of `lib/designSystemDefaults.ts` with tokens extracted from an actual product. The structure is already there — primitives, semantics (dark/light), component defs, and mappings. You can also import via the UI (Tokens tab → Import section → paste JSON or upload a screenshot for AI extraction).

### Things that are connected

When you change the design system:
- **Constraint validation** immediately re-evaluates all components
- **AI prompts** include the active design system context (via `aiTokenContext.ts`)
- **Theme switching** uses semantic token mappings to swap light ↔ dark
- **Component variant resolution** uses token mappings to apply correct styles

---

## Known Issues / In Progress

1. **Canvas variations UX** — Currently shows as cards below canvas. Planning to move variation previews directly onto the canvas as side-by-side alternatives.
2. **AI chat** — Planning to condense from a full chat panel to a more click-based interaction (click element → type change → apply).
3. **Validation panel** — Planning to move to a small expandable section in the bottom-right rather than a full tab.
4. **Desktop app** — Researching Electron/Tauri wrapper to graduate from web app to installable application.

---

## Git Workflow

Both collaborators work on the same repo with feature branches:

```bash
# Nick's branch
git checkout -b nick/design-system
# ... work ...
git push origin nick/design-system

# Merge when ready
git checkout main && git pull origin main
git merge nick/design-system
git push origin main
```

Since Nick is primarily working in `DesignTokensPanel.tsx`, `designSystemDefaults.ts`, and potentially new files for design system UI, while Zach works on Canvas, AI, and app shell, merge conflicts should be rare.

---

## Quick Reference: Store Actions for Design System

```typescript
// Update design system
updateDesignSystem({ namedTokens: [...] })

// Load built-in defaults
loadBuiltinDesignSystem()

// Access current state
const { designSystem } = useStore.getState()

// Listen to changes (React)
const namedTokens = useStore(s => s.designSystem.namedTokens)
const componentDefs = useStore(s => s.designSystem.componentDefs)
```
