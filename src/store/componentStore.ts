import { create } from 'zustand';
import { buildThemeSwapMap, defaultNamedTokens, defaultComponentDefs, defaultTokenMappings } from '@/lib/designSystemDefaults';
import { apiUrl } from '@/utils/apiBase';

export interface ComponentElement {
  id: string;
  type: 'div' | 'button' | 'input' | 'text' | 'image' | 'icon' | 'line' | 'arrow';
  content?: string;
  styles: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  children?: ComponentElement[];
  parentId?: string | null;
  hidden?: boolean;
  locked?: boolean;
  // Component states
  hoverStyles?: Record<string, any>;
  activeStyles?: Record<string, any>;
  disabledStyles?: Record<string, any>;
  focusedStyles?: Record<string, any>;
  loadingStyles?: Record<string, any>;
  // Annotations
  annotations?: Annotation[];
  // Animation
  animation?: {
    entrance?: 'none' | 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleUp' | 'bounce';
    duration?: number; // ms
    delay?: number; // ms
    easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    hoverTransition?: number; // ms for hover state transition
  };
  // Component variant tracking (links to ComponentDefinition)
  componentDefId?: string;          // which definition this follows
  variantProps?: Record<string, string>;  // e.g. { size: "md", variant: "primary" }
  slotName?: string;               // which slot this child fills (matches ComponentDefinition.slots[].name)
  // Typography preset tracking (links to a composed type style token id)
  typeStyle?: string;  // e.g. 'type-heading-1', 'type-body' — informational, CSS values live in styles
  // Auto layout sizing mode (how this component sizes within a flex parent)
  layoutSizing?: {
    widthMode: 'fixed' | 'hug' | 'fill';
    heightMode: 'fixed' | 'hug' | 'fill';
  };
  // ═══ Apple Design System (HIG) Properties ═══
  tintProminence?: 'auto' | 'none' | 'secondary' | 'primary';
  controlSize?: 'mini' | 'sm' | 'md' | 'lg' | 'xl';
  cornerRadiusMode?: 'fixed' | 'concentric' | 'capsule';
  glassEffect?: boolean;
  scrollEdgeEffect?: 'none' | 'soft' | 'hard';
  aiGenerated?: boolean;
  // ═══ Symbol System ═══
  symbolMasterId?: string;
  isSymbolMaster?: boolean;
  isSymbolInstance?: boolean;
}

export interface Annotation {
  id: string;
  text: string;
  author?: string;
  timestamp: number;
  resolved?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// ═══ Named Token System (Nick's spec) ═══
export type TokenType = 'color' | 'spacing' | 'typography' | 'radius' | 'shadow' | 'motion' | 'sizing' | 'border' | 'opacity' | 'breakpoint' | 'z-index';
export type TokenLayer = 'primitive' | 'semantic';

export interface DesignToken {
  id: string;
  name: string;                    // e.g. "color-background-primary"
  type: TokenType;                 // e.g. "color"
  value: string;                   // the actual value (hex, px, etc.)
  referenceId?: string;            // points to primitive token id (for semantic tokens)
  category: TokenLayer;            // primitive or semantic
  theme: 'light' | 'dark' | null;  // null for primitives
  description: string;             // "Primary background for content areas"
}

// ═══ Component Variant System ═══
export interface ComponentProperty {
  name: string;                     // e.g. "size", "variant"
  options: string[];                // e.g. ["sm", "md", "lg"]
  default: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;                     // e.g. "Button"
  description: string;
  properties: ComponentProperty[];  // designer choices
  states: string[];                 // runtime states
  slots: { name: string; required: boolean; description: string }[];
  guidelines: string;               // usage notes (legacy text)
  useWhen?: string[];               // structured: when to use this component
  dontUseWhen?: string[];           // structured: when NOT to use this component
  accessibility: string;            // ARIA, keyboard notes
  builtFrom?: string[];             // composition: component names this is built from
  responsiveRules?: { breakpoint: string; behavior: string }[];  // how it adapts across breakpoints
  platformOverrides?: {
    ios?: { notes: string; styles?: Record<string, any> };
    android?: { notes: string; styles?: Record<string, any> };
    web?: { notes: string; styles?: Record<string, any> };
  };
}

// ═══ Component Token Mapping ═══
export interface ComponentTokenMapping {
  id: string;
  componentDefId: string;          // links to ComponentDefinition.id
  propertyCombo: string;            // e.g. "size:md,variant:primary"
  state: string;                    // e.g. "default", "hover"
  cssProperty: string;              // e.g. "backgroundColor"
  tokenId: string;                  // links to DesignToken.id
}

export interface DesignSystem {
  colors: { name: string; value: string }[];
  fonts: string[];
  images: { name: string; url: string }[];
  // Legacy flat token arrays (still used by existing UI + validator)
  tokens: {
    enabled: boolean;
    // Typography
    fontSizes: number[];
    fontWeights: number[];
    lineHeights: number[];
    letterSpacing: string[];
    // Spacing & Layout
    spacing: number[];
    maxWidths: number[];
    // Borders & Shape
    borderRadius: number[];
    borderWidths: number[];
    borderStyles: string[];
    // Effects
    shadows: string[];
    opacities: number[];
    // Sizing
    iconSizes: number[];
    minHeights: number[];
  };
  // Named token system (Nick's spec — structured tokens with themes)
  namedTokens: DesignToken[];
  // Component variant definitions
  componentDefs: ComponentDefinition[];
  // Token mappings (component + variant + state → token)
  tokenMappings: ComponentTokenMapping[];
  // Guidelines — soft patterns and natural language rules
  guidelines: {
    enabled: boolean;
    rules: string[];
    referenceLibrary: boolean;
  };
  // Whether a custom design system has been explicitly imported (controls constraint enforcement)
  imported: boolean;
  // Target platform — affects AI generation defaults and accessibility rules
  platform: 'web' | 'ios' | 'android';
}

// Max undo history size
const MAX_HISTORY = 50;

export interface Workspace {
  id: string;
  name: string;
  components: ComponentElement[];
  history: ComponentElement[][];
  historyIndex: number;
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  canvasBg: 'dark' | 'light';
  designSystem: DesignSystem;
}

const defaultDesignSystem: DesignSystem = {
  colors: [
    { name: 'Primary', value: '#1976d2' },
    { name: 'Secondary', value: '#9c27b0' },
    { name: 'Success', value: '#2e7d32' },
    { name: 'Error', value: '#c62828' },
    { name: 'Warning', value: '#e65100' },
    { name: 'Info', value: '#0288d1' },
  ],
  fonts: ['Plus Jakarta Sans', 'DM Sans', 'Space Grotesk', 'Outfit', 'Sora', 'Lexend', 'Playfair Display', 'Inter'],
  images: [],
  tokens: {
    enabled: false,
    fontSizes: [12, 14, 16, 18, 20, 24, 32, 40, 48],
    fontWeights: [300, 400, 500, 600, 700],
    lineHeights: [1, 1.1, 1.2, 1.25, 1.4, 1.5, 1.6, 1.75, 1.8],
    letterSpacing: ['-0.02em', '0', '0.01em', '0.02em', '0.05em', '0.1em'],
    spacing: [4, 8, 12, 16, 24, 32, 48, 64],
    maxWidths: [320, 480, 640, 768, 1024, 1280],
    borderRadius: [0, 4, 8, 12, 16, 24, 9999],
    borderWidths: [0, 1, 2, 3, 4],
    borderStyles: ['none', 'solid', 'dashed', 'dotted'],
    shadows: ['none', '0 1px 3px rgba(0,0,0,0.12)', '0 4px 12px rgba(0,0,0,0.15)', '0 8px 30px rgba(0,0,0,0.2)'],
    opacities: [0, 0.08, 0.1, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
    iconSizes: [16, 20, 24, 32, 40, 48],
    minHeights: [32, 36, 40, 44, 48],
  },
  namedTokens: [],
  componentDefs: [],
  tokenMappings: [],
  guidelines: {
    enabled: false,
    rules: [],
    referenceLibrary: true,
  },
  imported: false,
  platform: 'web',
};

function deepCopyDesignSystem(): DesignSystem {
  return JSON.parse(JSON.stringify(defaultDesignSystem));
}

let workspaceCounter = 0;

function createWorkspace(name?: string): Workspace {
  workspaceCounter++;
  return {
    id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: name || `Workspace ${workspaceCounter}`,
    components: [],
    history: [[]],
    historyIndex: 0,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    showGrid: true,
    canvasBg: 'dark' as const,
    designSystem: deepCopyDesignSystem(),
  };
}

// Canvas-based variations displayed on the canvas
interface CanvasVariation {
  id: string;
  name: string;
  description: string;
  components: ComponentElement[];
  isFavorited: boolean;
}

interface CanvasVariationsState {
  targetIds: string[];
  sourceComponents: ComponentElement[];
  variations: CanvasVariation[];
  prompt: string;
  livePreviewId: string | null;
  generationIndex?: number; // which generation this is (0-based)
}

// Stores all past canvas variation generations per component
interface VariationHistoryEntry {
  variations: CanvasVariation[];
  prompt: string;
  timestamp: number;
}

interface StoreState {
  // Workspaces
  workspaces: Workspace[];
  activeWorkspaceId: string;

  // Component state
  components: ComponentElement[];
  selectedId: string | null;
  selectedIds: string[];
  hoveredId: string | null;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  
  // Undo/Redo history
  history: ComponentElement[][];
  historyIndex: number;
  
  // Clipboard
  clipboard: ComponentElement[];
  
  // Canvas state
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  canvasBg: 'dark' | 'light';
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
  activeTool: string;
  devicePreview: null | 'phone' | 'tablet' | 'desktop';
  previewState: 'normal' | 'hover' | 'active' | 'disabled' | 'focused' | 'loading';
  
  // Saved templates
  savedTemplates: { name: string; component: ComponentElement; timestamp: number }[];
  
  // AI state
  isGenerating: boolean;
  
  // Design system
  designSystem: DesignSystem;
  
  // Layer tree state
  expandedIds: Set<string>;
  
  // Sub-element selection
  editingParentId: string | null; // which parent component we're "inside"

  // Show annotations
  showAnnotations: boolean;

  // Inspect mode
  inspectMode: boolean;
  toggleInspectMode: () => void;
  
  // Theme
  activeTheme: 'light' | 'dark';

  // Responsive preview
  showResponsivePreview: boolean;
  toggleResponsivePreview: () => void;

  // Theme swap
  swapComponentTheme: () => void;

  // Canvas interaction state
  isCanvasDragging: boolean;
  setCanvasDragging: (dragging: boolean) => void;
  
  // Toast notifications
  toasts: Toast[];
  
  // Actions
  addComponent: (component: ComponentElement) => void;
  batchAddComponents: (components: ComponentElement[]) => void;
  addChildToComponent: (parentId: string, child: Partial<ComponentElement>) => void;
  reparentComponent: (componentId: string, newParentId: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentElement>) => void;
  batchUpdatePositions: (updates: { id: string; position: { x: number; y: number } }[]) => void;
  replaceComponent: (id: string, replacements: Partial<ComponentElement>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  deleteSelected: () => void;
  selectComponent: (id: string | null) => void;
  selectMultiple: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setHoveredComponent: (id: string | null) => void;
  clearComponents: () => void;
  reorderComponent: (fromIndex: number, toIndex: number) => void;
  reorderChild: (parentId: string, fromIndex: number, toIndex: number) => void;
  
  // Clipboard actions
  copySelected: () => void;
  pasteClipboard: () => void;
  cutSelected: () => void;
  
  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Layer tree actions
  toggleExpanded: (id: string) => void;
  
  // Sub-element actions
  enterComponent: (id: string) => void;
  exitComponent: () => void;
  
  // Toast actions
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Helpers
  findComponent: (id: string) => ComponentElement | null;
  
  // Canvas actions
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  zoomToFit: (viewportWidth: number, viewportHeight: number) => void;
  toggleGrid: () => void;
  setCanvasBg: (bg: 'dark' | 'light') => void;
  toggleRulers: () => void;
  toggleSnapToGrid: () => void;
  toggleComponentLock: (id: string) => void;
  setActiveTool: (tool: string) => void;
  setDevicePreview: (device: null | 'phone' | 'tablet' | 'desktop') => void;
  setPreviewState: (state: 'normal' | 'hover' | 'active' | 'disabled' | 'focused' | 'loading') => void;
  
  // Template actions
  saveAsTemplate: (id: string, name: string) => void;
  deleteTemplate: (index: number) => void;
  loadTemplate: (index: number) => void;
  
  // AI actions
  setIsGenerating: (generating: boolean) => void;
  
  // Annotation actions
  addAnnotation: (componentId: string, text: string, author?: string) => void;
  removeAnnotation: (componentId: string, annotationId: string) => void;
  toggleResolveAnnotation: (componentId: string, annotationId: string) => void;
  toggleShowAnnotations: () => void;
  
  // Canvas variations
  canvasVariations: CanvasVariationsState | null;
  // Variation iteration history — keyed by target component ID
  variationHistory: Record<string, VariationHistoryEntry[]>;
  variationHistoryIndex: number; // -1 = viewing current, 0+ = viewing history[index]
  pendingIterateTarget: string | null;
  showAICreate: boolean;
  setCanvasVariations: (data: CanvasVariationsState) => void;
  clearCanvasVariations: () => void;
  favoriteCanvasVariation: (variationId: string) => void;
  applyCanvasVariation: (variationId: string) => void;
  livePreviewCanvasVariation: (variationId: string | null) => void;
  navigateVariationHistory: (direction: 'prev' | 'next') => void;
  navigateToVariationIndex: (targetIndex: number) => void;
  restoreVariationHistory: (targetIds: string[]) => boolean;
  getVariationHistoryCount: (targetIds: string[]) => number;
  
  // Design system actions
  updateDesignSystem: (system: Partial<DesignSystem>) => void;
  loadBuiltinDesignSystem: () => void;
  
  // File operations
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
  clearCanvas: () => void;

  // Group actions
  groupSelected: () => void;
  ungroupComponent: (id: string) => void;

  // Workspace actions
  addWorkspace: (name?: string) => void;
  removeWorkspace: (id: string) => void;
  switchWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  duplicateWorkspace: (id: string) => void;

  // ═══ Symbol System (Master / Instance) ═══
  createSymbolFromComponent: (componentId: string) => void;
  createInstanceOfSymbol: (symbolMasterId: string, position?: { x: number; y: number }) => void;
  syncSymbolInstances: (masterId: string) => void;
  detachSymbolInstance: (instanceId: string) => void;
  getSymbolInstances: (masterId: string) => ComponentElement[];

  // ═══ Two-Way Token Sync ═══
  updateTokenAndSync: (tokenId: string, newValue: string) => void;

  // ═══ Design ↔ Code Round-Trip ═══
  importHTMLToExisting: (html: string, targetComponentId?: string) => Promise<boolean>;
}

/** Deep-clone a component, regenerating IDs for the root and all children */
function deepCloneWithNewIds(comp: ComponentElement, newParentId?: string): ComponentElement {
  const newId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const cloned: ComponentElement = {
    ...JSON.parse(JSON.stringify(comp)),
    id: newId,
    ...(newParentId !== undefined ? { parentId: newParentId } : {}),
  };
  if (cloned.children && cloned.children.length > 0) {
    cloned.children = cloned.children.map(child => deepCloneWithNewIds(child, newId));
  }
  return cloned;
}

export const useStore = create<StoreState>((set, get) => {
  const initialWorkspace = createWorkspace();
  return {
  // Initial state
  workspaces: [initialWorkspace],
  activeWorkspaceId: initialWorkspace.id,
  components: [],
  selectedId: null,
  selectedIds: [],
  selectionBox: null,
  hoveredId: null,
  history: [[]],
  historyIndex: 0,
  clipboard: [],
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  showGrid: true,
    canvasBg: 'dark' as const,
  showRulers: false,
  snapToGrid: false,
  gridSize: 20,
  activeTool: 'select',
  devicePreview: null,
  previewState: 'normal',
  savedTemplates: (() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('bivvy-templates');
        return stored ? JSON.parse(stored) : [];
      }
    } catch {}
    return [];
  })(),
  isGenerating: false,
  canvasVariations: null,
  variationHistory: {},
  variationHistoryIndex: -1,
  pendingIterateTarget: null,
  showAICreate: false,
  expandedIds: new Set<string>(),
  editingParentId: null,
  showAnnotations: true,
  inspectMode: false,
  showResponsivePreview: false,
  activeTheme: 'dark' as const,
  isCanvasDragging: false,
  toasts: [],
  designSystem: deepCopyDesignSystem(),

  // Helper functions
  findComponent: (id: string) => {
    const findInTree = (components: ComponentElement[]): ComponentElement | null => {
      for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children && Array.isArray(comp.children)) {
          const found = findInTree(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(get().components);
  },

  // ===== UNDO/REDO =====
  pushHistory: () => set((state) => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.components)));
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }),

