'use client';

import { useState, useMemo } from 'react';
import { X, Smartphone, Tablet, Monitor, Maximize2, AlertTriangle } from 'lucide-react';
import { useStore, ComponentElement } from '@/store/componentStore';
import { IconRenderer } from './IconRenderer';

// ═══ BREAKPOINTS ═══
const BREAKPOINTS = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: 375, height: 667 },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 768, height: 1024 },
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: 1280, height: 800 },
] as const;

type BreakpointId = typeof BREAKPOINTS[number]['id'];

// ═══ CHILD RENDERER ═══
function renderChild(child: ComponentElement) {
  if (child.type === 'icon' && child.content) {
    return (
      <div key={child.id} style={{ ...child.styles, position: child.styles?.position || 'relative' }}>
        <IconRenderer iconName={child.content} color={child.styles?.color || '#fff'} size={parseInt(child.styles?.fontSize || '16')} />
      </div>
    );
  }
  return (
    <div key={child.id} style={{ ...child.styles, position: child.styles?.position || 'relative' }}>
      {child.children?.map(renderChild) || child.content || ''}
    </div>
  );
}

// ═══ COMPONENT RENDERER ═══
function renderComponent(comp: ComponentElement, offsetX: number, offsetY: number) {
  const x = (comp.position?.x || 0) - offsetX;
  const y = (comp.position?.y || 0) - offsetY;
  const w = comp.size?.width || 100;
  const h = comp.size?.height || 50;

  if (comp.type === 'line' || comp.type === 'arrow') {
    const strokeColor = comp.styles?.stroke || '#9ca3af';
    const strokeW = Number(comp.styles?.strokeWidth) || 2;
    const parts = (comp.content || '').split(',').map(Number);
    let lx1 = 0, ly1 = 0, lx2 = w, ly2 = 0;
    if (parts.length === 4 && parts.every(n => !isNaN(n))) { lx1 = parts[0]; ly1 = parts[1]; lx2 = parts[2]; ly2 = parts[3]; }
    return (
      <svg key={comp.id} style={{ position: 'absolute', left: x, top: y, width: w, height: Math.max(h, 4), overflow: 'visible' }}>
        <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={strokeColor} strokeWidth={strokeW} strokeLinecap="round" />
      </svg>
    );
  }

  if (comp.type === 'icon') {
    return (
      <div key={comp.id} style={{ position: 'absolute', left: x, top: y, width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconRenderer iconName={comp.content || 'circle'} color={comp.styles?.color || '#ffffff'} size={Math.min(w, h) * 0.7} />
      </div>
    );
  }

  return (
    <div key={comp.id} style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...comp.styles }}>
      {comp.children && comp.children.length > 0 ? comp.children.map(renderChild) : comp.content || ''}
    </div>
  );
}

