'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useStore, ComponentElement } from '@/store/componentStore';
// lucide-react icons for context menu
import { Copy, Scissors, ClipboardPaste, ArrowUpToLine, ArrowUp, ArrowDown, ArrowDownToLine, Lock, Unlock, Search, BookmarkPlus, Group, Ungroup, Sparkles, StickyNote, Trash2, Clipboard, MousePointer2, Heart, Check, Wand2, X as XIcon, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { buildThemeSwapMap, defaultNamedTokens } from '@/lib/designSystemDefaults';
import { loadFontsFromComponents } from '@/utils/fontLoader';

// Token-based theme transform: swaps dark semantic values to light counterparts
function themeTransformStyle(styles: Record<string, any>, isLight: boolean, swapMap: Map<string, string>): Record<string, any> {
  if (!isLight || swapMap.size === 0) return styles;
  const s = { ...styles };
  const colorProps = ['backgroundColor', 'color', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'background', 'fill', 'stroke'];
  for (const prop of colorProps) {
    if (s[prop] && typeof s[prop] === 'string') {
      const lower = s[prop].toLowerCase();
      if (swapMap.has(lower)) {
        s[prop] = swapMap.get(lower)!;
      }
    }
  }
  // Also swap colors in border shorthand
  if (s.border && typeof s.border === 'string') {
    let border = s.border;
    for (const [dark, light] of swapMap) {
      if (border.toLowerCase().includes(dark)) {
        border = border.replace(new RegExp(dark.replace('#', '#?'), 'gi'), light);
      }
    }
    s.border = border;
  }
  return s;
}

// Shape defaults for each tool
const shapeDefaults: Record<string, { type: string; content: string; minWidth: number; minHeight: number; styles: Record<string, string> }> = {
  rectangle: {
    type: 'div', content: '', minWidth: 20, minHeight: 20,
    styles: { backgroundColor: '#374151', borderRadius: '8px', border: '1px solid #4b5563' },
  },
  circle: {
    type: 'div', content: '', minWidth: 20, minHeight: 20,
    styles: { backgroundColor: '#374151', borderRadius: '50%', border: '1px solid #4b5563' },
  },
  line: {
    type: 'line', content: '', minWidth: 10, minHeight: 10,
    styles: { stroke: '#9ca3af', strokeWidth: '2' },
  },
  arrow: {
    type: 'arrow', content: '', minWidth: 10, minHeight: 10,
    styles: { stroke: '#9ca3af', strokeWidth: '2' },
  },
  text: {
    type: 'text', content: 'Text', minWidth: 40, minHeight: 24,
    styles: { color: '#ffffff', fontSize: '16px', fontWeight: '400', backgroundColor: 'transparent', display: 'flex', alignItems: 'center' },
  },
  image: {
    type: 'div', content: '🖼️', minWidth: 40, minHeight: 40,
    styles: { backgroundColor: '#1f2937', borderRadius: '8px', border: '2px dashed #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' },
  },
};

// Default sizes when user single-clicks (no drag)
const defaultSizes: Record<string, { width: number; height: number }> = {
  rectangle: { width: 200, height: 120 },
  circle: { width: 120, height: 120 },
  line: { width: 200, height: 2 },
  arrow: { width: 200, height: 2 },
  text: { width: 120, height: 40 },
  image: { width: 200, height: 150 },
};

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    components, selectedId, selectedIds, hoveredId, zoom, showGrid, canvasBg, showRulers, activeTool,
    editingParentId, devicePreview, previewState, showAnnotations, activeTheme, inspectMode,
    selectComponent, selectMultiple, toggleSelection, clearSelection,
    updateComponent, addComponent, deleteSelected, duplicateComponent,
    setZoom, toggleGrid, setHoveredComponent, setActiveTool, findComponent,
    pushHistory, copySelected, pasteClipboard, cutSelected, selectAll,
    enterComponent, exitComponent, addToast, setCanvasDragging,
    panOffset, setPanOffset, designSystem, reorderChild,
    canvasVariations, clearCanvasVariations, applyCanvasVariation,
    favoriteCanvasVariation, livePreviewCanvasVariation, setCanvasVariations,
    variationHistory, variationHistoryIndex, navigateVariationHistory, navigateToVariationIndex,
  } = useStore();

  // Build theme swap map from named tokens (uses imported tokens if available, else internal defaults)
  const themeSwapMap = useMemo(() => {
    const tokens = designSystem.namedTokens?.length > 0 ? designSystem.namedTokens : [];
    if (!tokens.length) {
      // Use internal defaults for theme swap even without imported design system
      const { darkToLight } = buildThemeSwapMap(defaultNamedTokens);
      return darkToLight;
    }
    const { darkToLight } = buildThemeSwapMap(tokens);
    return darkToLight;
  }, [designSystem.namedTokens]);

  // Auto-load Google Fonts when components change (import, workspace switch, etc.)
  useEffect(() => {
    if (components.length > 0) loadFontsFromComponents(components);
  }, [components]);

  // Ghost card prevention: increment render key when components transitions to empty
  // This forces React to recreate the subtree, clearing any stale DOM nodes
  const [canvasRenderKey, setCanvasRenderKey] = useState(0);
  useEffect(() => {
    if (components.length === 0) {
      setCanvasRenderKey(k => k + 1);
    }
  }, [components.length]);

  // Interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  // Use refs for these flags to avoid race conditions between native mouseUp and React click
  const didDragBoxRef = useRef(false);
  const didDragComponentRef = useRef(false);
  const didDrawRef = useRef(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{x: number; y: number; width: number; height: number} | null>(null);
  const [drawPreview, setDrawPreview] = useState<{x: number; y: number; width: number; height: number} | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{x: number; y: number; componentId?: string; childId?: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageRef = useRef<{position: {x: number; y: number}; size: {width: number; height: number}} | null>(null);

  // Child drag state (dragging sub-elements within parent)
  const [isChildDragging, setIsChildDragging] = useState(false);
  const [childDragStart, setChildDragStart] = useState({ x: 0, y: 0 });
  const childDragStartStyles = useRef<{ left: number; top: number }>({ left: 0, top: 0 });
  const isFlexReorder = useRef(false); // Track if drag is a flex reorder operation
  const flexDragOriginIndex = useRef(-1); // Original index of dragged child
  const flexDropIndexRef = useRef<number | null>(null); // Drop target index (ref for mouseUp)
  const [flexDropIndex, setFlexDropIndex] = useState<number | null>(null); // Visual drop indicator position

  // Child resize state (resizing sub-elements within parent)
  const [isChildResizing, setIsChildResizing] = useState(false);
  const [childResizeHandle, setChildResizeHandle] = useState<string | null>(null);
  const [childResizeStart, setChildResizeStart] = useState({ x: 0, y: 0 });
  const childResizeStartSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const childResizeStartPos = useRef<{ left: number; top: number }>({ left: 0, top: 0 });
  // Snap guides
  const SNAP_THRESHOLD = 5; // pixels in canvas space
  const [snapGuides, setSnapGuides] = useState<{ type: 'x' | 'y'; pos: number; from: number; to: number }[]>([]);
  const snapGuidesRef = useRef<{ type: 'x' | 'y'; pos: number; from: number; to: number }[]>([]);

  // Child snap guides (within parent coordinate space)
  const [childSnapGuides, setChildSnapGuides] = useState<{ type: 'x' | 'y'; pos: number; from: number; to: number }[]>([]);

  // Refs for drawing to avoid stale closures
  const drawStartRef = useRef({ x: 0, y: 0 });
  const drawEndRef = useRef({ x: 0, y: 0 });
  const drawPreviewRef = useRef<{x: number; y: number; width: number; height: number} | null>(null);
  const activeToolRef = useRef(activeTool);
  const zoomRef = useRef(zoom);
  activeToolRef.current = activeTool;
  zoomRef.current = zoom;

  // Auto-fit when device preview is toggled
  useEffect(() => {
    if (!devicePreview || !canvasRef.current) return;
    const devSizes: Record<string, { w: number; h: number }> = { phone: { w: 375, h: 812 }, tablet: { w: 768, h: 1024 }, desktop: { w: 1440, h: 900 } };
    const dev = devSizes[devicePreview];
    if (!dev) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const padding = 80; // px of breathing room
    const fitZoom = Math.min((viewW - padding) / dev.w, (viewH - padding) / dev.h, 1);
    const scaledW = dev.w * fitZoom;
    const scaledH = dev.h * fitZoom;
    const newPanX = (viewW - scaledW) / 2;
    const newPanY = (viewH - scaledH) / 2;
    setZoom(Math.round(fitZoom * 100) / 100);
    setPanOffset({ x: newPanX, y: newPanY });
  }, [devicePreview]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Let inputs and textareas handle their own keys first
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      // Space for pan mode - only when not typing
      if (e.key === ' ' && !e.repeat && !isEditing) {
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }

      if (isEditing) return;

      if (!e.metaKey && !e.ctrlKey) {
        if (e.key === 'v' || e.key === 'V') setActiveTool('select');
        if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle');
        if (e.key === 'o' || e.key === 'O') setActiveTool('circle');
        if (e.key === 'l' || e.key === 'L') setActiveTool('line');
        if (e.key === 'a' && !e.shiftKey) setActiveTool('arrow');
        if (e.key === 't' || e.key === 'T') setActiveTool('text');
        
        // Shift+A: Toggle auto layout on selected component
        if (e.key === 'A' && e.shiftKey && selectedId) {
          e.preventDefault();
          const comp = useStore.getState().components.find(c => c.id === selectedId);
          if (comp && comp.type === 'div') {
            useStore.getState().pushHistory();
            const isFlex = comp.styles?.display === 'flex';
            if (isFlex) {
              useStore.getState().updateComponent(selectedId, { 
                styles: { ...comp.styles, display: undefined, flexDirection: undefined, gap: undefined, alignItems: undefined, justifyContent: undefined, flexWrap: undefined } 
              });
              useStore.getState().addToast('Auto layout removed', 'info');
            } else {
              useStore.getState().updateComponent(selectedId, { 
                styles: { ...comp.styles, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', justifyContent: 'flex-start' } 
              });
              useStore.getState().addToast('Auto layout added (⇧A)', 'success');
            }
          }
        }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        deleteSelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedId) {
        e.preventDefault();
        duplicateComponent(selectedId);
      }
      // Copy/Paste/Cut/Select All
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        copySelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        pasteClipboard();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
        e.preventDefault();
        cutSelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }
      // Group / Ungroup
      if ((e.metaKey || e.ctrlKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        useStore.getState().groupSelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'g' && e.shiftKey) {
        e.preventDefault();
        if (selectedId) useStore.getState().ungroupComponent(selectedId);
      }
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useStore.getState().undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useStore.getState().redo();
      }
      if (e.key === 'Escape') {
        // Always clear child snap guides on Escape
        setChildSnapGuides([]);
        // Dismiss canvas variations first
        if (useStore.getState().canvasVariations) {
          clearCanvasVariations();
          return;
        }
        // If editing text inline, just stop that
        if (editingId) {
          setEditingId(null);
          return;
        }
        // If inside a parent component, step out progressively
        const state = useStore.getState();
        if (state.editingParentId) {
          // If a child is selected, first step: select parent (stay in sub-element mode)
          if (state.selectedId && state.selectedId !== state.editingParentId) {
            selectComponent(state.editingParentId);
            return;
          }
          // Second step: exit sub-element mode entirely
          exitComponent();
          selectComponent(state.editingParentId);
          return;
        }
        setActiveTool('select');
        clearSelection();
        setContextMenu(null);
      }

      // Arrow key nudging
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

        // Push undo snapshot BEFORE modifying state
        pushHistory();

        const state = useStore.getState();
        if (state.editingParentId && state.selectedId) {
          // Nudge child element via CSS left/top
          const child = findComponent(state.selectedId);
          if (child) {
            const curLeft = parseInt(child.styles?.left || '0') || 0;
            const curTop = parseInt(child.styles?.top || '0') || 0;
            updateComponent(state.selectedId, {
              styles: {
                ...(child.styles || {}),
                position: 'absolute',
                left: `${curLeft + dx}px`,
                top: `${curTop + dy}px`,
              },
            });
          }
        } else {
          // Nudge top-level components via position
          const dp = state.devicePreview;
          const devSizes = { phone: { w: 375, h: 812 }, tablet: { w: 768, h: 1024 }, desktop: { w: 1440, h: 900 } };
          selectedIds.forEach(id => {
            const comp = findComponent(id);
            if (comp) {
              let newX = comp.position.x + dx;
              let newY = comp.position.y + dy;
              if (dp) {
                const dev = devSizes[dp];
                newX = Math.max(0, Math.min(newX, dev.w - comp.size.width));
                newY = Math.max(0, Math.min(newY, dev.h - comp.size.height));
              }
              updateComponent(id, { position: { x: newX, y: newY } });
            }
          });
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, selectedIds, editingId, setActiveTool, deleteSelected, duplicateComponent, clearSelection, copySelected, pasteClipboard, cutSelected, selectAll, exitComponent, selectComponent, findComponent, updateComponent, pushHistory]);

  // Get canvas-relative coordinates from mouse event
  const getCanvasPos = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const pan = useStore.getState().panOffset;
    const z = useStore.getState().zoom;
    return {
      x: (e.clientX - rect.left - pan.x) / z,
      y: (e.clientY - rect.top - pan.y) / z,
    };
  };

  const getCanvasPosRaw = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // ===== CANVAS BACKGROUND MOUSEDOWN =====
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Close context menu on any click
    if (contextMenu) setContextMenu(null);

    // Accept clicks on canvas background — not on components
    // The DOM hierarchy is: canvasRef → pannable → zoom layer → components
    // So we need to accept clicks on canvasRef, pannable, or zoom layer
    const target = e.target as HTMLElement;
    const isCanvasBg = target === e.currentTarget 
      || target.parentElement === e.currentTarget 
      || target.parentElement?.parentElement === e.currentTarget
      || target.closest('[data-component-id]') === null;
    if (!isCanvasBg) return;
    if (e.button === 2) return; // Right click handled separately

    // Middle mouse = pan
    if (e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (e.button !== 0) return; // Left click only

    // Space+click = pan
    if (spaceHeld) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (activeTool !== 'select') {
      // START DRAWING
      const pos = getCanvasPos(e);
      drawStartRef.current = pos;
      drawEndRef.current = pos;
      drawPreviewRef.current = { x: pos.x, y: pos.y, width: 0, height: 0 };
      setDrawPreview({ x: pos.x, y: pos.y, width: 0, height: 0 });
      setIsDrawing(true);
      didDrawRef.current = false;
    } else if (e.shiftKey) {
      // Shift+click on empty canvas = box select
      clearSelection();
      setEditingId(null);
      setIsBoxSelecting(true);
      const rawPos = getCanvasPosRaw(e);
      setDragStart(rawPos);
    } else {
      // Click+drag on empty canvas = pan (grab mechanic)
      clearSelection();
      setEditingId(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  // ===== RIGHT-CLICK CONTEXT MENU =====
  const handleContextMenu = (e: React.MouseEvent, componentId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (componentId && !selectedIds.includes(componentId)) {
      selectComponent(componentId);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, componentId });
  };

  // ===== PANNING =====
  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart]);

  // ===== SCROLL WHEEL: PAN (default) + ZOOM (Ctrl/Cmd) =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const state = useStore.getState();

      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd + scroll = zoom toward cursor
        const oldZoom = state.zoom;
        const delta = -e.deltaY * 0.002;
        const newZoom = Math.max(0.1, Math.min(3, oldZoom + delta));
        
        const rect = canvas.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        
        const canvasX = (cursorX - state.panOffset.x) / oldZoom;
        const canvasY = (cursorY - state.panOffset.y) / oldZoom;
        
        const newPanX = cursorX - canvasX * newZoom;
        const newPanY = cursorY - canvasY * newZoom;
        
        setZoom(newZoom);
        setPanOffset({ x: newPanX, y: newPanY });
      } else {
        // Regular scroll = pan canvas
        // Shift+scroll = horizontal pan
        const dx = e.shiftKey ? -e.deltaY : -e.deltaX;
        const dy = e.shiftKey ? 0 : -e.deltaY;
        setPanOffset({
          x: state.panOffset.x + dx,
          y: state.panOffset.y + dy,
        });
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [setZoom, setPanOffset]);

  // ===== CANVAS CLICK (fires after mouseUp) =====
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (didDragBoxRef.current) { didDragBoxRef.current = false; return; }
    if (didDrawRef.current) { didDrawRef.current = false; return; }

    const isCanvasBg = e.target === e.currentTarget || (e.target as HTMLElement).parentElement === e.currentTarget;
    if (isCanvasBg && activeTool === 'select') {
      // Dismiss canvas variations
      if (useStore.getState().canvasVariations) {
        clearCanvasVariations();
      }
      // If in sub-element mode, exit first
      if (editingParentId) {
        exitComponent();
      }
      clearSelection();
      setEditingId(null);
    }
  };

  // ===== DRAW MODE (drag-to-create shapes) =====
  useEffect(() => {
    if (!isDrawing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const z = zoomRef.current;
      const pan = useStore.getState().panOffset;
      const currentX = (e.clientX - rect.left - pan.x) / z;
      const currentY = (e.clientY - rect.top - pan.y) / z;
      const start = drawStartRef.current;

      // Track end position for line/arrow direction
      drawEndRef.current = { x: currentX, y: currentY };

      const preview = {
        x: Math.min(start.x, currentX),
        y: Math.min(start.y, currentY),
        width: Math.abs(currentX - start.x),
        height: Math.abs(currentY - start.y),
      };

      drawPreviewRef.current = preview;
      setDrawPreview(preview);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);

      const preview = drawPreviewRef.current;
      const start = drawStartRef.current;
      const end = drawEndRef.current;
      setDrawPreview(null);
      drawPreviewRef.current = null;

      if (!preview) return;

      const tool = activeToolRef.current;
      const shapeDef = shapeDefaults[tool];
      if (!shapeDef) return;

      const wasDrag = preview.width > 5 || preview.height > 5;

      // For lines and arrows, use start/end refs for direction
      if (tool === 'line' || tool === 'arrow') {
        // Bounding box
        const minX = Math.min(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const w = Math.max(Math.abs(end.x - start.x), 10);
        const h = Math.max(Math.abs(end.y - start.y), 4);

        // Store relative start/end within bounding box
        const relX1 = start.x - minX;
        const relY1 = start.y - minY;
        const relX2 = end.x - minX;
        const relY2 = end.y - minY;

        const finalSize = wasDrag
          ? { width: w, height: h }
          : defaultSizes[tool] || { width: 200, height: 2 };

        const finalPos = wasDrag
          ? { x: minX, y: minY }
          : { x: start.x, y: start.y };

        // Encode direction as "relX1,relY1,relX2,relY2" for rendering
        const directionContent = wasDrag
          ? `${Math.round(relX1)},${Math.round(relY1)},${Math.round(relX2)},${Math.round(relY2)}`
          : `0,0,${finalSize.width},0`;

        addComponent({
          id: `comp-${Date.now()}`,
          type: shapeDef.type as any,
          content: directionContent,
          position: finalPos,
          size: finalSize,
          styles: { ...shapeDef.styles },
        });
      } else if (tool === 'image') {
        // For images, open file picker instead of placing a placeholder
        const finalSize = wasDrag
          ? {
              width: Math.max(preview.width, shapeDef.minWidth),
              height: Math.max(preview.height, shapeDef.minHeight),
            }
          : defaultSizes[tool] || { width: 200, height: 150 };

        const finalPos = wasDrag
          ? { x: preview.x, y: preview.y }
          : { x: preview.x - finalSize.width / 2, y: preview.y - finalSize.height / 2 };

        pendingImageRef.current = { position: finalPos, size: finalSize };
        if (fileInputRef.current) fileInputRef.current.click();
      } else {
        // Normal shapes
        const finalSize = wasDrag
          ? {
              width: Math.max(preview.width, shapeDef.minWidth),
              height: Math.max(preview.height, shapeDef.minHeight),
            }
          : defaultSizes[tool] || { width: 100, height: 100 };

        const finalPos = wasDrag
          ? { x: preview.x, y: preview.y }
          : { x: preview.x - finalSize.width / 2, y: preview.y - finalSize.height / 2 };

        addComponent({
          id: `comp-${Date.now()}`,
          type: shapeDef.type as any,
          content: shapeDef.content,
          position: finalPos,
          size: finalSize,
          styles: { ...shapeDef.styles },
        });
      }

      didDrawRef.current = true;
      setActiveTool('select');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawing, addComponent, setActiveTool]);

  // ===== BOX SELECTION =====
  useEffect(() => {
    if (!isBoxSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rawPos = getCanvasPosRaw(e);
      const box = {
        x: Math.min(dragStart.x, rawPos.x),
        y: Math.min(dragStart.y, rawPos.y),
        width: Math.abs(rawPos.x - dragStart.x),
        height: Math.abs(rawPos.y - dragStart.y),
      };
      setSelectionBox(box);

      const selected = components.filter(comp => {
        const pan = useStore.getState().panOffset;
        const cx = pan.x + comp.position.x * zoom;
        const cy = pan.y + comp.position.y * zoom;
        const cw = comp.size.width * zoom;
        const ch = comp.size.height * zoom;
        return cx < box.x + box.width && cx + cw > box.x && cy < box.y + box.height && cy + ch > box.y;
      });
      if (selected.length > 0) selectMultiple(selected.map(c => c.id));
    };

    const handleMouseUp = () => {
      // Always mark as box-selected so click handler doesn't clear the selection
      // (selectionBox state is stale in this closure, use selectedIds from store instead)
      if (useStore.getState().selectedIds.length > 0) {
        didDragBoxRef.current = true;
      }
      setIsBoxSelecting(false);
      setSelectionBox(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isBoxSelecting, dragStart, components, zoom, selectMultiple]);

  // ===== COMPONENT CLICK =====
  const handleComponentClick = (e: React.MouseEvent, component: ComponentElement) => {
    e.stopPropagation();
    if (contextMenu) { setContextMenu(null); return; }
    if (didDragComponentRef.current) { didDragComponentRef.current = false; return; }

    // ── Deep descendant click: find the deepest data-bivvy-id under the cursor ──
    const target = e.target as HTMLElement;
    const bivvyEl = target.closest('[data-bivvy-id]') as HTMLElement;
    const clickedBivvyId = bivvyEl?.getAttribute('data-bivvy-id');
    
    // If we clicked a descendant (not the component itself)
    if (clickedBivvyId && clickedBivvyId !== component.id) {
      // Select the clicked descendant — selectComponent will auto-set editingParentId
      selectComponent(clickedBivvyId);
      return;
    }

    // ── Single-click auto-enter: if clicking directly on a child element, enter sub-element mode ──
    if (component.children && component.children.length > 0 && !editingParentId) {
      const childEl = target.closest('[data-child-id]') as HTMLElement;
      if (childEl) {
        const childId = childEl.getAttribute('data-child-id');
        if (childId) {
          enterComponent(component.id);
          selectComponent(childId);
          return;
        }
      }
    }

    // ── In sub-element mode: clicking parent background (not a child) exits to parent ──
    if (editingParentId === component.id) {
      const childEl = target.closest('[data-child-id]');
      if (!childEl) {
        selectComponent(component.id);
        return;
      }
    }

    if (e.shiftKey) {
      toggleSelection(component.id);
    } else {
      selectComponent(component.id);
    }
  };

  // Click on a child element while in sub-element editing mode
  const handleChildClick = (e: React.MouseEvent, child: ComponentElement) => {
    e.stopPropagation();
    if (didDragComponentRef.current) { didDragComponentRef.current = false; return; }
    
    // Event delegation: check if a deeper descendant was actually clicked
    const target = e.target as HTMLElement;
    const bivvyEl = target.closest('[data-bivvy-id]') as HTMLElement;
    const clickedId = bivvyEl?.getAttribute('data-bivvy-id');
    
    if (clickedId && clickedId !== child.id) {
      // Clicked a descendant within this child — select the descendant
      selectComponent(clickedId);
    } else {
      selectComponent(child.id);
    }
  };

  // Drag a child element within its parent
  const handleChildDragStart = (e: React.MouseEvent, child: ComponentElement) => {
    e.stopPropagation();
    e.preventDefault();
    selectComponent(child.id);
    setIsChildDragging(true);
    setCanvasDragging(true);

    // Detect if parent is a flex container — use reorder instead of absolute positioning
    const parent = editingParentId ? findComponent(editingParentId) : null;
    const parentIsFlex = parent?.styles?.display === 'flex';
    isFlexReorder.current = parentIsFlex;

    // Only push history for absolute positioning mode.
    // Flex reorder uses reorderChild which pushes history internally.
    if (!parentIsFlex) {
      pushHistory();
    }

    if (parentIsFlex && parent?.children) {
      flexDragOriginIndex.current = parent.children.findIndex(c => c.id === child.id);
    }

    // Read current CSS left/top if set; otherwise use the element's actual offset
    let currentLeft = parseInt(child.styles?.left || '') || 0;
    let currentTop = parseInt(child.styles?.top || '') || 0;

    // If no explicit left/top, measure actual rendered offset within parent
    if (!child.styles?.left && !child.styles?.top) {
      const el = (e.currentTarget as HTMLElement);
      currentLeft = el.offsetLeft;
      currentTop = el.offsetTop;
    }

    childDragStartStyles.current = { left: currentLeft, top: currentTop };
    setChildDragStart({ x: e.clientX, y: e.clientY });
  };

  // ===== DOUBLE CLICK TO EDIT =====
  const handleDoubleClick = (e: React.MouseEvent, component: ComponentElement) => {
    e.stopPropagation();
    // If component has children, enter sub-element editing mode
    if (component.children && component.children.length > 0) {
      enterComponent(component.id);
      selectComponent(component.id);
      return;
    }
    // Otherwise, inline text edit for text/button/input
    if (component.type === 'text' || component.type === 'button' || component.type === 'input') {
      useStore.getState().pushHistory();
      setEditingId(component.id);
    }
  };

  // Double-click a child to edit its text inline
  const handleChildDoubleClick = (e: React.MouseEvent, child: ComponentElement) => {
    e.stopPropagation();
    // Event delegation: check if a deeper descendant was double-clicked
    const target = e.target as HTMLElement;
    const bivvyEl = target.closest('[data-bivvy-id]') as HTMLElement;
    const clickedId = bivvyEl?.getAttribute('data-bivvy-id');
    const actualId = (clickedId && clickedId !== child.id) ? clickedId : child.id;
    const actualElement = findComponent(actualId);
    if (actualElement && (actualElement.type === 'text' || actualElement.type === 'button' || actualElement.type === 'input')) {
      useStore.getState().pushHistory();
      setEditingId(actualId);
    }
  };

  // ===== COMPONENT DRAG =====
  const handleDragStart = (e: React.MouseEvent, component: ComponentElement) => {
    e.stopPropagation();
    if (!selectedIds.includes(component.id)) selectComponent(component.id);
    pushHistory(); // Capture pre-drag state for undo
    setIsDragging(true);
    setCanvasDragging(true);
    setDragStart({
      x: e.clientX - component.position.x * zoom,
      y: e.clientY - component.position.y * zoom,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (selectedIds.length === 0) return;
      const primaryComp = findComponent(selectedIds[0]);
      if (!primaryComp) return;

      let newX = (e.clientX - dragStart.x) / zoom;
      let newY = (e.clientY - dragStart.y) / zoom;

      // Collect snap targets from non-selected components
      const state = useStore.getState();
      const otherComps = state.components.filter(c => !selectedIds.includes(c.id) && !c.hidden);
      const guides: { type: 'x' | 'y'; pos: number; from: number; to: number }[] = [];

      const dragW = primaryComp.size.width;
      const dragH = primaryComp.size.height;

      // Dragged component edges & center
      const dragLeft = newX;
      const dragRight = newX + dragW;
      const dragCenterX = newX + dragW / 2;
      const dragTop = newY;
      const dragBottom = newY + dragH;
      const dragCenterY = newY + dragH / 2;

      let snappedX = false;
      let snappedY = false;

      for (const other of otherComps) {
        const oLeft = other.position.x;
        const oRight = other.position.x + other.size.width;
        const oCenterX = other.position.x + other.size.width / 2;
        const oTop = other.position.y;
        const oBottom = other.position.y + other.size.height;
        const oCenterY = other.position.y + other.size.height / 2;

        // Vertical guides (snap X positions)
        const xChecks = [
          { drag: dragLeft, target: oLeft, label: 'left-left' },
          { drag: dragLeft, target: oRight, label: 'left-right' },
          { drag: dragRight, target: oLeft, label: 'right-left' },
          { drag: dragRight, target: oRight, label: 'right-right' },
          { drag: dragCenterX, target: oCenterX, label: 'center-center' },
        ];
        for (const check of xChecks) {
          if (!snappedX && Math.abs(check.drag - check.target) < SNAP_THRESHOLD) {
            newX += check.target - check.drag;
            snappedX = true;
            const minY = Math.min(newY, oTop);
            const maxY = Math.max(newY + dragH, oBottom);
            guides.push({ type: 'x', pos: check.target, from: minY, to: maxY });
          }
        }

        // Horizontal guides (snap Y positions)
        const yChecks = [
          { drag: dragTop, target: oTop, label: 'top-top' },
          { drag: dragTop, target: oBottom, label: 'top-bottom' },
          { drag: dragBottom, target: oTop, label: 'bottom-top' },
          { drag: dragBottom, target: oBottom, label: 'bottom-bottom' },
          { drag: dragCenterY, target: oCenterY, label: 'center-center' },
        ];
        for (const check of yChecks) {
          if (!snappedY && Math.abs(check.drag - check.target) < SNAP_THRESHOLD) {
            newY += check.target - check.drag;
            snappedY = true;
            const minX = Math.min(newX, oLeft);
            const maxX = Math.max(newX + dragW, oRight);
            guides.push({ type: 'y', pos: check.target, from: minX, to: maxX });
          }
        }
      }

      snapGuidesRef.current = guides;
      setSnapGuides(guides);

      // Snap to grid if enabled and no guide snap occurred
      // Keep unsnapped position for drag tracking to prevent feedback loop
      const unsnappedX = newX;
      const unsnappedY = newY;
      const state2 = useStore.getState();
      if (state2.snapToGrid) {
        const gs = state2.gridSize;
        if (!snappedX) newX = Math.round(newX / gs) * gs;
        if (!snappedY) newY = Math.round(newY / gs) * gs;
      }

      // Clamp to device bounds if preview active
      if (state2.devicePreview) {
        const devSizes = { phone: { w: 375, h: 812 }, tablet: { w: 768, h: 1024 }, desktop: { w: 1440, h: 900 } };
        const dev = devSizes[state2.devicePreview];
        newX = Math.max(0, Math.min(newX, dev.w - dragW));
        newY = Math.max(0, Math.min(newY, dev.h - dragH));
      }

      const deltaX = newX - primaryComp.position.x;
      const deltaY = newY - primaryComp.position.y;

      selectedIds.forEach(id => {
        const comp = findComponent(id);
        if (comp) {
          updateComponent(id, {
            position: { x: comp.position.x + deltaX, y: comp.position.y + deltaY },
          });
        }
      });
      // Use unsnapped position for drag origin so snap doesn't accumulate
      setDragStart({ x: e.clientX - unsnappedX * zoom, y: e.clientY - unsnappedY * zoom });
    };

    const handleMouseUp = () => {
      if (selectedIds.length > 0) {
        didDragComponentRef.current = true;
      }
      setIsDragging(false);
      setCanvasDragging(false);
      setSnapGuides([]);
      snapGuidesRef.current = [];
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedIds, dragStart, zoom, updateComponent, findComponent]);

  // ===== CHILD DRAG (sub-element within parent) =====
  useEffect(() => {
    if (!isChildDragging) return;
    const DRAG_THRESHOLD = 3; // px before treating as real drag
    let dragStarted = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedId || !editingParentId) return;

      // Require minimum movement before starting actual drag
      if (!dragStarted) {
        const dx = Math.abs(e.clientX - childDragStart.x);
        const dy = Math.abs(e.clientY - childDragStart.y);
        if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
        dragStarted = true;

        // For flex containers, DON'T freeze siblings — use reorder instead
        if (!isFlexReorder.current) {
          // Freeze siblings on first real drag movement (non-flex only)
          const parent = findComponent(editingParentId);
          if (parent?.children) {
            const updates: { id: string; left: number; top: number; styles: any }[] = [];
            for (const sibling of parent.children) {
              if (sibling.id === selectedId) continue;
              if (sibling.styles?.position === 'absolute') continue;
              const sibEl = document.querySelector(`[data-child-id="${sibling.id}"]`) as HTMLElement;
              if (!sibEl) continue;
              updates.push({
                id: sibling.id,
                left: sibEl.offsetLeft,
                top: sibEl.offsetTop,
                styles: sibling.styles || {},
              });
            }
            for (const upd of updates) {
              updateComponent(upd.id, {
                styles: {
                  ...upd.styles,
                  position: 'absolute',
                  left: `${upd.left}px`,
                  top: `${upd.top}px`,
                },
              });
            }
          }
        }
      }

      // ─── FLEX REORDER MODE — track drop position, don't reorder yet ───
      if (isFlexReorder.current) {
        const parent = findComponent(editingParentId);
        if (!parent?.children) return;

        const isRow = parent.styles?.flexDirection !== 'column';
        const cursorPos = isRow ? e.clientX : e.clientY;

        // Find which slot the cursor is in
        let dropIdx = parent.children.length; // default: end
        for (let i = 0; i < parent.children.length; i++) {
          const childEl = document.querySelector(`[data-child-id="${parent.children[i].id}"]`) as HTMLElement;
          if (!childEl) continue;
          const rect = childEl.getBoundingClientRect();
          const midpoint = isRow ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
          if (cursorPos < midpoint) {
            dropIdx = i;
            break;
          }
        }

        // Don't show indicator at the dragged element's own position or the slot right after it
        const originIdx = flexDragOriginIndex.current;
        if (dropIdx === originIdx || dropIdx === originIdx + 1) {
          flexDropIndexRef.current = null;
          setFlexDropIndex(null);
        } else {
          flexDropIndexRef.current = dropIdx;
          setFlexDropIndex(dropIdx);
        }
        return;
      }

      // ─── ABSOLUTE POSITIONING MODE (non-flex) ───
      const deltaX = (e.clientX - childDragStart.x) / zoom;
      const deltaY = (e.clientY - childDragStart.y) / zoom;
      let newLeft = Math.round(childDragStartStyles.current.left + deltaX);
      let newTop = Math.round(childDragStartStyles.current.top + deltaY);

      // Get dragged child dimensions from DOM
      const draggedEl = document.querySelector(`[data-child-id="${selectedId}"]`) as HTMLElement;
      const parentEl = document.querySelector(`[data-component-id="${editingParentId}"]`) as HTMLElement;
      if (!draggedEl || !parentEl) {
        updateComponent(selectedId, {
          styles: {
            ...(findComponent(selectedId)?.styles || {}),
            position: 'absolute',
            left: `${newLeft}px`,
            top: `${newTop}px`,
          },
        });
        return;
      }

      const dragW = draggedEl.offsetWidth;
      const dragH = draggedEl.offsetHeight;
      const parentW = parentEl.offsetWidth;
      const parentH = parentEl.offsetHeight;

      // Get sibling positions from DOM
      const parent = findComponent(editingParentId);
      const siblings = (parent?.children || []).filter(c => c.id !== selectedId && !c.hidden);
      const guides: { type: 'x' | 'y'; pos: number; from: number; to: number }[] = [];

      const dragLeft = newLeft;
      const dragRight = newLeft + dragW;
      const dragCenterX = newLeft + dragW / 2;
      const dragTop = newTop;
      const dragBottom = newTop + dragH;
      const dragCenterY = newTop + dragH / 2;

      let snappedX = false;
      let snappedY = false;

      // Snap to parent edges and center
      const parentTargetsX = [0, parentW / 2, parentW];
      const parentTargetsY = [0, parentH / 2, parentH];

      // Snap to parent horizontal edges/center
      for (const target of parentTargetsX) {
        if (!snappedX) {
          for (const edge of [dragLeft, dragRight, dragCenterX]) {
            if (!snappedX && Math.abs(edge - target) < SNAP_THRESHOLD) {
              newLeft += target - edge;
              snappedX = true;
              guides.push({ type: 'x', pos: target, from: 0, to: parentH });
            }
          }
        }
      }
      for (const target of parentTargetsY) {
        if (!snappedY) {
          for (const edge of [dragTop, dragBottom, dragCenterY]) {
            if (!snappedY && Math.abs(edge - target) < SNAP_THRESHOLD) {
              newTop += target - edge;
              snappedY = true;
              guides.push({ type: 'y', pos: target, from: 0, to: parentW });
            }
          }
        }
      }

      // Snap to siblings
      for (const sib of siblings) {
        const sibEl = document.querySelector(`[data-child-id="${sib.id}"]`) as HTMLElement;
        if (!sibEl) continue;

        const oLeft = sibEl.offsetLeft;
        const oTop = sibEl.offsetTop;
        const oRight = oLeft + sibEl.offsetWidth;
        const oBottom = oTop + sibEl.offsetHeight;
        const oCenterX = (oLeft + oRight) / 2;
        const oCenterY = (oTop + oBottom) / 2;

        // Recalculate drag edges after potential parent snap
        const dL = newLeft, dR = newLeft + dragW, dCX = newLeft + dragW / 2;
        const dT = newTop, dB = newTop + dragH, dCY = newTop + dragH / 2;

        const xChecks = [
          { drag: dL, target: oLeft }, { drag: dL, target: oRight },
          { drag: dR, target: oLeft }, { drag: dR, target: oRight },
          { drag: dCX, target: oCenterX },
        ];
        for (const check of xChecks) {
          if (!snappedX && Math.abs(check.drag - check.target) < SNAP_THRESHOLD) {
            newLeft += check.target - check.drag;
            snappedX = true;
            const minY = Math.min(newTop, oTop);
            const maxY = Math.max(newTop + dragH, oBottom);
            guides.push({ type: 'x', pos: check.target, from: minY, to: maxY });
          }
        }

        const yChecks = [
          { drag: dT, target: oTop }, { drag: dT, target: oBottom },
          { drag: dB, target: oTop }, { drag: dB, target: oBottom },
          { drag: dCY, target: oCenterY },
        ];
        for (const check of yChecks) {
          if (!snappedY && Math.abs(check.drag - check.target) < SNAP_THRESHOLD) {
            newTop += check.target - check.drag;
            snappedY = true;
            const minX = Math.min(newLeft, oLeft);
            const maxX = Math.max(newLeft + dragW, oRight);
            guides.push({ type: 'y', pos: check.target, from: minX, to: maxX });
          }
        }
      }

      setChildSnapGuides(guides);

      updateComponent(selectedId, {
        styles: {
          ...(findComponent(selectedId)?.styles || {}),
          position: 'absolute',
          left: `${newLeft}px`,
          top: `${newTop}px`,
        },
      });
    };

    const handleMouseUp = () => {
      if (dragStarted) {
        didDragComponentRef.current = true;
        // Perform flex reorder on drop
        if (isFlexReorder.current && flexDropIndexRef.current !== null && editingParentId) {
          const originIdx = flexDragOriginIndex.current;
          const dropIdx = flexDropIndexRef.current;
          // No-op: dropping in same slot or the slot immediately after (same position)
          if (dropIdx === originIdx || dropIdx === originIdx + 1) {
            // Item would stay in the same position, skip reorder
          } else {
            // Adjust target: if dropping after the original position, account for removal
            const targetIdx = dropIdx > originIdx ? dropIdx - 1 : dropIdx;
            if (originIdx !== targetIdx && originIdx >= 0) {
              reorderChild(editingParentId, originIdx, targetIdx);
            }
          }
        }
      }
      isFlexReorder.current = false;
      flexDragOriginIndex.current = -1;
      flexDropIndexRef.current = null;
      setFlexDropIndex(null);
      setIsChildDragging(false);
      setCanvasDragging(false);
      setChildSnapGuides([]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isChildDragging, selectedId, editingParentId, childDragStart, zoom, updateComponent, findComponent, reorderChild]);

  // ===== CHILD RESIZE (sub-element within parent) =====
  const handleChildResizeStart = (e: React.MouseEvent, child: ComponentElement, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    selectComponent(child.id);
    pushHistory(); // Capture pre-resize state for undo
    setIsChildResizing(true);
    setCanvasDragging(true);
    setChildResizeHandle(handle);
    setChildResizeStart({ x: e.clientX, y: e.clientY });

    // Read current size from element
    const el = e.currentTarget.parentElement as HTMLElement;
    const currentWidth = parseInt(child.styles?.width || '') || el?.offsetWidth || 50;
    const currentHeight = parseInt(child.styles?.height || '') || el?.offsetHeight || 30;
    childResizeStartSize.current = { width: currentWidth, height: currentHeight };

    // Read current position for handles that move the origin
    const currentLeft = parseInt(child.styles?.left || '') || el?.offsetLeft || 0;
    const currentTop = parseInt(child.styles?.top || '') || el?.offsetTop || 0;
    childResizeStartPos.current = { left: currentLeft, top: currentTop };
  };

  useEffect(() => {
    if (!isChildResizing || !selectedId || !childResizeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const child = findComponent(selectedId);
      if (!child) return;

      const deltaX = (e.clientX - childResizeStart.x) / zoom;
      const deltaY = (e.clientY - childResizeStart.y) / zoom;

      let newWidth = childResizeStartSize.current.width;
      let newHeight = childResizeStartSize.current.height;
      let newLeft = childResizeStartPos.current.left;
      let newTop = childResizeStartPos.current.top;

      switch (childResizeHandle) {
        case 'bottom-right':
          newWidth = Math.max(20, childResizeStartSize.current.width + deltaX);
          newHeight = Math.max(20, childResizeStartSize.current.height + deltaY);
          break;
        case 'bottom-left':
          newWidth = Math.max(20, childResizeStartSize.current.width - deltaX);
          newHeight = Math.max(20, childResizeStartSize.current.height + deltaY);
          newLeft = childResizeStartPos.current.left + (childResizeStartSize.current.width - newWidth);
          break;
        case 'top-right':
          newWidth = Math.max(20, childResizeStartSize.current.width + deltaX);
          newHeight = Math.max(20, childResizeStartSize.current.height - deltaY);
          newTop = childResizeStartPos.current.top + (childResizeStartSize.current.height - newHeight);
          break;
        case 'top-left':
          newWidth = Math.max(20, childResizeStartSize.current.width - deltaX);
          newHeight = Math.max(20, childResizeStartSize.current.height - deltaY);
          newLeft = childResizeStartPos.current.left + (childResizeStartSize.current.width - newWidth);
          newTop = childResizeStartPos.current.top + (childResizeStartSize.current.height - newHeight);
          break;
      }

      updateComponent(selectedId, {
        styles: {
          ...(child.styles || {}),
          position: 'absolute',
          width: `${Math.round(newWidth)}px`,
          height: `${Math.round(newHeight)}px`,
          left: `${Math.round(newLeft)}px`,
          top: `${Math.round(newTop)}px`,
        },
      });
    };

    const handleMouseUp = () => {
      setIsChildResizing(false);
      setChildResizeHandle(null);
      setCanvasDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isChildResizing, selectedId, childResizeHandle, childResizeStart, zoom, updateComponent, findComponent]);

  // ===== RESIZE HANDLES =====
  const handleResizeStart = (e: React.MouseEvent, component: ComponentElement, handle: string) => {
    e.stopPropagation();
    pushHistory(); // Capture pre-resize state for undo
    setIsResizing(true);
    setCanvasDragging(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    selectComponent(component.id);
  };

  useEffect(() => {
    if (!isResizing || !selectedId || !resizeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const component = findComponent(selectedId);
      if (!component) return;

      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      let newSize = { ...component.size };
      let newPosition = { ...component.position };

      switch (resizeHandle) {
        case 'top-left':
          newSize.width = Math.max(30, component.size.width - deltaX);
          newSize.height = Math.max(20, component.size.height - deltaY);
          newPosition.x = component.position.x + (component.size.width - newSize.width);
          newPosition.y = component.position.y + (component.size.height - newSize.height);
          break;
        case 'top-right':
          newSize.width = Math.max(30, component.size.width + deltaX);
          newSize.height = Math.max(20, component.size.height - deltaY);
          newPosition.y = component.position.y + (component.size.height - newSize.height);
          break;
        case 'bottom-left':
          newSize.width = Math.max(30, component.size.width - deltaX);
          newSize.height = Math.max(20, component.size.height + deltaY);
          newPosition.x = component.position.x + (component.size.width - newSize.width);
          break;
        case 'bottom-right':
          newSize.width = Math.max(30, component.size.width + deltaX);
          newSize.height = Math.max(20, component.size.height + deltaY);
          break;
      }

      // Clamp to device bounds if preview active
      const state = useStore.getState();
      if (state.devicePreview) {
        const devSizes = { phone: { w: 375, h: 812 }, tablet: { w: 768, h: 1024 }, desktop: { w: 1440, h: 900 } };
        const dev = devSizes[state.devicePreview];
        // Clamp position
        newPosition.x = Math.max(0, newPosition.x);
        newPosition.y = Math.max(0, newPosition.y);
        // Clamp size so it doesn't extend past device edge
        newSize.width = Math.min(newSize.width, dev.w - newPosition.x);
        newSize.height = Math.min(newSize.height, dev.h - newPosition.y);
        // Re-enforce minimums
        newSize.width = Math.max(30, newSize.width);
        newSize.height = Math.max(20, newSize.height);
      }

      updateComponent(selectedId, { size: newSize, position: newPosition });
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setCanvasDragging(false);
      setResizeHandle(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, selectedId, resizeHandle, dragStart, zoom, updateComponent, findComponent]);

  // ===== IMAGE FILE UPLOAD =====
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImageRef.current) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl || !pendingImageRef.current) return;

      const { position, size } = pendingImageRef.current;

      // Create image component with data URL as background
      addComponent({
        id: `comp-${Date.now()}`,
        type: 'div' as any,
        content: '',
        position,
        size,
        styles: {
          backgroundImage: `url(${dataUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '4px',
          overflow: 'hidden',
        },
      });

      pendingImageRef.current = null;
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  // ===== RENDER COMPONENT =====
  const renderComponent = (component: ComponentElement) => {
    // Skip hidden components
    if (component.hidden) return null;
    
    const isSelected = selectedIds.includes(component.id);
    const isHovered = hoveredId === component.id;
    const isLocked = !!component.locked;

    // Parse direction data for lines/arrows: "x1,y1,x2,y2" relative to bounding box
    const parseDirection = (content: string) => {
      const parts = content.split(',').map(Number);
      if (parts.length === 4 && parts.every(n => !isNaN(n))) {
        return { x1: parts[0], y1: parts[1], x2: parts[2], y2: parts[3] };
      }
      return { x1: 0, y1: 0, x2: component.size.width, y2: 0 }; // Default horizontal
    };

    // Render SVG line or arrow
    if (component.type === 'line' || component.type === 'arrow') {
      const dir = parseDirection(component.content || '');
      const w = component.size.width;
      const h = Math.max(component.size.height, 4);
      const strokeColor = component.styles.stroke || '#9ca3af';
      const strokeWidth = Number(component.styles.strokeWidth) || 2;

      // Scale direction coords to size
      const sx1 = (dir.x1 / component.size.width) * w;
      const sy1 = (dir.y1 / Math.max(component.size.height, 1)) * h;
      const sx2 = (dir.x2 / component.size.width) * w;
      const sy2 = (dir.y2 / Math.max(component.size.height, 1)) * h;

      return (
        <div
          key={component.id}
          data-component-id={component.id}
          className="absolute select-none"
          style={{
            left: `${component.position.x}px`,
            top: `${component.position.y}px`,
            width: `${w}px`,
            height: `${h}px`,
          }}
          onClick={(e) => handleComponentClick(e, component)}
          onContextMenu={(e) => handleContextMenu(e, component.id)}
          onMouseDown={(e) => !isResizing && handleDragStart(e, component)}
          onMouseEnter={() => setHoveredComponent(component.id)}
          onMouseLeave={() => setHoveredComponent(null)}
        >
          <svg width={w} height={h} style={{ overflow: 'visible' }}>
            <line
              x1={sx1} y1={sy1} x2={sx2} y2={sy2}
              stroke={isSelected ? '#2296FF' : isHovered ? '#2296FF' : strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {component.type === 'arrow' && (
              <polygon
                points={getArrowHead(sx1, sy1, sx2, sy2)}
                fill={isSelected ? '#2296FF' : isHovered ? '#2296FF' : strokeColor}
              />
            )}
          </svg>
          {/* Hit area for easier selection */}
          <div className="absolute inset-0" style={{ cursor: 'move' }} />
          {isSelected && selectedIds.length === 1 && (
            <>
              <div className="absolute w-3 h-3 bg-[#2296FF] border-2 border-white rounded-full -top-1.5 -left-1.5 cursor-pointer"
                onMouseDown={(e) => handleResizeStart(e, component, 'top-left')} />
              <div className="absolute w-3 h-3 bg-[#2296FF] border-2 border-white rounded-full -top-1.5 -right-1.5 cursor-pointer"
                onMouseDown={(e) => handleResizeStart(e, component, 'top-right')} />
              <div className="absolute w-3 h-3 bg-[#2296FF] border-2 border-white rounded-full -bottom-1.5 -left-1.5 cursor-pointer"
                onMouseDown={(e) => handleResizeStart(e, component, 'bottom-left')} />
              <div className="absolute w-3 h-3 bg-[#2296FF] border-2 border-white rounded-full -bottom-1.5 -right-1.5 cursor-pointer"
                onMouseDown={(e) => handleResizeStart(e, component, 'bottom-right')} />
            </>
          )}
        </div>
      );
    }

    const defaultStyles = component.type === 'button' ? {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    } : {};

    const renderContent = () => {
      if (component.type === 'icon' && component.content) {
        return (
          <IconRenderer
            iconName={component.content}
            color={activeTheme === 'light' && themeSwapMap.has((component.styles.color || '').toLowerCase()) ? themeSwapMap.get(component.styles.color.toLowerCase())! : (component.styles.color || '#ffffff')}
            size={Math.min(component.size.width, component.size.height) * 0.6}
          />
        );
      }
      // Inline editing for text/button/input
      if (editingId === component.id && (component.type === 'text' || component.type === 'button' || component.type === 'input')) {
        return (
          <textarea
            autoFocus
            value={component.content || ''}
            onChange={(e) => updateComponent(component.id, { content: e.target.value })}
            onBlur={() => setEditingId(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditingId(null);
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); }
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full h-full bg-transparent outline-none resize-none text-inherit"
            style={{
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
              textAlign: 'inherit' as any,
              padding: 'inherit',
              cursor: 'text',
            }}
          />
        );
      }
      
      // If component has children, render them
      if (component.children && component.children.length > 0) {
        // Enable child interaction if this IS the editing parent OR contains it as a descendant
        const isEditingThis = editingParentId === component.id || (editingParentId !== null && (() => {
          const findInChildren = (children?: ComponentElement[]): boolean => {
            if (!children) return false;
            for (const c of children) {
              if (c.id === editingParentId) return true;
              if (findInChildren(c.children)) return true;
            }
            return false;
          };
          return findInChildren(component.children);
        })());
        const isDirectEditingParent = editingParentId === component.id;
        const isFlexParent = component.styles?.display === 'flex';
        const isRowFlex = isFlexParent && component.styles?.flexDirection !== 'column';
        const showDropIndicators = isDirectEditingParent && isFlexReorder.current && isChildDragging && flexDropIndex !== null;
        
        // Build children array with optional drop indicators
        const childElements: React.ReactNode[] = [];
        
        // Drop indicator element factory
        const makeDropIndicator = (key: string) => (
          <div
            key={key}
            style={{
              width: isRowFlex ? '3px' : '100%',
              height: isRowFlex ? '100%' : '3px',
              minHeight: isRowFlex ? '20px' : undefined,
              minWidth: isRowFlex ? undefined : '20px',
              backgroundColor: '#2296FF',
              borderRadius: '2px',
              flexShrink: 0,
              alignSelf: 'stretch',
              transition: 'opacity 0.15s ease',
              boxShadow: '0 0 8px rgba(34,150,255,0.6)',
            }}
          />
        );
        
        component.children.forEach((child, childIdx) => {
          // Insert drop indicator before this child if needed
          if (showDropIndicators && flexDropIndex === childIdx) {
            childElements.push(makeDropIndicator(`drop-indicator-${childIdx}`));
          }
          
          if (child.hidden) {
            childElements.push(null);
            return;
          }
          const isChildSelected = selectedId === child.id;
          const isChildHovered = hoveredId === child.id;
          const isDraggedChild = isChildDragging && isFlexReorder.current && child.id === selectedId;
          
          // Render child inline editing
          if (editingId === child.id && (child.type === 'text' || child.type === 'button' || child.type === 'input')) {
            childElements.push(
              <div key={child.id} style={{ ...child.styles, position: child.styles?.position || 'relative' }}>
                <textarea
                  autoFocus
                  value={child.content || ''}
                  onChange={(e) => updateComponent(child.id, { content: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setEditingId(null);
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); }
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full bg-transparent outline-none resize-none text-inherit"
                  style={{
                    color: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    lineHeight: 'inherit',
                    textAlign: 'inherit' as any,
                    cursor: 'text',
                    minHeight: '1em',
                  }}
                />
              </div>
            );
            return;
          }

          childElements.push(
            <div
              key={child.id}
              data-child-id={child.id}
              data-bivvy-id={child.id}
              style={{
                ...themeTransformStyle(child.styles, activeTheme === 'light', themeSwapMap),
                // State preview for children (theme-transformed)
                ...(previewState === 'hover' && child.hoverStyles ? themeTransformStyle(child.hoverStyles, activeTheme === 'light', themeSwapMap) : {}),
                ...(previewState === 'active' && child.activeStyles ? themeTransformStyle(child.activeStyles, activeTheme === 'light', themeSwapMap) : {}),
                ...(previewState === 'disabled' && child.disabledStyles ? themeTransformStyle(child.disabledStyles, activeTheme === 'light', themeSwapMap) : {}),
                ...(previewState === 'focused' && child.focusedStyles ? themeTransformStyle(child.focusedStyles, activeTheme === 'light', themeSwapMap) : {}),
                ...(previewState === 'loading' && child.loadingStyles ? themeTransformStyle(child.loadingStyles, activeTheme === 'light', themeSwapMap) : {}),
                position: child.styles?.position || 'relative',
                // Prevent text from spilling outside flex containers
                overflowWrap: 'break-word' as any,
                wordBreak: 'break-word' as any,
                minWidth: 0,
                outline: child.id === editingParentId ? '2px dashed #2296FF' : isEditingThis && isChildSelected ? '2px solid #2296FF' : isEditingThis && isChildHovered ? '1px solid rgba(34,150,255,0.5)' : 'none',
                outlineOffset: '2px',
                borderRadius: child.styles?.borderRadius || (previewState !== 'normal' && child[`${previewState}Styles` as keyof typeof child] as any)?.borderRadius || '2px',
                cursor: isDirectEditingParent ? (isChildResizing ? 'default' : 'move') : isEditingThis ? 'pointer' : containsEditingParent ? 'pointer' : 'default',
                // ── Design Properties (Apple HIG) on children — MUST come after explicit borderRadius/padding ──
                // Control Size (buttons/inputs) — child override > parent
                ...((child.type === 'button' || child.type === 'input') && (child.controlSize || component.controlSize) ? (() => {
                  const size = child.controlSize || component.controlSize;
                  const sizeMap: Record<string, { padding: string; fontSize: string }> = {
                    mini: { padding: '2px 6px', fontSize: '10px' },
                    sm: { padding: '4px 10px', fontSize: '12px' },
                    md: { padding: '8px 16px', fontSize: '14px' },
                    lg: { padding: '12px 24px', fontSize: '16px' },
                    xl: { padding: '16px 32px', fontSize: '18px' },
                  };
                  return sizeMap[size] || {};
                })() : {}),
                // Tint Prominence (buttons only) — child override > parent
                ...(child.type === 'button' && (child.tintProminence || component.tintProminence) ? (() => {
                  const prominence = child.tintProminence || component.tintProminence;
                  const currentBg = child.styles?.backgroundColor || '#2296FF';
                  if (prominence === 'primary') return { backgroundColor: currentBg, color: '#ffffff', fontWeight: '600' };
                  if (prominence === 'secondary') return { backgroundColor: 'transparent', border: `1.5px solid ${currentBg}`, color: currentBg };
                  if (prominence === 'none') return { backgroundColor: 'transparent', border: 'none', color: currentBg, fontWeight: '500' };
                  return {}; // auto
                })() : {}),
                // Capsule mode on children — child override > parent
                ...((child.cornerRadiusMode || component.cornerRadiusMode) === 'capsule' ? { borderRadius: '9999px' } : {}),
                // Concentric mode — child radius = parent radius - parent padding
                ...((child.cornerRadiusMode || component.cornerRadiusMode) === 'concentric' ? (() => {
                  const parentRadius = parseInt(component.styles?.borderRadius || '0') || 0;
                  const parentPadding = parseInt(component.styles?.padding || '0') || 0;
                  const childRadius = Math.max(0, parentRadius - parentPadding);
                  return childRadius > 0 ? { borderRadius: `${childRadius}px` } : {};
                })() : {}),
                // Glass effect on children
                ...((child.glassEffect || component.glassEffect) ? {
                  backdropFilter: 'blur(10px) saturate(1.5)',
                  WebkitBackdropFilter: 'blur(10px) saturate(1.5)',
                  ...(child.type === 'button' || child.type === 'div' ? {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderColor: 'rgba(255,255,255,0.25)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  } : {}),
                } : {}),
                // Scroll Edge Effect on children
                ...(child.scrollEdgeEffect === 'soft' ? {
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                } : {}),
                ...(child.scrollEdgeEffect === 'hard' ? {
                  borderTopWidth: '1px', borderTopColor: 'rgba(255,255,255,0.1)', borderTopStyle: 'solid',
                  borderBottomWidth: '1px', borderBottomColor: 'rgba(255,255,255,0.1)', borderBottomStyle: 'solid',
                } : {}),
                // Force overflow:visible if card has a badge-like child or explicitly requests it
                overflow: (() => {
                  if (isEditingThis && isChildSelected) return 'visible';
                  // Respect explicit overflow:visible set by AI or user
                  if (child.styles?.overflow === 'visible') return 'visible';
                  // Auto-detect: does any grandchild extend beyond this container?
                  if (child.children?.length > 0) {
                    for (const gc of child.children) {
                      const gcs = gc.styles || {};
                      // Negative margin = element extends beyond parent edge
                      if (gcs.marginTop && parseFloat(gcs.marginTop) < 0) return 'visible';
                      if (gcs.marginBottom && parseFloat(gcs.marginBottom) < 0) return 'visible';
                      // Absolute/relative positioned badge at top/bottom edge
                      if (gcs.position === 'absolute' && (gcs.top?.includes('-') || gcs.bottom?.includes('-'))) return 'visible';
                      // Small text element with background (badge pattern)
                      const content = (gc.content || gc.children?.[0]?.content || '').trim();
                      if (content.length > 0 && content.length <= 30 && gcs.backgroundColor && gcs.backgroundColor !== 'transparent') {
                        if (gcs.marginTop || gcs.position === 'absolute' || gcs.alignSelf === 'center' || gcs.textAlign === 'center') {
                          return 'visible';
                        }
                      }
                    }
                  }
                  return child.styles?.overflow || undefined;
                })(),
                ...((previewState === 'disabled' || previewState === 'loading') ? { opacity: ((child as any)[`${previewState}Styles`]?.opacity ?? child.styles?.opacity ?? (previewState === 'disabled' ? 0.5 : 0.7)) } : {}),
                // Dim the dragged child during flex reorder
                ...(isDraggedChild ? { opacity: 0.4, transition: 'opacity 0.15s ease' } : {}),
                transition: isDraggedChild ? 'opacity 0.15s ease' : `outline 0.1s ease, background-color ${child.animation?.hoverTransition || 400}ms ease, color ${child.animation?.hoverTransition || 400}ms ease, border-color ${child.animation?.hoverTransition || 400}ms ease, border-radius 0.3s ease, box-shadow 0.3s ease, transform ${child.animation?.hoverTransition || 400}ms ease`,
              }}
              onClick={isEditingThis ? (e) => handleChildClick(e, child) : undefined}
              onDoubleClick={isEditingThis ? (e) => handleChildDoubleClick(e, child) : undefined}
              onMouseDown={isDirectEditingParent ? (e) => {
                // Check if clicking a deeper descendant — skip drag, let click handler select it
                const t = e.target as HTMLElement;
                const bEl = t.closest('[data-bivvy-id]') as HTMLElement;
                const bId = bEl?.getAttribute('data-bivvy-id');
                if (bId && bId !== child.id) { e.stopPropagation(); return; }
                handleChildDragStart(e, child);
              } : isEditingThis ? (e) => e.stopPropagation() : undefined}
              onContextMenu={isEditingThis ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectComponent(child.id);
                setContextMenu({ x: e.clientX, y: e.clientY, componentId: component.id, childId: child.id });
              } : undefined}
              onMouseEnter={isEditingThis ? () => setHoveredComponent(child.id) : undefined}
              onMouseLeave={isEditingThis ? () => setHoveredComponent(null) : undefined}
            >
              {child.type === 'icon' && child.content ? (
                <IconRenderer
                  iconName={child.content}
                  color={activeTheme === 'light' && themeSwapMap.has((child.styles?.color || '').toLowerCase()) ? themeSwapMap.get(child.styles.color.toLowerCase())! : (child.styles?.color || '#ffffff')}
                  size={parseInt(child.styles?.width || child.styles?.height || child.styles?.fontSize || '0') || 24}
                />
              ) : (
                child.content
              )}
              {/* Render grandchildren */}
              {child.children?.map((grandchild, gcIdx) => {
                let gcStyles = themeTransformStyle(grandchild.styles || {}, activeTheme === 'light', themeSwapMap);
                
                // ─── RENDER-TIME BADGE FIX ───
                // If this is the first grandchild and looks like a badge,
                // force absolute positioning so it doesn't push sibling content down.
                // A "badge" is: first child, short text (≤25 chars), has a background color,
                // and the parent card has 3+ siblings (other content after badge).
                if (gcIdx === 0 && child.children && child.children.length >= 3) {
                  // Get the text content, checking direct content and first child's content
                  const gcContent = (grandchild.content || grandchild.children?.[0]?.content || '').trim().replace(/\n/g, ' ');
                  const hasBg = !!gcStyles.backgroundColor && gcStyles.backgroundColor !== 'transparent';
                  const isShort = gcContent.length > 0 && gcContent.length <= 30;
                  const hasRounding = parseInt(gcStyles.borderRadius || '0') >= 4;
                  const isSmallFont = parseInt(gcStyles.fontSize || '16') <= 15;
                  const hasPadding = !!gcStyles.padding;
                  
                  // Badge detection: short text with background + (rounding or small font or padding)
                  if (isShort && hasBg && (hasRounding || isSmallFont || hasPadding) && gcStyles.position !== 'absolute') {
                    gcStyles = {
                      ...gcStyles,
                      position: 'absolute',
                      top: gcStyles.top || '-14px',
                      left: gcStyles.left || '50%',
                      transform: gcStyles.transform || 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      zIndex: '1',
                    };
                    // Also ensure the parent card has position:relative
                    if (!child.styles?.position || child.styles.position === 'relative') {
                      // Already relative or will be set by the position override below
                    }
                  }
                }
                
                return (
                  <div 
                    key={grandchild.id} 
                    data-bivvy-id={grandchild.id}
                    data-child-id={grandchild.id}
                    style={{
                      ...gcStyles,
                      // ── Design Properties cascade to grandchildren ──
                      ...((grandchild.type === 'button' || grandchild.type === 'input') && (grandchild.controlSize || component.controlSize) ? (() => {
                        const size = grandchild.controlSize || component.controlSize;
                        const sizeMap: Record<string, { padding: string; fontSize: string }> = {
                          mini: { padding: '2px 6px', fontSize: '10px' },
                          sm: { padding: '4px 10px', fontSize: '12px' },
                          md: { padding: '8px 16px', fontSize: '14px' },
                          lg: { padding: '12px 24px', fontSize: '16px' },
                          xl: { padding: '16px 32px', fontSize: '18px' },
                        };
                        return sizeMap[size] || {};
                      })() : {}),
                      ...(grandchild.type === 'button' && (grandchild.tintProminence || component.tintProminence) ? (() => {
                        const prominence = grandchild.tintProminence || component.tintProminence;
                        const currentBg = grandchild.styles?.backgroundColor || '#2296FF';
                        if (prominence === 'primary') return { backgroundColor: currentBg, color: '#ffffff', fontWeight: '600' };
                        if (prominence === 'secondary') return { backgroundColor: 'transparent', border: `1.5px solid ${currentBg}`, color: currentBg };
                        if (prominence === 'none') return { backgroundColor: 'transparent', border: 'none', color: currentBg, fontWeight: '500' };
                        return {};
                      })() : {}),
                      ...((grandchild.cornerRadiusMode || component.cornerRadiusMode) === 'capsule' ? { borderRadius: '9999px' } : {}),
                      ...((grandchild.glassEffect || component.glassEffect) ? {
                        backdropFilter: 'blur(10px) saturate(1.5)',
                        WebkitBackdropFilter: 'blur(10px) saturate(1.5)',
                        ...(grandchild.type === 'button' || grandchild.type === 'div' ? {
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          borderColor: 'rgba(255,255,255,0.25)',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                        } : {}),
                      } : {}),
                      ...(selectedId === grandchild.id ? { outline: '2px solid #2296FF', outlineOffset: '2px' } : 
                          hoveredId === grandchild.id ? { outline: '1px solid rgba(34,150,255,0.5)', outlineOffset: '2px' } : {}),
                      cursor: editingParentId ? 'pointer' : undefined,
                    }}
                    onMouseDown={(e) => { e.stopPropagation(); }}
                    onClick={(e) => { e.stopPropagation(); selectComponent(grandchild.id); }}
                    onMouseEnter={() => setHoveredComponent(grandchild.id)}
                    onMouseLeave={() => setHoveredComponent(null)}
                  >
                    {grandchild.type === 'icon' && grandchild.content ? (
                      <IconRenderer
                        iconName={grandchild.content}
                        color={gcStyles?.color || '#ffffff'}
                        size={parseInt(gcStyles?.width || gcStyles?.height || gcStyles?.fontSize || '0') || 24}
                      />
                    ) : grandchild.content}
                    {/* Render descendants recursively */}
                    {grandchild.children?.map(function renderDescendant(desc: any): React.ReactNode {
                      const dStyles = themeTransformStyle(desc.styles || {}, activeTheme === 'light', themeSwapMap);
                      return (
                        <div key={desc.id} data-bivvy-id={desc.id} data-child-id={desc.id} style={{
                          ...dStyles,
                          ...(selectedId === desc.id ? { outline: '2px solid #2296FF', outlineOffset: '2px' } :
                              hoveredId === desc.id ? { outline: '1px solid rgba(34,150,255,0.5)', outlineOffset: '2px' } : {}),
                          cursor: editingParentId ? 'pointer' : undefined,
                        }}
                        onMouseDown={(e) => { e.stopPropagation(); }}
                        onClick={(e) => { e.stopPropagation(); selectComponent(desc.id); }}
                        onMouseEnter={() => setHoveredComponent(desc.id)}
                        onMouseLeave={() => setHoveredComponent(null)}
                        >
                          {desc.type === 'icon' && desc.content ? (
                            <IconRenderer
                              iconName={desc.content}
                              color={dStyles?.color || '#ffffff'}
                              size={parseInt(dStyles?.width || dStyles?.height || dStyles?.fontSize || '0') || 24}
                            />
                          ) : desc.content}
                          {desc.children?.map(renderDescendant)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {/* Child resize handles */}
              {isDirectEditingParent && isChildSelected && (
                <>
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((handle) => (
                    <div
                      key={handle}
                      className={`
                        absolute w-2.5 h-2.5 bg-[#2296FF] border-[1.5px] border-white rounded-full z-10
                        ${handle.includes('top') ? '-top-1' : '-bottom-1'}
                        ${handle.includes('left') ? '-left-1' : '-right-1'}
                      `}
                      style={{
                        cursor: handle === 'top-left' || handle === 'bottom-right' ? 'nwse-resize' : 'nesw-resize',
                      }}
                      onMouseDown={(e) => handleChildResizeStart(e, child, handle)}
                    />
                  ))}
                </>
              )}
            </div>
          );
        });
        
        // Trailing drop indicator (for dropping at end)
        if (showDropIndicators && flexDropIndex === component.children.length) {
          childElements.push(makeDropIndicator('drop-indicator-end'));
        }
        
        return childElements;
      }
      
      return component.content;
    };

    const isEditingThisParent = editingParentId === component.id;
    // Check if this component contains the editing parent as a descendant
    const containsEditingParent = editingParentId !== null && editingParentId !== component.id && (() => {
      const findInChildren = (children?: ComponentElement[]): boolean => {
        if (!children) return false;
        for (const c of children) {
          if (c.id === editingParentId) return true;
          if (findInChildren(c.children)) return true;
        }
        return false;
      };
      return findInChildren(component.children);
    })();
    const isInsideAnotherParent = editingParentId !== null && editingParentId !== component.id && !containsEditingParent;

    // Build animation class/style if entrance animation is set
    // Skip animation when dimmed (sub-element mode on another parent) — fill-mode: both overrides opacity
    const animClass = !isInsideAnotherParent && component.animation?.entrance && component.animation.entrance !== 'none'
      ? `bivvy-anim-${component.animation.entrance}` : '';
    const animStyle: Record<string, string> = {};
    if (animClass) {
      const dur = component.animation?.duration || 300;
      const delay = component.animation?.delay || 0;
      const ease = component.animation?.easing || 'ease';
      animStyle.animationDuration = `${dur}ms`;
      animStyle.animationDelay = `${delay}ms`;
      animStyle.animationTimingFunction = ease;
    }
    // Hover transition duration from animation config
    const hoverTransMs = component.animation?.hoverTransition ?? 200;

    return (
      <div
        key={component.id}
        data-component-id={component.id}
        data-children-hoverable={isSelected && !isEditingThisParent && !containsEditingParent && component.children && component.children.length > 0 ? 'true' : undefined}
        className={`
          absolute select-none ${animClass}
          ${isSelected && !isEditingThisParent ? 'ring-2 ring-[#2296FF]' : ''}
          ${isEditingThisParent ? '' : ''}
          ${isHovered && !isSelected && !isInsideAnotherParent ? 'ring-2 ring-[#2296FF]/50' : ''}
        `}
        style={{
          left: `${component.position.x}px`,
          top: `${component.position.y}px`,
          // Width sizing mode
          ...(() => {
            const wMode = component.layoutSizing?.widthMode || 'fixed';
            if (wMode === 'hug') return { width: 'fit-content', minWidth: `${component.size.width}px` };
            return { width: `${component.size.width}px` };
          })(),
          // Height sizing mode
          ...(() => {
            const hMode = component.layoutSizing?.heightMode || 'fixed';
            if (hMode === 'hug' || (component.children && component.children.length > 0)) {
              return { minHeight: `${component.size.height}px`, height: 'auto' };
            }
            return { height: `${component.size.height}px` };
          })(),
          ...defaultStyles,
          ...themeTransformStyle(component.styles, activeTheme === 'light', themeSwapMap),
          // State preview: apply state-specific styles (theme-transformed)
          ...(previewState === 'hover' && component.hoverStyles ? themeTransformStyle(component.hoverStyles, activeTheme === 'light', themeSwapMap) : {}),
          ...(previewState === 'active' && component.activeStyles ? themeTransformStyle(component.activeStyles, activeTheme === 'light', themeSwapMap) : {}),
          ...(previewState === 'disabled' && component.disabledStyles ? themeTransformStyle(component.disabledStyles, activeTheme === 'light', themeSwapMap) : {}),
          ...(previewState === 'focused' && component.focusedStyles ? themeTransformStyle(component.focusedStyles, activeTheme === 'light', themeSwapMap) : {}),
          ...(previewState === 'loading' && component.loadingStyles ? themeTransformStyle(component.loadingStyles, activeTheme === 'light', themeSwapMap) : {}),
          // Live hover/active when NOT in forced preview
          ...(previewState === 'normal' && isHovered && !isSelected && component.hoverStyles ? themeTransformStyle(component.hoverStyles, activeTheme === 'light', themeSwapMap) : {}),
          ...(previewState === 'normal' && activeComponentId === component.id && component.activeStyles ? themeTransformStyle(component.activeStyles, activeTheme === 'light', themeSwapMap) : {}),
          // ── Design Properties (Apple HIG) ──
          ...(component.glassEffect ? {
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderColor: 'rgba(255,255,255,0.2)',
            borderWidth: '1px',
            borderStyle: 'solid',
          } : {}),
          ...(component.cornerRadiusMode === 'capsule' ? { borderRadius: '9999px' } : {}),
          ...(component.scrollEdgeEffect === 'soft' ? {
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
          } : {}),
          ...(component.scrollEdgeEffect === 'hard' ? {
            borderTopWidth: '1px', borderTopColor: 'rgba(255,255,255,0.1)', borderTopStyle: 'solid',
            borderBottomWidth: '1px', borderBottomColor: 'rgba(255,255,255,0.1)', borderBottomStyle: 'solid',
          } : {}),
          // Dim non-editing components when in sub-element mode
          opacity: isInsideAnotherParent ? 0.25 : (
            previewState === 'disabled' ? (component.disabledStyles?.opacity ?? 0.5) :
            previewState === 'loading' ? (component.loadingStyles?.opacity ?? 0.7) :
            (previewState === 'hover' && component.hoverStyles?.opacity != null ? component.hoverStyles.opacity :
            previewState === 'active' && component.activeStyles?.opacity != null ? component.activeStyles.opacity :
            previewState === 'focused' && component.focusedStyles?.opacity != null ? component.focusedStyles.opacity :
            previewState === 'normal' && isHovered && !isSelected && component.hoverStyles?.opacity != null ? component.hoverStyles.opacity :
            previewState === 'normal' && activeComponentId === component.id && component.activeStyles?.opacity != null ? component.activeStyles.opacity :
            component.styles.opacity ?? 1)
          ),
          pointerEvents: isInsideAnotherParent ? 'none' : 'auto',
          outline: (isEditingThisParent || containsEditingParent) ? '2px dashed #2296FF' : 'none',
          outlineOffset: '2px',
          // Allow child resize handles to overflow when editing children, or when component has edge badges
          ...((isEditingThisParent || containsEditingParent) ? { overflow: 'visible' } : 
            component.styles.overflow === 'visible' ? { overflow: 'visible' } :
            // Auto-detect badge children extending beyond this component
            (() => {
              if (component.children?.length > 0) {
                for (const ch of component.children) {
                  const chs = ch.styles || {};
                  if (chs.overflow === 'visible') return { overflow: 'visible' };
                  if (chs.marginTop && parseFloat(chs.marginTop) < 0) return { overflow: 'visible' };
                  if (ch.children?.length > 0) {
                    for (const gc of ch.children) {
                      const gcs = gc.styles || {};
                      if (gcs.marginTop && parseFloat(gcs.marginTop) < 0) return { overflow: 'visible' };
                      if (gcs.position === 'absolute' && gcs.top?.includes('-')) return { overflow: 'visible' };
                    }
                  }
                }
              }
              return {};
            })()
          ),
          transition: isDragging || isResizing || isChildDragging || isChildResizing ? 'none' : `opacity 0.15s ease, outline 0.15s ease, box-shadow ${hoverTransMs}ms ease, background-color ${hoverTransMs}ms ease, color ${hoverTransMs}ms ease, border-color ${hoverTransMs}ms ease, border-radius 0.3s ease, transform ${hoverTransMs}ms ease`,
          ...animStyle,
        }}
        onClick={(e) => handleComponentClick(e, component)}
        onDoubleClick={(e) => handleDoubleClick(e, component)}
        onContextMenu={(e) => handleContextMenu(e, component.id)}
        onMouseDown={(e) => {
          setActiveComponentId(component.id);
          // Don't start parent drag when in child editing mode
          if (isEditingThisParent || containsEditingParent) return;
          // Don't start drag if clicking a deep descendant — let click handler select it
          const target = e.target as HTMLElement;
          const bivvyEl = target.closest('[data-bivvy-id]') as HTMLElement;
          if (bivvyEl && bivvyEl.getAttribute('data-bivvy-id') !== component.id) return;
          if (!isResizing && !isLocked && editingId !== component.id) handleDragStart(e, component);
        }}
        onMouseUp={() => setActiveComponentId(null)}
        onMouseEnter={() => !isInsideAnotherParent && setHoveredComponent(component.id)}
        onMouseLeave={() => { setHoveredComponent(null); setActiveComponentId(null); }}
      >
        {renderContent()}

        {/* Sub-element mode indicator */}
        {(isEditingThisParent || containsEditingParent) && (
          <div
            className="absolute -top-8 left-0 flex items-center gap-2 pointer-events-auto z-[60]"
            style={{ fontSize: '10px' }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); exitComponent(); selectComponent(component.id); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2296FF] text-white text-[10px] font-medium hover:bg-[#1a85e6] transition-colors whitespace-nowrap shadow-md"
            >
              ← Exit
              <span className="text-white/60 text-[9px] ml-0.5">Esc</span>
            </button>
          </div>
        )}

        {/* Annotation pin */}
        {showAnnotations && component.annotations && component.annotations.length > 0 && (
          <div
            className="absolute -top-2 -right-2 z-[60] flex items-center justify-center"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => { e.stopPropagation(); selectComponent(component.id); }}
            title={component.annotations.map(a => `${a.resolved ? '[Resolved] ' : ''}${a.text}`).join('\n')}
          >
            <div className="w-5 h-5 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center shadow-md border border-amber-600">
              {component.annotations.filter(a => !a.resolved).length || component.annotations.length}
            </div>
          </div>
        )}

        {/* Child snap guides (rendered inside parent coordinate space) */}
        {(isEditingThisParent || containsEditingParent) && childSnapGuides.length > 0 && childSnapGuides.map((guide, i) => (
          guide.type === 'x' ? (
            <div
              key={`csnap-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${guide.pos}px`,
                top: `${guide.from}px`,
                width: '1px',
                height: `${guide.to - guide.from}px`,
                backgroundColor: '#FF6B6B',
                zIndex: 100,
              }}
            />
          ) : (
            <div
              key={`csnap-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${guide.from}px`,
                top: `${guide.pos}px`,
                width: `${guide.to - guide.from}px`,
                height: '1px',
                backgroundColor: '#FF6B6B',
                zIndex: 100,
              }}
            />
          )
        ))}

        {isSelected && selectedIds.length === 1 && !isEditingThisParent && !containsEditingParent && !isLocked && (
          <>
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((handle) => (
              <div
                key={handle}
                className={`
                  absolute w-3 h-3 bg-[#2296FF] border-2 border-white rounded-full cursor-pointer
                  ${handle.includes('top') ? '-top-1.5' : '-bottom-1.5'}
                  ${handle.includes('left') ? '-left-1.5' : '-right-1.5'}
                `}
                onMouseDown={(e) => handleResizeStart(e, component, handle)}
              />
            ))}
          </>
        )}

        {/* Lock indicator */}
        {isLocked && isSelected && (
          <div className="absolute -top-6 right-0 px-2 py-0.5 bg-gray-700 rounded-t-md text-[10px] text-gray-300 font-medium whitespace-nowrap pointer-events-none">
            🔒 Locked
          </div>
        )}

        {/* AI-generated badge */}
        {component.aiGenerated && isSelected && !isLocked && (
          <div className="absolute -top-6 left-0 flex items-center gap-1 px-2 py-0.5 rounded-t-md text-[10px] font-medium whitespace-nowrap pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(34,150,255,0.9), rgba(139,92,246,0.9))' }}>
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-white">AI</span>
          </div>
        )}
      </div>
    );
  };

  // ===== DRAW PREVIEW =====
  const renderDrawPreview = () => {
    if (!drawPreview || (drawPreview.width + drawPreview.height < 3)) return null;
    const tool = activeTool;

    if (tool === 'line' || tool === 'arrow') {
      const start = drawStartRef.current;
      const end = drawEndRef.current;
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const w = Math.max(Math.abs(end.x - start.x), 4);
      const h = Math.max(Math.abs(end.y - start.y), 4);
      const rx1 = start.x - minX;
      const ry1 = start.y - minY;
      const rx2 = end.x - minX;
      const ry2 = end.y - minY;

      return (
        <svg
          style={{
            position: 'absolute',
            left: `${minX}px`,
            top: `${minY}px`,
            width: `${w}px`,
            height: `${h}px`,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <line x1={rx1} y1={ry1} x2={rx2} y2={ry2}
            stroke="#2296FF" strokeWidth="2" strokeLinecap="round" />
          {tool === 'arrow' && (
            <polygon points={getArrowHead(rx1, ry1, rx2, ry2)} fill="#2296FF" />
          )}
        </svg>
      );
    }

    // Rectangle/circle/other preview
    const base: React.CSSProperties = {
      position: 'absolute',
      left: `${drawPreview.x}px`,
      top: `${drawPreview.y}px`,
      width: `${drawPreview.width}px`,
      height: `${drawPreview.height}px`,
      border: '2px solid #2296FF',
      backgroundColor: 'rgba(34, 150, 255, 0.1)',
      pointerEvents: 'none',
    };
    if (tool === 'circle') base.borderRadius = '50%';
    return <div style={base} />;
  };

  // Helper: compute arrowhead points
  const getArrowHead = (x1: number, y1: number, x2: number, y2: number): string => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 12;
    const p1x = x2 - headLen * Math.cos(angle - Math.PI / 6);
    const p1y = y2 - headLen * Math.sin(angle - Math.PI / 6);
    const p2x = x2 - headLen * Math.cos(angle + Math.PI / 6);
    const p2y = y2 - headLen * Math.sin(angle + Math.PI / 6);
    return `${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`;
  };

  // ===== SCROLLBAR STATE & COMPUTATION =====
  const [scrollbarDrag, setScrollbarDrag] = useState<{ axis: 'x' | 'y'; startMouse: number; startPan: number } | null>(null);
  const SCROLLBAR_THICKNESS = 8;
  const SCROLLBAR_MARGIN = 4;
  const MIN_THUMB = 30;

  // Compute content bounds (bounding box of all components)
  const contentBounds = useMemo(() => {
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of components) {
      minX = Math.min(minX, c.position.x);
      minY = Math.min(minY, c.position.y);
      maxX = Math.max(maxX, c.position.x + c.size.width);
      maxY = Math.max(maxY, c.position.y + c.size.height);
    }
    const pad = 200;
    return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
  }, [components]);

  const scrollbarInfo = useMemo(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return null;
    const viewW = canvasEl.clientWidth;
    const viewH = canvasEl.clientHeight;
    const cMinX = contentBounds.minX * zoom + panOffset.x;
    const cMinY = contentBounds.minY * zoom + panOffset.y;
    const cMaxX = contentBounds.maxX * zoom + panOffset.x;
    const cMaxY = contentBounds.maxY * zoom + panOffset.y;
    const contentW = cMaxX - cMinX;
    const contentH = cMaxY - cMinY;
    const totalMinX = Math.min(0, cMinX);
    const totalMaxX = Math.max(viewW, cMaxX);
    const totalMinY = Math.min(0, cMinY);
    const totalMaxY = Math.max(viewH, cMaxY);
    const totalW = totalMaxX - totalMinX;
    const totalH = totalMaxY - totalMinY;
    const trackW = viewW - SCROLLBAR_MARGIN * 2 - SCROLLBAR_THICKNESS;
    const trackH = viewH - SCROLLBAR_MARGIN * 2 - SCROLLBAR_THICKNESS;
    const thumbW = Math.max(MIN_THUMB, (viewW / totalW) * trackW);
    const thumbH = Math.max(MIN_THUMB, (viewH / totalH) * trackH);
    const scrollRatioX = totalW > viewW ? (0 - totalMinX) / (totalW - viewW) : 0;
    const scrollRatioY = totalH > viewH ? (0 - totalMinY) / (totalH - viewH) : 0;
    const thumbX = scrollRatioX * (trackW - thumbW);
    const thumbY = scrollRatioY * (trackH - thumbH);
    const showH = contentW > viewW * 0.8 || Math.abs(panOffset.x) > 10;
    const showV = contentH > viewH * 0.8 || Math.abs(panOffset.y) > 10;
    return { thumbX, thumbY, thumbW, thumbH, trackW, trackH, showH, showV, totalW, totalH, totalMinX, totalMinY, viewW, viewH };
  }, [components, panOffset, zoom, contentBounds]);

  useEffect(() => {
    if (!scrollbarDrag) return;
    const { axis, startMouse, startPan } = scrollbarDrag;
    const handleMove = (e: MouseEvent) => {
      if (!scrollbarInfo) return;
      const { trackW, trackH, thumbW, thumbH, totalW, totalH, viewW, viewH } = scrollbarInfo;
      if (axis === 'x') {
        const delta = e.clientX - startMouse;
        const ratio = delta / (trackW - thumbW);
        setPanOffset({ x: startPan - ratio * (totalW - viewW), y: panOffset.y });
      } else {
        const delta = e.clientY - startMouse;
        const ratio = delta / (trackH - thumbH);
        setPanOffset({ x: panOffset.x, y: startPan - ratio * (totalH - viewH) });
      }
    };
    const handleUp = () => setScrollbarDrag(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [scrollbarDrag, scrollbarInfo, panOffset, setPanOffset]);

  return (
    <div className="relative h-full w-full bg-[#000000] overflow-hidden">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      {/* Horizontal Ruler */}
      {showRulers && (
        <div className="absolute top-0 left-0 right-0 h-5 bg-[#1a1a1a] border-b border-gray-800 z-20 overflow-hidden pointer-events-none">
          {Array.from({ length: 60 }, (_, i) => {
            const pos = i * 50 * zoom;
            const isMajor = i % 2 === 0;
            return (
              <div key={i} className="absolute top-0" style={{ left: `${pos}px` }}>
                <div className={`border-l ${isMajor ? 'border-gray-500 h-2.5' : 'border-gray-600 h-1.5'}`} style={{ marginTop: isMajor ? '0' : '4px' }} />
                {isMajor && <span className="absolute top-2 left-1 text-[8px] text-gray-500 select-none leading-none">{i * 50}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Vertical Ruler */}
      {showRulers && (
        <div className="absolute top-0 left-0 bottom-0 w-5 bg-[#1a1a1a] border-r border-gray-800 z-20 overflow-hidden pointer-events-none">
          {Array.from({ length: 40 }, (_, i) => {
            const pos = i * 50 * zoom;
            const isMajor = i % 2 === 0;
            return (
              <div key={i} className="absolute left-0" style={{ top: `${pos}px` }}>
                <div className={`border-t ${isMajor ? 'border-gray-500 w-2.5' : 'border-gray-600 w-1.5'}`} style={{ marginLeft: isMajor ? '0' : '4px' }} />
                {isMajor && <span className="absolute left-2 top-1 text-[8px] text-gray-500 select-none leading-none" style={{ writingMode: 'vertical-lr' }}>{i * 50}</span>}
              </div>
            );
          })}
        </div>
      )}
      {/* Canvas Area */}
      <div
        ref={canvasRef}
        data-bivvy-canvas
        className="h-full w-full relative overflow-hidden"
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onContextMenu={(e) => { const target = e.target as HTMLElement; const isCanvasBg = target === e.currentTarget || target.parentElement === e.currentTarget || target.parentElement?.parentElement === e.currentTarget || target.closest('[data-component-id]') === null; if (isCanvasBg) handleContextMenu(e); }}
        style={{
          cursor: isPanning ? 'grabbing' : spaceHeld ? 'grab' : isDragging ? 'grabbing' : (isDrawing || activeTool !== 'select') ? 'crosshair' : 'default',
          backgroundColor: activeTheme === 'light' ? '#f5f5f5' : canvasBg === 'light' ? '#f5f5f5' : '#0a0a0a',
          backgroundImage: showGrid
            ? (activeTheme === 'light' || canvasBg === 'light')
              ? `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`
              : `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panOffset.x % (20 * zoom)}px ${panOffset.y % (20 * zoom)}px`,
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* Pannable inner container */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Zoom layer — scales ALL content uniformly (fonts, padding, borders, etc.) */}
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '10000px',
              height: '10000px',
            }}
          >
          {/* Device preview frame */}
          {devicePreview && (() => {
            const devices = {
              phone: { w: 375, h: 812, label: 'iPhone 14', radius: 40 },
              tablet: { w: 768, h: 1024, label: 'iPad', radius: 20 },
              desktop: { w: 1440, h: 900, label: 'Desktop', radius: 8 },
            };
            const dev = devices[devicePreview];
            return (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: 0,
                  top: 0,
                  width: `${dev.w}px`,
                  height: `${dev.h}px`,
                  border: '2px solid rgba(34, 150, 255, 0.3)',
                  borderRadius: `${dev.radius}px`,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.15)',
                  zIndex: 0,
                }}
              >
                {/* Device label */}
                <div
                  className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#2296FF]/20 text-[#2296FF] text-[10px] font-medium rounded-full whitespace-nowrap border border-[#2296FF]/30"
                >
                  {dev.label} — {dev.w}×{dev.h}
                </div>
              </div>
            );
          })()}

          {/* Components — keyed container forces full cleanup when components clears */}
          <div key={`components-${canvasRenderKey}`}>
            {components.map(renderComponent)}
            
            {/* ═══ AUTO LAYOUT VISUAL OVERLAYS ═══ */}
            {(() => {
              if (!selectedId) return null;
              const sel = components.find(c => c.id === selectedId);
              if (!sel || sel.styles?.display !== 'flex') return null;
              
              const pad = sel.styles?.padding || '0';
              const vals = pad.replace(/px/g, '').trim().split(/\s+/).map(Number).filter((n: number) => !isNaN(n));
              let pt = 0, pr = 0, pb = 0, pl = 0;
              if (vals.length === 1) { pt = pr = pb = pl = vals[0]; }
              else if (vals.length === 2) { pt = pb = vals[0]; pr = pl = vals[1]; }
              else if (vals.length === 3) { pt = vals[0]; pr = pl = vals[1]; pb = vals[2]; }
              else if (vals.length === 4) { pt = vals[0]; pr = vals[1]; pb = vals[2]; pl = vals[3]; }
              
              const hasPadding = pt > 0 || pr > 0 || pb > 0 || pl > 0;
              if (!hasPadding) return null;
              
              const x = sel.position.x;
              const y = sel.position.y;
              const w = sel.size.width;
              const h = sel.size.height;
              const padColor = 'rgba(236, 72, 153, 0.08)'; // pink tint
              const padBorder = 'rgba(236, 72, 153, 0.25)'; // pink border
              
              return (
                <div className="pointer-events-none" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", zIndex: 50 }}>
                  {/* Top padding */}
                  {pt > 0 && (
                    <div style={{
                      position: 'absolute', left: x, top: y, width: w, height: pt,
                      background: padColor, borderBottom: `1px dashed ${padBorder}`,
                    }} />
                  )}
                  {/* Bottom padding */}
                  {pb > 0 && (
                    <div style={{
                      position: 'absolute', left: x, top: y + h - pb, width: w, height: pb,
                      background: padColor, borderTop: `1px dashed ${padBorder}`,
                    }} />
                  )}
                  {/* Left padding */}
                  {pl > 0 && (
                    <div style={{
                      position: 'absolute', left: x, top: y + pt, width: pl, height: h - pt - pb,
                      background: padColor, borderRight: `1px dashed ${padBorder}`,
                    }} />
                  )}
                  {/* Right padding */}
                  {pr > 0 && (
                    <div style={{
                      position: 'absolute', left: x + w - pr, top: y + pt, width: pr, height: h - pt - pb,
                      background: padColor, borderLeft: `1px dashed ${padBorder}`,
                    }} />
                  )}
                  {/* Gap indicators */}
                  {sel.children && sel.children.length > 1 && sel.styles?.gap && (() => {
                    const gapPx = parseInt(sel.styles.gap) || 0;
                    if (gapPx <= 0) return null;
                    const isRow = sel.styles.flexDirection === 'row' || sel.styles.flexDirection === 'row-reverse';
                    const gapColor = 'rgba(99, 102, 241, 0.12)';
                    const gapBorder = 'rgba(99, 102, 241, 0.35)';
                    
                    // Calculate approximate child positions based on flex layout
                    // For now show gap indicators between each pair of children
                    const childCount = sel.children.filter(c => !c.hidden).length;
                    if (childCount < 2) return null;
                    
                    const indicators = [];
                    for (let i = 0; i < childCount - 1; i++) {
                      if (isRow) {
                        // Approximate: evenly distribute gaps
                        const contentW = w - pl - pr - gapPx * (childCount - 1);
                        const childW = contentW / childCount;
                        const gapX = x + pl + childW * (i + 1) + gapPx * i;
                        indicators.push(
                          <div key={`gap-${i}`} style={{
                            position: 'absolute', left: gapX, top: y + pt,
                            width: gapPx, height: h - pt - pb,
                            background: gapColor,
                            borderLeft: `1px dashed ${gapBorder}`,
                            borderRight: `1px dashed ${gapBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: 8, color: 'rgba(99,102,241,0.7)', fontWeight: 600 }}>{gapPx}</span>
                          </div>
                        );
                      } else {
                        const contentH = h - pt - pb - gapPx * (childCount - 1);
                        const childH = contentH / childCount;
                        const gapY = y + pt + childH * (i + 1) + gapPx * i;
                        indicators.push(
                          <div key={`gap-${i}`} style={{
                            position: 'absolute', left: x + pl, top: gapY,
                            width: w - pl - pr, height: gapPx,
                            background: gapColor,
                            borderTop: `1px dashed ${gapBorder}`,
                            borderBottom: `1px dashed ${gapBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {gapPx >= 8 && <span style={{ fontSize: 8, color: 'rgba(99,102,241,0.7)', fontWeight: 600 }}>{gapPx}</span>}
                          </div>
                        );
                      }
                    }
                    return indicators;
                  })()}
                </div>
              );
            })()}
          </div>

          {/* ── Canvas Variation Cards ── */}
          {canvasVariations && (() => {
            const target = canvasVariations.sourceComponents[0];
            if (!target?.position || !target?.size) return null;
            
            const tw = target.size.width;
            const th = target.size.height;
            
            // Card width: enough for footer buttons (~200px min), proportional to component, max 320
            const CARD_W = Math.min(320, Math.max(200, tw + 80));
            // Preview at 1:1 if it fits, scale down if component is wider than card
            const previewScale = Math.min((CARD_W - 24) / tw, 1.0);
            const previewW = tw * previewScale;
            const previewH = th * previewScale;
            // Preview area has some padding around the rendered component
            const previewAreaH = Math.max(60, previewH + 24);
            
            const GAP_X = 28;
            const GAP_Y = 36;
            const FOOTER_H = 140; // approximate footer height (includes V badge row)
            const startX = target.position.x + tw + 100;
            const startY = target.position.y;
            const varCount = canvasVariations.variations.length;
            const cols = varCount > 2 ? 2 : varCount;
            
            return (
              <>
                {/* Header with generation navigation */}
                {/* Header with iteration timeline */}
                <div className="absolute pointer-events-auto z-[55]" style={{ left: startX, top: startY - 60 }}>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#2296FF]" />
                        <span className="text-[13px] font-semibold text-gray-200">{varCount} Variation{varCount !== 1 ? 's' : ''}</span>
                      </div>
                    
                    {/* Iteration timeline with clickable dots */}
                    {(() => {
                      const targetKey = canvasVariations.targetIds.join(',');
                      const historyArr = variationHistory[targetKey] || [];
                      const totalGens = historyArr.length;
                      if (totalGens <= 1) return null;
                      
                      const currentGen = variationHistoryIndex + 1;
                      return (
                        <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/50 rounded-lg px-2 py-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigateVariationHistory('prev'); }}
                            disabled={variationHistoryIndex <= 0}
                            className={`p-0.5 rounded transition-colors ${variationHistoryIndex <= 0 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-1">
                            {historyArr.map((_: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToVariationIndex(idx);
                                }}
                                className={`rounded-full transition-all ${
                                  idx === variationHistoryIndex 
                                    ? 'w-5 h-2.5 bg-[#2296FF]' 
                                    : 'w-2.5 h-2.5 bg-gray-600 hover:bg-gray-400'
                                }`}
                                title={`Generation ${idx + 1}${historyArr[idx]?.prompt ? ': "' + historyArr[idx].prompt.substring(0, 30) + '"' : ''}`}
                              />
                            ))}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigateVariationHistory('next'); }}
                            disabled={variationHistoryIndex >= totalGens - 1}
                            className={`p-0.5 rounded transition-colors ${variationHistoryIndex >= totalGens - 1 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] text-gray-400 font-medium ml-0.5">
                            Gen {currentGen}<span className="text-gray-600">/{totalGens}</span>
                          </span>
                        </div>
                      );
                    })()}
                    
                    {canvasVariations.prompt && (
                      <span className="text-[11px] text-gray-500 max-w-[200px] truncate">"{canvasVariations.prompt}"</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); clearCanvasVariations(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/90 border border-gray-700/60 text-[11px] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                    >
                      <XIcon className="w-3.5 h-3.5" /> Dismiss
                    </button>
                    </div>
                  </div>
                </div>
                
                {/* Connection line */}
                <svg className="absolute pointer-events-none z-[54]" style={{ left: target.position.x + tw, top: startY + th / 2 - 1, width: 100, height: 2 }}>
                  <line x1="0" y1="1" x2="100" y2="1" stroke="#2296FF" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
                </svg>
                
                {/* Original vs Variations comparison strip */}
                <div className="absolute pointer-events-auto z-[55]" style={{ 
                  left: startX, 
                  top: startY - 28,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-500">Original</span>
                  <div className="w-1 h-1 rounded-full bg-gray-600" />
                  {canvasVariations.variations.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={(e) => { e.stopPropagation(); livePreviewCanvasVariation(canvasVariations.livePreviewId === v.id ? null : v.id); }}
                      className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded transition-all ${
                        canvasVariations.livePreviewId === v.id 
                          ? 'text-[#2296FF] bg-[#2296FF]/15' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      V{i + 1}
                    </button>
                  ))}
                </div>

                {/* Cards */}
                {canvasVariations.variations.map((variation, idx) => {
                  const col = idx % cols;
                  const row = Math.floor(idx / cols);
                  const cardX = startX + col * (CARD_W + GAP_X);
                  const cardY = startY + row * (previewAreaH + FOOTER_H + GAP_Y);
                  const isPreviewing = canvasVariations.livePreviewId === variation.id;
                  
                  return (
                    <div key={variation.id} className="absolute pointer-events-auto z-[55]" style={{ left: cardX, top: cardY, width: CARD_W }}>
                      <div className={`rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        isPreviewing ? 'border-[#2296FF] shadow-xl shadow-[#2296FF]/20 ring-1 ring-[#2296FF]/30'
                        : variation.isFavorited ? 'border-amber-500/40 shadow-lg shadow-amber-500/10'
                        : 'border-gray-700/50 shadow-xl shadow-black/40 hover:border-gray-600/60'
                      }`}>
                        {/* Preview — faithfully renders component at ~1:1 */}
                        <div
                          className="relative bg-[#0a0a15] cursor-pointer flex items-center justify-center"
                          style={{ width: CARD_W, height: previewAreaH, overflow: 'hidden' }}
                          onClick={(e) => { e.stopPropagation(); livePreviewCanvasVariation(isPreviewing ? null : variation.id); }}
                        >
                          {isPreviewing && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2296FF] text-white text-[9px] font-semibold shadow-md">
                              <Eye className="w-3 h-3" /> Previewing
                            </div>
                          )}
                          {/* Detect if any variation component has edge badges that need overflow room */}
                          {(() => {
                            // Check if any component has children with negative margins or absolute negative top
                            const hasBadge = variation.components.some(comp =>
                              comp.children?.some((ch: any) =>
                                ch.children?.some((gc: any) => {
                                  const gcs = gc.styles || {};
                                  return (gcs.position === 'absolute' && gcs.top && parseFloat(gcs.top) < 0) ||
                                         (gcs.marginTop && parseFloat(gcs.marginTop) < 0);
                                })
                              )
                            );
                            const badgePad = hasBadge ? 16 : 0;
                            return (
                          <div style={{
                            width: tw, height: th,
                            transform: previewScale < 1 ? `scale(${previewScale})` : undefined,
                            transformOrigin: 'center center',
                            overflow: 'visible', flexShrink: 0,
                            paddingTop: badgePad,
                            borderRadius: variation.components[0]?.styles?.borderRadius || '0',
                          }}>
                            {variation.components.map((comp) => {
                              const s = { ...(comp.styles || {}) };
                              // Apply same defaults as canvas renderer
                              const typeDefaults: Record<string, any> = {};
                              if (comp.type === 'button') {
                                typeDefaults.display = 'flex';
                                typeDefaults.alignItems = 'center';
                                typeDefaults.justifyContent = 'center';
                              }
                              // Detect if this component has edge-badge grandchildren
                              const hasEdgeBadge = comp.children?.some((child: any) =>
                                child.children?.some((gc: any) => {
                                  const gcs = gc.styles || {};
                                  return (gcs.position === 'absolute' && gcs.top && parseFloat(gcs.top) < 0) ||
                                         (gcs.marginTop && parseFloat(gcs.marginTop) < 0);
                                })
                              );
                              return (
                                <div key={comp.id} style={{
                                  width: '100%', height: '100%',
                                  ...typeDefaults,
                                  ...s,
                                  position: 'relative',
                                  overflow: hasEdgeBadge ? 'visible' : (s.overflow || undefined),
                                }}>
                                  {comp.children?.map((child: any) => {
                                    if (child.hidden) return null;
                                    const cs = { ...(child.styles || {}) };
                                    // Detect if THIS child container has edge-badge grandchildren  
                                    const childHasEdgeBadge = child.children?.some((gc: any) => {
                                      const gcs = gc.styles || {};
                                      return (gcs.position === 'absolute' && gcs.top && parseFloat(gcs.top) < 0) ||
                                             (gcs.marginTop && parseFloat(gcs.marginTop) < 0);
                                    });
                                    return (
                                      <div key={child.id} style={{
                                        ...cs,
                                        position: cs.position || 'relative',
                                        overflow: childHasEdgeBadge ? 'visible' : (cs.overflow || undefined),
                                        overflowWrap: 'break-word' as any, wordBreak: 'break-word' as any, minWidth: 0,
                                      }}>
                                        {child.type === 'icon' && child.content
                                          ? <IconRenderer iconName={child.content} color={cs.color || '#fff'} size={parseInt(cs.width || cs.height || cs.fontSize || '0') || 24} />
                                          : child.content}
                                        {child.children?.map((gc: any) => (
                                          <div key={gc.id} style={gc.styles || {}}>
                                            {gc.type === 'icon' && gc.content
                                              ? <IconRenderer iconName={gc.content} color={gc.styles?.color || '#fff'} size={parseInt(gc.styles?.width || gc.styles?.fontSize || '0') || 16} />
                                              : gc.content}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })}
                                  {!comp.children?.length && comp.content && <span>{comp.content}</span>}
                                </div>
                              );
                            })}
                          </div>
                            );
                          })()}
                        </div>
                        
                        {/* Footer */}
                        <div className="bg-[#111122] px-3.5 py-3 border-t border-gray-800/40">
                          {/* Variation badge */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#2296FF]/70 bg-[#2296FF]/10 px-1.5 py-0.5 rounded">V{idx + 1}</span>
                            {variation.isFavorited && <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-400/70 bg-amber-400/10 px-1.5 py-0.5 rounded">Saved</span>}
                          </div>
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <span className="text-[13px] font-semibold text-gray-100">{variation.name}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); favoriteCanvasVariation(variation.id); }}
                              className={`p-1 rounded-lg transition-all flex-shrink-0 ${variation.isFavorited ? 'text-amber-400 bg-amber-400/10' : 'text-gray-600 hover:text-amber-400 hover:bg-amber-400/5'}`}
                            >
                              <Heart className="w-4 h-4" fill={variation.isFavorited ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          {variation.description && <p className="text-[11px] text-gray-400 mb-2.5 leading-relaxed">{variation.description}</p>}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); livePreviewCanvasVariation(isPreviewing ? null : variation.id); }}
                              className={`flex items-center gap-1 text-[11px] font-medium py-1.5 px-2.5 rounded-lg transition-all border ${
                                isPreviewing ? 'bg-[#2296FF]/15 border-[#2296FF]/40 text-[#2296FF]' : 'bg-gray-800/60 border-gray-700/40 text-gray-400 hover:text-gray-200'
                              }`}
                            >
                              {isPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              {isPreviewing ? 'Exit' : 'Preview'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); applyCanvasVariation(variation.id); }}
                              className="flex-1 flex items-center justify-center gap-1 bg-[#2296FF] hover:bg-[#1a85e6] text-white text-[11px] font-semibold py-1.5 rounded-lg transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Apply
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const targetId = canvasVariations.targetIds[0];
                                // Apply variation, then signal AIVariationGenerator to auto-open
                                applyCanvasVariation(variation.id);
                                useStore.setState({ pendingIterateTarget: targetId });
                              }}
                              className="flex items-center gap-1 bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 text-[11px] font-medium py-1.5 px-2.5 rounded-lg transition-colors border border-gray-700/40"
                              title="Iterate on this variation"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })()}

          {/* Snap Guides */}
          {snapGuides.map((guide, i) => (
            guide.type === 'x' ? (
              <div
                key={`snap-${i}`}
                className="absolute pointer-events-none z-50"
                style={{
                  left: `${guide.pos}px`,
                  top: `${guide.from}px`,
                  width: '1px',
                  height: `${guide.to - guide.from}px`,
                  backgroundColor: '#FF6B6B',
                }}
              />
            ) : (
              <div
                key={`snap-${i}`}
                className="absolute pointer-events-none z-50"
                style={{
                  left: `${guide.from}px`,
                  top: `${guide.pos}px`,
                  width: `${guide.to - guide.from}px`,
                  height: '1px',
                  backgroundColor: '#FF6B6B',
                }}
              />
            )
          ))}
          {/* Draw Preview (inside zoom layer for proper scaling) */}
          {renderDrawPreview()}
          </div>
        </div>

        {/* Selection Box (screen space - outside zoom layer) */}
        {selectionBox && (
          <div
            className="absolute border-2 border-[#2296FF] bg-[#2296FF]/10 pointer-events-none"
            style={{
              left: `${selectionBox.x}px`,
              top: `${selectionBox.y}px`,
              width: `${selectionBox.width}px`,
              height: `${selectionBox.height}px`,
            }}
          />
        )}
      </div>

      {/* ===== CONTEXT MENU ===== */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }} />
          <div
            className="fixed z-[80] bg-[#1a1a1a]/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/60 py-1.5 min-w-[200px] animate-menu-in"
            ref={(el) => {
              if (el) {
                const rect = el.getBoundingClientRect();
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                let x = contextMenu.x;
                let y = contextMenu.y;
                if (x + rect.width > vw - 8) x = vw - rect.width - 8;
                if (y + rect.height > vh - 8) y = vh - rect.height - 8;
                if (x < 8) x = 8;
                if (y < 8) y = 8;
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
              }
            }}
          >
            {/* ── Child element context menu ── */}
            {contextMenu.childId && contextMenu.componentId && (() => {
              const parent = findComponent(contextMenu.componentId!);
              const child = parent?.children?.find(c => c.id === contextMenu.childId);
              if (!child) return null;
              const typeLabels: Record<string, string> = { div: 'Container', text: 'Text', button: 'Button', input: 'Input', icon: 'Icon' };
              const childLabel = typeLabels[child.type] || child.type;
              return (
                <>
                  <div className="px-3 py-1.5 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                    {childLabel}{child.content ? `: ${child.content.substring(0, 16)}${child.content.length > 16 ? '...' : ''}` : ''}
                  </div>
                  <div className="h-px bg-gray-700 my-1" />
                  {(child.type === 'text' || child.type === 'button' || child.type === 'input') && (
                    <button
                      onClick={() => { useStore.getState().pushHistory(); setEditingId(child.id); setContextMenu(null); }}
                      className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <span>Edit Text</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const note = window.prompt('Add a note:');
                      if (note?.trim()) {
                        useStore.getState().addAnnotation(child.id, note.trim());
                        useStore.getState().addToast('Note added', 'success');
                      }
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <span>Add Note</span>
                  </button>
                  <div className="h-px bg-gray-700 my-1" />
                  <button
                    onClick={() => {
                      selectComponent(contextMenu.componentId!);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <span>Select Parent</span>
                    <span className="ml-auto text-xs text-gray-500">Esc</span>
                  </button>
                  <button
                    onClick={() => {
                      // Remove child from parent
                      const state = useStore.getState();
                      const parentComp = findComponent(contextMenu.componentId!);
                      if (parentComp?.children) {
                        state.pushHistory();
                        const newChildren = parentComp.children.filter(c => c.id !== child.id);
                        state.updateComponent(contextMenu.componentId!, { children: newChildren });
                        selectComponent(contextMenu.componentId!);
                        state.addToast('Child element removed', 'info');
                      }
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                  >
                    <span>Remove</span>
                    <span className="ml-auto text-xs text-gray-500">⌫</span>
                  </button>
                </>
              );
            })()}
            {/* ── Parent component context menu ── */}
            {contextMenu.componentId && !contextMenu.childId && (
              <>
                <button
                  onClick={() => { if (selectedId) duplicateComponent(selectedId); setContextMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Duplicate</span>
                  <span className="ml-auto text-[10px] text-gray-500">⌘D</span>
                </button>
                <button
                  onClick={() => { copySelected(); setContextMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <Clipboard className="w-3.5 h-3.5 text-gray-500" />
                  <span>Copy</span>
                  <span className="ml-auto text-[10px] text-gray-500">⌘C</span>
                </button>
                <button
                  onClick={() => { cutSelected(); setContextMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <Scissors className="w-3.5 h-3.5 text-gray-500" />
                  <span>Cut</span>
                  <span className="ml-auto text-[10px] text-gray-500">⌘X</span>
                </button>
                <div className="h-px bg-gray-700/50 my-1 mx-2" />
                <button
                  onClick={() => {
                    const state = useStore.getState();
                    const idx = state.components.findIndex(c => c.id === contextMenu.componentId);
                    if (idx >= 0) state.reorderComponent(idx, state.components.length - 1);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <ArrowUpToLine className="w-3.5 h-3.5 text-gray-500" />
                  <span>Bring to Front</span>
                  <span className="ml-auto text-[10px] text-gray-500">⇧⌘↑</span>
                </button>
                <button
                  onClick={() => {
                    const state = useStore.getState();
                    const idx = state.components.findIndex(c => c.id === contextMenu.componentId);
                    if (idx >= 0 && idx < state.components.length - 1) state.reorderComponent(idx, idx + 1);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                  <span>Bring Forward</span>
                  <span className="ml-auto text-[10px] text-gray-500">⌘↑</span>
                </button>
                <button
                  onClick={() => {
                    const state = useStore.getState();
                    const idx = state.components.findIndex(c => c.id === contextMenu.componentId);
                    if (idx > 0) state.reorderComponent(idx, idx - 1);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                  <span>Send Backward</span>
                  <span className="ml-auto text-[10px] text-gray-500">⌘↓</span>
                </button>
                <button
                  onClick={() => {
                    const state = useStore.getState();
                    const idx = state.components.findIndex(c => c.id === contextMenu.componentId);
                    if (idx >= 0) state.reorderComponent(idx, 0);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-gray-500" />
                  <span>Send to Back</span>
                  <span className="ml-auto text-[10px] text-gray-500">⇧⌘↓</span>
                </button>
                <div className="h-px bg-gray-700/50 my-1 mx-2" />
                <button
                  onClick={() => {
                    useStore.getState().toggleComponentLock(contextMenu.componentId!);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  {(() => { const c = findComponent(contextMenu.componentId!); return c?.locked ? <Unlock className="w-3.5 h-3.5 text-gray-500" /> : <Lock className="w-3.5 h-3.5 text-gray-500" />; })()}
                  <span>{(() => { const c = findComponent(contextMenu.componentId!); return c?.locked ? 'Unlock' : 'Lock'; })()}</span>
                </button>
                <button
                  onClick={() => {
                    const state = useStore.getState();
                    if (!state.inspectMode) state.toggleInspectMode();
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                  <span>Inspect</span>
                  <span className="ml-auto text-[10px] text-gray-500">I</span>
                </button>
                <button
                  onClick={() => {
                    const comp = findComponent(contextMenu.componentId!);
                    if (comp) {
                      const name = comp.content
                        ? `${comp.type}: ${comp.content.substring(0, 20)}`
                        : comp.type;
                      useStore.getState().saveAsTemplate(contextMenu.componentId!, name);
                      useStore.getState().addToast('Saved as template', 'success');
                    }
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-gray-500" />
                  <span>Save as Template</span>
                </button>
                {/* Group/Ungroup */}
                {selectedIds.length >= 2 && (
                  <button
                    onClick={() => {
                      useStore.getState().groupSelected();
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                    style={{ width: 'calc(100% - 4px)' }}
                  >
                    <Group className="w-3.5 h-3.5 text-gray-500" />
                    <span>Group</span>
                    <span className="ml-auto text-[10px] text-gray-500">⌘G</span>
                  </button>
                )}
                {(() => {
                  const comp = findComponent(contextMenu.componentId!);
                  return comp?.children && comp.children.length > 0 ? (
                    <button
                      onClick={() => {
                        useStore.getState().ungroupComponent(contextMenu.componentId!);
                        setContextMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                      style={{ width: 'calc(100% - 4px)' }}
                    >
                      <Ungroup className="w-3.5 h-3.5 text-gray-500" />
                      <span>Ungroup</span>
                      <span className="ml-auto text-[10px] text-gray-500">⇧⌘G</span>
                    </button>
                  ) : null;
                })()}
                <div className="h-px bg-gray-700/50 my-1 mx-2" />
                <button
                  onClick={() => {
                    const note = window.prompt('Add a note:');
                    if (note?.trim()) {
                      useStore.getState().addAnnotation(contextMenu.componentId!, note.trim());
                      useStore.getState().addToast('Note added', 'success');
                    }
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <StickyNote className="w-3.5 h-3.5 text-gray-500" />
                  <span>Add Note</span>
                </button>
                <div className="h-px bg-gray-700/50 my-1 mx-2" />
                <button
                  onClick={() => { deleteSelected(); setContextMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                  <span className="ml-auto text-[10px] text-gray-500">⌫</span>
                </button>
              </>
            )}
            {!contextMenu.componentId && (
              <>
                <button
                  onClick={() => { pasteClipboard(); setContextMenu(null); }}
                  disabled={useStore.getState().clipboard.length === 0}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-gray-500" />
                  <span>Paste</span>
                  <span className="ml-auto text-[10px] text-gray-500">⌘V</span>
                </button>
                <button
                  onClick={() => { selectAll(); setContextMenu(null); }}
                  disabled={components.length === 0}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <MousePointer2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>Select All</span>
                  <span className="ml-auto text-[10px] text-gray-500">⌘A</span>
                </button>
                <div className="h-px bg-gray-700/50 my-1 mx-2" />
                <button
                  onClick={() => { useStore.getState().clearCanvas(); setContextMenu(null); }}
                  disabled={components.length === 0}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Canvas</span>
                </button>
                <div className="h-px bg-gray-700/50 my-1 mx-2" />
                <button
                  onClick={() => {
                    setContextMenu(null);
                    useStore.setState({ showAICreate: true });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#2296FF] hover:bg-[#2296FF]/10 hover:text-[#58b0ff] transition-colors rounded-md mx-0.5"
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create with AI</span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ===== SCROLLBARS ===== */}
      {scrollbarInfo?.showH && (
        <div
          className="absolute z-[60]"
          style={{
            bottom: SCROLLBAR_MARGIN,
            left: SCROLLBAR_MARGIN,
            width: scrollbarInfo.trackW,
            height: SCROLLBAR_THICKNESS,
            borderRadius: SCROLLBAR_THICKNESS / 2,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            // Click on track = jump to position
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / scrollbarInfo.trackW;
            const newPanX = -(clickRatio * (scrollbarInfo.totalW - scrollbarInfo.viewW) + scrollbarInfo.totalMinX);
            setPanOffset({ x: newPanX, y: panOffset.y });
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: scrollbarInfo.thumbX,
              top: 0,
              width: scrollbarInfo.thumbW,
              height: SCROLLBAR_THICKNESS,
              borderRadius: SCROLLBAR_THICKNESS / 2,
              backgroundColor: scrollbarDrag?.axis === 'x' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: scrollbarDrag ? 'none' : 'background-color 0.15s',
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setScrollbarDrag({ axis: 'x', startMouse: e.clientX, startPan: panOffset.x });
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.4)'; }}
            onMouseLeave={(e) => { if (!scrollbarDrag) (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
          />
        </div>
      )}
      {scrollbarInfo?.showV && (
        <div
          className="absolute z-[60]"
          style={{
            right: SCROLLBAR_MARGIN,
            top: SCROLLBAR_MARGIN,
            width: SCROLLBAR_THICKNESS,
            height: scrollbarInfo.trackH,
            borderRadius: SCROLLBAR_THICKNESS / 2,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientY - rect.top) / scrollbarInfo.trackH;
            const newPanY = -(clickRatio * (scrollbarInfo.totalH - scrollbarInfo.viewH) + scrollbarInfo.totalMinY);
            setPanOffset({ x: panOffset.x, y: newPanY });
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: scrollbarInfo.thumbY,
              left: 0,
              width: SCROLLBAR_THICKNESS,
              height: scrollbarInfo.thumbH,
              borderRadius: SCROLLBAR_THICKNESS / 2,
              backgroundColor: scrollbarDrag?.axis === 'y' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: scrollbarDrag ? 'none' : 'background-color 0.15s',
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setScrollbarDrag({ axis: 'y', startMouse: e.clientY, startPan: panOffset.y });
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.4)'; }}
            onMouseLeave={(e) => { if (!scrollbarDrag) (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
          />
        </div>
      )}


    </div>
  );
}
