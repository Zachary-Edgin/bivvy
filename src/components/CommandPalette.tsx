'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/componentStore';
import { apiUrl } from '@/utils/apiBase';
import {
  Search, Wand2, Sparkles, Palette, Type, Square, Circle, Image as ImageIcon,
  Undo2, Redo2, Trash2, Copy, Layers, Moon, Sun, Smartphone, Grid3X3,
  Crosshair, Eye, Download, BookOpen, Zap, ArrowRight, Command,
  Package, RefreshCw, Link2, Unlink
} from 'lucide-react';

interface PaletteAction {
  id: string;
  label: string;
  description?: string;
  icon: any;
  category: 'ai' | 'create' | 'edit' | 'canvas' | 'design' | 'symbols';
  keywords: string[];
  action: () => void | Promise<void>;
  shortcut?: string;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'commands' | 'ai'>('commands');
  const [aiLoading, setAiLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    selectedId, selectedIds, components,
    addComponent, deleteSelected, duplicateComponent,
    undo, redo, canUndo, canRedo,
    setActiveTool, toggleGrid, toggleSnapToGrid,
    toggleInspectMode, toggleResponsivePreview,
    swapComponentTheme, activeTheme,
    showGrid, snapToGrid,
    addToast,
    designSystem, updateDesignSystem,
    findComponent, updateComponent, replaceComponent,
    pushHistory,
  } = useStore();

