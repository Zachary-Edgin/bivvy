'use client';

import { useStore, ComponentElement } from '@/store/componentStore';
import { useState, useCallback, useEffect } from 'react';
import {
  ArrowRight,
  ArrowDown,
  Link,
  Unlink,
  WrapText,
  AlignHorizontalSpaceAround,
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// FIGMA-STYLE AUTO LAYOUT PANEL
// ═══════════════════════════════════════════════════

// Helper: parse CSS padding string → 4 individual values
function parsePadding(padding?: string): { top: number; right: number; bottom: number; left: number } {
  if (!padding) return { top: 0, right: 0, bottom: 0, left: 0 };
  const vals = padding.replace(/px/g, '').trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
  if (vals.length === 1) return { top: vals[0], right: vals[0], bottom: vals[0], left: vals[0] };
  if (vals.length === 2) return { top: vals[0], right: vals[1], bottom: vals[0], left: vals[1] };
  if (vals.length === 3) return { top: vals[0], right: vals[1], bottom: vals[2], left: vals[1] };
  if (vals.length === 4) return { top: vals[0], right: vals[1], bottom: vals[2], left: vals[3] };
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

// Helper: build CSS padding string from 4 values
function buildPadding(t: number, r: number, b: number, l: number): string {
  if (t === r && r === b && b === l) return `${t}px`;
  if (t === b && r === l) return `${t}px ${r}px`;
  return `${t}px ${r}px ${b}px ${l}px`;
}

// Helper: parse gap value
function parseGap(gap?: string): number {
  if (!gap) return 0;
  return parseInt(gap) || 0;
}

// 9-point alignment grid position mapping
type AlignPos = 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br';

function getAlignPos(direction: string, alignItems?: string, justifyContent?: string): AlignPos {
  const ai = alignItems || 'flex-start';
  const jc = justifyContent || 'flex-start';
  
  let hAlign: 'l' | 'c' | 'r';
  let vAlign: 't' | 'c' | 'b';
  
  if (direction === 'column' || direction === 'column-reverse') {
    // Column: justifyContent = vertical, alignItems = horizontal
    vAlign = jc === 'center' ? 'c' : jc === 'flex-end' ? 'b' : 't';
    hAlign = ai === 'center' ? 'c' : ai === 'flex-end' ? 'r' : 'l';
  } else {
    // Row: justifyContent = horizontal, alignItems = vertical
    hAlign = jc === 'center' ? 'c' : jc === 'flex-end' ? 'r' : 'l';
    vAlign = ai === 'center' ? 'c' : ai === 'flex-end' ? 'b' : 't';
  }
  
  return `${vAlign}${hAlign}` as AlignPos;
}

function posToFlexProps(pos: AlignPos, direction: string): { alignItems: string; justifyContent: string } {
  const vMap: Record<string, string> = { t: 'flex-start', c: 'center', b: 'flex-end' };
  const hMap: Record<string, string> = { l: 'flex-start', c: 'center', r: 'flex-end' };
  
  const v = vMap[pos[0]];
  const h = hMap[pos[1]];
  
  if (direction === 'column' || direction === 'column-reverse') {
    return { justifyContent: v, alignItems: h };
  } else {
    return { alignItems: v, justifyContent: h };
  }
}

// ─── Tiny number input ───
function NumInput({ value, onChange, label, min = 0, max = 999, width = 44 }: {
  value: number; onChange: (v: number) => void; label?: string; min?: number; max?: number; width?: number;
}) {
  const [localVal, setLocalVal] = useState(String(value));
  
  // Sync when external value changes (e.g., selecting different component)
  useEffect(() => { setLocalVal(String(value)); }, [value]);
  
  const commit = () => {
    const n = Math.max(min, Math.min(max, parseInt(localVal) || 0));
    onChange(n);
    setLocalVal(String(n));
  };
  
  return (
    <div className="flex flex-col items-center gap-0.5">
      {label && <span className="text-[8px] text-gray-600 uppercase tracking-wider">{label}</span>}
      <input
        type="text"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') commit();
          if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(max, (parseInt(localVal) || 0) + 1); setLocalVal(String(n)); onChange(n); }
          if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.max(min, (parseInt(localVal) || 0) - 1); setLocalVal(String(n)); onChange(n); }
        }}
        className="text-center bg-gray-800/80 border border-gray-700/50 rounded text-[11px] text-white outline-none focus:border-[#2296FF]/60 transition-colors"
        style={{ width, padding: '3px 4px' }}
      />
    </div>
  );
}

