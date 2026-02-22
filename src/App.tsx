

import { useState, useEffect, useCallback, useRef, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { apiUrl } from '@/utils/apiBase';
import { BivvyMenu } from '@/components/BivvyMenu';
import { LayerTree } from '@/components/LayerTree';
import { LibraryPanel } from '@/components/LibraryPanel';
import { Canvas } from '@/components/Canvas';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { CanvasToolbar } from '@/components/CanvasToolbar';
import { AIVariationGenerator } from '@/components/AIVariationGenerator';
import { WorkspaceBar } from '@/components/WorkspaceBar';
import { ToastContainer } from '@/components/Toast';
import { SelectionBreadcrumb } from '@/components/SelectionBreadcrumb';
import { ExportPanel } from '@/components/ExportPanel';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { OnboardingTour, WelcomeScreen } from '@/components/OnboardingTour';
import { DesignTokensPanel } from '@/components/DesignTokensPanel';
import { ConstraintValidationPanel } from '@/components/ConstraintValidationPanel';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { InspectOverlay } from '@/components/InspectOverlay';
import { ResponsivePreview } from '@/components/ResponsivePreview';
import { CommandPalette } from '@/components/CommandPalette';
import { StarterKitsPanel } from '@/components/StarterKitsPanel';
import { ModeBar, PlanModePlaceholder, ImplementModePlaceholder } from '@/components/ModeBar';
import type { AppMode } from '@/components/ModeBar';
import { HomeScreen } from '@/components/HomeScreen';
import { SearchModal } from '@/components/SearchModal';
import { useStore } from '@/store/componentStore';
import { X, Layers, ChevronLeft, ChevronRight, MousePointer, Hand, Ban, Sun, Target, Loader2, AlertTriangle, Wand2, Sparkles } from 'lucide-react';
import { loadFontsFromComponents } from '@/utils/fontLoader';

// ═══════════════════════════════════════
// ERROR BOUNDARY
// ═══════════════════════════════════════
interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackLabel: string;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Bivvy] ${this.props.fallbackLabel} crashed:`, error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 bg-[#121212]">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-gray-300 text-xs font-medium mb-1">{this.props.fallbackLabel} encountered an error</p>
          <p className="text-gray-500 text-[10px] mb-3 text-center max-w-[200px]">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 bg-[#2296FF] text-white text-[11px] rounded-md hover:bg-[#2296FF]/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════
// RESPONSIVE PREVIEW OVERLAY
// ═══════════════════════════════════════
function ResponsivePreviewOverlay() {
  const show = useStore(s => s.showResponsivePreview);
  const toggle = useStore(s => s.toggleResponsivePreview);
  if (!show) return null;
  return <ResponsivePreview onClose={toggle} />;
}

// ═══════════════════════════════════════
// THEME PREVIEW BADGE
// ═══════════════════════════════════════
function ThemePreviewBadge() {
  const activeTheme = useStore(s => s.activeTheme);
  const swapComponentTheme = useStore(s => s.swapComponentTheme);
  if (activeTheme === 'dark') return null;
  return (
    <div className="absolute top-3 left-3 z-[45] flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1 backdrop-blur-sm">
      <Sun className="w-3 h-3 text-amber-400" />
      <span className="text-[10px] font-medium text-amber-400">Light Theme</span>
      <button onClick={swapComponentTheme} className="ml-1 text-amber-400/60 hover:text-amber-400 transition-colors text-[9px] underline">
        Switch Back
      </button>
    </div>
  );
}

// ═══════════════════════════════════════
// STATE PREVIEW BAR (floats on canvas)
// ═══════════════════════════════════════
function StatePreviewBar() {
  const previewState = useStore(s => s.previewState);
  const setPreviewState = useStore(s => s.setPreviewState);
  const components = useStore(s => s.components);

  // Check if any component has state overrides
  const hasAnyStates = components.some(c =>
    (c.hoverStyles && Object.keys(c.hoverStyles).length > 0) ||
    (c.activeStyles && Object.keys(c.activeStyles).length > 0) ||
    (c.disabledStyles && Object.keys(c.disabledStyles).length > 0) ||
    (c.focusedStyles && Object.keys(c.focusedStyles).length > 0) ||
    (c.loadingStyles && Object.keys(c.loadingStyles).length > 0) ||
    c.children?.some(ch =>
      (ch.hoverStyles && Object.keys(ch.hoverStyles).length > 0) ||
      (ch.activeStyles && Object.keys(ch.activeStyles).length > 0) ||
      (ch.disabledStyles && Object.keys(ch.disabledStyles).length > 0) ||
      (ch.focusedStyles && Object.keys(ch.focusedStyles).length > 0) ||
      (ch.loadingStyles && Object.keys(ch.loadingStyles).length > 0)
    )
  );

  if (!hasAnyStates && previewState === 'normal') return null;

  const states = [
    { key: 'normal' as const, label: 'Normal', icon: null },
    { key: 'hover' as const, label: 'Hover', icon: MousePointer },
    { key: 'active' as const, label: 'Active', icon: Hand },
    { key: 'focused' as const, label: 'Focus', icon: Target },
    { key: 'disabled' as const, label: 'Disabled', icon: Ban },
    { key: 'loading' as const, label: 'Loading', icon: Loader2 },
  ];

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[45] flex items-center gap-0.5 bg-[#1a1a2e]/95 border border-gray-700/60 rounded-lg p-0.5 shadow-lg backdrop-blur-sm">
      {states.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setPreviewState(key)}
          className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all flex items-center gap-1 ${
            previewState === key
              ? key === 'normal' ? 'bg-gray-700 text-white' : 'bg-[#2296FF] text-white'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          {Icon && <Icon className="w-2.5 h-2.5" />}
          {label}
        </button>
      ))}
      {previewState !== 'normal' && (
        <div className="ml-1 pl-1.5 border-l border-gray-700/50">
          <span className="text-[10px] text-[#2296FF] font-medium">PREVIEW</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// HORIZONTAL RESIZE HANDLE (left/right)
// ═══════════════════════════════════════
function HResizeHandle({ side, onResize }: { side: 'left' | 'right'; onResize: (delta: number) => void }) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const d = ev.clientX - lastX.current;
      lastX.current = ev.clientX;
      onResize(side === 'left' ? d : -d);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [onResize, side]);

  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute top-0 bottom-0 w-1.5 z-[40] cursor-col-resize group ${side === 'left' ? 'right-0' : 'left-0'}`}
    >
      <div className={`absolute top-0 bottom-0 w-[3px] transition-colors duration-150 group-hover:bg-[#2296FF]/50 group-active:bg-[#2296FF] ${side === 'left' ? 'right-0' : 'left-0'}`} />
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL TABS
// ═══════════════════════════════════════
function RightPanelTabs() {
  const [tab, setTab] = useState<'design' | 'tokens' | 'validate' | 'a11y'>('design');
  const tokensEnabled = useStore(s => s.designSystem.tokens.enabled || s.designSystem.guidelines.enabled);
  return (
    <>
      <div className="flex h-10 border-b border-gray-800 flex-shrink-0">
        <button onClick={() => setTab('design')} className={`flex-1 px-2 text-[10px] font-medium transition-colors ${tab === 'design' ? 'text-white border-b-2 border-[#2296FF]' : 'text-gray-500 hover:text-gray-300'}`}>Design</button>
        <button onClick={() => setTab('tokens')} className={`flex-1 px-2 text-[10px] font-medium transition-colors flex items-center justify-center gap-1 ${tab === 'tokens' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}>
          Tokens {tokensEnabled && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
        </button>
        <button onClick={() => setTab('validate')} className={`flex-1 px-2 text-[10px] font-medium transition-colors flex items-center justify-center gap-1 ${tab === 'validate' ? 'text-white border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}>
          Validate {tokensEnabled && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
        </button>
        <button onClick={() => setTab('a11y')} className={`flex-1 px-2 text-[10px] font-medium transition-colors flex items-center justify-center gap-1 ${tab === 'a11y' ? 'text-white border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
          A11y
        </button>
      </div>
      <div className="flex-1 overflow-y-auto panel-scroll">
        {tab === 'design' ? <PropertiesPanel /> : tab === 'tokens' ? <DesignTokensPanel /> : tab === 'validate' ? <ConstraintValidationPanel /> : <AccessibilityPanel />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// LIBRARY DRAWER
// ═══════════════════════════════════════
function LibraryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-[55] bg-black/30" onClick={onClose} />}
      <div className={`fixed top-10 left-0 bottom-0 w-[320px] z-[56] bg-[#121212] border-r border-gray-700/80 shadow-2xl shadow-black/40 transform transition-transform duration-300 ease-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-11 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-white font-semibold text-xs">Component Library</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-hidden"><LibraryPanel /></div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════
const LEFT_MIN = 220;
const LEFT_MAX = 440;
const LEFT_DEFAULT = 300;
const LEFT_COLLAPSED = 44;
const RIGHT_MIN = 220;
const RIGHT_MAX = 480;
const RIGHT_DEFAULT = 280;

// ═══════════════════════════════════════
// AI CREATE DIALOG — lives here (not in AIVariationGenerator)
// because page.tsx is guaranteed to recompile on every save
// ═══════════════════════════════════════
function AICreateDialog() {
  const showAICreate = useStore(s => s.showAICreate);
  const addComponent = useStore(s => s.addComponent);
  const addToast = useStore(s => s.addToast);
  const [mode, setMode] = useState<'describe' | 'code'>('describe');
  const [prompt, setPrompt] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showAICreate) {
      setTimeout(() => {
        if (mode === 'describe') inputRef.current?.focus();
        else textareaRef.current?.focus();
      }, 150);
    }
  }, [showAICreate, mode]);

  const close = () => {
    useStore.setState({ showAICreate: false });
    setPrompt('');
    setCodeInput('');
    setStatus('');
    setMode('describe');
  };

  const sendToAI = async (message: string) => {
    setIsGenerating(true);
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      setStatus(attempt > 1 ? `Retrying (${attempt}/${maxRetries})...` : (mode === 'code' ? 'Reconstructing from code...' : 'Creating...'));

      try {
        const state = useStore.getState();
        const response = await fetch(apiUrl('/api/ai-update'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            components: state.components,
            selectedId: null,
            editingParentId: null,
            canvasBg: 'dark',
            designTokens: state.designSystem,
            history: [],
          }),
        });

        const text = await response.text();

        // Check for overloaded/rate limit errors and retry
        if (text.includes('overloaded_error') || text.includes('rate_limit') || text.includes('529')) {
          if (attempt < maxRetries) {
            setStatus(`API busy, retrying in ${attempt * 2}s...`);
            await new Promise(r => setTimeout(r, attempt * 2000));
            continue;
          }
          throw new Error('API is overloaded. Please try again in a minute.');
        }

        if (text.includes('__ERROR__:')) {
          throw new Error(text.split('__ERROR__:')[1]?.trim() || 'Stream error');
        }

        let jsonStr = '';
        const fenceMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (fenceMatch) {
          jsonStr = fenceMatch[1];
        } else {
          const first = text.indexOf('{');
          const last = text.lastIndexOf('}');
          if (first !== -1 && last > first) {
            jsonStr = text.substring(first, last + 1);
          }
        }

        if (!jsonStr) {
          console.error('[Bivvy] No JSON in response:', text);
          throw new Error('No JSON found in response');
        }

        const data = JSON.parse(jsonStr);

        if (data.fonts?.length) {
          for (const font of data.fonts) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
        }

        if (data.action === 'create' && data.component) {
          loadFontsFromComponents([data.component]);
          addComponent(data.component);
          addToast(data.message || (mode === 'code' ? 'Component imported from code!' : 'Component created!'), 'success');
          close();
        } else if (data.action === 'create_page' && data.components) {
          loadFontsFromComponents(data.components);
          const { batchAddComponents } = useStore.getState();
          batchAddComponents(data.components);
          addToast(data.message || `Created ${data.components.length} components`, 'success');
          close();
        } else {
          addToast(`AI responded with action "${data.action}" — not handled yet`, 'error');
        }
        break; // Success — exit retry loop
      } catch (error: any) {
        if (attempt === maxRetries) {
          console.error('[Bivvy] AICreateDialog error:', error);
          addToast(`${mode === 'code' ? 'Import' : 'Creation'} failed: ${(error?.message || '').substring(0, 120)}`, 'error');
        }
      }
    }
    setIsGenerating(false);
    setStatus('');
  };

  const handleCreate = () => {
    if (mode === 'describe') {
      if (!prompt.trim()) return;
      sendToAI(prompt.trim());
    } else {
      if (!codeInput.trim()) return;
      // Wrap pasted code with import instructions
      sendToAI(`IMPORT FROM CODE — Reconstruct the following HTML/React/JSX code as Bivvy component(s) on the canvas. Preserve the visual structure, text content, colors, fonts, spacing, and layout as closely as possible. Convert CSS classes to inline styles. Convert React components to nested div/text/button/input elements with appropriate styles. Here is the code:\n\n${codeInput.trim()}`);
    }
  };

  if (!showAICreate) return null;

  const hasInput = mode === 'describe' ? prompt.trim() : codeInput.trim();

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isGenerating) close(); }}
    >
      <div style={{ width: 480, background: '#1a1a2e', border: '1px solid rgba(107,114,128,0.4)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(107,114,128,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles style={{ width: 16, height: 16, color: '#2296FF' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb' }}>Create with AI</span>
          </div>
          <button onClick={close} disabled={isGenerating} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}>
            <X style={{ width: 16, height: 16, color: '#6b7280' }} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(107,114,128,0.2)', padding: '0 20px' }}>
          <button
            onClick={() => !isGenerating && setMode('describe')}
            style={{
              flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, background: 'none', border: 'none',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              color: mode === 'describe' ? '#e5e7eb' : '#6b7280',
              borderBottom: mode === 'describe' ? '2px solid #2296FF' : '2px solid transparent',
            }}
          >
            ✨ Describe
          </button>
          <button
            onClick={() => !isGenerating && setMode('code')}
            style={{
              flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, background: 'none', border: 'none',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              color: mode === 'code' ? '#e5e7eb' : '#6b7280',
              borderBottom: mode === 'code' ? '2px solid #a855f7' : '2px solid transparent',
            }}
          >
            {'</>'} Import Code
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px' }}>
          {mode === 'describe' ? (
            <>
              <label style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 8, display: 'block' }}>Describe what you want to create</label>
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter' && !isGenerating) handleCreate();
                  if (e.key === 'Escape' && !isGenerating) close();
                }}
                placeholder="e.g., A hero banner with navigation, a pricing card, a login form..."
                disabled={isGenerating}
                style={{
                  width: '100%', background: 'rgba(31,41,55,0.6)', border: '1px solid rgba(107,114,128,0.35)',
                  borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#e5e7eb',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </>
          ) : (
            <>
              <label style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 8, display: 'block' }}>Paste HTML, React, or JSX code</label>
              <textarea
                ref={textareaRef}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Escape' && !isGenerating) close();
                }}
                placeholder={'<div class="card p-6 bg-white rounded-xl shadow-lg">\n  <h2 class="text-2xl font-bold">Title</h2>\n  <p class="text-gray-600 mt-2">Description text</p>\n  <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">\n    Click me\n  </button>\n</div>'}
                disabled={isGenerating}
                style={{
                  width: '100%', height: 160, background: 'rgba(31,41,55,0.6)', border: '1px solid rgba(107,114,128,0.35)',
                  borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#e5e7eb',
                  outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'monospace',
                }}
              />
              <p style={{ fontSize: 10, color: '#6b7280', marginTop: 6 }}>
                AI will reconstruct your code as editable Bivvy components, preserving styles and structure.
              </p>
            </>
          )}
          {status && <p style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>{status}</p>}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 20px 16px' }}>
          <button
            onClick={handleCreate}
            disabled={isGenerating || !hasInput}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: isGenerating ? 'rgba(34,150,255,0.4)' : mode === 'code'
                ? 'linear-gradient(90deg, #a855f7, #6366f1)'
                : 'linear-gradient(90deg, #2296FF, #6366f1)',
              color: 'white', fontSize: 13, fontWeight: 600, padding: '12px 0',
              borderRadius: 10, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: !hasInput && !isGenerating ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isGenerating ? (
              <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /><span>{status || 'Working...'}</span></>
            ) : mode === 'code' ? (
              <><Wand2 style={{ width: 16, height: 16 }} /><span>Import as Component</span></>
            ) : (
              <><Wand2 style={{ width: 16, height: 16 }} /><span>Create Component</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [showExport, setShowExport] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showStarterKits, setShowStarterKits] = useState(false);
  const [layersCollapsed, setLayersCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(LEFT_DEFAULT);
  const [rightWidth, setRightWidth] = useState(RIGHT_DEFAULT);
  const leftRef = useRef<HTMLDivElement>(null);
  const components = useStore((s) => s.components);

  // ═══ App-level state ═══
  const [appScreen, setAppScreen] = useState<'home' | 'workspace'>('home');
  const [appMode, setAppMode] = useState<AppMode>('design');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLeftResize = useCallback((delta: number) => {
    setLeftWidth(w => Math.max(LEFT_MIN, Math.min(LEFT_MAX, w + delta)));
  }, []);

  const handleRightResize = useCallback((delta: number) => {
    setRightWidth(w => Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, w + delta)));
  }, []);

  useEffect(() => {
    try { const t = localStorage.getItem('bivvy-tour-completed'); if (!t) setShowWelcome(true); } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) { e.preventDefault(); setShowShortcuts(prev => !prev); }
    };
    // Cmd+K handler (runs even in inputs)
    const cmdKHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keydown', cmdKHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keydown', cmdKHandler);
    };
  }, []);

  // ═══ Electron Menu Bridge ═══
  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onMenuAction((action: string, data?: any) => {
      switch (action) {
        case 'menu:new-workspace':
          useStore.getState().addWorkspace();
          break;
        case 'menu:save':
          // Trigger save (same as Cmd+S in keyboard handler)
          break;
        case 'menu:export':
          setShowExport(true);
          break;
        case 'menu:undo':
          useStore.getState().undo();
          break;
        case 'menu:redo':
          useStore.getState().redo();
          break;
        case 'menu:toggle-grid':
          useStore.getState().toggleGrid();
          break;
        case 'menu:toggle-rulers':
          useStore.getState().toggleRulers();
          break;
        case 'menu:zoom-fit':
          useStore.getState().zoomToFit(window.innerWidth, window.innerHeight);
          break;
        case 'prompt:api-key':
          // window.prompt() not supported in Electron — direct users to terminal
          useStore.getState().addToast('Set your API key via terminal: echo "ANTHROPIC_API_KEY=sk-ant-..." > ~/Library/Application\\ Support/Bivvy/.env', 'info');
          break;
      }
    });
  }, []);

  const actualLeftWidth = layersCollapsed ? LEFT_COLLAPSED : leftWidth;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0a0a0a]">

      {appScreen === 'home' ? (
        <HomeScreen
          onEnterWorkspace={() => setAppScreen('workspace')}
          onNewProject={() => { setAppScreen('workspace'); }}
          onSearch={(q) => { setSearchQuery(q); setShowSearchModal(true); setAppScreen('workspace'); }}
        />
      ) : (
      <>

      {/* ═══ LEFT SIDEBAR — Layers ═══ */}
      <div
        ref={leftRef}
        className="flex flex-col border-r border-gray-800 flex-shrink-0 bg-[#121212] relative"
        style={{ width: actualLeftWidth }}
      >
        {!layersCollapsed && <HResizeHandle side="left" onResize={handleLeftResize} />}

        {/* Menu Header */}
        <div className={`h-10 flex items-center border-b border-gray-800 flex-shrink-0 gap-1 ${layersCollapsed ? 'justify-center pl-0 pr-0' : 'pl-[72px] pr-2'}`} style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="flex items-center gap-1 flex-1">
          <BivvyMenu onShowShortcuts={() => setShowShortcuts(true)} onShowLibrary={() => setShowLibrary(true)} onShowStarterKits={() => setShowStarterKits(true)} onShowCommandPalette={() => setShowCommandPalette(true)} compact={layersCollapsed} />
          {!layersCollapsed && (
            <button onClick={() => setShowLibrary(true)} className="ml-auto p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Component Library">
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}
          </div>
        </div>

        {layersCollapsed ? (
          /* Collapsed rail */
          <div className="flex flex-col items-center pt-2 gap-2">
            <button onClick={() => setLayersCollapsed(false)} className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Expand sidebar">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Expanded: Layers (full height) */
          <>
            {/* Layers section */}
            <div className="flex flex-col overflow-hidden flex-1" data-tour="layers">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 flex-shrink-0">
                <h2 className="text-white font-semibold text-xs">Layers</h2>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">{components.length}</span>
                  <button onClick={() => setLayersCollapsed(true)} className="p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors" title="Collapse sidebar">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <LayerTree hideHeader />
            </div>
          </>
        )}
      </div>

      {/* ═══ CENTER — Workspace Bar + Canvas + Bottom Toolbar ═══ */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between h-10 bg-[#121212] border-b border-gray-800" data-tour="workspace-bar" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}><WorkspaceBar onExport={() => setShowExport(true)} onHome={() => setAppScreen('home')} /></div>
          <div className="pr-2 flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <ModeBar activeMode={appMode} onModeChange={setAppMode} />
          </div>
        </div>
        
        {appMode === 'design' ? (
        <div className="flex-1 min-h-0 relative" data-tour="canvas">
          <SelectionBreadcrumb />
          <ErrorBoundary fallbackLabel="Canvas">
            <Canvas />
          </ErrorBoundary>
          <AIVariationGenerator />
          <AICreateDialog />
          <StatePreviewBar />
          <InspectOverlay />
          <ThemePreviewBadge />
          <ResponsivePreviewOverlay />
          <ToastContainer />
          {showWelcome && components.length === 0 && (
            <WelcomeScreen
              onStartTour={() => { setShowWelcome(false); setShowTour(true); }}
              onDismiss={() => { setShowWelcome(false); try { localStorage.setItem('bivvy-tour-completed', 'true'); } catch {} }}
            />
          )}
        </div>
        ) : appMode === 'plan' ? (
          <PlanModePlaceholder />
        ) : (
          <ImplementModePlaceholder />
        )}
        {appMode === 'design' && <CanvasToolbar />}
      </div>

      {/* ═══ RIGHT SIDEBAR — Full-height Design/Tokens/Validate ═══ */}
      <div className="flex flex-col border-l border-gray-800 flex-shrink-0 bg-[#121212] relative" style={{ width: rightWidth }} data-tour="properties">
        <HResizeHandle side="right" onResize={handleRightResize} />
        <ErrorBoundary fallbackLabel="Properties Panel">
          <RightPanelTabs />
        </ErrorBoundary>
      </div>

      {/* ═══ OVERLAYS ═══ */}
      <LibraryDrawer open={showLibrary} onClose={() => setShowLibrary(false)} />
      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}
      {showStarterKits && <StarterKitsPanel onClose={() => setShowStarterKits(false)} />}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        initialQuery={searchQuery}
        onSelectResult={() => { setShowSearchModal(false); }}
        onStartNew={() => { setShowSearchModal(false); }}
      />
      </>
      )}
    </div>
  );
}