  // AI quick-action: send a one-liner to the AI update endpoint
  const sendAIQuickAction = useCallback(async (prompt: string) => {
    if (!selectedId) {
      addToast('Select a component first', 'error');
      return;
    }
    setAiLoading(true);
    try {
      const state = useStore.getState();
      const response = await fetch(apiUrl('/api/ai-update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          components: state.components,
          selectedId: state.selectedId,
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
      
      // Handle fonts
      if (data.fonts?.length) {
        for (const font of data.fonts) {
          const link = document.createElement('link');
          link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
      }
      
      if (data.action === 'update' && data.componentId && data.updates) {
        // Single component update: { componentId, updates: { styles: {...} } }
        const { pushHistory } = useStore.getState();
        pushHistory();
        updateComponent(data.componentId, data.updates);
        addToast(data.message || 'AI update applied', 'success');
      } else if ((data.action === 'multi_update' || data.action === 'restyle_all') && data.items) {
        // Multiple updates: { items: [{ componentId, updates }] }
        const { pushHistory } = useStore.getState();
        pushHistory();
        for (const item of data.items) {
          if (item.componentId && item.updates) {
            updateComponent(item.componentId, item.updates);
          }
        }
        addToast(data.message || `Updated ${data.items.length} elements`, 'success');
      } else if (data.action === 'add_child' && data.parentId && data.child) {
        const { addChildToComponent } = useStore.getState();
        addChildToComponent(data.parentId, data.child);
        addToast(data.message || 'Child added', 'success');
      } else if (data.action === 'reparent' && data.componentId && data.parentId) {
        const { reparentComponent } = useStore.getState();
        reparentComponent(data.componentId, data.parentId);
        addToast(data.message || 'Moved into parent', 'success');
      } else if (data.action === 'create' && data.component) {
        addComponent(data.component);
        addToast(data.message || 'Component created', 'success');
      } else if (data.action === 'create_page' && data.components) {
        const { batchAddComponents } = useStore.getState();
        batchAddComponents(data.components);
        addToast(data.message || `Created ${data.components.length} components`, 'success');
      } else if (data.action === 'delete' && data.componentId) {
        const { deleteComponent } = useStore.getState();
        deleteComponent(data.componentId);
        addToast(data.message || 'Deleted', 'success');
      } else if (data.action === 'resize' && data.componentId && data.size) {
        const { pushHistory } = useStore.getState();
        pushHistory();
        updateComponent(data.componentId, { size: data.size });
        addToast(data.message || 'Resized', 'success');
      } else if (data.action === 'duplicate' && data.componentId) {
        const { duplicateComponent: dupComp } = useStore.getState();
        dupComp(data.componentId);
        addToast(data.message || 'Duplicated', 'success');
      } else if (data.action === 'describe' || data.action === 'info') {
        addToast(data.message || 'Done', 'info');
      } else {
        addToast(data.message || 'Done', 'info');
      }
    } catch (err: any) {
      addToast(`AI error: ${err.message?.substring(0, 80)}`, 'error');
    } finally {
      setAiLoading(false);
      onClose();
    }
  }, [selectedId, addToast, pushHistory, updateComponent, addComponent, onClose]);

  // Build static actions list
  const actions: PaletteAction[] = [
    // ── AI Quick Actions ──
    { id: 'ai-darker', label: 'Make it darker', icon: Wand2, category: 'ai', keywords: ['dark', 'shade', 'dim'], action: () => sendAIQuickAction('Make this component darker — darken background, adjust text for contrast') },
    { id: 'ai-lighter', label: 'Make it lighter', icon: Wand2, category: 'ai', keywords: ['light', 'bright', 'white'], action: () => sendAIQuickAction('Make this component lighter — lighten background, adjust text for contrast') },
    { id: 'ai-shadow', label: 'Add shadow', icon: Wand2, category: 'ai', keywords: ['shadow', 'elevation', 'depth'], action: () => sendAIQuickAction('Add a subtle, professional box-shadow to this component') },
    { id: 'ai-round', label: 'Round corners', icon: Wand2, category: 'ai', keywords: ['round', 'radius', 'corner', 'pill'], action: () => sendAIQuickAction('Increase the border-radius to make corners more rounded') },
    { id: 'ai-bigger', label: 'Make it bigger', icon: Wand2, category: 'ai', keywords: ['bigger', 'larger', 'scale', 'grow'], action: () => sendAIQuickAction('Increase the size of this component — make it about 30% larger, scale fonts proportionally') },
    { id: 'ai-smaller', label: 'Make it smaller', icon: Wand2, category: 'ai', keywords: ['smaller', 'shrink', 'compact', 'mini'], action: () => sendAIQuickAction('Make this component smaller/more compact — reduce size by about 30%, scale fonts proportionally') },
    { id: 'ai-bold', label: 'Make text bolder', icon: Wand2, category: 'ai', keywords: ['bold', 'heavy', 'weight', 'thick'], action: () => sendAIQuickAction('Make the text bolder — increase font-weight') },
    { id: 'ai-padding', label: 'Add more padding', icon: Wand2, category: 'ai', keywords: ['padding', 'space', 'breathe', 'room'], action: () => sendAIQuickAction('Add more internal padding to give the content more breathing room') },
    { id: 'ai-border', label: 'Add border', icon: Wand2, category: 'ai', keywords: ['border', 'outline', 'stroke'], action: () => sendAIQuickAction('Add a subtle border around this component') },
    { id: 'ai-glass', label: 'Apply glass effect', icon: Sparkles, category: 'ai', keywords: ['glass', 'blur', 'frosted', 'transparent', 'liquid'], action: () => sendAIQuickAction('Apply a frosted glass / glassmorphism effect — semi-transparent background with backdrop-blur, subtle border') },
    { id: 'ai-gradient', label: 'Add gradient', icon: Palette, category: 'ai', keywords: ['gradient', 'fade', 'blend'], action: () => sendAIQuickAction('Replace the solid background with a beautiful subtle gradient that works with the existing color scheme') },
    { id: 'ai-minimal', label: 'Make it minimal', icon: Wand2, category: 'ai', keywords: ['minimal', 'clean', 'simple', 'flat'], action: () => sendAIQuickAction('Simplify this component — remove shadows, reduce borders, make it more minimal and clean') },

    // ── Create ──
    { id: 'create-rect', label: 'Add Rectangle', icon: Square, category: 'create', keywords: ['rectangle', 'box', 'div', 'container'], shortcut: 'R', action: () => { setActiveTool('rectangle'); onClose(); } },
    { id: 'create-circle', label: 'Add Circle', icon: Circle, category: 'create', keywords: ['circle', 'oval', 'ellipse'], shortcut: 'O', action: () => { setActiveTool('circle'); onClose(); } },
    { id: 'create-text', label: 'Add Text', icon: Type, category: 'create', keywords: ['text', 'label', 'heading', 'paragraph'], shortcut: 'T', action: () => { setActiveTool('text'); onClose(); } },
    { id: 'create-image', label: 'Add Image', icon: ImageIcon, category: 'create', keywords: ['image', 'photo', 'picture'], shortcut: 'I', action: () => { setActiveTool('image'); onClose(); } },
    { id: 'create-ai', label: 'Create with AI', icon: Sparkles, category: 'create', keywords: ['create', 'generate', 'ai', 'new component'], action: () => { useStore.setState({ showAICreate: true }); onClose(); } },

    // ── Edit ──
    { id: 'edit-undo', label: 'Undo', icon: Undo2, category: 'edit', keywords: ['undo', 'revert', 'back'], shortcut: '⌘Z', action: () => { undo(); onClose(); } },
    { id: 'edit-redo', label: 'Redo', icon: Redo2, category: 'edit', keywords: ['redo', 'forward'], shortcut: '⇧⌘Z', action: () => { redo(); onClose(); } },
    { id: 'edit-delete', label: 'Delete selected', icon: Trash2, category: 'edit', keywords: ['delete', 'remove', 'trash'], shortcut: '⌫', action: () => { deleteSelected(); onClose(); } },
    { id: 'edit-duplicate', label: 'Duplicate selected', icon: Copy, category: 'edit', keywords: ['duplicate', 'clone', 'copy'], shortcut: '⌘D', action: () => { if (selectedId) duplicateComponent(selectedId); onClose(); } },

    // ── Canvas ──
    { id: 'canvas-grid', label: `${showGrid ? 'Hide' : 'Show'} grid`, icon: Grid3X3, category: 'canvas', keywords: ['grid', 'lines', 'guides'], action: () => { toggleGrid(); onClose(); } },
    { id: 'canvas-snap', label: `${snapToGrid ? 'Disable' : 'Enable'} snap to grid`, icon: Grid3X3, category: 'canvas', keywords: ['snap', 'align', 'magnetic'], action: () => { toggleSnapToGrid(); onClose(); } },
    { id: 'canvas-inspect', label: 'Toggle inspect mode', icon: Crosshair, category: 'canvas', keywords: ['inspect', 'measure', 'spacing'], action: () => { toggleInspectMode(); onClose(); } },
    { id: 'canvas-responsive', label: 'Responsive preview', icon: Smartphone, category: 'canvas', keywords: ['responsive', 'mobile', 'tablet', 'preview'], action: () => { toggleResponsivePreview(); onClose(); } },
    { id: 'canvas-theme', label: `Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} theme`, icon: activeTheme === 'dark' ? Sun : Moon, category: 'canvas', keywords: ['theme', 'dark', 'light', 'mode'], action: () => { swapComponentTheme(); onClose(); } },

    // ── Design System ──
    { id: 'design-web', label: 'Set platform: Web', icon: Zap, category: 'design', keywords: ['web', 'platform', 'browser'], action: () => { updateDesignSystem({ platform: 'web' }); addToast('Platform set to Web', 'success'); onClose(); } },
    { id: 'design-ios', label: 'Set platform: iOS', icon: Zap, category: 'design', keywords: ['ios', 'apple', 'iphone', 'platform'], action: () => { updateDesignSystem({ platform: 'ios' }); addToast('Platform set to iOS', 'success'); onClose(); } },
    { id: 'design-android', label: 'Set platform: Android', icon: Zap, category: 'design', keywords: ['android', 'google', 'material', 'platform'], action: () => { updateDesignSystem({ platform: 'android' }); addToast('Platform set to Android', 'success'); onClose(); } },

    // ── Symbols ──
    { id: 'symbol-create', label: 'Create symbol from selection', icon: Package, category: 'symbols', keywords: ['symbol', 'master', 'reusable', 'component def'], action: () => {
      if (!selectedId) { addToast('Select a component first', 'error'); onClose(); return; }
      const comp = findComponent(selectedId);
      if (!comp) { onClose(); return; }
      useStore.getState().createSymbolFromComponent(selectedId);
      addToast(`Symbol "${comp.content || comp.type}" created`, 'success');
      onClose();
    }},
    { id: 'symbol-detach', label: 'Detach from symbol', icon: Unlink, category: 'symbols', keywords: ['detach', 'unlink', 'instance', 'override'], action: () => {
      if (!selectedId) { addToast('Select a component first', 'error'); onClose(); return; }
      useStore.getState().detachSymbolInstance(selectedId);
      addToast('Detached from symbol', 'success');
      onClose();
    }},
    { id: 'symbol-sync', label: 'Sync symbol instances', icon: RefreshCw, category: 'symbols', keywords: ['sync', 'propagate', 'update instances', 'symbol'], action: () => {
      if (!selectedId) { addToast('Select a symbol master first', 'error'); onClose(); return; }
      useStore.getState().syncSymbolInstances(selectedId);
      addToast('Instances synced', 'success');
      onClose();
    }},
  ];

  // Filter actions
  const filtered = query.trim()
    ? actions.filter(a => {
        const q = query.toLowerCase();
        return a.label.toLowerCase().includes(q) ||
               a.keywords.some(k => k.includes(q)) ||
               (a.description || '').toLowerCase().includes(q);
      })
    : actions;

  const groupedByCategory = filtered.reduce<Record<string, PaletteAction[]>>((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    ai: '✨ AI Quick Actions',
    create: '➕ Create',
    edit: '✏️ Edit',
    canvas: '🖼️ Canvas',
    design: '🎨 Design System',
    symbols: '📦 Symbols',
  };
  const categoryOrder = ['ai', 'create', 'edit', 'canvas', 'design', 'symbols'];

  // Flatten for keyboard navigation
  const flatFiltered = categoryOrder.flatMap(cat => groupedByCategory[cat] || []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, flatFiltered.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (mode === 'ai' && query.trim()) {
          sendAIQuickAction(query.trim());
          return;
        }
        if (flatFiltered[selectedIndex]) {
          flatFiltered[selectedIndex].action();
        }
        return;
      }
      // Tab to switch modes
      if (e.key === 'Tab') {
        e.preventDefault();
        setMode(m => m === 'commands' ? 'ai' : 'commands');
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flatFiltered, selectedIndex, onClose, mode, query, sendAIQuickAction]);

  // Auto-scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  let runningIndex = 0;

  return (
    <div className="fixed inset-0 z-[100001] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[540px] bg-[#1a1a1a] border border-gray-700/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden" style={{ maxHeight: '60vh' }}>
        {/* Header / Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          {mode === 'ai' ? (
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={mode === 'ai' ? 'Describe what to change…' : 'Type a command or search…'}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
            autoFocus
          />
          {aiLoading && (
            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full" />
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode(m => m === 'commands' ? 'ai' : 'commands')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                mode === 'ai' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
              }`}
            >
              {mode === 'ai' ? '✨ AI' : '⌘ Commands'}
            </button>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-500 font-mono">Tab</kbd>
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto max-h-[45vh] py-1 panel-scroll">
          {mode === 'ai' ? (
            <div className="px-4 py-8 text-center">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3 opacity-60" />
              <p className="text-gray-400 text-sm mb-1">AI Quick Command</p>
              <p className="text-gray-600 text-xs">
                {selectedId
                  ? 'Describe what to change and press Enter'
                  : 'Select a component on canvas first'
                }
              </p>
              {query.trim() && selectedId && (
                <div className="mt-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300 text-xs">
                  Press <kbd className="px-1 py-0.5 bg-purple-500/20 rounded text-[10px] font-mono">Enter</kbd> to apply: "{query}"
                </div>
              )}
            </div>
          ) : flatFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 text-sm">No matching commands</p>
              <p className="text-gray-600 text-xs mt-1">Try switching to <span className="text-purple-400">AI mode</span> with Tab</p>
            </div>
          ) : (
            categoryOrder.map(cat => {
              const items = groupedByCategory[cat];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="px-4 pt-2 pb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {categoryLabels[cat] || cat}
                    </span>
                  </div>
                  {items.map(item => {
                    const idx = runningIndex++;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        onClick={() => item.action()}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                          idx === selectedIndex ? 'bg-[#2296FF]/15 text-white' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${
                          item.category === 'ai' ? 'text-purple-400' : 'text-gray-500'
                        }`} />
                        <span className="text-sm flex-1">{item.label}</span>
                        {item.shortcut && (
                          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-500 font-mono">{item.shortcut}</kbd>
                        )}
                        {item.category === 'ai' && (
                          <ArrowRight className="w-3 h-3 text-gray-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 text-[10px] text-gray-600">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-gray-800 rounded font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 bg-gray-800 rounded font-mono">↵</kbd> run</span>
            <span><kbd className="px-1 py-0.5 bg-gray-800 rounded font-mono">Tab</kbd> toggle AI</span>
          </div>
          <span><kbd className="px-1 py-0.5 bg-gray-800 rounded font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
