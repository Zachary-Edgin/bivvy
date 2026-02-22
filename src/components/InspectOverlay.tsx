'use client';

import { useState } from 'react';
import { useStore, ComponentElement } from '@/store/componentStore';

// Measurement line component
function MeasureLine({ x1, y1, x2, y2, label, zoom }: { x1: number; y1: number; x2: number; y2: number; label: string; zoom: number }) {
  const isH = Math.abs(y1 - y2) < 2;
  const mid = isH ? { x: (x1 + x2) / 2, y: y1 } : { x: x1, y: (y1 + y2) / 2 };
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF6B6B" strokeWidth={1 / zoom} strokeDasharray={`${3 / zoom} ${3 / zoom}`} />
      {/* End caps */}
      {isH ? (
        <>
          <line x1={x1} y1={y1 - 4 / zoom} x2={x1} y2={y1 + 4 / zoom} stroke="#FF6B6B" strokeWidth={1 / zoom} />
          <line x1={x2} y1={y2 - 4 / zoom} x2={x2} y2={y2 + 4 / zoom} stroke="#FF6B6B" strokeWidth={1 / zoom} />
        </>
      ) : (
        <>
          <line x1={x1 - 4 / zoom} y1={y1} x2={x1 + 4 / zoom} y2={y1} stroke="#FF6B6B" strokeWidth={1 / zoom} />
          <line x1={x2 - 4 / zoom} y1={y2} x2={x2 + 4 / zoom} y2={y2} stroke="#FF6B6B" strokeWidth={1 / zoom} />
        </>
      )}
      <rect
        x={mid.x - 14 / zoom}
        y={mid.y - 7 / zoom}
        width={28 / zoom}
        height={14 / zoom}
        rx={3 / zoom}
        fill="#FF6B6B"
      />
      <text x={mid.x} y={mid.y + 3.5 / zoom} textAnchor="middle" fill="white" fontSize={9 / zoom} fontFamily="Inter, sans-serif" fontWeight={600}>
        {label}
      </text>
    </>
  );
}

