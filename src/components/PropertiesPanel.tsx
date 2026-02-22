'use client';

import { useStore, ComponentElement } from '@/store/componentStore';
import { 
  Trash2, 
  Copy, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Droplet,
  Square,
  Type,
  Layers,
  Move,
  Maximize2,
  Minus,
  MousePointer2,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ArrowRight,
  ArrowDown,
  LayoutGrid,
  MessageSquare,
  Play,
} from 'lucide-react';
import { useState } from 'react';
import { parseTypeStyle, detectTypeStyle } from '@/lib/designSystemDefaults';
import { AutoLayoutPanel, ChildSizingPanel } from '@/components/AutoLayoutPanel';

export function PropertiesPanel() {
  const { selectedId, selectedIds, editingParentId, findComponent, updateComponent, batchUpdatePositions, deleteComponent, components, designSystem } = useStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['position', 'size', 'fill', 'text', 'border'])
  );
  const [activeState, setActiveState] = useState<'normal' | 'hover' | 'active' | 'disabled' | 'focused' | 'loading'>('normal');

  // Get selected components
  const selectedComponents = selectedIds.map(id => findComponent(id)).filter(Boolean);
  const component = selectedComponents.length === 1 ? selectedComponents[0] : null;
  const isMultiSelect = selectedComponents.length > 1;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Handle updates for multi-selection
  const handleMultiUpdate = (updates: any) => {
    selectedIds.forEach(id => {
      updateComponent(id, updates);
    });
  };

  const SectionHeader = ({ icon: Icon, title, section }: any) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/5 transition-colors"
    >
      {expandedSections.has(section) ? (
        <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
      ) : (
        <ChevronRight className="w-2.5 h-2.5 text-gray-500" />
      )}
      <Icon className="w-3 h-3 text-gray-400" />
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{title}</span>
    </button>
  );

  if (selectedComponents.length === 0) {
    return (
      <div className="h-full flex flex-col bg-[#121212]">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <MousePointer2 className="w-5 h-5 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-[10px]">Select a component to edit</p>
          </div>
        </div>
      </div>
    );
  }

  // Multi-selection handling
  if (isMultiSelect) {
    // Alignment helpers
    const alignLeft = () => {
      const comps = selectedComponents.map(c => ({ id: c!.id, x: c!.position.x, y: c!.position.y, w: c!.size.width, h: c!.size.height }));
      const minX = Math.min(...comps.map(c => c.x));
      useStore.getState().pushHistory();
      batchUpdatePositions(comps.map(c => ({ id: c.id, position: { x: minX, y: c.y } })));
    };
    const alignCenterH = () => {
      const comps = selectedComponents.map(c => ({ id: c!.id, x: c!.position.x, y: c!.position.y, w: c!.size.width, h: c!.size.height }));
      const avg = comps.reduce((s, c) => s + c.x + c.w / 2, 0) / comps.length;
      useStore.getState().pushHistory();
      batchUpdatePositions(comps.map(c => ({ id: c.id, position: { x: avg - c.w / 2, y: c.y } })));
    };
    const alignRight = () => {
      const comps = selectedComponents.map(c => ({ id: c!.id, x: c!.position.x, y: c!.position.y, w: c!.size.width, h: c!.size.height }));
      const maxRight = Math.max(...comps.map(c => c.x + c.w));
      useStore.getState().pushHistory();
      batchUpdatePositions(comps.map(c => ({ id: c.id, position: { x: maxRight - c.w, y: c.y } })));
    };
    const alignTop = () => {
      const comps = selectedComponents.map(c => ({ id: c!.id, x: c!.position.x, y: c!.position.y, w: c!.size.width, h: c!.size.height }));
      const minY = Math.min(...comps.map(c => c.y));
      useStore.getState().pushHistory();
      batchUpdatePositions(comps.map(c => ({ id: c.id, position: { x: c.x, y: minY } })));
    };
    const alignCenterV = () => {
      const comps = selectedComponents.map(c => ({ id: c!.id, x: c!.position.x, y: c!.position.y, w: c!.size.width, h: c!.size.height }));
      const avg = comps.reduce((s, c) => s + c.y + c.h / 2, 0) / comps.length;
      useStore.getState().pushHistory();
      batchUpdatePositions(comps.map(c => ({ id: c.id, position: { x: c.x, y: avg - c.h / 2 } })));
    };
    const alignBottom = () => {
      const comps = selectedComponents.map(c => ({ id: c!.id, x: c!.position.x, y: c!.position.y, w: c!.size.width, h: c!.size.height }));
      const maxBottom = Math.max(...comps.map(c => c.y + c.h));
      useStore.getState().pushHistory();
      batchUpdatePositions(comps.map(c => ({ id: c.id, position: { x: c.x, y: maxBottom - c.h } })));
    };
    const distributeH = () => {
      if (selectedComponents.length < 3) return;
      const comps = selectedComponents.map(c => ({ id: c!.id, x: c!.position.x, y: c!.position.y, w: c!.size.width, h: c!.size.height }));
      const sorted = [...comps].sort((a, b) => a.x - b.x);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpace = (last.x + last.w) - first.x;
      const totalWidths = sorted.reduce((sum, c) => sum + c.w, 0);
      const gap = (totalSpace - totalWidths) / (sorted.length - 1);
      let currentX = first.x;
      const updates = sorted.map(c => {
        const pos = { id: c.id, position: { x: currentX, y: c.y } };
        currentX += c.w + gap;
        return pos;
      });
      useStore.getState().pushHistory();
      batchUpdatePositions(updates);
    };
    const distributeV = () => {
      if (selectedComponents.length < 3) return;
      const comps = selectedComponents.map(c => ({ id: c!.id, x: c!.position.x, y: c!.position.y, w: c!.size.width, h: c!.size.height }));
      const sorted = [...comps].sort((a, b) => a.y - b.y);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpace = (last.y + last.h) - first.y;
      const totalHeights = sorted.reduce((sum, c) => sum + c.h, 0);
      const gap = (totalSpace - totalHeights) / (sorted.length - 1);
      let currentY = first.y;
      const updates = sorted.map(c => {
        const pos = { id: c.id, position: { x: c.x, y: currentY } };
        currentY += c.h + gap;
        return pos;
      });
      useStore.getState().pushHistory();
      batchUpdatePositions(updates);
    };

    return (
      <div className="h-full flex flex-col bg-[#121212] overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-gray-800">
          <h2 className="text-white font-semibold text-xs flex items-center gap-2 mb-3">
            <Square className="w-4 h-4 text-[#2296FF]" />
            Design
          </h2>

          {/* Multi-select badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-[#2296FF] text-white text-xs rounded">
              {selectedComponents.length} components
            </span>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { useStore.getState().deleteSelected(); }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete All
            </button>
          </div>
        </div>

        {/* Alignment + Common properties */}
        <div className="flex-1 overflow-y-auto">
          {/* Alignment section */}
          <div className="border-b border-gray-800">
            <SectionHeader icon={AlignHorizontalJustifyCenter} title="Alignment" section="alignment" />
            {expandedSections.has('alignment') && (
              <div className="px-3 py-2 space-y-2">
                <label className="text-[10px] text-gray-500 block">Align</label>
                <div className="flex gap-1">
                  <button onClick={alignLeft} className="flex-1 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Align Left">
                    <AlignHorizontalJustifyStart className="w-3.5 h-3.5 text-gray-300 mx-auto" />
                  </button>
                  <button onClick={alignCenterH} className="flex-1 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Align Center">
                    <AlignHorizontalJustifyCenter className="w-3.5 h-3.5 text-gray-300 mx-auto" />
                  </button>
                  <button onClick={alignRight} className="flex-1 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Align Right">
                    <AlignHorizontalJustifyEnd className="w-3.5 h-3.5 text-gray-300 mx-auto" />
                  </button>
                  <div className="w-px bg-gray-700" />
                  <button onClick={alignTop} className="flex-1 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Align Top">
                    <AlignVerticalJustifyStart className="w-3.5 h-3.5 text-gray-300 mx-auto" />
                  </button>
                  <button onClick={alignCenterV} className="flex-1 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Align Middle">
                    <AlignVerticalJustifyCenter className="w-3.5 h-3.5 text-gray-300 mx-auto" />
                  </button>
                  <button onClick={alignBottom} className="flex-1 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Align Bottom">
                    <AlignVerticalJustifyEnd className="w-3.5 h-3.5 text-gray-300 mx-auto" />
                  </button>
                </div>
                {selectedComponents.length >= 3 && (
                  <>
                    <label className="text-[10px] text-gray-500 block mt-2">Distribute</label>
                    <div className="flex gap-1">
                      <button onClick={distributeH} className="flex-1 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-[10px] text-gray-300">
                        Horizontal
                      </button>
                      <button onClick={distributeV} className="flex-1 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-[10px] text-gray-300">
                        Vertical
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {/* Fill section */}
          <div className="border-b border-gray-800">
            <SectionHeader icon={Droplet} title="Fill" section="fill" />
            {expandedSections.has('fill') && (
              <div className="px-3 py-2 space-y-2">
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">Background</label>
                  <input
                    type="color"
                    className="w-full h-8 rounded cursor-pointer"
                    onChange={(e) => handleMultiUpdate({ styles: { backgroundColor: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">Opacity (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full"
                    onChange={(e) => handleMultiUpdate({ styles: { opacity: parseInt(e.target.value) / 100 } })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Border section */}
          <div className="border-b border-gray-800">
            <SectionHeader icon={Square} title="Border" section="border" />
            {expandedSections.has('border') && (
              <div className="px-3 py-2 space-y-2">
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">Border Radius</label>
                  <input
                    type="text"
                    placeholder="e.g. 8px"
                    className="w-full px-2 py-1 bg-gray-800 text-white text-xs rounded border border-gray-800"
                    onChange={(e) => handleMultiUpdate({ styles: { borderRadius: e.target.value } })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: any) => {
    updateComponent(component!.id, updates);
  };

  // State-aware style changes — only sends the changed properties
  const handleStyleChange = (styleUpdates: Record<string, any>) => {
    if (activeState === 'normal') {
      updateComponent(component!.id, { styles: { ...component!.styles, ...styleUpdates } });
    } else {
      const stateKey = `${activeState}Styles` as 'hoverStyles' | 'activeStyles' | 'disabledStyles' | 'focusedStyles' | 'loadingStyles';
      const currentStateStyles = (component as any)?.[stateKey] || {};
      updateComponent(component!.id, { [stateKey]: { ...currentStateStyles, ...styleUpdates } });
    }
  };

  // Effective styles for current state tab (merged base + state overrides)
  const es: Record<string, any> = (() => {
    if (activeState === 'normal') return component!.styles;
    const stateKey = `${activeState}Styles` as 'hoverStyles' | 'activeStyles' | 'disabledStyles' | 'focusedStyles' | 'loadingStyles';
    return { ...component!.styles, ...((component as any)?.[stateKey] || {}) };
  })();

  const isSubElement = (editingParentId && selectedId !== editingParentId) || !!component?.parentId;

  const safePosition = component?.position || { x: 0, y: 0 };
  const safeSize = component?.size || { width: 0, height: 0 };

  const handleDuplicate = () => {
    // Use the store's duplicateComponent which regenerates all child IDs
    useStore.getState().duplicateComponent(component!.id);
  };

  return (
    <div className="h-full flex flex-col bg-[#121212] overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-2 pb-2 border-b border-gray-800/50">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-semibold text-white tracking-wide">
            {component.type.toUpperCase()}
          </span>
          <div className="flex-1" />
          <button
            onClick={() => { useStore.getState().pushHistory(); updateComponent(component.id, { hidden: !component.hidden }); }}
            className={`p-1 hover:bg-white/10 rounded transition-colors ${component.hidden ? 'bg-white/10' : ''}`}
            title={component.hidden ? 'Show' : 'Hide'}
          >
            {component.hidden
              ? <EyeOff className="w-3 h-3 text-yellow-400" />
              : <Eye className="w-3 h-3 text-gray-500" />
            }
          </button>
          <button
            onClick={() => { useStore.getState().pushHistory(); updateComponent(component.id, { locked: !component.locked }); }}
            className={`p-1 hover:bg-white/10 rounded transition-colors ${component.locked ? 'bg-white/10' : ''}`}
            title={component.locked ? 'Unlock' : 'Lock'}
          >
            {component.locked
              ? <Lock className="w-3 h-3 text-yellow-400" />
              : <Unlock className="w-3 h-3 text-gray-500" />
            }
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3 h-3 text-gray-500" />
          </button>
          <button
            onClick={() => deleteComponent(component.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3 text-red-400/70" />
          </button>
        </div>

        {/* Sub-element indicator */}
        {isSubElement && (
          <div className="px-2 py-0.5 bg-[#2296FF]/10 border border-[#2296FF]/20 rounded text-[9px] text-[#2296FF] mb-1">
            Sub-element of parent
          </div>
        )}
      </div>

      {/* Component State Tabs */}
      {(component.type === 'button' || component.type === 'input' || component.type === 'div') && (
        <div className="flex border-b border-gray-800/50 flex-shrink-0 px-1">
          {(['normal', 'hover', 'active', 'focused', 'disabled', 'loading'] as const).map((state) => {
            const stateKey = `${state}Styles` as 'hoverStyles' | 'activeStyles' | 'disabledStyles' | 'focusedStyles' | 'loadingStyles';
            const hasOverride = state !== 'normal' && (component as any)?.[stateKey] && Object.keys((component as any)[stateKey]).length > 0;
            return (
              <button
                key={state}
                onClick={() => setActiveState(state)}
                className={`flex-1 py-1 text-[9px] font-medium transition-colors relative ${
                  activeState === state
                    ? 'text-[#2296FF]'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {state === 'normal' ? 'Normal' : state === 'focused' ? 'Focus' : state.charAt(0).toUpperCase() + state.slice(1)}
                {hasOverride && (
                  <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-[#2296FF]" />
                )}
                {activeState === state && (
                  <div className="absolute bottom-0 left-1 right-1 h-[1.5px] bg-[#2296FF] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* State info banner */}
        {activeState !== 'normal' && (
          <div className="px-3 py-2 bg-[#2296FF]/5 border-b border-[#2296FF]/10 text-[10px] text-[#2296FF] flex items-center justify-between">
            <span>Editing <strong>{activeState}</strong> state overrides. Only changed properties apply.</span>
            {component && (() => {
              const stateKey = `${activeState}Styles` as 'hoverStyles' | 'activeStyles' | 'disabledStyles' | 'focusedStyles' | 'loadingStyles';
              const hasOverrides = (component as any)?.[stateKey] && Object.keys((component as any)[stateKey]).length > 0;
              return hasOverrides ? (
                <button
                  onClick={() => { useStore.getState().pushHistory(); updateComponent(component.id, { [stateKey]: {} }); }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[#2296FF]/10 hover:bg-[#2296FF]/20 transition-colors"
                >
                  Clear
                </button>
              ) : null;
            })()}
          </div>
        )}

        {/* POSITION - different for sub-elements vs top-level */}
        {!isSubElement ? (
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={Move} title="Position" section="position" />
          {expandedSections.has('position') && (
            <div className="px-3 pb-2 space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">X</label>
                  <input
                    type="number"
                    value={Math.round(safePosition.x)}
                    onChange={(e) => handleUpdate({
                      position: { ...safePosition, x: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Y</label>
                  <input
                    type="number"
                    value={Math.round(safePosition.y)}
                    onChange={(e) => handleUpdate({
                      position: { ...safePosition, y: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        ) : (
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={Move} title="Position" section="position" />
          {expandedSections.has('position') && (
            <div className="px-3 pb-2 space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">X</label>
                  <input
                    type="number"
                    value={parseInt(es.left) || 0}
                    onChange={(e) => handleStyleChange({
                      position: 'absolute',
                      left: `${e.target.value}px`,
                    })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Y</label>
                  <input
                    type="number"
                    value={parseInt(es.top) || 0}
                    onChange={(e) => handleStyleChange({
                      position: 'absolute',
                      top: `${e.target.value}px`,
                    })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* SIZE */}
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={Maximize2} title="Size" section="size" />
          {expandedSections.has('size') && (
            <div className="px-3 pb-2 space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">W</label>
                  {isSubElement ? (
                    <input
                      type="number"
                      value={parseInt(es.width) || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleStyleChange({ width: v ? `${v}px` : undefined });
                      }}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                      placeholder="auto"
                    />
                  ) : (
                    <input
                      type="number"
                      value={Math.round(safeSize.width)}
                      onChange={(e) => handleUpdate({
                        size: { ...safeSize, width: parseInt(e.target.value) || 50 }
                      })}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">H</label>
                  {isSubElement ? (
                    <input
                      type="number"
                      value={parseInt(es.height) || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleStyleChange({ height: v ? `${v}px` : undefined });
                      }}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                      placeholder="auto"
                    />
                  ) : (
                    <input
                      type="number"
                      value={Math.round(safeSize.height)}
                      onChange={(e) => handleUpdate({
                        size: { ...safeSize, height: parseInt(e.target.value) || 30 }
                      })}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                    />
                  )}
                </div>
              </div>
              {isSubElement && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-gray-500 mb-0.5 block">Padding</label>
                    <input
                      type="text"
                      value={es.padding || '0'}
                      onChange={(e) => handleStyleChange({ padding: e.target.value })}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                      placeholder="8px"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-0.5 block">Margin</label>
                    <input
                      type="text"
                      value={es.margin || '0'}
                      onChange={(e) => handleStyleChange({ margin: e.target.value })}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Rotation (deg)</label>
                <input
                  type="number"
                  value={parseInt(es.transform?.match(/rotate\((-?\d+)deg\)/)?.[1] || '0')}
                  onChange={(e) => handleStyleChange({ transform: `rotate(${e.target.value}deg)` })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* FILL - not for lines/arrows */}
        {component.type !== 'line' && component.type !== 'arrow' && (
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={Droplet} title="Fill" section="fill" />
          {expandedSections.has('fill') && (
            <div className="px-3 pb-2 space-y-1.5">
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={es.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                    className="w-10 h-8 rounded border border-gray-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={es.backgroundColor || ''}
                    onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                    className="flex-1 px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parseFloat(es.opacity || '1') * 100}
                  onChange={(e) => handleStyleChange({ opacity: (parseInt(e.target.value) / 100).toString() })}
                  className="w-full"
                />
                <div className="text-[10px] text-gray-500 text-right mt-1">
                  {Math.round(parseFloat(es.opacity || '1') * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* STROKE - for lines and arrows */}
        {(component.type === 'line' || component.type === 'arrow') && (
          <div className="border-b border-gray-800/30">
            <SectionHeader icon={Minus} title="Stroke" section="stroke" />
            {expandedSections.has('stroke') && (
              <div className="px-3 pb-2 space-y-1.5">
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Stroke Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={es.stroke || '#9ca3af'}
                      onChange={(e) => handleStyleChange({ stroke: e.target.value })}
                      className="w-10 h-8 rounded border border-gray-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={es.stroke || ''}
                      onChange={(e) => handleStyleChange({ stroke: e.target.value })}
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                      placeholder="#9ca3af"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Stroke Width</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={Number(es.strokeWidth) || 2}
                    onChange={(e) => handleStyleChange({ strokeWidth: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parseFloat(es.opacity || '1') * 100}
                    onChange={(e) => handleStyleChange({ opacity: (parseInt(e.target.value) / 100).toString() })}
                    className="w-full"
                  />
                  <div className="text-[10px] text-gray-500 text-right mt-1">
                    {Math.round(parseFloat(es.opacity || '1') * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEXT */}
        {(component.type === 'text' || component.type === 'button') && (
          <div className="border-b border-gray-800/30">
            <SectionHeader icon={Type} title="Text" section="text" />
            {expandedSections.has('text') && (
              <div className="px-3 pb-2 space-y-1.5">
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Content</label>
                  <textarea
                    value={component.content || ''}
                    onChange={(e) => handleUpdate({ content: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white resize-none"
                    rows={2}
                  />
                </div>
                {/* ── Type Style Preset Picker (normal state only) ── */}
                {activeState === 'normal' && (() => {
                  const nt = designSystem.namedTokens;
                  const typeTokens = nt.filter((t: any) => t.type === 'typography' && t.category === 'semantic' && t.id.startsWith('type-'));
                  if (typeTokens.length === 0) return null;
                  const detected = detectTypeStyle(es, nt);
                  // Detection reflects actual CSS values — prefer it over stored metadata
                  // which can become stale after variations or manual edits
                  const current = detected || '';
                  return (
                    <div>
                      <label className="text-[9px] text-gray-500 mb-0.5 block">Type Style</label>
                      <select
                        value={current}
                        onChange={(e) => {
                          const tokenId = e.target.value;
                          if (!tokenId) {
                            // "Custom" selected — clear typeStyle tracking but keep current values
                            updateComponent(component!.id, { typeStyle: undefined });
                            return;
                          }
                          const token = nt.find((t: any) => t.id === tokenId);
                          if (!token) return;
                          const parsed = parseTypeStyle(token.value);
                          if (!parsed) return;
                          // Apply all 4 typography props + track the preset (single update)
                          updateComponent(component!.id, {
                            typeStyle: tokenId,
                            styles: {
                              ...component!.styles,
                              fontSize: parsed.fontSize,
                              lineHeight: parsed.lineHeight,
                              fontWeight: parsed.fontWeight,
                              fontFamily: parsed.fontFamily,
                            },
                          });
                        }}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                      >
                        <option value="">Custom</option>
                        {typeTokens.map((t: any) => {
                          const parsed = parseTypeStyle(t.value);
                          const preview = parsed ? `${parsed.fontSize} / ${parsed.fontWeight}` : t.value;
                          return (
                            <option key={t.id} value={t.id}>
                              {t.name} — {preview}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })()}
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Font Size</label>
                  <input
                    type="number"
                    value={parseInt(es.fontSize || '14')}
                    onChange={(e) => { handleStyleChange({ fontSize: `${e.target.value}px` }); if (activeState === 'normal') updateComponent(component!.id, { typeStyle: undefined }); }}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Font Family</label>
                  <select
                    value={es.fontFamily || 'inherit'}
                    onChange={(e) => { handleStyleChange({ fontFamily: e.target.value }); if (activeState === 'normal') updateComponent(component!.id, { typeStyle: undefined }); }}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  >
                    <option value="inherit">Default (System)</option>
                    <option value="Inter">Inter</option>
                    <option value="Manrope">Manrope</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="DM Sans">DM Sans</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Font Weight</label>
                  <select
                    value={es.fontWeight || '400'}
                    onChange={(e) => { handleStyleChange({ fontWeight: e.target.value }); if (activeState === 'normal') updateComponent(component!.id, { typeStyle: undefined }); }}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  >
                    <option value="300">Light</option>
                    <option value="400">Regular</option>
                    <option value="500">Medium</option>
                    <option value="600">Semibold</option>
                    <option value="700">Bold</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={es.color || '#000000'}
                      onChange={(e) => handleStyleChange({ color: e.target.value })}
                      className="w-10 h-8 rounded border border-gray-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={es.color || ''}
                      onChange={(e) => handleStyleChange({ color: e.target.value })}
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Line Height</label>
                  <input
                    type="number"
                    step="0.1"
                    value={parseFloat(es.lineHeight || '1.5')}
                    onChange={(e) => { handleStyleChange({ lineHeight: e.target.value }); if (activeState === 'normal') updateComponent(component!.id, { typeStyle: undefined }); }}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  />
                </div>
                {/* Text Alignment */}
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Text Align</label>
                  <div className="flex gap-1">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button
                        key={align}
                        onClick={() => handleStyleChange({ textAlign: align })}
                        className={`flex-1 px-2 py-1.5 rounded text-[10px] transition-colors outline-none ${
                          (es.textAlign || 'left') === align
                            ? 'bg-[#2296FF] text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {align === 'left' ? '⫷' : align === 'center' ? '⫿' : '⫸'}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Letter Spacing */}
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Letter Spacing</label>
                  <input
                    type="number"
                    step="0.1"
                    value={parseFloat(es.letterSpacing || '0')}
                    onChange={(e) => handleStyleChange({ letterSpacing: `${e.target.value}px` })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  />
                </div>
                {/* Text Decoration */}
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Decoration</label>
                  <div className="flex gap-1">
                    {[
                      { value: 'none', label: 'None' },
                      { value: 'underline', label: 'U̲' },
                      { value: 'line-through', label: 'S̶' },
                    ].map(d => (
                      <button
                        key={d.value}
                        onClick={() => handleStyleChange({ textDecoration: d.value })}
                        className={`flex-1 px-2 py-1.5 rounded text-[10px] transition-colors outline-none ${
                          (es.textDecoration || 'none') === d.value
                            ? 'bg-[#2296FF] text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Text Transform */}
                <div>
                  <label className="text-[9px] text-gray-500 mb-0.5 block">Transform</label>
                  <div className="flex gap-1">
                    {[
                      { value: 'none', label: 'Aa' },
                      { value: 'uppercase', label: 'AA' },
                      { value: 'lowercase', label: 'aa' },
                      { value: 'capitalize', label: 'Ab' },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => handleStyleChange({ textTransform: t.value })}
                        className={`flex-1 px-2 py-1.5 rounded text-[10px] transition-colors outline-none ${
                          (es.textTransform || 'none') === t.value
                            ? 'bg-[#2296FF] text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Quick center (flex centering for buttons) */}
                {component.type === 'button' && (
                  <div>
                    <label className="text-[9px] text-gray-500 mb-0.5 block">Center Content</label>
                    <button
                      onClick={() => handleStyleChange({ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' 
                      })}
                      className={`w-full px-2 py-1.5 rounded text-[10px] transition-colors outline-none ${
                        es.display === 'flex' && es.alignItems === 'center' && es.justifyContent === 'center'
                          ? 'bg-[#2296FF] text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      Center Text in Button
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* BORDER - not for lines/arrows */}
        {component.type !== 'line' && component.type !== 'arrow' && (
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={Square} title="Border" section="border" />
          {expandedSections.has('border') && (
            <div className="px-3 pb-2 space-y-1.5">
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Border Radius</label>
                <input
                  type="number"
                  value={parseInt(es.borderRadius || '0')}
                  onChange={(e) => handleStyleChange({ borderRadius: `${e.target.value}px` })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Border Width</label>
                <input
                  type="number"
                  value={parseInt(es.borderWidth || es.border?.split(' ')[0] || '0')}
                  onChange={(e) => {
                    const w = e.target.value;
                    const color = es.borderColor || es.border?.match(/#[0-9a-fA-F]+|rgba?\([^)]+\)/)?.[0] || '#333';
                    handleStyleChange({ borderWidth: `${w}px`, borderStyle: 'solid', borderColor: color, border: undefined });
                  }}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Border Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={es.borderColor || es.border?.match(/#[0-9a-fA-F]{3,8}/)?.[0] || '#333333'}
                    onChange={(e) => handleStyleChange({ borderColor: e.target.value, borderStyle: 'solid', border: undefined })}
                    className="w-10 h-8 rounded border border-gray-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={es.borderColor || ''}
                    onChange={(e) => handleStyleChange({ borderColor: e.target.value, borderStyle: 'solid', border: undefined })}
                    className="flex-1 px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                    placeholder="#333333"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* EFFECTS */}
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={Layers} title="Effects" section="effects" />
          {expandedSections.has('effects') && (
            <div className="px-3 pb-2 space-y-1.5">
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Box Shadow</label>
                <input
                  type="text"
                  value={es.boxShadow || ''}
                  onChange={(e) => handleStyleChange({ boxShadow: e.target.value })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  placeholder="0 2px 8px rgba(0,0,0,0.1)"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Backdrop Filter</label>
                <input
                  type="text"
                  value={es.backdropFilter || ''}
                  onChange={(e) => handleStyleChange({ backdropFilter: e.target.value, WebkitBackdropFilter: e.target.value })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  placeholder="blur(10px) saturate(1.5)"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Filter</label>
                <input
                  type="text"
                  value={es.filter || ''}
                  onChange={(e) => handleStyleChange({ filter: e.target.value })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                  placeholder="brightness(1.1) contrast(1.05)"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Overflow</label>
                <div className="flex gap-1">
                  {(['visible', 'hidden', 'auto'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => handleStyleChange({ overflow: v })}
                      className={`flex-1 px-2 py-1.5 rounded text-[10px] transition-colors outline-none capitalize ${
                        (es.overflow || 'visible') === v
                          ? 'bg-[#2296FF] text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 mb-0.5 block">Cursor</label>
                <select
                  value={es.cursor || 'default'}
                  onChange={(e) => handleStyleChange({ cursor: e.target.value })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-800 rounded text-[11px] text-white"
                >
                  <option value="default">Default</option>
                  <option value="pointer">Pointer</option>
                  <option value="text">Text</option>
                  <option value="move">Move</option>
                  <option value="not-allowed">Not Allowed</option>
                  <option value="grab">Grab</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* AUTO LAYOUT */}
        {component.type === 'div' && (
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={LayoutGrid} title="Auto Layout" section="autolayout" />
          {expandedSections.has('autolayout') && (
            <AutoLayoutPanel component={component} />
          )}
        </div>
        )}

        {/* CHILD SIZING (when editing a child inside a flex parent) */}
        {isSubElement && (() => {
          // Check if parent is a flex container
          const parent = useStore.getState().components.find(c => c.id === editingParentId) || 
                         useStore.getState().components.find(c => c.children?.some(ch => ch.id === component.id));
          const parentChild = parent?.children?.find(ch => ch.id === component.id);
          if (parent?.styles?.display === 'flex' && parentChild) {
            return (
              <div className="border-b border-gray-800/30">
                <SectionHeader icon={LayoutGrid} title="Layout Sizing" section="childsizing" />
                {expandedSections.has('childsizing') && (
                  <ChildSizingPanel child={component} />
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* DESIGN PROPERTIES (Apple HIG) */}
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={Layers} title="Design Properties" section="designProps" />
          {expandedSections.has('designProps') && (
            <DesignPropertiesSection key={component.id} component={component} />
          )}
        </div>

        {/* NOTES */}
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={MessageSquare} title="Notes" section="notes" />
          {expandedSections.has('notes') && (
            <div className="px-3 pb-2 space-y-1.5">
              {(component.annotations || []).map((ann) => (
                <div key={ann.id} className={`flex items-start gap-2 p-2 rounded text-[10px] ${ann.resolved ? 'bg-gray-800/30 opacity-60' : 'bg-amber-500/5 border border-amber-500/15'}`}>
                  <div className="flex-1">
                    <p className={`text-gray-300 ${ann.resolved ? 'line-through' : ''}`}>{ann.text}</p>
                    <p className="text-gray-600 mt-0.5">{new Date(ann.timestamp).toLocaleDateString()}{ann.author ? ` · ${ann.author}` : ''}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => useStore.getState().toggleResolveAnnotation(component.id, ann.id)}
                      className={`px-1 py-0.5 rounded text-[9px] ${ann.resolved ? 'text-gray-500 hover:text-gray-300' : 'text-green-500 hover:text-green-400'}`}
                      title={ann.resolved ? 'Reopen' : 'Resolve'}
                    >
                      {ann.resolved ? 'Reopen' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => useStore.getState().removeAnnotation(component.id, ann.id)}
                      className="px-1 py-0.5 rounded text-[9px] text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const note = window.prompt('Add a note:');
                  if (note?.trim()) {
                    useStore.getState().addAnnotation(component.id, note.trim());
                  }
                }}
                className="w-full py-1.5 rounded border border-dashed border-gray-700 hover:border-gray-500 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                + Add Note
              </button>
            </div>
          )}
        </div>

        {/* ANIMATION */}
        <div className="border-b border-gray-800/30">
          <SectionHeader icon={Play} title="Animation" section="animation" />
          {expandedSections.has('animation') && (
            <div className="px-3 pb-3 space-y-3">
              {/* Entrance */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1.5 block">Entrance</label>
                <select
                  value={component.animation?.entrance || 'none'}
                  onChange={(e) => updateComponent(component.id, { animation: { ...(component.animation || {}), entrance: e.target.value as any } })}
                  className="w-full bg-gray-800 text-[10px] text-gray-300 px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-[#2296FF]"
                >
                  <option value="none">None</option>
                  <option value="fadeIn">Fade In</option>
                  <option value="slideUp">Slide Up</option>
                  <option value="slideDown">Slide Down</option>
                  <option value="slideLeft">Slide Left</option>
                  <option value="slideRight">Slide Right</option>
                  <option value="scaleUp">Scale Up</option>
                  <option value="bounce">Bounce</option>
                </select>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Duration (ms)</label>
                  <input
                    type="number"
                    min={50}
                    max={3000}
                    step={50}
                    value={component.animation?.duration || 300}
                    onChange={(e) => updateComponent(component.id, { animation: { ...(component.animation || {}), duration: parseInt(e.target.value) || 300 } })}
                    className="w-full bg-gray-800 text-[10px] text-gray-300 px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-[#2296FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Delay (ms)</label>
                  <input
                    type="number"
                    min={0}
                    max={5000}
                    step={50}
                    value={component.animation?.delay || 0}
                    onChange={(e) => updateComponent(component.id, { animation: { ...(component.animation || {}), delay: parseInt(e.target.value) || 0 } })}
                    className="w-full bg-gray-800 text-[10px] text-gray-300 px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-[#2296FF]"
                  />
                </div>
              </div>

              {/* Easing */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1.5 block">Easing</label>
                <div className="flex gap-1">
                  {(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'] as const).map(val => (
                    <button
                      key={val}
                      onClick={() => updateComponent(component.id, { animation: { ...(component.animation || {}), easing: val } })}
                      className={`flex-1 px-0.5 py-1.5 rounded text-[9px] transition-colors outline-none ${
                        (component.animation?.easing || 'ease') === val
                          ? 'bg-[#2296FF] text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {val === 'ease-in-out' ? 'in-out' : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hover Transition */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Hover Transition (ms)</label>
                <input
                  type="number"
                  min={0}
                  max={2000}
                  step={50}
                  value={component.animation?.hoverTransition || 200}
                  onChange={(e) => updateComponent(component.id, { animation: { ...(component.animation || {}), hoverTransition: parseInt(e.target.value) || 200 } })}
                  className="w-full bg-gray-800 text-[10px] text-gray-300 px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-[#2296FF]"
                />
              </div>

              {/* Preview button */}
              <button
                onClick={() => {
                  const el = document.querySelector(`[data-component-id="${component.id}"]`) as HTMLElement;
                  if (!el) return;
                  const anim = component.animation || {};
                  const entrance = anim.entrance || 'none';
                  if (entrance === 'none') return;
                  const dur = anim.duration || 300;
                  const ease = anim.easing || 'ease';
                  const keyframes: Keyframe[] =
                    entrance === 'fadeIn' ? [{ opacity: 0 }, { opacity: 1 }] :
                    entrance === 'slideUp' ? [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }] :
                    entrance === 'slideDown' ? [{ transform: 'translateY(-24px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }] :
                    entrance === 'slideLeft' ? [{ transform: 'translateX(24px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }] :
                    entrance === 'slideRight' ? [{ transform: 'translateX(-24px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }] :
                    entrance === 'scaleUp' ? [{ transform: 'scale(0.85)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }] :
                    entrance === 'bounce' ? [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'translateY(-6px)', opacity: 1 }, { transform: 'translateY(2px)', opacity: 1 }, { transform: 'translateY(0)', opacity: 1 }] :
                    [{ opacity: 0 }, { opacity: 1 }];
                  el.animate(keyframes, { duration: dur, easing: ease, fill: 'forwards' });
                }}
                className="w-full py-1.5 rounded bg-[#2296FF]/10 hover:bg-[#2296FF]/20 border border-[#2296FF]/20 text-[10px] text-[#2296FF] transition-colors"
              >
                Preview Animation
              </button>
            </div>
          )}
        </div>

        {/* ═══ SYMBOL SECTION ═══ */}
        <div className="border-b border-gray-800">
          <SymbolSection component={component} />
        </div>

      </div>
    </div>
  );
}

// ═══ SYMBOL SECTION ═══
function SymbolSection({ component }: { component: ComponentElement }) {
  const { createSymbolFromComponent, createInstanceOfSymbol, syncSymbolInstances, detachSymbolInstance, getSymbolInstances } = useStore();
  
  const isMaster = component.isSymbolMaster;
  const isInstance = component.isSymbolInstance;
  const symbolId = component.symbolMasterId;
  const instanceCount = isMaster ? getSymbolInstances(component.id).length : 0;
  
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-semibold text-white">Symbol</span>
        {isMaster && <span className="px-1.5 py-0 rounded text-[8px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">Master</span>}
        {isInstance && <span className="px-1.5 py-0 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Instance</span>}
      </div>
      
      {!isMaster && !isInstance && (
        <button
          onClick={() => createSymbolFromComponent(component.id)}
          className="w-full py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-[10px] text-purple-400 font-medium transition-colors"
        >
          Create Symbol
        </button>
      )}
      
      {isMaster && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-gray-500">{instanceCount} instance{instanceCount !== 1 ? 's' : ''} linked</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => createInstanceOfSymbol(component.id)}
              className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-[10px] text-cyan-400 font-medium transition-colors"
            >
              + Instance
            </button>
            <button
              onClick={() => syncSymbolInstances(component.id)}
              className="flex-1 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-[10px] text-purple-400 font-medium transition-colors"
            >
              ↻ Sync All
            </button>
          </div>
        </div>
      )}
      
      {isInstance && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-gray-500">Linked to symbol: <span className="text-gray-400 font-mono">{symbolId?.substring(0, 16)}…</span></p>
          <button
            onClick={() => detachSymbolInstance(component.id)}
            className="w-full py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-[10px] text-orange-400 font-medium transition-colors"
          >
            Detach from Symbol
          </button>
        </div>
      )}
    </div>
  );
}

// ═══ VARIANT SECTION COMPONENT ═══
// ═══ Apple Design Properties Section ═══
function DesignPropertiesSection({ component }: { component: any }) {
  const { updateComponent } = useStore();
  const isButton = component.type === 'button';
  const isInteractive = ['button', 'input'].includes(component.type);
  const hasChildren = component.children && component.children.length > 0;
  const hasButtonChildren = hasChildren && component.children.some((c: any) => c.type === 'button' || c.type === 'input');

  const tintOptions = ['auto', 'none', 'secondary', 'primary'] as const;
  const sizeOptions = ['mini', 'sm', 'md', 'lg', 'xl'] as const;
  const radiusModes = ['fixed', 'concentric', 'capsule'] as const;
  const scrollOptions = ['none', 'soft', 'hard'] as const;

  const radiusDescriptions: Record<string, string> = {
    fixed: 'Manual radius value',
    concentric: 'Inner = parent − padding',
    capsule: 'Radius = half height (pill shape)',
  };

  return (
    <div className="px-3 pb-3 space-y-3">
      <p className="text-[10px] text-gray-500">Apple Human Interface Guidelines</p>

      {/* Control Size — 5-tier */}
      {(isInteractive || hasButtonChildren) && (
        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">Control Size{hasButtonChildren && !isInteractive ? ' (children)' : ''}</label>
          <div className="flex gap-1">
            {sizeOptions.map(s => (
              <button key={s} onClick={() => updateComponent(component.id, { controlSize: s })}
                className={`flex-1 px-1.5 py-1 rounded text-[10px] font-medium transition-all ${
                  (component.controlSize || 'md') === s
                    ? 'bg-[#2296FF] text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Tint Prominence — buttons only */}
      {(isButton || hasButtonChildren) && (
        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">Tint Prominence{hasButtonChildren && !isButton ? ' (children)' : ''}</label>
          <div className="flex gap-1">
            {tintOptions.map(t => (
              <button key={t} onClick={() => updateComponent(component.id, { tintProminence: t })}
                className={`flex-1 px-1.5 py-1 rounded text-[10px] font-medium transition-all capitalize ${
                  (component.tintProminence || 'auto') === t
                    ? 'bg-[#2296FF] text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}>{t}</button>
            ))}
          </div>
          <p className="text-[9px] text-gray-600 mt-1">Controls button emphasis level (Apple HIG)</p>
        </div>
      )}

      {/* Corner Radius Mode */}
      <div>
        <label className="text-[10px] text-gray-500 mb-1 block">Corner Radius Mode</label>
        <div className="flex gap-1">
          {radiusModes.map(m => (
            <button key={m} onClick={() => updateComponent(component.id, { cornerRadiusMode: m })}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-medium transition-all capitalize ${
                (component.cornerRadiusMode || 'fixed') === m
                  ? 'bg-[#2296FF] text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}>{m}</button>
          ))}
        </div>
        <p className="text-[9px] text-gray-600 mt-1">{radiusDescriptions[component.cornerRadiusMode || 'fixed']}</p>
      </div>

      {/* Glass Effect Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-500">Liquid Glass</label>
        <button
          onClick={() => updateComponent(component.id, { glassEffect: !component.glassEffect })}
          className={`w-8 h-4 rounded-full transition-colors relative ${
            component.glassEffect ? 'bg-[#2296FF]' : 'bg-gray-700'
          }`}
        >
          <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
            component.glassEffect ? 'translate-x-4' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Scroll Edge Effect */}
      <div>
        <label className="text-[10px] text-gray-500 mb-1 block">Scroll Edge Effect</label>
        <div className="flex gap-1">
          {scrollOptions.map(s => (
            <button key={s} onClick={() => updateComponent(component.id, { scrollEdgeEffect: s })}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-medium transition-all capitalize ${
                (component.scrollEdgeEffect || 'none') === s
                  ? 'bg-[#2296FF] text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* AI Generated Badge indicator */}
      {component.aiGenerated && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-purple-500/10 border border-purple-500/20">
          <span className="text-purple-400 text-[10px]">✦</span>
          <span className="text-[10px] text-purple-300">AI-generated component</span>
        </div>
      )}
    </div>
  );
}