// ═══ DEVICE FRAME ═══
function DeviceFrame({
  breakpoint,
  components,
  isActive,
  onClick,
  compact,
}: {
  breakpoint: typeof BREAKPOINTS[number];
  components: ComponentElement[];
  isActive: boolean;
  onClick: () => void;
  compact: boolean;
}) {
  const Icon = breakpoint.icon;

  // Calculate component bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  components.forEach(comp => {
    if (!comp.position || !comp.size) return;
    minX = Math.min(minX, comp.position.x);
    minY = Math.min(minY, comp.position.y);
    maxX = Math.max(maxX, comp.position.x + comp.size.width);
    maxY = Math.max(maxY, comp.position.y + comp.size.height);
  });
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 200; maxY = 100; }

  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const fitsWidth = contentW <= breakpoint.width;
  const overflowPct = fitsWidth ? 0 : Math.round(((contentW - breakpoint.width) / breakpoint.width) * 100);

  // Frame display sizing
  const maxFrameH = compact ? 280 : 400;
  const aspectRatio = breakpoint.width / breakpoint.height;
  const frameDisplayW = compact ? Math.min(breakpoint.width * 0.25, 200) : Math.min(breakpoint.width * 0.3, 300);
  const frameDisplayH = Math.min(frameDisplayW / aspectRatio, maxFrameH);

  // Scale content to fit the frame display area
  const innerScale = Math.min(
    frameDisplayW / breakpoint.width,
    frameDisplayH / breakpoint.height,
    1
  );

  return (
    <div
      className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${isActive ? '' : 'opacity-70 hover:opacity-100'}`}
      onClick={onClick}
    >
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2296FF]' : 'text-gray-500'}`} />
        <span className={`text-[11px] font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>{breakpoint.label}</span>
        <span className="text-[9px] text-gray-600 font-mono">{breakpoint.width}px</span>
      </div>

      {/* Device frame */}
      <div
        className={`relative rounded-lg border-2 overflow-hidden bg-[#0a0a0a] transition-all ${
          isActive ? 'border-[#2296FF] shadow-lg shadow-[#2296FF]/15' : 'border-gray-700 hover:border-gray-500'
        }`}
        style={{ width: frameDisplayW, height: frameDisplayH }}
      >
        {/* Simulated viewport - content renders inside */}
        <div
          style={{
            width: breakpoint.width,
            height: breakpoint.height,
            transform: `scale(${innerScale})`,
            transformOrigin: 'top left',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Center the content within the viewport */}
          <div
            style={{
              position: 'absolute',
              left: Math.max(0, (breakpoint.width - contentW) / 2),
              top: Math.max(0, Math.min(20, (breakpoint.height - contentH) / 2)),
              width: contentW,
              height: contentH,
            }}
          >
            <div style={{ position: 'relative', width: contentW, height: contentH }}>
              {components.map(comp => renderComponent(comp, minX, minY))}
            </div>
          </div>
        </div>

        {/* Overflow warning overlay */}
        {!fitsWidth && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500/30 to-transparent h-8 flex items-end justify-center pb-1">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/80 rounded text-[8px] text-white font-medium">
              <AlertTriangle className="w-2.5 h-2.5" />
              {overflowPct}% overflow
            </div>
          </div>
        )}

        {/* Fit badge */}
        {fitsWidth && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-[8px] text-emerald-400 font-medium border border-emerald-500/30">
            Fits ✓
          </div>
        )}
      </div>

      {/* Dimensions info */}
      <div className="text-center">
        <p className={`text-[9px] font-mono ${fitsWidth ? 'text-gray-500' : 'text-red-400'}`}>
          {Math.round(contentW)} × {Math.round(contentH)}px
          {!fitsWidth && ` → ${breakpoint.width}px viewport`}
        </p>
      </div>
    </div>
  );
}

// ═══ MAIN COMPONENT ═══
export function ResponsivePreview({ onClose }: { onClose: () => void }) {
  const { selectedIds, findComponent, components } = useStore();
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointId>('mobile');
  const [showAll, setShowAll] = useState(true);

  // Get components to preview
  const previewComponents = useMemo(() => {
    if (selectedIds.length > 0) {
      return selectedIds
        .map(id => findComponent(id))
        .filter((c): c is ComponentElement => !!c && !c.hidden && !!c.position && !!c.size);
    }
    // No selection — preview all visible
    return components.filter(c => !c.hidden && c.position && c.size);
  }, [selectedIds, findComponent, components]);

  if (previewComponents.length === 0) {
    return (
      <div className="absolute inset-0 z-[55] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center max-w-xs">
          <p className="text-sm text-gray-300 mb-2">No components to preview</p>
          <p className="text-[10px] text-gray-500 mb-4">Select components or add some to the canvas first.</p>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors">Close</button>
        </div>
      </div>
    );
  }

  const activeBreakpointData = BREAKPOINTS.find(b => b.id === activeBreakpoint)!;
  const contentWidth = (() => {
    let minX = Infinity, maxX = -Infinity;
    previewComponents.forEach(c => {
      if (!c.position || !c.size) return;
      minX = Math.min(minX, c.position.x);
      maxX = Math.max(maxX, c.position.x + c.size.width);
    });
    return isFinite(minX) ? maxX - minX : 0;
  })();

  return (
    <div className="absolute inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#121212] rounded-2xl border border-gray-800 shadow-2xl shadow-black/50 max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Responsive Preview</h2>
              <p className="text-[10px] text-gray-500">
                {previewComponents.length} component{previewComponents.length !== 1 ? 's' : ''}
                {selectedIds.length > 0 ? ' (selected)' : ' (all)'}
                {' · '}
                {Math.round(contentWidth)}px wide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Side-by-side toggle */}
            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                showAll ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {showAll ? 'Side by Side' : 'Single View'}
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Breakpoint Responsiveness Summary */}
        <div className="px-4 py-2 border-b border-gray-800/50 flex items-center gap-3 flex-shrink-0">
          {BREAKPOINTS.map(bp => {
            const fits = contentWidth <= bp.width;
            const Icon = bp.icon;
            return (
              <button
                key={bp.id}
                onClick={() => { setActiveBreakpoint(bp.id); if (showAll) setShowAll(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  (!showAll && activeBreakpoint === bp.id)
                    ? 'bg-[#2296FF]/20 text-[#2296FF] border border-[#2296FF]/30'
                    : 'bg-gray-800/50 border border-gray-800 hover:border-gray-600 text-gray-400'
                }`}
              >
                <Icon className="w-3 h-3" />
                {bp.label}
                <span className="font-mono text-[8px] text-gray-600">{bp.width}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${fits ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </button>
            );
          })}
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto p-6 min-h-0">
          {showAll ? (
            /* ── Side-by-side view ── */
            <div className="flex items-start justify-center gap-6">
              {BREAKPOINTS.map(bp => (
                <DeviceFrame
                  key={bp.id}
                  breakpoint={bp}
                  components={previewComponents}
                  isActive={activeBreakpoint === bp.id}
                  onClick={() => { setActiveBreakpoint(bp.id); setShowAll(false); }}
                  compact={true}
                />
              ))}
            </div>
          ) : (
            /* ── Single focused view ── */
            <div className="flex justify-center">
              <DeviceFrame
                breakpoint={activeBreakpointData}
                components={previewComponents}
                isActive={true}
                onClick={() => {}}
                compact={false}
              />
            </div>
          )}
        </div>

        {/* Footer — responsive hints */}
        <div className="px-4 py-2 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Fits viewport</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Overflows viewport</span>
            </div>
            <p className="text-gray-600">
              {contentWidth <= 375
                ? 'Component fits all breakpoints ✓'
                : contentWidth <= 768
                  ? 'Fits tablet & desktop — consider mobile optimization'
                  : contentWidth <= 1280
                    ? 'Fits desktop only — needs responsive adjustments'
                    : 'Exceeds all standard breakpoints'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