  undo: () => set((state) => {
    if (state.historyIndex <= 0) {
      // At beginning of history — ensure we're at the initial state
      const initial = state.history[0] ? JSON.parse(JSON.stringify(state.history[0])) : [];
      return {
        components: initial,
        historyIndex: 0,
        selectedId: null,
        selectedIds: [],
        editingParentId: null,
      };
    }
    // Save current live state for redo (append after current index if not already there)
    const newHistory = [...state.history];
    if (newHistory.length <= state.historyIndex + 1 || 
        JSON.stringify(newHistory[state.historyIndex + 1]) !== JSON.stringify(state.components)) {
      // Ensure there's room for the current state at index+1
      newHistory[state.historyIndex + 1] = JSON.parse(JSON.stringify(state.components));
    }
    
    // Restore the pre-change state at historyIndex (pushHistory saves state BEFORE mutation here)
    const restored = JSON.parse(JSON.stringify(newHistory[state.historyIndex]));
    // If editingParentId no longer exists in restored state, clear it
    const findInTree = (comps: ComponentElement[], id: string): boolean => {
      for (const c of comps) {
        if (c.id === id) return true;
        if (c.children && findInTree(c.children, id)) return true;
      }
      return false;
    };
    const editingParentId = state.editingParentId && findInTree(restored, state.editingParentId) ? state.editingParentId : null;
    return {
      components: restored,
      history: newHistory,
      historyIndex: state.historyIndex - 1,
      selectedId: null,
      selectedIds: [],
      editingParentId,
    };
  }),

