'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/componentStore';
import { generateFullHTML } from '@/components/ExportPanel';
import { loadFontsFromComponents } from '@/utils/fontLoader';
import logoSvg from '@/assets/logo-bivvy.svg';
import {
  Menu, Undo2, Redo2, Copy, Clipboard, Trash2, Scissors,
  ZoomIn, ZoomOut, Grid3x3, Eye, Ruler, Download,
  Settings, HelpCircle, Keyboard, Info, ChevronRight,
  FilePlus, FolderOpen, Save, FileCode, FileImage,
  AlertTriangle, Check, X, Layers, Package, Command
} from 'lucide-react';
// ===== ABOUT MODAL =====
function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-2xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#2296FF] to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">B</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Bivvy</h2>
          <p className="text-sm text-gray-400 mb-4">Version 27</p>
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
            AI-powered component design tool. Create, iterate, and export UI components with natural language and visual tools.
          </p>
          <div className="space-y-2 text-xs text-gray-500">
            <p>Built with Next.js · Zustand · Tailwind CSS</p>
            <p>Icons by Lucide</p>
            <p className="pt-2 text-gray-600">© 2026 Bivvy</p>
          </div>
        </div>
        <div className="border-t border-gray-700/50 px-6 py-4 flex justify-center">
          <button onClick={onClose} className="px-6 py-2 bg-[#2296FF] hover:bg-[#1a7fe0] text-white text-sm font-medium rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== PREFERENCES MODAL =====