export function InspectOverlay() {
  const { components, selectedId, hoveredId, zoom, panOffset, inspectMode } = useStore();
  const [inspectHoverId, setInspectHoverId] = useState<string | null>(null);

  if (!inspectMode) return null;

  const findComp = (id: string): ComponentElement | null => {
    const search = (list: ComponentElement[]): ComponentElement | null => {
      for (const c of list) {
        if (c.id === id) return c;
        if (c.children) { const f = search(c.children); if (f) return f; }
      }
      return null;
    };
    return search(components);
  };

  const hovered = inspectHoverId ? findComp(inspectHoverId) : (hoveredId ? findComp(hoveredId) : null);
  const selected = selectedId ? findComp(selectedId) : null;

  // Build spacing measurements between selected and hovered
  const measurements: { x1: number; y1: number; x2: number; y2: number; label: string }[] = [];
  if (selected && hovered && selected.id !== hovered.id && selected.position && hovered.position && selected.size && hovered.size) {
    const sR = { l: selected.position.x, t: selected.position.y, r: selected.position.x + selected.size.width, b: selected.position.y + selected.size.height };
    const hR = { l: hovered.position.x, t: hovered.position.y, r: hovered.position.x + hovered.size.width, b: hovered.position.y + hovered.size.height };

    // Horizontal gap
    if (hR.l > sR.r) {
      const midY = Math.max(sR.t, hR.t) + (Math.min(sR.b, hR.b) - Math.max(sR.t, hR.t)) / 2;
      measurements.push({ x1: sR.r, y1: midY, x2: hR.l, y2: midY, label: `${Math.round(hR.l - sR.r)}` });
    } else if (sR.l > hR.r) {
      const midY = Math.max(sR.t, hR.t) + (Math.min(sR.b, hR.b) - Math.max(sR.t, hR.t)) / 2;
      measurements.push({ x1: hR.r, y1: midY, x2: sR.l, y2: midY, label: `${Math.round(sR.l - hR.r)}` });
    }

    // Vertical gap
    if (hR.t > sR.b) {
      const midX = Math.max(sR.l, hR.l) + (Math.min(sR.r, hR.r) - Math.max(sR.l, hR.l)) / 2;
      measurements.push({ x1: midX, y1: sR.b, x2: midX, y2: hR.t, label: `${Math.round(hR.t - sR.b)}` });
    } else if (sR.t > hR.b) {
      const midX = Math.max(sR.l, hR.l) + (Math.min(sR.r, hR.r) - Math.max(sR.l, hR.l)) / 2;
      measurements.push({ x1: midX, y1: hR.b, x2: midX, y2: sR.t, label: `${Math.round(sR.t - hR.b)}` });
    }
  }

  // Tooltip with component specs
  const tooltipComp = (hovered?.position && hovered?.size) ? hovered : (selected?.position && selected?.size) ? selected : null;

  return (
    <>
      {/* SVG measurement lines */}
      {measurements.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-[55]"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <g transform={`translate(${panOffset.x},${panOffset.y}) scale(${zoom})`}>
            {measurements.map((m, i) => (
              <MeasureLine key={i} {...m} zoom={zoom} />
            ))}
          </g>
        </svg>
      )}

      {/* Spec tooltip */}
      {tooltipComp && (
        <div
          className="absolute z-[56] pointer-events-none"
          style={{
            left: (tooltipComp.position.x + tooltipComp.size.width + 12) * zoom + panOffset.x,
            top: tooltipComp.position.y * zoom + panOffset.y,
          }}
        >
          <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl p-3 min-w-[180px] max-w-[260px]">
            <div className="text-[11px] font-semibold text-white mb-2 flex items-center gap-2">
              <span className="uppercase text-[9px] px-1.5 py-0.5 bg-[#2296FF]/20 text-[#2296FF] rounded">{tooltipComp.type}</span>
              {tooltipComp.content && <span className="text-gray-400 font-normal truncate">{tooltipComp.content.substring(0, 20)}</span>}
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Size</span>
                <span className="text-gray-300 font-mono">{tooltipComp.size.width} x {tooltipComp.size.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Position</span>
                <span className="text-gray-300 font-mono">{Math.round(tooltipComp.position.x)}, {Math.round(tooltipComp.position.y)}</span>
              </div>
              {tooltipComp.styles?.backgroundColor && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Background</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-gray-600" style={{ backgroundColor: tooltipComp.styles.backgroundColor }} />
                    <span className="text-gray-300 font-mono">{tooltipComp.styles.backgroundColor}</span>
                  </span>
                </div>
              )}
              {tooltipComp.styles?.color && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Color</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-gray-600" style={{ backgroundColor: tooltipComp.styles.color }} />
                    <span className="text-gray-300 font-mono">{tooltipComp.styles.color}</span>
                  </span>
                </div>
              )}
              {tooltipComp.styles?.fontFamily && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Font</span>
                  <span className="text-gray-300">{tooltipComp.styles.fontFamily.split(',')[0].replace(/'/g, '')}</span>
                </div>
              )}
              {tooltipComp.styles?.fontSize && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Size / Weight</span>
                  <span className="text-gray-300 font-mono">{tooltipComp.styles.fontSize} / {tooltipComp.styles.fontWeight || 400}</span>
                </div>
              )}
              {tooltipComp.styles?.borderRadius && tooltipComp.styles.borderRadius !== '0px' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Radius</span>
                  <span className="text-gray-300 font-mono">{tooltipComp.styles.borderRadius}</span>
                </div>
              )}
              {tooltipComp.styles?.padding && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Padding</span>
                  <span className="text-gray-300 font-mono">{tooltipComp.styles.padding}</span>
                </div>
              )}
              {tooltipComp.styles?.gap && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Gap</span>
                  <span className="text-gray-300 font-mono">{tooltipComp.styles.gap}</span>
                </div>
              )}
              {tooltipComp.styles?.boxShadow && tooltipComp.styles.boxShadow !== 'none' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Shadow</span>
                  <span className="text-gray-300 font-mono truncate max-w-[120px]">{tooltipComp.styles.boxShadow}</span>
                </div>
              )}
              {tooltipComp.styles?.opacity && tooltipComp.styles.opacity !== 1 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Opacity</span>
                  <span className="text-gray-300 font-mono">{tooltipComp.styles.opacity}</span>
                </div>
              )}
              {(tooltipComp.hoverStyles && Object.keys(tooltipComp.hoverStyles).length > 0) ||
               (tooltipComp.focusedStyles && Object.keys(tooltipComp.focusedStyles).length > 0) ||
               (tooltipComp.loadingStyles && Object.keys(tooltipComp.loadingStyles).length > 0) ? (
                <div className="flex justify-between">
                  <span className="text-gray-500">States</span>
                  <span className="text-gray-300">
                    {[
                      tooltipComp.hoverStyles && Object.keys(tooltipComp.hoverStyles).length > 0 ? 'hover' : '',
                      tooltipComp.activeStyles && Object.keys(tooltipComp.activeStyles).length > 0 ? 'active' : '',
                      tooltipComp.focusedStyles && Object.keys(tooltipComp.focusedStyles).length > 0 ? 'focused' : '',
                      tooltipComp.disabledStyles && Object.keys(tooltipComp.disabledStyles).length > 0 ? 'disabled' : '',
                      tooltipComp.loadingStyles && Object.keys(tooltipComp.loadingStyles).length > 0 ? 'loading' : '',
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              ) : null}
              {tooltipComp.animation?.entrance && tooltipComp.animation.entrance !== 'none' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Animation</span>
                  <span className="text-gray-300">{tooltipComp.animation.entrance} {tooltipComp.animation.duration || 300}ms</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inspect mode badge */}
      <div className="absolute top-3 right-3 z-[56] flex items-center gap-1.5 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg px-2.5 py-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
        <span className="text-[10px] font-medium text-[#FF6B6B]">Inspect Mode</span>
      </div>
    </>
  );
}