// ─── Main Auto Layout Panel ───
export function AutoLayoutPanel({ component }: { component: ComponentElement }) {
  const updateComponent = useStore(s => s.updateComponent);
  const [paddingLinked, setPaddingLinked] = useState(true);
  
  const es = component.styles || {};
  const isFlex = es.display === 'flex';
  const direction = es.flexDirection || 'column';
  const isRow = direction === 'row' || direction === 'row-reverse';
  const gap = parseGap(es.gap);
  const pad = parsePadding(es.padding);
  const wrap = es.flexWrap === 'wrap';
  const alignPos = isFlex ? getAlignPos(direction, es.alignItems, es.justifyContent) : 'tl';
  
  const handleStyleChange = useCallback((updates: Record<string, any>) => {
    updateComponent(component.id, { styles: { ...component.styles, ...updates } });
  }, [component.id, component.styles, updateComponent]);

  // Toggle auto layout on/off
  const toggleAutoLayout = () => {
    if (isFlex) {
      handleStyleChange({ 
        display: undefined, flexDirection: undefined, gap: undefined, 
        alignItems: undefined, justifyContent: undefined, flexWrap: undefined 
      });
    } else {
      handleStyleChange({ 
        display: 'flex', flexDirection: 'column', gap: '8px',
        alignItems: 'flex-start', justifyContent: 'flex-start',
      });
    }
  };

  // Direction
  const setDirection = (dir: string) => {
    handleStyleChange({ flexDirection: dir });
  };

  // Alignment grid click
  const setAlignment = (pos: AlignPos) => {
    const props = posToFlexProps(pos, direction);
    handleStyleChange(props);
  };

  // Gap
  const setGap = (val: number) => {
    handleStyleChange({ gap: `${val}px` });
  };

  // Padding
  const setPadVal = (side: 'top' | 'right' | 'bottom' | 'left', val: number) => {
    const newPad = { ...pad, [side]: val };
    if (paddingLinked) {
      // Set all sides to this value
      handleStyleChange({ padding: `${val}px` });
    } else {
      handleStyleChange({ padding: buildPadding(newPad.top, newPad.right, newPad.bottom, newPad.left) });
    }
  };

  // Wrap
  const toggleWrap = () => {
    handleStyleChange({ flexWrap: wrap ? 'nowrap' : 'wrap' });
  };

  // ─── Sizing modes ───
  const sizing = component.layoutSizing || { widthMode: 'fixed', heightMode: 'fixed' };
  
  const setSizingMode = (axis: 'widthMode' | 'heightMode', mode: 'fixed' | 'hug' | 'fill') => {
    const newSizing = { ...sizing, [axis]: mode };
    updateComponent(component.id, { layoutSizing: newSizing });
    
    // Also update styles to reflect
    if (axis === 'widthMode') {
      if (mode === 'hug') {
        handleStyleChange({ width: 'auto' });
      } else if (mode === 'fill') {
        handleStyleChange({ width: '100%', flex: '1' });
      }
      // 'fixed' keeps current explicit width
    }
    if (axis === 'heightMode') {
      if (mode === 'hug') {
        handleStyleChange({ height: 'auto' });
      } else if (mode === 'fill') {
        handleStyleChange({ height: '100%', flex: undefined });
      }
    }
  };

  return (
    <div className="px-3 pb-3">
      {/* ─── Header row: Toggle + Direction ─── */}
      <div className="flex items-center gap-2 mb-3">
        {/* On/Off Toggle */}
        <button
          onClick={toggleAutoLayout}
          className={`relative w-8 h-[18px] rounded-full transition-colors flex-shrink-0 ${isFlex ? 'bg-[#2296FF]' : 'bg-gray-700'}`}
        >
          <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${isFlex ? 'left-[16px]' : 'left-[2px]'}`} />
        </button>

        {isFlex && (
          <>
            {/* Direction buttons */}
            <div className="flex gap-0.5 bg-gray-800/60 rounded-md p-0.5">
              <button
                onClick={() => setDirection('row')}
                className={`p-1.5 rounded transition-colors ${isRow ? 'bg-[#2296FF] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                title="Horizontal"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setDirection('column')}
                className={`p-1.5 rounded transition-colors ${!isRow ? 'bg-[#2296FF] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                title="Vertical"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>

            {/* Wrap toggle */}
            <button
              onClick={toggleWrap}
              className={`p-1.5 rounded transition-colors ${wrap ? 'bg-[#2296FF] text-white' : 'bg-gray-800/60 text-gray-500 hover:text-gray-300'}`}
              title="Wrap"
            >
              <WrapText className="w-3 h-3" />
            </button>

            {/* Gap input */}
            <div className="flex items-center gap-1 ml-auto">
              <AlignHorizontalSpaceAround className="w-3 h-3 text-gray-500" />
              <NumInput value={gap} onChange={setGap} width={36} />
            </div>
          </>
        )}
      </div>

      {isFlex && (
        <>
          {/* ─── Alignment Grid + Padding ─── */}
          <div className="flex gap-3 mb-3">
            {/* 9-point alignment grid */}
            <div className="flex-shrink-0">
              <label className="text-[9px] text-gray-600 mb-1.5 block uppercase tracking-wider">Align</label>
              <div 
                className="grid grid-cols-3 gap-[3px] bg-gray-800/40 p-1.5 rounded-lg"
                style={{ width: 54, height: 54 }}
              >
                {(['tl','tc','tr','cl','cc','cr','bl','bc','br'] as AlignPos[]).map((pos) => {
                  const isActive = alignPos === pos;
                  // Visual indicator: show bars that represent content flow direction
                  const isVert = !isRow;
                  return (
                    <button
                      key={pos}
                      onClick={() => setAlignment(pos)}
                      className={`rounded-sm transition-all flex items-center justify-center ${
                        isActive 
                          ? 'bg-[#2296FF] shadow-sm shadow-blue-500/30' 
                          : 'bg-gray-700/60 hover:bg-gray-600/60'
                      }`}
                      style={{ width: 14, height: 14 }}
                    >
                      {isActive && (
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'white' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Padding controls */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[9px] text-gray-600 uppercase tracking-wider">Padding</label>
                <button
                  onClick={() => setPaddingLinked(!paddingLinked)}
                  className={`p-0.5 rounded transition-colors ${paddingLinked ? 'text-[#2296FF]' : 'text-gray-600 hover:text-gray-400'}`}
                  title={paddingLinked ? 'Unlink padding sides' : 'Link all padding sides'}
                >
                  {paddingLinked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                </button>
              </div>

              {paddingLinked ? (
                /* Single value when linked */
                <div className="flex items-center justify-center">
                  <NumInput value={pad.top} onChange={(v) => setPadVal('top', v)} label="All" width={52} />
                </div>
              ) : (
                /* Cross-shaped 4-value layout */
                <div className="grid gap-1" style={{ gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto auto' }}>
                  <div /> {/* empty */}
                  <NumInput value={pad.top} onChange={(v) => setPadVal('top', v)} label="T" width={40} />
                  <div /> {/* empty */}
                  <NumInput value={pad.left} onChange={(v) => setPadVal('left', v)} label="L" width={40} />
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 border border-gray-600 rounded-sm" />
                  </div>
                  <NumInput value={pad.right} onChange={(v) => setPadVal('right', v)} label="R" width={40} />
                  <div /> {/* empty */}
                  <NumInput value={pad.bottom} onChange={(v) => setPadVal('bottom', v)} label="B" width={40} />
                  <div /> {/* empty */}
                </div>
              )}
            </div>
          </div>

          {/* ─── Sizing Mode ─── */}
          <div className="mb-2">
            <label className="text-[9px] text-gray-600 mb-1.5 block uppercase tracking-wider">Sizing</label>
            <div className="flex gap-2">
              {/* Width sizing */}
              <div className="flex-1">
                <span className="text-[9px] text-gray-500 mb-1 block">Width</span>
                <div className="flex gap-0.5 bg-gray-800/40 rounded-md p-0.5">
                  {(['fixed', 'hug', 'fill'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSizingMode('widthMode', mode)}
                      className={`flex-1 px-1 py-1 rounded text-[9px] font-medium transition-colors ${
                        sizing.widthMode === mode
                          ? 'bg-[#2296FF] text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {mode === 'fixed' ? '⊡' : mode === 'hug' ? '⊟' : '↔'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Height sizing */}
              <div className="flex-1">
                <span className="text-[9px] text-gray-500 mb-1 block">Height</span>
                <div className="flex gap-0.5 bg-gray-800/40 rounded-md p-0.5">
                  {(['fixed', 'hug', 'fill'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSizingMode('heightMode', mode)}
                      className={`flex-1 px-1 py-1 rounded text-[9px] font-medium transition-colors ${
                        sizing.heightMode === mode
                          ? 'bg-[#2296FF] text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {mode === 'fixed' ? '⊡' : mode === 'hug' ? '⊟' : '↕'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── space-between option ─── */}
          <div className="flex items-center justify-between mt-2">
            <label className="text-[9px] text-gray-600 uppercase tracking-wider">Space Between</label>
            <button
              onClick={() => {
                const dir = direction;
                const isCol = dir === 'column' || dir === 'column-reverse';
                const currentJC = es.justifyContent || 'flex-start';
                if (currentJC === 'space-between') {
                  handleStyleChange({ justifyContent: 'flex-start' });
                } else {
                  handleStyleChange({ justifyContent: 'space-between' });
                }
              }}
              className={`relative w-7 h-[16px] rounded-full transition-colors flex-shrink-0 ${
                es.justifyContent === 'space-between' ? 'bg-[#2296FF]' : 'bg-gray-700'
              }`}
            >
              <div className={`absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white transition-transform ${
                es.justifyContent === 'space-between' ? 'left-[13px]' : 'left-[2px]'
              }`} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Child Sizing Panel (shown when a child of an auto layout frame is selected) ───
export function ChildSizingPanel({ child }: { child: ComponentElement }) {
  const updateComponent = useStore(s => s.updateComponent);
  const sizing = child.layoutSizing || { widthMode: 'fixed', heightMode: 'fixed' };

  const handleStyleChange = useCallback((updates: Record<string, any>) => {
    updateComponent(child.id, { styles: { ...child.styles, ...updates } });
  }, [child.id, child.styles, updateComponent]);

  const setSizingMode = (axis: 'widthMode' | 'heightMode', mode: 'fixed' | 'hug' | 'fill') => {
    const newSizing = { ...sizing, [axis]: mode };
    updateComponent(child.id, { layoutSizing: newSizing });

    if (axis === 'widthMode') {
      if (mode === 'hug') {
        handleStyleChange({ width: undefined, flex: undefined, alignSelf: undefined });
      } else if (mode === 'fill') {
        handleStyleChange({ width: undefined, flex: undefined, alignSelf: 'stretch' });
      } else {
        handleStyleChange({ alignSelf: undefined });
      }
    }
    if (axis === 'heightMode') {
      if (mode === 'hug') {
        handleStyleChange({ height: undefined });
      } else if (mode === 'fill') {
        handleStyleChange({ height: undefined, flex: '1' });
      }
    }
  };

  return (
    <div className="px-3 pb-2">
      <label className="text-[9px] text-gray-600 mb-1.5 block uppercase tracking-wider">Sizing in Parent</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <span className="text-[9px] text-gray-500 mb-1 block">Width</span>
          <div className="flex gap-0.5 bg-gray-800/40 rounded-md p-0.5">
            {(['fixed', 'hug', 'fill'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setSizingMode('widthMode', mode)}
                className={`flex-1 px-1 py-1 rounded text-[9px] font-medium transition-colors ${
                  sizing.widthMode === mode
                    ? 'bg-[#2296FF] text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {mode === 'fixed' ? '⊡' : mode === 'hug' ? '⊟' : '↔'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <span className="text-[9px] text-gray-500 mb-1 block">Height</span>
          <div className="flex gap-0.5 bg-gray-800/40 rounded-md p-0.5">
            {(['fixed', 'hug', 'fill'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setSizingMode('heightMode', mode)}
                className={`flex-1 px-1 py-1 rounded text-[9px] font-medium transition-colors ${
                  sizing.heightMode === mode
                    ? 'bg-[#2296FF] text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {mode === 'fixed' ? '⊡' : mode === 'hug' ? '⊟' : '↕'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
