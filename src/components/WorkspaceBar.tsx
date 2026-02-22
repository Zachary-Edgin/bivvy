'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/componentStore';
import { Plus, X, Copy, Pencil, Code, Smartphone, Tablet, Monitor, Home } from 'lucide-react';

export function WorkspaceBar({ onExport, onHome }: { onExport?: () => void; onHome?: () => void }) {
  const {
    workspaces, activeWorkspaceId,
    addWorkspace, removeWorkspace, switchWorkspace, renameWorkspace, duplicateWorkspace,
    devicePreview, setDevicePreview,
    canvasBg, setCanvasBg,
  } = useStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu]);

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
    setContextMenu(null);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      renameWorkspace(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="h-10 flex items-center bg-[#121212] border-b border-gray-800 px-1 gap-1">

      {/* ── Home button ── */}
      {onHome && (
        <button
          onClick={onHome}
          className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors flex-shrink-0"
          title="Back to Home"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ── Workspace tabs (scrollable) ── */}
      <div ref={scrollRef} className="flex-1 flex items-center gap-0.5 overflow-x-auto min-w-0 scrollbar-none">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          return (
            <div
              key={ws.id}
              onClick={() => switchWorkspace(ws.id)}
              onContextMenu={(e) => handleContextMenu(e, ws.id)}
              onDoubleClick={() => startRename(ws.id, ws.name)}
              className={`
                group flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-medium cursor-pointer
                transition-all duration-150 flex-shrink-0 max-w-[180px]
                ${isActive
                  ? 'bg-gray-800 text-white border border-gray-700'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-[#2296FF]' : 'bg-gray-600'}`} />
              {editingId === ws.id ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="bg-transparent text-white text-[11px] font-medium outline-none w-full min-w-[40px]"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{ws.name}</span>
              )}
              {workspaces.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeWorkspace(ws.id); }}
                  className={`
                    flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all duration-100
                    ${isActive
                      ? 'text-gray-500 hover:text-white hover:bg-gray-700'
                      : 'opacity-0 group-hover:opacity-100 text-gray-600 hover:text-white hover:bg-gray-700'
                    }
                  `}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={() => addWorkspace()}
          className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800/50 transition-colors"
          title="New workspace"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="w-px h-5 bg-gray-700/50 mx-1" />

      {/* ── Device / Canvas / Export ── */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={() => setDevicePreview(devicePreview === 'phone' ? null : 'phone')}
          className={`p-1.5 rounded-md transition-colors ${devicePreview === 'phone' ? 'bg-[#2296FF]/20 text-[#2296FF]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="Phone (375×812)"
        >
          <Smartphone className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setDevicePreview(devicePreview === 'tablet' ? null : 'tablet')}
          className={`p-1.5 rounded-md transition-colors ${devicePreview === 'tablet' ? 'bg-[#2296FF]/20 text-[#2296FF]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="Tablet (768×1024)"
        >
          <Tablet className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setDevicePreview(devicePreview === 'desktop' ? null : 'desktop')}
          className={`p-1.5 rounded-md transition-colors ${devicePreview === 'desktop' ? 'bg-[#2296FF]/20 text-[#2296FF]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="Desktop (1440×900)"
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-gray-700/50 mx-0.5" />
        <button
          onClick={() => setCanvasBg('dark')}
          className={`p-1.5 rounded-md transition-colors ${canvasBg === 'dark' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="Dark canvas"
        >
          <div className="w-3.5 h-3.5 rounded-sm bg-gray-900 border border-gray-600" />
        </button>
        <button
          onClick={() => setCanvasBg('light')}
          className={`p-1.5 rounded-md transition-colors ${canvasBg === 'light' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="Light canvas"
        >
          <div className="w-3.5 h-3.5 rounded-sm bg-gray-200 border border-gray-400" />
        </button>
        <div className="w-px h-4 bg-gray-700/50 mx-0.5" />
        <button
          onClick={onExport}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Export Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { startRename(contextMenu.id, workspaces.find(ws => ws.id === contextMenu.id)?.name || ''); }}
            className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 flex items-center gap-2 text-left"
          >
            <Pencil className="w-3 h-3" /> Rename
          </button>
          <button
            onClick={() => { duplicateWorkspace(contextMenu.id); setContextMenu(null); }}
            className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 flex items-center gap-2 text-left"
          >
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          {workspaces.length > 1 && (
            <>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() => { removeWorkspace(contextMenu.id); setContextMenu(null); }}
                className="w-full px-3 py-1.5 text-xs text-red-400 hover:bg-gray-800 flex items-center gap-2 text-left"
              >
                <X className="w-3 h-3" /> Close
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
}