  redo: () => set((state) => {
    // After undo, the saved (pre-undo) state is at historyIndex + 2
    // (historyIndex+1 = pushHistory entry, historyIndex+2 = saved live state)
    if (state.historyIndex + 2 >= state.history.length) return state;
    const restored = JSON.parse(JSON.stringify(state.history[state.historyIndex + 2]));
    const findInTree = (comps: ComponentElement[], id: string): boolean => {
      for (const c of comps) {
        if (c.id === id) return true;
        if (c.children && findInTree(c.children, id)) return true;
      }
      return false;
    };
    const editingParentId = state.editingParentId && findInTree(restored, state.editingParentId) ? state.editingParentId : null;
    return {
      components: restored,
      historyIndex: state.historyIndex + 1,
      selectedId: null,
      selectedIds: [],
      editingParentId,
    };
  }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex + 2 < get().history.length,

  // ===== CLIPBOARD =====
  copySelected: () => set((state) => {
    const findInTree = (components: ComponentElement[], id: string): ComponentElement | null => {
      for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) { const found = findInTree(comp.children, id); if (found) return found; }
      }
      return null;
    };
    const copied = state.selectedIds
      .map(id => findInTree(state.components, id))
      .filter(Boolean) as ComponentElement[];
    return { clipboard: JSON.parse(JSON.stringify(copied)) };
  }),

  pasteClipboard: () => {
    const state = get();
    if (state.clipboard.length === 0) return;
    
    // Push history before paste
    get().pushHistory();
    
    const newComps = state.clipboard.map(comp => {
      const cloned = deepCloneWithNewIds(comp);
      // Strip parentId — pasted items become top-level components
      delete cloned.parentId;
      // If pasting a child element (has zero position/size), give it sensible defaults
      const hasValidSize = comp.size.width > 0 && comp.size.height > 0;
      if (!hasValidSize) {
        // Derive size from styles or use defaults
        const w = parseInt(comp.styles?.width || '') || 200;
        const h = parseInt(comp.styles?.height || '') || 100;
        cloned.size = { width: w, height: h };
        cloned.position = { x: 200, y: 200 };
      } else {
        cloned.position = { x: comp.position.x + 30, y: comp.position.y + 30 };
      }
      return cloned;
    });
    
    set({
      components: [...state.components, ...newComps],
      selectedIds: newComps.map(c => c.id),
      selectedId: newComps.length === 1 ? newComps[0].id : null,
    });
  },

  cutSelected: () => {
    const state = get();
    // Find components (including nested children)
    const findInTree = (components: ComponentElement[], id: string): ComponentElement | null => {
      for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) { const found = findInTree(comp.children, id); if (found) return found; }
      }
      return null;
    };
    const copied = state.selectedIds
      .map(id => findInTree(state.components, id))
      .filter(Boolean) as ComponentElement[];
    
    // Push history before cut
    get().pushHistory();
    
    const idsToDelete = new Set(state.selectedIds);
    const deleteInTree = (components: ComponentElement[]): ComponentElement[] => {
      return components
        .filter(comp => !idsToDelete.has(comp.id))
        .map(comp => comp.children ? { ...comp, children: deleteInTree(comp.children) } : comp);
    };
    // Clear editingParentId if the edited parent is being cut
    const newEditingParentId = state.editingParentId && idsToDelete.has(state.editingParentId)
      ? null : state.editingParentId;
    set({
      clipboard: JSON.parse(JSON.stringify(copied)),
      components: deleteInTree(state.components),
      selectedId: null,
      selectedIds: [],
      editingParentId: newEditingParentId,
    });
  },

  // ===== COMPONENT ACTIONS =====
  addComponent: (component) => {
    get().pushHistory();
    // Clamp position to device bounds if preview active
    const dp = get().devicePreview;
    if (dp && component.position && component.size) {
      const devSizes = { phone: { w: 375, h: 812 }, tablet: { w: 768, h: 1024 }, desktop: { w: 1440, h: 900 } };
      const dev = devSizes[dp];
      component = {
        ...component,
        position: {
          x: Math.max(0, Math.min(component.position.x, dev.w - component.size.width)),
          y: Math.max(0, Math.min(component.position.y, dev.h - component.size.height)),
        },
      };
    }
    set((state) => ({
      components: [...state.components, component],
      selectedId: component.id,
      selectedIds: [component.id],
      expandedIds: new Set([...state.expandedIds, component.id]),
    }));
  },

  batchAddComponents: (components) => {
    get().pushHistory();
    const dp = get().devicePreview;
    const devSizes = { phone: { w: 375, h: 812 }, tablet: { w: 768, h: 1024 }, desktop: { w: 1440, h: 900 } };
    const clamped = components.map(comp => {
      if (dp && comp.position && comp.size) {
        const dev = devSizes[dp];
        return { ...comp, position: { x: Math.max(0, Math.min(comp.position.x, dev.w - comp.size.width)), y: Math.max(0, Math.min(comp.position.y, dev.h - comp.size.height)) } };
      }
      return comp;
    });
    const lastComp = clamped[clamped.length - 1];
    set((state) => ({
      components: [...state.components, ...clamped],
      selectedId: lastComp?.id || state.selectedId,
      selectedIds: lastComp ? [lastComp.id] : state.selectedIds,
      expandedIds: new Set([...state.expandedIds, ...clamped.map(c => c.id)]),
    }));
  },

  addChildToComponent: (parentId, child) => {
    get().pushHistory();
    set((state) => {
      const addChild = (components: ComponentElement[]): ComponentElement[] => {
        return components.map((comp) => {
          if (comp.id === parentId) {
            const childStyles = { ...(child.styles || {}) };
            // Ensure icons have a visible size in styles
            if ((child.type === 'icon') && !childStyles.width) {
              childStyles.width = '24px';
              childStyles.height = '24px';
            }
            const fullChild: ComponentElement = {
              id: child.id || `child-${Date.now()}`,
              type: child.type || 'text',
              content: child.content || '',
              styles: childStyles,
              // Children don't use position/size — they're flex items
              // Use dummy values; actual sizing comes from styles
              position: { x: 0, y: 0 },
              size: { width: 0, height: 0 },
              parentId: parentId,
            };
            const newChildren = [...(comp.children || []), fullChild];
            // Auto-expand parent height: estimate ~50px per child + padding
            const estimatedHeight = Math.max(comp.size.height, newChildren.length * 50 + 40);
            return {
              ...comp,
              children: newChildren,
              size: { ...comp.size, height: estimatedHeight },
              // Ensure parent has flex layout for children
              styles: {
                ...comp.styles,
                display: comp.styles.display || 'flex',
                flexDirection: comp.styles.flexDirection || 'column',
                gap: comp.styles.gap || '8px',
              },
            };
          }
          if (comp.children) {
            return { ...comp, children: addChild(comp.children) };
          }
          return comp;
        });
      };
      return {
        components: addChild(state.components),
        expandedIds: new Set([...state.expandedIds, parentId]),
      };
    });
  },

  reparentComponent: (componentId, newParentId) => {
    // Prevent self-reparenting
    if (componentId === newParentId) return;
    
    // Prevent circular reparenting (moving a component into its own descendant)
    const isDescendant = (ancestorId: string, targetId: string, components: ComponentElement[]): boolean => {
      const findComp = (comps: ComponentElement[], id: string): ComponentElement | null => {
        for (const c of comps) {
          if (c.id === id) return c;
          if (c.children) { const f = findComp(c.children, id); if (f) return f; }
        }
        return null;
      };
      const ancestor = findComp(components, ancestorId);
      if (!ancestor?.children) return false;
      const checkChildren = (children: ComponentElement[]): boolean => {
        for (const child of children) {
          if (child.id === targetId) return true;
          if (child.children && child.children.length > 0 && checkChildren(child.children)) return true;
        }
        return false;
      };
      return checkChildren(ancestor.children);
    };
    
    if (isDescendant(componentId, newParentId, get().components)) return;
    
    get().pushHistory();
    set((state) => {
      // 1. Find the component to move
      let movedComponent: ComponentElement | null = null;
      const findAndRemove = (components: ComponentElement[]): ComponentElement[] => {
        return components
          .filter((comp) => {
            if (comp.id === componentId) {
              movedComponent = { ...comp };
              return false; // Remove from current location
            }
            return true;
          })
          .map((comp) => {
            if (comp.children) {
              return { ...comp, children: findAndRemove(comp.children) };
            }
            return comp;
          });
      };

      const withoutComponent = findAndRemove(state.components);

      if (!movedComponent) return {};

      // 2. Add it as a child of the new parent
      const insertIntoParent = (components: ComponentElement[]): ComponentElement[] => {
        return components.map((comp) => {
          if (comp.id === newParentId) {
            const childVersion: ComponentElement = {
              ...movedComponent!,
              parentId: newParentId,
              // Clear position/size — child is a flex item now
              position: { x: 0, y: 0 },
              size: { width: 0, height: 0 },
              // Transfer original size into styles so icons/elements render correctly
              styles: {
                ...movedComponent!.styles,
                ...(movedComponent!.type === 'icon' && !movedComponent!.styles.width ? {
                  width: `${movedComponent!.size?.width || 24}px`,
                  height: `${movedComponent!.size?.height || 24}px`,
                } : {}),
              },
            };
            const newChildren = [...(comp.children || []), childVersion];
            const estimatedHeight = Math.max(comp.size.height, newChildren.length * 50 + 40);
            return {
              ...comp,
              children: newChildren,
              size: { ...comp.size, height: estimatedHeight },
              styles: {
                ...comp.styles,
                display: comp.styles.display || 'flex',
                flexDirection: comp.styles.flexDirection || 'column',
                gap: comp.styles.gap || '8px',
              },
            };
          }
          if (comp.children) {
            return { ...comp, children: insertIntoParent(comp.children) };
          }
          return comp;
        });
      };

      return {
        components: insertIntoParent(withoutComponent),
        expandedIds: new Set([...state.expandedIds, newParentId]),
        selectedIds: [],
        selectedId: null,
      };
    });
  },
  
  updateComponent: (id, updates) => set((state) => {
    const updateInTree = (components: ComponentElement[]): ComponentElement[] => {
      return components.map((comp) => {
        if (comp.id === id) {
          return {
            ...comp,
            ...updates,
            styles: updates.styles ? { ...comp.styles, ...updates.styles } : comp.styles,
            position: updates.position ? { ...comp.position, ...updates.position } : comp.position,
            size: updates.size ? { ...comp.size, ...updates.size } : comp.size,
          };
        }
        if (comp.children) {
          return { ...comp, children: updateInTree(comp.children) };
        }
        return comp;
      });
    };
    return { components: updateInTree(state.components) };
  }),

  batchUpdatePositions: (updates) => set((state) => {
    const posMap = new Map(updates.map(u => [u.id, u.position]));
    const updateInTree = (components: ComponentElement[]): ComponentElement[] =>
      components.map(comp => {
        const newPos = posMap.get(comp.id);
        const updated = newPos ? { ...comp, position: newPos } : comp;
        if (updated.children) return { ...updated, children: updateInTree(updated.children) };
        return updated;
      });
    return { components: updateInTree(state.components) };
  }),

  // Full REPLACE (no merge) — used by variations
  replaceComponent: (id, replacements) => set((state) => {
    const replaceInTree = (components: ComponentElement[]): ComponentElement[] => {
      return components.map((comp) => {
        if (comp.id === id) {
          return {
            ...comp,
            // Full replace: styles are NOT merged, they're overwritten
            ...(replacements.type !== undefined ? { type: replacements.type } : {}),
            ...(replacements.styles !== undefined ? { styles: replacements.styles } : {}),
            ...(replacements.content !== undefined ? { content: replacements.content } : {}),
            ...(replacements.size !== undefined ? { size: replacements.size } : {}),
            ...(replacements.position !== undefined ? { position: replacements.position } : {}),
            ...(replacements.children !== undefined ? { children: replacements.children } : {}),
            ...(replacements.hoverStyles !== undefined ? { hoverStyles: replacements.hoverStyles } : {}),
            ...(replacements.activeStyles !== undefined ? { activeStyles: replacements.activeStyles } : {}),
            ...(replacements.disabledStyles !== undefined ? { disabledStyles: replacements.disabledStyles } : {}),
            ...(replacements.focusedStyles !== undefined ? { focusedStyles: replacements.focusedStyles } : {}),
            ...(replacements.loadingStyles !== undefined ? { loadingStyles: replacements.loadingStyles } : {}),
            ...(replacements.variantProps !== undefined ? { variantProps: replacements.variantProps } : {}),
            ...(replacements.componentDefId !== undefined ? { componentDefId: replacements.componentDefId } : {}),
            ...(replacements.typeStyle !== undefined ? { typeStyle: replacements.typeStyle } : {}),
            ...(replacements.animation !== undefined ? { animation: replacements.animation } : {}),
            ...(replacements.hidden !== undefined ? { hidden: replacements.hidden } : {}),
            ...(replacements.locked !== undefined ? { locked: replacements.locked } : {}),
            ...(replacements.layoutSizing !== undefined ? { layoutSizing: replacements.layoutSizing } : {}),
          };
        }
        if (comp.children) {
          return { ...comp, children: replaceInTree(comp.children) };
        }
        return comp;
      });
    };
    return { components: replaceInTree(state.components) };
  }),
  
  deleteComponent: (id) => {
    get().pushHistory();
    set((state) => {
      const deleteInTree = (components: ComponentElement[]): ComponentElement[] => {
        return components
          .filter(comp => comp.id !== id)
          .map(comp => comp.children ? { ...comp, children: deleteInTree(comp.children) } : comp);
      };
      // Clear editingParentId if we're deleting the parent being edited,
      // or if the deleted component IS the editingParent's child (parent may now be empty)
      let newEditingParentId = state.editingParentId;
      if (state.editingParentId === id) {
        newEditingParentId = null;
      }
      return {
        components: deleteInTree(state.components),
        selectedId: state.selectedId === id ? null : state.selectedId,
        selectedIds: state.selectedIds.filter(sid => sid !== id),
        editingParentId: newEditingParentId,
      };
    });
  },

  duplicateComponent: (id) => {
    get().pushHistory();
    set((state) => {
      // Search for the component and track if it's nested
      const findInTree = (components: ComponentElement[]): ComponentElement | null => {
        for (const c of components) {
          if (c.id === id) return c;
          if (c.children) {
            const found = findInTree(c.children);
            if (found) return found;
          }
        }
        return null;
      };
      const comp = findInTree(state.components);
      if (!comp) return state;
      
      // Check if this is a top-level component
      const isTopLevel = state.components.some(c => c.id === id);
      const newComp = deepCloneWithNewIds(comp);
      
      if (isTopLevel) {
        // Top-level: append to root with offset position
        newComp.position = { x: comp.position.x + 20, y: comp.position.y + 20 };
        return {
          components: [...state.components, newComp],
          selectedId: newComp.id,
          selectedIds: [newComp.id],
        };
      } else {
        // Nested child: insert as sibling within the same parent
        newComp.parentId = comp.parentId;
        const insertSibling = (components: ComponentElement[]): ComponentElement[] => {
          return components.map(c => {
            if (c.children) {
              const idx = c.children.findIndex(child => child.id === id);
              if (idx >= 0) {
                const newChildren = [...c.children];
                newChildren.splice(idx + 1, 0, newComp);
                return { ...c, children: newChildren };
              }
              return { ...c, children: insertSibling(c.children) };
            }
            return c;
          });
        };
        return {
          components: insertSibling(state.components),
          selectedId: newComp.id,
          selectedIds: [newComp.id],
        };
      }
    });
  },

  deleteSelected: () => {
    get().pushHistory();
    set((state) => {
      const idsToDelete = new Set(state.selectedIds);
      const deleteInTree = (components: ComponentElement[]): ComponentElement[] => {
        return components
          .filter(comp => !idsToDelete.has(comp.id))
          .map(comp => comp.children ? { ...comp, children: deleteInTree(comp.children) } : comp);
      };
      // Clear editingParentId if the edited parent is being deleted
      const newEditingParentId = state.editingParentId && idsToDelete.has(state.editingParentId)
        ? null : state.editingParentId;
      return {
        components: deleteInTree(state.components),
        selectedId: null,
        selectedIds: [],
        editingParentId: newEditingParentId,
      };
    });
  },
  
  // ===== SELECTION =====
  selectComponent: (id) => {
    if (!id) {
      set({ selectedId: null, selectedIds: [] });
      return;
    }
    // Check if this is a child element — if so, auto-enter editing mode for parent
    const state = get();
    const findParentOfChild = (components: ComponentElement[], targetId: string): string | null => {
      for (const comp of components) {
        if (comp.children) {
          for (const child of comp.children) {
            if (child.id === targetId) return comp.id;
          }
          // Recurse into nested children
          for (const child of comp.children) {
            if (child.children) {
              const found = findParentOfChild([child], targetId);
              if (found) return found;
            }
          }
        }
      }
      return null;
    };
    const parentId = findParentOfChild(state.components, id);
    if (parentId) {
      // Selecting a child → enter its parent's editing mode
      set({ selectedId: id, selectedIds: [id], editingParentId: parentId });
    } else if (id === state.editingParentId) {
      // Selecting the parent we're currently editing → keep editing mode
      set({ selectedId: id, selectedIds: [id] });
    } else {
      // Selecting a different top-level component → exit any editing mode
      set({ selectedId: id, selectedIds: [id], editingParentId: null });
    }
  },
  selectMultiple: (ids) => set({ selectedIds: ids, selectedId: ids.length === 1 ? ids[0] : null }),
  toggleSelection: (id) => {
    const state = get();
    const newIds = state.selectedIds.includes(id)
      ? state.selectedIds.filter(sid => sid !== id)
      : [...state.selectedIds, id];
    set({ selectedIds: newIds, selectedId: newIds.length === 1 ? newIds[0] : null });
  },
  clearSelection: () => set({ selectedIds: [], selectedId: null, selectionBox: null }),
  selectAll: () => set((state) => ({
    selectedIds: state.components.map(c => c.id),
    selectedId: state.components.length === 1 ? state.components[0].id : null,
  })),
  
  setHoveredComponent: (id) => set({ hoveredId: id }),
  
  clearComponents: () => {
    get().pushHistory();
    set({ components: [], selectedId: null, selectedIds: [], expandedIds: new Set(), editingParentId: null });
  },

  reorderComponent: (fromIndex, toIndex) => {
    get().pushHistory();
    set((state) => {
      const newComponents = [...state.components];
      const [movedComponent] = newComponents.splice(fromIndex, 1);
      newComponents.splice(toIndex, 0, movedComponent);
      return { components: newComponents };
    });
  },

  reorderChild: (parentId, fromIndex, toIndex) => {
    get().pushHistory();
    set((state) => {
      const updateInTree = (components: ComponentElement[]): ComponentElement[] => {
        return components.map(c => {
          if (c.id === parentId && c.children) {
            const newChildren = [...c.children];
            const [moved] = newChildren.splice(fromIndex, 1);
            newChildren.splice(toIndex, 0, moved);
            return { ...c, children: newChildren };
          }
          if (c.children) return { ...c, children: updateInTree(c.children) };
          return c;
        });
      };
      return { components: updateInTree(state.components) };
    });
  },

  // Layer tree actions
  toggleExpanded: (id) => set((state) => {
    const newExpanded = new Set(state.expandedIds);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    return { expandedIds: newExpanded };
  }),

  // Sub-element actions
  enterComponent: (id) => set({ editingParentId: id }),
  exitComponent: () => set({ editingParentId: null }),
  setCanvasDragging: (dragging) => set({ isCanvasDragging: dragging }),

  // Toast actions
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-remove: errors 6s, others 3s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id),
      }));
    }, type === 'error' ? 6000 : 3000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),

  // Canvas actions
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  zoomToFit: (viewportWidth, viewportHeight) => {
    const state = get();
    const comps = state.components.filter(c => !c.hidden);
    if (comps.length === 0) {
      set({ zoom: 1, panOffset: { x: 0, y: 0 } });
      return;
    }
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of comps) {
      minX = Math.min(minX, c.position.x);
      minY = Math.min(minY, c.position.y);
      maxX = Math.max(maxX, c.position.x + c.size.width);
      maxY = Math.max(maxY, c.position.y + c.size.height);
    }
    const bbWidth = maxX - minX;
    const bbHeight = maxY - minY;
    if (bbWidth <= 0 || bbHeight <= 0) return;

    const padding = 60; // px of breathing room
    const availW = viewportWidth - padding * 2;
    const availH = viewportHeight - padding * 2;
    // Never zoom beyond 100% to prevent jarring over-zoom on small components
    const newZoom = Math.max(0.1, Math.min(1, Math.min(availW / bbWidth, availH / bbHeight)));
    
    // Center the bounding box in viewport
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const panX = viewportWidth / 2 - centerX * newZoom;
    const panY = viewportHeight / 2 - centerY * newZoom;

    set({ zoom: newZoom, panOffset: { x: panX, y: panY } });
  },
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setCanvasBg: (bg) => set({ canvasBg: bg }),
  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  toggleComponentLock: (id) => {
    get().pushHistory();
    const updateInTree = (components: ComponentElement[]): ComponentElement[] =>
      components.map(c => {
        if (c.id === id) return { ...c, locked: !c.locked };
        if (c.children) return { ...c, children: updateInTree(c.children) };
        return c;
      });
    set((state) => ({ components: updateInTree(state.components) }));
  },
  setActiveTool: (tool) => set({ activeTool: tool }),
  setDevicePreview: (device) => set({ devicePreview: device }),
  setPreviewState: (state) => set({ previewState: state }),
  
  // Template actions
  saveAsTemplate: (id, name) => {
    const comp = get().findComponent(id);
    if (!comp) return;
    // Deep clone the component
    const clone = JSON.parse(JSON.stringify(comp));
    set((state) => ({
      savedTemplates: [...state.savedTemplates, { name, component: clone, timestamp: Date.now() }],
    }));
    // Persist to localStorage
    try {
      const templates = [...get().savedTemplates];
      localStorage.setItem('bivvy-templates', JSON.stringify(templates));
    } catch {
      get().addToast('Failed to save template — storage full', 'error');
    }
  },
  deleteTemplate: (index) => {
    set((state) => {
      const newTemplates = state.savedTemplates.filter((_, i) => i !== index);
      try { localStorage.setItem('bivvy-templates', JSON.stringify(newTemplates)); } catch {}
      return { savedTemplates: newTemplates };
    });
  },
  loadTemplate: (index) => {
    const template = get().savedTemplates[index];
    if (!template) return;
    const clone = JSON.parse(JSON.stringify(template.component));
    // Give it a new ID and offset position
    const newId = `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const reassignIds = (c: any, parentNewId?: string) => {
      c.id = parentNewId || newId;
      if (c.children) {
        c.children.forEach((child: any, i: number) => {
          reassignIds(child, `${c.id}-child-${i}`);
        });
      }
    };
    reassignIds(clone);
    clone.position = { x: clone.position.x + 40, y: clone.position.y + 40 };
    get().addComponent(clone);
  },

  // AI actions
  setIsGenerating: (generating) => set({ isGenerating: generating }),

  // Annotation actions
  addAnnotation: (componentId, text, author) => {
    const annotation: Annotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      author,
      timestamp: Date.now(),
    };
    get().pushHistory();
    const state = get();
    const update = (comps: ComponentElement[]): ComponentElement[] =>
      comps.map(c => {
        if (c.id === componentId) return { ...c, annotations: [...(c.annotations || []), annotation] };
        if (c.children) return { ...c, children: update(c.children) };
        return c;
      });
    set({ components: update(state.components) });
  },
  removeAnnotation: (componentId, annotationId) => {
    get().pushHistory();
    const state = get();
    const update = (comps: ComponentElement[]): ComponentElement[] =>
      comps.map(c => {
        if (c.id === componentId) return { ...c, annotations: (c.annotations || []).filter(a => a.id !== annotationId) };
        if (c.children) return { ...c, children: update(c.children) };
        return c;
      });
    set({ components: update(state.components) });
  },
  toggleResolveAnnotation: (componentId, annotationId) => {
    get().pushHistory();
    const state = get();
    const update = (comps: ComponentElement[]): ComponentElement[] =>
      comps.map(c => {
        if (c.id === componentId) return { ...c, annotations: (c.annotations || []).map(a => a.id === annotationId ? { ...a, resolved: !a.resolved } : a) };
        if (c.children) return { ...c, children: update(c.children) };
        return c;
      });
    set({ components: update(state.components) });
  },
  toggleShowAnnotations: () => set(s => ({ showAnnotations: !s.showAnnotations })),
  toggleInspectMode: () => set(s => ({ inspectMode: !s.inspectMode })),
  toggleResponsivePreview: () => set(s => ({ showResponsivePreview: !s.showResponsivePreview })),
  
  swapComponentTheme: () => {
    const state = get();
    const isDark = state.activeTheme === 'dark';
    const tokens = state.designSystem?.namedTokens || [];
    const { darkToLight, lightToDark } = buildThemeSwapMap(tokens);
    const swapMap = isDark ? darkToLight : lightToDark;

    // Helper: invert hex luminance for colors not in swap map
    const invertHex = (hex: string): string => {
      const h = hex.replace('#', '');
      if (h.length < 6) return hex;
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      const alpha = h.length >= 8 ? h.substring(6) : ''; // preserve alpha if present
      const lum = (r * 0.299 + g * 0.587 + b * 0.114);
      // Only invert truly dark or truly light colors (not mid-range brand colors)
      if (lum < 50) {
        // Very dark → make light
        return `#${Math.min(255, 255 - r + 30).toString(16).padStart(2, '0')}${Math.min(255, 255 - g + 30).toString(16).padStart(2, '0')}${Math.min(255, 255 - b + 30).toString(16).padStart(2, '0')}${alpha}`;
      } else if (lum > 200) {
        // Very light → make dark
        return `#${Math.max(0, 255 - r - 30).toString(16).padStart(2, '0')}${Math.max(0, 255 - g - 30).toString(16).padStart(2, '0')}${Math.max(0, 255 - b - 30).toString(16).padStart(2, '0')}${alpha}`;
      }
      return hex; // Leave mid-range brand colors alone
    };

    const colorProps = ['backgroundColor', 'color', 'borderColor', 'background', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke'];
    
    const swapStyles = (styles: Record<string, any>): Record<string, any> => {
      const newStyles = { ...styles };
      for (const prop of colorProps) {
        if (newStyles[prop] && typeof newStyles[prop] === 'string') {
          const val = newStyles[prop].toLowerCase();
          if (swapMap.has(val)) {
            newStyles[prop] = swapMap.get(val)!;
          } else if (val.startsWith('#') && val.length >= 7) {
            newStyles[prop] = invertHex(val);
          }
        }
      }
      // Handle border shorthand (e.g. "1px solid #2a2a2a")
      if (newStyles.border && typeof newStyles.border === 'string') {
        const borderMatch = newStyles.border.match(/(.*?\s)?(#[0-9a-fA-F]{6,8})/);
        if (borderMatch) {
          const hexVal = borderMatch[2].toLowerCase();
          const replacement = swapMap.has(hexVal) ? swapMap.get(hexVal)! : invertHex(hexVal);
          newStyles.border = newStyles.border.replace(borderMatch[2], replacement);
        }
      }
      // Handle boxShadow
      if (newStyles.boxShadow && typeof newStyles.boxShadow === 'string') {
        newStyles.boxShadow = newStyles.boxShadow.replace(/#[0-9a-fA-F]{6,8}/gi, (match: string) => {
          const val = match.toLowerCase();
          return swapMap.has(val) ? swapMap.get(val)! : match; // Don't invert shadow colors
        });
      }
      return newStyles;
    };

    const swapComponent = (comp: ComponentElement): ComponentElement => {
      const newComp = { ...comp, styles: swapStyles(comp.styles) };
      if (comp.hoverStyles) newComp.hoverStyles = swapStyles(comp.hoverStyles);
      if (comp.activeStyles) newComp.activeStyles = swapStyles(comp.activeStyles);
      if (comp.disabledStyles) newComp.disabledStyles = swapStyles(comp.disabledStyles);
      if (comp.focusedStyles) newComp.focusedStyles = swapStyles(comp.focusedStyles);
      if (comp.loadingStyles) newComp.loadingStyles = swapStyles(comp.loadingStyles);
      if (comp.children) {
        newComp.children = comp.children.map(swapComponent);
      }
      return newComp;
    };

    const newComponents = state.components.map(swapComponent);
    const newTheme = isDark ? 'light' : 'dark';
    const newCanvasBg = isDark ? 'light' : 'dark';

    get().pushHistory();
    set({
      components: newComponents,
      activeTheme: newTheme,
      canvasBg: newCanvasBg,
    });
    get().addToast(`Switched to ${newTheme} theme`, 'success');
  },

  // Canvas variation actions
  setCanvasVariations: (data) => {
    const state = get();
    const targetKey = data.targetIds.join(',');
    const newHistory = { ...state.variationHistory };
    
    // Restore originals if a live preview was active
    if (state.canvasVariations?.livePreviewId) {
      state.canvasVariations.sourceComponents.forEach((original) => {
        get().replaceComponent(original.id, {
          styles: original.styles, content: original.content,
          size: original.size, children: original.children,
        });
      });
    }
    
    // Push this new generation to history
    if (!newHistory[targetKey]) newHistory[targetKey] = [];
    newHistory[targetKey].push({
      variations: data.variations,
      prompt: data.prompt,
      timestamp: Date.now(),
    });
    
    const genIdx = newHistory[targetKey].length - 1;
    
    set({ 
      canvasVariations: { ...data, generationIndex: genIdx, livePreviewId: null }, 
      variationHistory: newHistory,
      variationHistoryIndex: genIdx, // Point to the latest
    });
  },
  clearCanvasVariations: () => {
    const state = get();
    // Restore originals if a live preview was active
    if (state.canvasVariations?.livePreviewId) {
      state.canvasVariations.sourceComponents.forEach((original) => {
        get().replaceComponent(original.id, {
          styles: original.styles,
          content: original.content,
          size: original.size,
          children: original.children,
          ...(original.hoverStyles !== undefined ? { hoverStyles: original.hoverStyles } : {}),
        });
      });
    }
    set({ canvasVariations: null });
  },
  favoriteCanvasVariation: (variationId) => set((state) => {
    if (!state.canvasVariations) return {};
    return {
      canvasVariations: {
        ...state.canvasVariations,
        variations: state.canvasVariations.variations.map(v =>
          v.id === variationId ? { ...v, isFavorited: !v.isFavorited } : v
        ),
      },
    };
  }),
  applyCanvasVariation: (variationId) => {
    const state = get();
    if (!state.canvasVariations) return;
    const variation = state.canvasVariations.variations.find(v => v.id === variationId);
    if (!variation) return;
    
    // Restore originals first so pushHistory captures the pre-variation state
    state.canvasVariations.sourceComponents.forEach((original) => {
      get().replaceComponent(original.id, {
        styles: original.styles, content: original.content,
        size: original.size, children: original.children,
      });
    });
    
    get().pushHistory();
    
    // Now apply the variation
    const sanitizeTextBg = (children: any[]): any[] => {
      if (!children) return children;
      return children.map((child: any) => {
        const sanitized = { ...child };
        if (child.type === 'text' && (child.styles?.backgroundColor || child.styles?.background)) {
          const { backgroundColor, background, ...restStyles } = child.styles;
          sanitized.styles = restStyles;
        }
        if (child.children?.length) sanitized.children = sanitizeTextBg(child.children);
        return sanitized;
      });
    };
    
    variation.components.forEach((updatedComp) => {
      const sanitizedChildren = updatedComp.children ? sanitizeTextBg(updatedComp.children) : updatedComp.children;
      get().replaceComponent(updatedComp.id, {
        styles: updatedComp.styles,
        content: updatedComp.content,
        size: updatedComp.size,
        children: sanitizedChildren || updatedComp.children,
        ...(updatedComp.hoverStyles !== undefined ? { hoverStyles: updatedComp.hoverStyles } : {}),
        ...(updatedComp.activeStyles !== undefined ? { activeStyles: updatedComp.activeStyles } : {}),
        ...(updatedComp.disabledStyles !== undefined ? { disabledStyles: updatedComp.disabledStyles } : {}),
        ...(updatedComp.focusedStyles !== undefined ? { focusedStyles: updatedComp.focusedStyles } : {}),
        ...(updatedComp.loadingStyles !== undefined ? { loadingStyles: updatedComp.loadingStyles } : {}),
        ...(updatedComp.variantProps !== undefined ? { variantProps: updatedComp.variantProps } : {}),
        ...(updatedComp.componentDefId !== undefined ? { componentDefId: updatedComp.componentDefId } : {}),
        ...(updatedComp.typeStyle !== undefined ? { typeStyle: updatedComp.typeStyle } : {}),
        ...(updatedComp.animation !== undefined ? { animation: updatedComp.animation } : {}),
      });
    });
    
    set({ canvasVariations: null });
    get().addToast('Variation applied', 'success');
  },
  livePreviewCanvasVariation: (variationId) => {
    const state = get();
    if (!state.canvasVariations) return;
    
    // Always restore originals first
    state.canvasVariations.sourceComponents.forEach((original) => {
      get().replaceComponent(original.id, {
        styles: original.styles,
        content: original.content,
        size: original.size,
        children: original.children,
        ...(original.hoverStyles !== undefined ? { hoverStyles: original.hoverStyles } : {}),
      });
    });
    
    // Re-capture source snapshot from current state (preserves any property panel edits
    // made while variations were displayed but no live preview was active)
    const refreshedSources = state.canvasVariations.sourceComponents.map(orig => {
      const current = get().findComponent(orig.id);
      return current ? JSON.parse(JSON.stringify(current)) : orig;
    });
    
    // If setting a new preview, apply that variation's styles
    if (variationId) {
      const variation = state.canvasVariations.variations.find(v => v.id === variationId);
      if (variation) {
        variation.components.forEach((updatedComp) => {
          get().replaceComponent(updatedComp.id, {
            styles: updatedComp.styles,
            content: updatedComp.content,
            size: updatedComp.size,
            children: updatedComp.children,
            ...(updatedComp.hoverStyles !== undefined ? { hoverStyles: updatedComp.hoverStyles } : {}),
          });
        });
      }
    }
    
    set((s) => ({
      canvasVariations: s.canvasVariations ? {
        ...s.canvasVariations,
        sourceComponents: refreshedSources,
        livePreviewId: variationId,
      } : null,
    }));
  },

  navigateVariationHistory: (direction) => {
    const state = get();
    if (!state.canvasVariations) return;
    
    const targetKey = state.canvasVariations.targetIds.join(',');
    const history = state.variationHistory[targetKey] || [];
    if (history.length <= 1) return; // Only 1 generation, nothing to navigate
    
    const currentIdx = state.variationHistoryIndex;
    let newIdx = currentIdx;
    
    if (direction === 'prev') {
      newIdx = Math.max(0, currentIdx - 1);
    } else {
      newIdx = Math.min(history.length - 1, currentIdx + 1);
    }
    
    if (newIdx === currentIdx) return; // No change
    
    // Restore originals if live previewing
    if (state.canvasVariations.livePreviewId) {
      state.canvasVariations.sourceComponents.forEach((original) => {
        get().replaceComponent(original.id, {
          styles: original.styles, content: original.content,
          size: original.size, children: original.children,
        });
      });
    }
    
    // Swap displayed variations from history
    const entry = history[newIdx];
    set((s) => ({
      variationHistoryIndex: newIdx,
      canvasVariations: s.canvasVariations ? {
        ...s.canvasVariations,
        variations: entry.variations,
        prompt: entry.prompt,
        generationIndex: newIdx,
        livePreviewId: null,
      } : null,
    }));
  },

  navigateToVariationIndex: (targetIndex: number) => {
    const state = get();
    if (!state.canvasVariations) return;
    
    const targetKey = state.canvasVariations.targetIds.join(',');
    const history = state.variationHistory[targetKey] || [];
    if (targetIndex < 0 || targetIndex >= history.length || targetIndex === state.variationHistoryIndex) return;
    
    // Restore originals if live previewing
    if (state.canvasVariations.livePreviewId) {
      state.canvasVariations.sourceComponents.forEach((original) => {
        get().replaceComponent(original.id, {
          styles: original.styles, content: original.content,
          size: original.size, children: original.children,
        });
      });
    }
    
    const entry = history[targetIndex];
    set((s) => ({
      variationHistoryIndex: targetIndex,
      canvasVariations: s.canvasVariations ? {
        ...s.canvasVariations,
        variations: entry.variations,
        prompt: entry.prompt,
        generationIndex: targetIndex,
        livePreviewId: null,
      } : null,
    }));
  },

  // Restore previous variations from history (without generating new ones)
  restoreVariationHistory: (targetIds: string[]): boolean => {
    const state = get();
    const targetKey = targetIds.join(',');
    const history = state.variationHistory[targetKey];
    if (!history || history.length === 0) return false;

    // Get the source components (current state of the targets)
    const sourceComponents = targetIds.map(id => {
      const comp = state.components.find(c => c.id === id);
      return comp;
    }).filter(Boolean) as ComponentElement[];

    if (sourceComponents.length === 0) return false;

    const lastIdx = history.length - 1;
    const entry = history[lastIdx];

    set({
      canvasVariations: {
        targetIds,
        sourceComponents: JSON.parse(JSON.stringify(sourceComponents)),
        variations: entry.variations,
        prompt: entry.prompt,
        generationIndex: lastIdx,
        livePreviewId: null,
      },
      variationHistoryIndex: lastIdx,
    });
    return true;
  },

  // Check how many history entries exist for given targets
  getVariationHistoryCount: (targetIds: string[]): number => {
    const state = get();
    const targetKey = targetIds.join(',');
    return (state.variationHistory[targetKey] || []).length;
  },

  // Design system actions
  updateDesignSystem: (system) => set((state) => ({
    designSystem: { ...state.designSystem, ...system },
  })),
  loadBuiltinDesignSystem: () => set((state) => ({
    designSystem: {
      ...state.designSystem,
      namedTokens: [...defaultNamedTokens],
      componentDefs: [...defaultComponentDefs],
      tokenMappings: [...defaultTokenMappings],
      tokens: { ...state.designSystem.tokens, enabled: true },
      guidelines: { ...state.designSystem.guidelines, enabled: true, referenceLibrary: true },
    },
  })),

  // ===== FILE OPERATIONS =====
  exportJSON: () => {
    const state = get();
    return JSON.stringify({
      version: '27',
      components: state.components,
      designSystem: state.designSystem,
      zoom: state.zoom,
      showGrid: state.showGrid, canvasBg: state.canvasBg,
    }, null, 2);
  },

  importJSON: (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!data.components || !Array.isArray(data.components)) return false;
      // Validate minimal component structure to prevent runtime crashes
      const isValid = data.components.every((c: any) =>
        c.id && c.type && c.position && typeof c.position.x === 'number' && typeof c.position.y === 'number' &&
        c.size && typeof c.size.width === 'number' && typeof c.size.height === 'number' && c.styles
      );
      if (!isValid) {
        get().addToast('Import failed: malformed component data', 'error');
        return false;
      }
      get().pushHistory();
      const importedDS = data.designSystem || get().designSystem;
      // Ensure new fields exist for backward compat with older files
      if (!importedDS.namedTokens) importedDS.namedTokens = [];
      if (!importedDS.componentDefs) importedDS.componentDefs = [];
      if (!importedDS.tokenMappings) importedDS.tokenMappings = [];
      set({
        components: data.components,
        designSystem: importedDS,
        zoom: data.zoom || 1,
        showGrid: data.showGrid ?? true, canvasBg: data.canvasBg || 'dark' as const,
        selectedId: null,
        selectedIds: [],
        editingParentId: null,
      });
      return true;
    } catch {
      return false;
    }
  },

  clearCanvas: () => {
    get().pushHistory();
    set({
      components: [],
      selectedId: null,
      selectedIds: [],
      editingParentId: null,
    });
    get().addToast('Canvas cleared', 'info');
  },


  // ===== GROUP ACTIONS =====
  groupSelected: () => {
    const state = get();
    if (state.selectedIds.length < 2) return;
    
    // Only group top-level components — children can't be grouped
    const comps = state.selectedIds
      .map(id => state.components.find(c => c.id === id))
      .filter(Boolean) as ComponentElement[];
    
    if (comps.length < 2) {
      get().addToast('Select 2+ top-level components to group', 'info');
      return;
    }
    
    get().pushHistory();
    
    // Calculate bounding box
    const minX = Math.min(...comps.map(c => c.position.x));
    const minY = Math.min(...comps.map(c => c.position.y));
    const maxX = Math.max(...comps.map(c => c.position.x + c.size.width));
    const maxY = Math.max(...comps.map(c => c.position.y + c.size.height));
    
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Convert children positions to relative
    const children: ComponentElement[] = comps.map(c => ({
      ...JSON.parse(JSON.stringify(c)),
      styles: {
        ...(c.styles || {}),
        position: 'absolute',
        left: `${c.position.x - minX}px`,
        top: `${c.position.y - minY}px`,
        width: `${c.size.width}px`,
        height: `${c.size.height}px`,
      },
      parentId: groupId,
    }));
    
    const group: ComponentElement = {
      id: groupId,
      type: 'div',
      content: '',
      position: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY },
      styles: {
        position: 'relative',
      },
      children,
    };
    
    // Remove originals and add group
    const remaining = state.components.filter(c => !state.selectedIds.includes(c.id));
    set({
      components: [...remaining, group],
      selectedId: groupId,
      selectedIds: [groupId],
      expandedIds: new Set([...state.expandedIds, groupId]),
    });
    
    get().addToast('Grouped components', 'success');
  },
  
  ungroupComponent: (id: string) => {
    const state = get();
    const group = state.components.find(c => c.id === id);
    if (!group || !group.children || group.children.length === 0) return;
    
    get().pushHistory();
    
    const zoom = state.zoom || 1;
    
    // Try to measure actual child positions from the DOM
    const parentEl = document.querySelector(`[data-component-id="${id}"]`) as HTMLElement;
    const parentRect = parentEl?.getBoundingClientRect();
    
    const extracted: ComponentElement[] = group.children.map((child, index) => {
      let childX = group.position.x;
      let childY = group.position.y;
      let w = parseInt(child.styles?.width || '0') || child.size?.width || group.size?.width || 200;
      let h = parseInt(child.styles?.height || '0') || child.size?.height || 60;
      
      // Try DOM measurement first (most accurate)
      const childEl = parentEl?.querySelector(`[data-child-id="${child.id}"]`) as HTMLElement;
      if (childEl && parentRect) {
        const childRect = childEl.getBoundingClientRect();
        // Convert screen coordinates back to canvas coordinates
        childX = group.position.x + (childRect.left - parentRect.left) / zoom;
        childY = group.position.y + (childRect.top - parentRect.top) / zoom;
        w = childRect.width / zoom;
        h = childRect.height / zoom;
      } else {
        // Fallback: estimate flex layout positioning
        const isFlexColumn = group.styles?.display === 'flex' && (group.styles?.flexDirection !== 'row');
        const gap = parseInt(group.styles?.gap || '0') || 8;
        const pad = parseInt(group.styles?.padding || '0') || 0;
        
        if (child.styles?.position === 'absolute') {
          // Absolutely positioned children
          childX = group.position.x + (parseInt(child.styles?.left || '0') || 0);
          childY = group.position.y + (parseInt(child.styles?.top || '0') || 0);
        } else if (isFlexColumn) {
          childX = group.position.x + pad;
          // Estimate vertical stacking
          let cumY = pad;
          for (let i = 0; i < index; i++) {
            const prev = group.children![i];
            if (prev.styles?.position === 'absolute') continue;
            cumY += (parseInt(prev.styles?.height || '0') || prev.size?.height || 60) + gap;
          }
          childY = group.position.y + cumY;
        } else {
          // Flex row or unknown
          childX = group.position.x + index * (w + (parseInt(group.styles?.gap || '0') || 20));
          childY = group.position.y;
        }
      }
      
      const newStyles = { ...(child.styles || {}) };
      delete newStyles.position;
      delete newStyles.left;
      delete newStyles.top;
      
      return {
        ...child,
        parentId: null,
        position: { x: Math.round(childX), y: Math.round(childY) },
        size: { width: Math.round(w), height: Math.round(h) },
        styles: newStyles,
      };
    });
    
    const remaining = state.components.filter(c => c.id !== id);
    const newIds = extracted.map(c => c.id);
    set({
      components: [...remaining, ...extracted],
      selectedId: newIds[0] || null,
      selectedIds: newIds,
    });
    
    get().addToast('Ungrouped components', 'success');
  },

  // ===== WORKSPACE ACTIONS =====
  addWorkspace: (name?: string) => {
    const state = get();
    // Save current workspace state first
    const updatedWorkspaces = state.workspaces.map(ws =>
      ws.id === state.activeWorkspaceId
        ? { ...ws, components: state.components, history: state.history, historyIndex: state.historyIndex, zoom: state.zoom, panOffset: state.panOffset, showGrid: state.showGrid, canvasBg: state.canvasBg, designSystem: state.designSystem }
        : ws
    );
    const newWs = createWorkspace(name);
    set({
      workspaces: [...updatedWorkspaces, newWs],
      activeWorkspaceId: newWs.id,
      components: [],
      history: [[]],
      historyIndex: 0,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      showGrid: true,
    canvasBg: 'dark' as const,
      canvasVariations: null,
      variationHistory: {},
      variationHistoryIndex: -1,
      pendingIterateTarget: null,
      showAICreate: false,
      designSystem: deepCopyDesignSystem(),
      selectedId: null,
      selectedIds: [],
      expandedIds: new Set(),
      editingParentId: null,
    });
  },

  removeWorkspace: (id: string) => {
    const state = get();
    if (state.workspaces.length <= 1) return; // Can't remove last workspace
    const remaining = state.workspaces.filter(ws => ws.id !== id);
    if (state.activeWorkspaceId === id) {
      // Switch to first remaining workspace
      const target = remaining[0];
      set({
        workspaces: remaining,
        activeWorkspaceId: target.id,
        components: target.components,
        history: target.history,
        historyIndex: target.historyIndex,
        zoom: target.zoom,
        panOffset: target.panOffset,
        showGrid: target.showGrid, canvasBg: target.canvasBg || 'dark' as const,
        designSystem: target.designSystem,
        selectedId: null,
        selectedIds: [],
        expandedIds: new Set(),
        editingParentId: null,
      });
    } else {
      set({ workspaces: remaining });
    }
  },

  switchWorkspace: (id: string) => {
    const state = get();
    if (id === state.activeWorkspaceId) return;
    const target = state.workspaces.find(ws => ws.id === id);
    if (!target) return;
    // Save current workspace
    const updatedWorkspaces = state.workspaces.map(ws =>
      ws.id === state.activeWorkspaceId
        ? { ...ws, components: state.components, history: state.history, historyIndex: state.historyIndex, zoom: state.zoom, panOffset: state.panOffset, showGrid: state.showGrid, canvasBg: state.canvasBg, designSystem: state.designSystem }
        : ws
    );
    set({
      workspaces: updatedWorkspaces,
      activeWorkspaceId: id,
      components: target.components,
      history: target.history,
      historyIndex: target.historyIndex,
      zoom: target.zoom,
      panOffset: target.panOffset,
      showGrid: target.showGrid, canvasBg: target.canvasBg || 'dark' as const,
      designSystem: target.designSystem,
      selectedId: null,
      selectedIds: [],
      expandedIds: new Set(),
      editingParentId: null,
    });
  },

  renameWorkspace: (id: string, name: string) => {
    set((state) => ({
      workspaces: state.workspaces.map(ws =>
        ws.id === id ? { ...ws, name } : ws
      ),
    }));
  },

  duplicateWorkspace: (id: string) => {
    const state = get();
    const source = id === state.activeWorkspaceId
      ? { ...state.workspaces.find(ws => ws.id === id)!, components: state.components, history: state.history, historyIndex: state.historyIndex, zoom: state.zoom, panOffset: state.panOffset, showGrid: state.showGrid, canvasBg: state.canvasBg, designSystem: state.designSystem }
      : state.workspaces.find(ws => ws.id === id);
    if (!source) return;
    
    // Save current state first
    const updatedWorkspaces = state.workspaces.map(ws =>
      ws.id === state.activeWorkspaceId
        ? { ...ws, components: state.components, history: state.history, historyIndex: state.historyIndex, zoom: state.zoom, panOffset: state.panOffset, showGrid: state.showGrid, canvasBg: state.canvasBg, designSystem: state.designSystem }
        : ws
    );

    const newWs: Workspace = {
      ...JSON.parse(JSON.stringify(source)),
      id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${source.name} (copy)`,
    };
    set({
      workspaces: [...updatedWorkspaces, newWs],
      activeWorkspaceId: newWs.id,
      components: newWs.components,
      history: newWs.history,
      historyIndex: newWs.historyIndex,
      zoom: newWs.zoom,
      panOffset: newWs.panOffset,
      showGrid: newWs.showGrid,
      canvasBg: newWs.canvasBg || 'dark' as const,
      designSystem: newWs.designSystem,
      selectedId: null,
      selectedIds: [],
      expandedIds: new Set(),
      editingParentId: null,
    });
  },

  // ═══════════════════════════════════════════════════
  // SYMBOL SYSTEM (Master / Instance)
  // ═══════════════════════════════════════════════════

  createSymbolFromComponent: (componentId: string) => {
    const state = get();
    const comp = state.components.find(c => c.id === componentId);
    if (!comp) return;
    state.pushHistory();
    
    const symbolId = `symbol-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const updatedComponents = state.components.map(c =>
      c.id === componentId ? { ...c, symbolMasterId: symbolId, isSymbolMaster: true } : c
    );
    set({ components: updatedComponents });
  },

  createInstanceOfSymbol: (symbolMasterId: string, position?: { x: number; y: number }) => {
    const state = get();
    const master = state.components.find(c => 
      c.symbolMasterId === symbolMasterId || 
      (c.isSymbolMaster && c.id === symbolMasterId)
    );
    if (!master) return;
    state.pushHistory();
    
    const actualSymbolId = master.symbolMasterId || symbolMasterId;
    
    const cloned = JSON.parse(JSON.stringify(master));
    const regenIds = (el: any): any => {
      el.id = `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      if (el.children) el.children = el.children.map(regenIds);
      return el;
    };
    regenIds(cloned);
    
    cloned.symbolMasterId = actualSymbolId;
    cloned.isSymbolMaster = false;
    cloned.isSymbolInstance = true;
    
    cloned.position = position || {
      x: master.position.x + master.size.width + 40,
      y: master.position.y,
    };
    
    set({ components: [...state.components, cloned] });
    get().addToast('Symbol instance created', 'success');
  },

  syncSymbolInstances: (masterId: string) => {
    const state = get();
    const master = state.components.find(c => 
      c.isSymbolMaster && (c.symbolMasterId === masterId || c.id === masterId)
    );
    if (!master) return;
    state.pushHistory();
    
    const symbolId = master.symbolMasterId || masterId;
    
    const updatedComponents = state.components.map(c => {
      if (c.isSymbolInstance && c.symbolMasterId === symbolId) {
        const synced = JSON.parse(JSON.stringify(master));
        const regenIds = (el: any): any => {
          el.id = `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          if (el.children) el.children = el.children.map(regenIds);
          return el;
        };
        if (synced.children) synced.children = synced.children.map(regenIds);
        
        return {
          ...synced,
          id: c.id,
          position: c.position,
          symbolMasterId: symbolId,
          isSymbolMaster: false,
          isSymbolInstance: true,
        };
      }
      return c;
    });
    
    const count = updatedComponents.filter(c => c.isSymbolInstance && c.symbolMasterId === symbolId).length;
    set({ components: updatedComponents });
    get().addToast(`Synced ${count} instance${count !== 1 ? 's' : ''} from master`, 'success');
  },

  detachSymbolInstance: (instanceId: string) => {
    const state = get();
    state.pushHistory();
    const updatedComponents = state.components.map(c => {
      if (c.id === instanceId) {
        const { symbolMasterId, isSymbolInstance, isSymbolMaster, ...detached } = c;
        return detached as ComponentElement;
      }
      return c;
    });
    set({ components: updatedComponents });
  },

  getSymbolInstances: (masterId: string) => {
    const master = get().components.find(c => 
      c.isSymbolMaster && (c.symbolMasterId === masterId || c.id === masterId)
    );
    if (!master) return [];
    const symbolId = master.symbolMasterId || masterId;
    return get().components.filter(c => c.isSymbolInstance && c.symbolMasterId === symbolId);
  },

  // ═══════════════════════════════════════════════════
  // TWO-WAY TOKEN SYNC
  // ═══════════════════════════════════════════════════

  updateTokenAndSync: (tokenId: string, newValue: string) => {
    const state = get();
    state.pushHistory();
    
    // 1. Update the token itself
    const updatedTokens = state.designSystem.namedTokens.map(t =>
      t.id === tokenId ? { ...t, value: newValue } : t
    );
    
    // 2. Find token name for matching
    const token = state.designSystem.namedTokens.find(t => t.id === tokenId);
    if (!token) return;
    
    // 3. Find all tokenMappings that reference this token
    const affectedMappings = state.designSystem.tokenMappings.filter(m =>
      m.tokenId === tokenId || m.tokenId === token.name
    );
    
    // 4. Build a map of CSS property → new value for each affected componentDef+state
    const tokenValueMap: Record<string, string> = {};
    for (const t of updatedTokens) {
      tokenValueMap[t.id] = t.value;
      tokenValueMap[t.name] = t.value;
    }
    
    // 5. Walk all components and update styles that use the old token value
    const oldValue = token.value;
    const updateStyles = (styles: Record<string, any>) => {
      const updated = { ...styles };
      for (const [key, val] of Object.entries(updated)) {
        if (val === oldValue) {
          updated[key] = newValue;
        }
      }
      return updated;
    };
    
    const updateComponent = (comp: ComponentElement): ComponentElement => {
      const updated = {
        ...comp,
        styles: updateStyles(comp.styles),
        hoverStyles: comp.hoverStyles ? updateStyles(comp.hoverStyles) : comp.hoverStyles,
        activeStyles: comp.activeStyles ? updateStyles(comp.activeStyles) : comp.activeStyles,
        disabledStyles: comp.disabledStyles ? updateStyles(comp.disabledStyles) : comp.disabledStyles,
        focusedStyles: comp.focusedStyles ? updateStyles(comp.focusedStyles) : comp.focusedStyles,
      };
      if (comp.children) {
        updated.children = comp.children.map(updateComponent);
      }
      return updated;
    };
    
    const updatedComponents = state.components.map(updateComponent);
    
    set({
      components: updatedComponents,
      designSystem: {
        ...state.designSystem,
        namedTokens: updatedTokens,
      },
    });
    
    // Count affected components
    const countDiff = (a: ComponentElement[], b: ComponentElement[]): number => {
      let count = 0;
      for (let i = 0; i < a.length; i++) {
        if (JSON.stringify(a[i]?.styles) !== JSON.stringify(b[i]?.styles)) count++;
        if (a[i]?.children && b[i]?.children) count += countDiff(a[i].children!, b[i].children!);
      }
      return count;
    };
    const affectedCount = countDiff(state.components, updatedComponents);
    if (affectedCount > 0) {
      get().addToast(`Token "${token.name}" → ${newValue} — updated ${affectedCount} component${affectedCount !== 1 ? 's' : ''}`, 'success');
    }
  },

  // ═══════════════════════════════════════════════════
  // DESIGN ↔ CODE ROUND-TRIP
  // ═══════════════════════════════════════════════════

  importHTMLToExisting: async (html: string, targetComponentId?: string) => {
    try {
      const state = get();
      
      // Send to AI for parsing
      const response = await fetch(apiUrl('/api/ai-update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: targetComponentId
            ? `ROUND-TRIP IMPORT: The user has exported this component, edited the code, and is importing it back. Parse the following HTML/React/JSX code and return updates to REPLACE the existing component [${targetComponentId}] with the structure from the code. Preserve IDs where possible, match element types and content. Return action "update" with the full component replacement.\n\nCODE:\n${html}`
            : `IMPORT FROM CODE — Reconstruct the following HTML/React/JSX code as Bivvy component(s) on the canvas. Preserve the visual structure, text content, colors, fonts, spacing, and layout as closely as possible. Convert CSS classes to inline styles. Convert React components to nested div/text/button/input elements with appropriate styles.\n\nCODE:\n${html}`,
          components: state.components,
          selectedId: targetComponentId || state.selectedId,
          editingParentId: state.editingParentId,
          canvasBg: state.canvasBg,
          designTokens: state.designSystem,
          history: [],
        }),
      });
      
      const text = await response.text();
      // Robust JSON extraction — handle markdown fences and surrounding text
      let jsonStr = '';
      const fenceMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (fenceMatch) {
        jsonStr = fenceMatch[1];
      } else {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = text.substring(firstBrace, lastBrace + 1);
        }
      }
      if (!jsonStr) throw new Error('No JSON found in AI response');
      const data = JSON.parse(jsonStr);
      
      if (data.action === 'update' && data.componentId && data.updates) {
        // Single component update: { componentId, updates: { styles: {...} } }
        get().pushHistory();
        get().updateComponent(data.componentId, data.updates);
        get().addToast(data.message || 'Code imported and component updated', 'success');
        return true;
      } else if ((data.action === 'multi_update' || data.action === 'restyle_all') && data.items) {
        get().pushHistory();
        for (const item of data.items) {
          if (item.componentId && item.updates) {
            get().updateComponent(item.componentId, item.updates);
          }
        }
        get().addToast(data.message || `Updated ${data.items.length} elements`, 'success');
        return true;
      } else if (data.action === 'add_child' && data.parentId && data.child) {
        get().addChildToComponent(data.parentId, data.child);
        get().addToast(data.message || 'Child added', 'success');
        return true;
      } else if (data.action === 'reparent' && data.componentId && data.parentId) {
        get().reparentComponent(data.componentId, data.parentId);
        get().addToast(data.message || 'Moved into parent', 'success');
        return true;
      } else if (data.action === 'create' && data.component) {
        get().addComponent(data.component);
        get().addToast(data.message || 'Component created from code', 'success');
        return true;
      } else if (data.action === 'create_page' && data.components) {
        get().batchAddComponents(data.components);
        get().addToast(data.message || `${data.components.length} components imported`, 'success');
        return true;
      } else if (data.action === 'delete' && data.componentId) {
        get().deleteComponent(data.componentId);
        get().addToast(data.message || 'Deleted', 'success');
        return true;
      } else if (data.action === 'resize' && data.componentId && data.size) {
        get().pushHistory();
        get().updateComponent(data.componentId, { size: data.size });
        get().addToast(data.message || 'Resized', 'success');
        return true;
      } else if (data.action === 'duplicate' && data.componentId) {
        get().duplicateComponent(data.componentId);
        get().addToast(data.message || 'Duplicated', 'success');
        return true;
      }
      // describe / info actions just show message
      if (data.message) {
        get().addToast(data.message, 'info');
      }
      return false;
    } catch (err: any) {
      get().addToast(`Round-trip import failed: ${err.message?.substring(0, 80)}`, 'error');
      return false;
    }
  },

};
});
