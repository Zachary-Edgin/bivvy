'use client';

import { 
  MousePointer2, Square, Type, Image as ImageIcon, Circle,
  Minus, ArrowRight, Undo2, Redo2, Layers, Copy, Trash2,
  MessageSquare, Crosshair, Sun, Moon, Smartphone, Globe, Apple, TabletSmartphone,
  Grid3X3, Magnet, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store/componentStore';

export function CanvasToolbar() {
  const { 
    activeTool, setActiveTool, 
    selectedId, selectedIds,
    duplicateComponent, deleteSelected,
    undo, redo, canUndo, canRedo,
    showAnnotations, toggleShowAnnotations,
    inspectMode, toggleInspectMode,
    showResponsivePreview, toggleResponsivePreview,
    showGrid, toggleGrid, snapToGrid, toggleSnapToGrid,
    activeTheme, swapComponentTheme,
    zoom, setZoom, zoomToFit,
    designSystem, updateDesignSystem,
  } = useStore();
  const [showMoreTools, setShowMoreTools] = useState(false);

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)', shortcut: 'v' },
    { id: 'divider1' },
    { id: 'rectangle', icon: Square, label: 'Rectangle (R)', shortcut: 'r' },
    { id: 'circle', icon: Circle, label: 'Circle (O)', shortcut: 'o' },
    { id: 'line', icon: Minus, label: 'Line (L)', shortcut: 'l' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow (A)', shortcut: 'a' },
    { id: 'divider2' },
    { id: 'text', icon: Type, label: 'Text (T)', shortcut: 't' },
    { id: 'image', icon: ImageIcon, label: 'Image (I)', shortcut: 'i' },
  ];

  return (
    <div className="flex items-center bg-[#121212] border-t border-gray-800 px-2 gap-1 pb-3 pt-1 flex-shrink-0" data-tour="toolbar">
      {/* Drawing Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => {
          if (tool.id.startsWith('divider')) {
            return <div key={tool.id} className="w-px h-6 bg-gray-700/60 mx-0.5" />;
          }
          const Icon = tool.icon!;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`
                p-2 rounded-lg transition-all duration-150 outline-none
                ${activeTool === tool.id
                  ? 'bg-[#2296FF] text-white shadow-md shadow-[#2296FF]/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
              title={tool.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      <div className="w-px h-6 bg-gray-700/60 mx-1" />

      {/* Undo / Redo */}
      <button
        onClick={() => undo()}
        disabled={!canUndo()}
        className={`p-2 rounded-lg transition-all duration-150 outline-none ${
          canUndo() ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 opacity-40 cursor-not-allowed'
        }`}
        title="Undo (⌘Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => redo()}
        disabled={!canRedo()}
        className={`p-2 rounded-lg transition-all duration-150 outline-none ${
          canRedo() ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 opacity-40 cursor-not-allowed'
        }`}
        title="Redo (⌘⇧Z)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-700/60 mx-1" />

      {/* More Tools */}
      <div className="relative">
        <button
          onClick={() => setShowMoreTools(!showMoreTools)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150 outline-none"
          title="More Tools"
        >
          <Layers className="w-4 h-4" />
        </button>

        {showMoreTools && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMoreTools(false)} />
            <div className="absolute bottom-full mb-2 left-0 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-800/50 p-1.5 min-w-[180px] z-50">
              <button
                onClick={() => {
                  if (selectedId) duplicateComponent(selectedId);
                  setShowMoreTools(false);
                }}
                disabled={!selectedId}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate</span>
                <span className="ml-auto text-xs text-gray-500">⌘D</span>
              </button>
              <button
                onClick={() => {
                  deleteSelected();
                  setShowMoreTools(false);
                }}
                disabled={selectedIds.length === 0}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
                <span className="ml-auto text-xs text-gray-500">⌫</span>
              </button>
              <div className="h-px bg-gray-700 my-1" />
              <button
                onClick={() => {
                  toggleShowAnnotations();
                  setShowMoreTools(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{showAnnotations ? 'Hide' : 'Show'} Notes</span>
              </button>
              <button
                onClick={() => {
                  toggleInspectMode();
                  setShowMoreTools(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs ${inspectMode ? 'text-[#FF6B6B] bg-[#FF6B6B]/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <Crosshair className="w-4 h-4" />
                <span>{inspectMode ? 'Exit' : 'Enter'} Inspect</span>
              </button>
              <div className="h-px bg-gray-700 my-1" />
              <button
                onClick={() => { toggleGrid(); setShowMoreTools(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs ${showGrid ? 'text-gray-300' : 'text-gray-500'} hover:text-white hover:bg-gray-800`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>{showGrid ? 'Hide' : 'Show'} Grid</span>
              </button>
              <button
                onClick={() => { toggleSnapToGrid(); setShowMoreTools(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs ${snapToGrid ? 'text-[#2296FF] bg-[#2296FF]/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <Magnet className="w-4 h-4" />
                <span>Snap to Grid {snapToGrid ? 'On' : 'Off'}</span>
              </button>
              <div className="h-px bg-gray-700 my-1" />
              <button
                onClick={() => {
                  toggleResponsivePreview();
                  setShowMoreTools(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs ${showResponsivePreview ? 'text-purple-400 bg-purple-500/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Responsive Preview</span>
              </button>
              <button
                onClick={() => {
                  swapComponentTheme();
                  setShowMoreTools(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-xs"
              >
                {activeTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>Swap to {activeTheme === 'dark' ? 'Light' : 'Dark'} Theme</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Status Pills */}
      {(snapToGrid || inspectMode) && (
        <div className="flex items-center gap-1 ml-1">
          {snapToGrid && (
            <div className="px-2 py-0.5 rounded-full bg-[#2296FF]/15 border border-[#2296FF]/25 text-[9px] text-[#2296FF] font-medium">
              Snap
            </div>
          )}
          {inspectMode && (
            <div className="px-2 py-0.5 rounded-full bg-[#FF6B6B]/15 border border-[#FF6B6B]/25 text-[9px] text-[#FF6B6B] font-medium">
              Inspect
            </div>
          )}
        </div>
      )}

      {/* Platform Selector */}
      <div className="flex items-center gap-0.5 ml-1 bg-gray-900/80 rounded-lg p-0.5 border border-gray-800/50">
        {([
          { key: 'web' as const, icon: Globe, label: 'Web' },
          { key: 'ios' as const, icon: Apple, label: 'iOS' },
          { key: 'android' as const, icon: TabletSmartphone, label: 'Android' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => updateDesignSystem({ platform: key })}
            className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all ${
              designSystem.platform === key
                ? 'bg-[#2296FF]/20 text-[#2296FF] border border-[#2296FF]/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 border border-transparent'
            }`}
            title={`Target: ${label}`}
          >
            <Icon className="w-3 h-3" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zoom Controls (right side) */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Zoom Out (⌘−)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="px-1.5 text-[11px] text-gray-400 font-medium min-w-[40px] text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Zoom In (⌘+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            const vw = window.innerWidth - 576;
            const vh = window.innerHeight - 60;
            zoomToFit(vw, vh);
          }}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