function PreferencesModal({ onClose }: { onClose: () => void }) {
  const { showGrid, toggleGrid, showRulers, toggleRulers, snapToGrid, toggleSnapToGrid, activeTheme, swapComponentTheme } = useStore();

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={onChange}
        className={`relative w-10 h-[22px] rounded-full transition-colors ${checked ? 'bg-[#2296FF]' : 'bg-gray-600'}`}
      >
        <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full transition-all shadow-sm ${checked ? 'left-[22px]' : 'left-[3px]'}`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-2xl w-[440px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[#2296FF]" />
            <h2 className="text-lg font-semibold text-white">Preferences</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Canvas</h3>
            <div className="space-y-1">
              <Toggle checked={showGrid} onChange={toggleGrid} label="Show grid" />
              <Toggle checked={showRulers} onChange={toggleRulers} label="Show rulers" />
              <Toggle checked={snapToGrid} onChange={toggleSnapToGrid} label="Snap to grid" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Theme</h3>
            <div className="flex gap-2">
              <button onClick={() => { if (activeTheme === 'light') swapComponentTheme(); }} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTheme === 'dark' ? 'bg-[#2296FF] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                Dark
              </button>
              <button onClick={() => { if (activeTheme === 'dark') swapComponentTheme(); }} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTheme === 'light' ? 'bg-[#2296FF] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                Light
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700/50 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-[#2296FF] hover:bg-[#1a7fe0] text-white text-sm font-medium rounded-lg transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== CONFIRM DIALOG =====
function ConfirmDialog({ title, message, onConfirm, onCancel, danger }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-2xl w-[380px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-500/20' : 'bg-[#2296FF]/20'}`}>
              <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-[#2296FF]'}`} />
            </div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-400 ml-[52px]">{message}</p>
        </div>
        <div className="border-t border-gray-700/50 px-6 py-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2296FF] hover:bg-[#1a7fe0]'}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ===== TOAST =====
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error' | 'info'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  const colors: Record<string, string> = {
    success: 'bg-green-500/20 border-green-500/50 text-green-300',
    error: 'bg-red-500/20 border-red-500/50 text-red-300',
    info: 'bg-[#2296FF]/20 border-[#2296FF]/50 text-blue-300',
  };

  return (
    <div className={`fixed top-4 right-4 z-[90] px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl ${colors[type]}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        {type === 'success' && <Check className="w-4 h-4" />}
        {type === 'error' && <X className="w-4 h-4" />}
        {type === 'info' && <Info className="w-4 h-4" />}
        {message}
      </div>
    </div>
  );
}

// ===== MAIN BIVVY MENU =====
export function BivvyMenu({ onShowShortcuts, onShowLibrary, onShowStarterKits, onShowCommandPalette, compact }: { onShowShortcuts?: () => void; onShowLibrary?: () => void; onShowStarterKits?: () => void; onShowCommandPalette?: () => void; compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<'shortcuts' | 'about' | 'preferences' | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void; danger?: boolean } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    zoom, setZoom, toggleGrid, showGrid, showRulers, toggleRulers,
    deleteSelected, selectedId, selectedIds, duplicateComponent, clearSelection,
    selectAll, components, clearComponents,
    undo, redo, canUndo, canRedo,
    copySelected, pasteClipboard, cutSelected, clipboard,
    exportJSON, importJSON,
  } = useStore();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type });
  const closeMenu = () => { setIsOpen(false); setActiveSubmenu(null); };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) closeMenu(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // ===== GLOBAL KEYBOARD SHORTCUTS (BivvyMenu-only — Canvas handles undo/redo/copy/paste/cut/selectAll) =====
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 's' && !e.shiftKey) { e.preventDefault(); handleSave(); }
      if (mod && e.key === 'e' && e.shiftKey) { e.preventDefault(); handleExportHTML(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ===== FILE OPERATIONS =====
  const handleNewFile = () => {
    if (components.length === 0) { showToast('Canvas is already empty', 'info'); closeMenu(); return; }
    setConfirmAction({
      title: 'New File', message: 'Clear all components? Unsaved changes will be lost.', danger: true,
      onConfirm: () => { clearComponents(); showToast('Canvas cleared'); setConfirmAction(null); },
    });
    closeMenu();
  };

  const handleSave = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bivvy-project-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Project saved');
    closeMenu();
  };

  const handleOpen = () => { fileInputRef.current?.click(); closeMenu(); };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = importJSON(reader.result as string);
      if (success) {
        // Load any custom Google Fonts referenced by imported components
        loadFontsFromComponents(useStore.getState().components);
      }
      showToast(success ? `Loaded ${file.name}` : 'Invalid project file', success ? 'success' : 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportHTML = () => {
    const html = generateFullHTML(useStore.getState().components);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bivvy-export-${new Date().toISOString().slice(0, 10)}.html`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Exported as HTML'); closeMenu();
  };

  const handleExportPNG = async () => {
    const canvasEl = document.querySelector('[data-bivvy-canvas]') as HTMLElement;
    if (!canvasEl) { showToast('Add a data-bivvy-canvas attribute to canvas', 'error'); closeMenu(); return; }
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(canvasEl, { backgroundColor: '#0d0d0d', scale: 2 });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = `bivvy-export-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      showToast('Exported as PNG');
    } catch {
      showToast('PNG export requires html2canvas — using SVG fallback', 'info');
      handleExportSVG();
    }
    closeMenu();
  };

  const handleExportSVG = () => {
    const state = useStore.getState();
    const svgElements = state.components.map(comp => {
      const s = comp.styles;
      const x = comp.position.x, y = comp.position.y, w = comp.size.width, h = comp.size.height;
      if (s.borderRadius === '50%') {
        return `  <ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${s.backgroundColor || '#374151'}" />`;
      }
      const rx = parseInt(s.borderRadius) || 0;
      let inner = '';
      if (comp.content) {
        inner = `<text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="central" fill="${s.color || '#fff'}" font-size="${parseInt(s.fontSize) || 14}">${comp.content}</text>`;
      }
      return `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${s.backgroundColor || '#374151'}" />${inner ? '\n  ' + inner : ''}`;
    }).join('\n');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">\n  <rect width="1280" height="720" fill="#0d0d0d"/>\n${svgElements}\n</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `bivvy-export-${new Date().toISOString().slice(0, 10)}.svg`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Exported as SVG'); closeMenu();
  };

  // ===== MENU ITEM COMPONENTS =====
  const MenuItem = ({ icon: Icon, label, shortcut, onClick, disabled, danger, checked }: {
    icon?: any; label: string; shortcut?: string; onClick?: () => void; disabled?: boolean; danger?: boolean; checked?: boolean;
  }) => (
    <button
      className={`w-full flex items-center gap-3 px-3 py-1.5 text-left text-sm transition-colors rounded ${
        disabled ? 'text-gray-600 cursor-not-allowed' : danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:bg-white/5'
      }`}
      onClick={() => { if (!disabled) onClick?.(); }}
      disabled={disabled}
    >
      {checked !== undefined ? (
        <div className="w-4 h-4 flex items-center justify-center">
          {checked && <Check className="w-3.5 h-3.5 text-[#2296FF]" />}
        </div>
      ) : Icon ? <Icon className="w-4 h-4 flex-shrink-0" /> : <div className="w-4" />}
      <span className="flex-1">{label}</span>
      {shortcut && <span className="text-xs text-gray-500 ml-2">{shortcut}</span>}
    </button>
  );

  const SubMenuItem = ({ label, submenuId, icon: Icon }: { label: string; submenuId: string; icon?: any }) => (
    <button
      className={`w-full flex items-center gap-3 px-3 py-1.5 text-left text-sm transition-colors rounded ${
        activeSubmenu === submenuId ? 'bg-white/5 text-white' : 'text-gray-300 hover:bg-white/5'
      }`}
      onMouseEnter={() => setActiveSubmenu(submenuId)}
    >
      {Icon ? <Icon className="w-4 h-4 flex-shrink-0" /> : <div className="w-4" />}
      <span className="flex-1">{label}</span>
      <ChevronRight className="w-3 h-3 text-gray-500" />
    </button>
  );

  const Divider = () => <div className="border-t border-gray-700/50 my-1" />;

  const hasSelection = selectedIds.length > 0;
  const hasClipboard = clipboard.length > 0;

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />

      <div ref={menuRef} className="relative flex items-center gap-1">
        {/* Bivvy Logo — hidden when sidebar collapsed */}
        {!compact && (
          <div className="flex items-center px-2">
            <img src={logoSvg} alt="Bivvy" className="h-4" />
          </div>
        )}

        {/* Hamburger */}
        <button
          onClick={() => { setIsOpen(!isOpen); setActiveSubmenu(null); }}
          className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-[#2296FF] text-white' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* ===== DROPDOWN ===== */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-gray-700/80 rounded-lg shadow-2xl shadow-black/60 py-1 z-[70]"
            onMouseLeave={() => setActiveSubmenu(null)}>

            <SubMenuItem label="File" submenuId="file" icon={FolderOpen} />
            <SubMenuItem label="Edit" submenuId="edit" icon={Clipboard} />
            <SubMenuItem label="View" submenuId="view" icon={Eye} />
            <Divider />
            <MenuItem icon={Layers} label="Component Library" onClick={() => { closeMenu(); onShowLibrary?.(); }} />
            <MenuItem icon={Package} label="Starter UI Kits" onClick={() => { closeMenu(); onShowStarterKits?.(); }} />
            <MenuItem icon={Command} label="Command Palette" shortcut="⌘K" onClick={() => { closeMenu(); onShowCommandPalette?.(); }} />
            <Divider />
            <MenuItem icon={Settings} label="Preferences..." onClick={() => { closeMenu(); setShowModal('preferences'); }} />
            <MenuItem icon={Keyboard} label="Keyboard shortcuts" shortcut="?" onClick={() => { closeMenu(); onShowShortcuts?.(); }} />
            <Divider />
            <MenuItem icon={HelpCircle} label="Help & shortcuts" shortcut="?" onClick={() => { closeMenu(); onShowShortcuts?.(); }} />
            <MenuItem icon={Info} label="About Bivvy" onClick={() => { closeMenu(); setShowModal('about'); }} />

            {/* FILE SUBMENU */}
            {activeSubmenu === 'file' && (
              <div className="absolute left-full top-0 ml-1 w-56 bg-[#1a1a1a] border border-gray-700/80 rounded-lg shadow-2xl shadow-black/60 py-1">
                <MenuItem icon={FilePlus} label="New file" shortcut="⌘N" onClick={handleNewFile} />
                <MenuItem icon={FolderOpen} label="Open..." shortcut="⌘O" onClick={handleOpen} />
                <Divider />
                <MenuItem icon={Save} label="Save project" shortcut="⌘S" onClick={handleSave} />
                <Divider />
                <MenuItem icon={FileCode} label="Export as HTML" shortcut="⌘⇧E" onClick={handleExportHTML} />
                <MenuItem icon={FileImage} label="Export as PNG" onClick={handleExportPNG} />
                <MenuItem icon={Download} label="Export as SVG" onClick={handleExportSVG} />
              </div>
            )}

            {/* EDIT SUBMENU */}
            {activeSubmenu === 'edit' && (
              <div className="absolute left-full top-0 mt-7 ml-1 w-56 bg-[#1a1a1a] border border-gray-700/80 rounded-lg shadow-2xl shadow-black/60 py-1">
                <MenuItem icon={Undo2} label="Undo" shortcut="⌘Z" onClick={() => { undo(); closeMenu(); }} disabled={!canUndo()} />
                <MenuItem icon={Redo2} label="Redo" shortcut="⌘⇧Z" onClick={() => { redo(); closeMenu(); }} disabled={!canRedo()} />
                <Divider />
                <MenuItem icon={Copy} label="Copy" shortcut="⌘C" onClick={() => { copySelected(); closeMenu(); showToast('Copied'); }} disabled={!hasSelection} />
                <MenuItem icon={Scissors} label="Cut" shortcut="⌘X" onClick={() => { cutSelected(); closeMenu(); showToast('Cut'); }} disabled={!hasSelection} />
                <MenuItem icon={Clipboard} label="Paste" shortcut="⌘V" onClick={() => { pasteClipboard(); closeMenu(); }} disabled={!hasClipboard} />
                <Divider />
                <MenuItem icon={Copy} label="Duplicate" shortcut="⌘D" onClick={() => { if (selectedId) duplicateComponent(selectedId); closeMenu(); }} disabled={!selectedId} />
                <MenuItem icon={Trash2} label="Delete" shortcut="⌫" onClick={() => { deleteSelected(); closeMenu(); }} disabled={!hasSelection} danger />
                <Divider />
                <MenuItem label="Select all" shortcut="⌘A" onClick={() => { selectAll(); closeMenu(); }} disabled={components.length === 0} />
                <MenuItem label="Deselect all" shortcut="Esc" onClick={() => { clearSelection(); closeMenu(); }} />
              </div>
            )}

            {/* VIEW SUBMENU */}
            {activeSubmenu === 'view' && (
              <div className="absolute left-full top-0 mt-14 ml-1 w-56 bg-[#1a1a1a] border border-gray-700/80 rounded-lg shadow-2xl shadow-black/60 py-1">
                <MenuItem icon={ZoomIn} label="Zoom in" shortcut="⌘+" onClick={() => { setZoom(Math.min(3, zoom + 0.1)); closeMenu(); }} />
                <MenuItem icon={ZoomOut} label="Zoom out" shortcut="⌘-" onClick={() => { setZoom(Math.max(0.1, zoom - 0.1)); closeMenu(); }} />
                <MenuItem label="Zoom to 100%" shortcut="⌘0" onClick={() => { setZoom(1); closeMenu(); }} />
                <MenuItem label="Zoom to 50%" onClick={() => { setZoom(0.5); closeMenu(); }} />
                <MenuItem label="Zoom to 200%" onClick={() => { setZoom(2); closeMenu(); }} />
                <Divider />
                <MenuItem icon={Grid3x3} label="Show grid" checked={showGrid} onClick={() => { toggleGrid(); closeMenu(); }} />
                <MenuItem icon={Ruler} label="Show rulers" checked={showRulers} onClick={() => { toggleRulers(); closeMenu(); }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* shortcuts modal handled by page-level KeyboardShortcuts component */}
      {showModal === 'about' && <AboutModal onClose={() => setShowModal(null)} />}
      {showModal === 'preferences' && <PreferencesModal onClose={() => setShowModal(null)} />}
      {confirmAction && <ConfirmDialog title={confirmAction.title} message={confirmAction.message} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} danger={confirmAction.danger} />}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
