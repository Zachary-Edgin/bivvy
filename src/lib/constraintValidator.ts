/**
 * Bivvy Constraint Validation Engine v3
 * ZERO recursion. ZERO JSON.stringify. Manual primitive extraction only.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type ViolationSeverity = 'error' | 'warning' | 'info';
export type TokenCategory = 'color'|'fontSize'|'fontWeight'|'fontFamily'|'lineHeight'|'letterSpacing'|'spacing'|'borderRadius'|'borderWidth'|'borderStyle'|'shadow'|'opacity'|'iconSize'|'minHeight'|'maxWidth'|'Apple HIG';

export interface Violation {
  id: string; componentId: string; componentName: string; property: string;
  currentValue: string; category: TokenCategory; severity: ViolationSeverity;
  message: string; nearestValidToken: string | null; distance?: number;
}

export interface ComponentValidationResult {
  componentId: string; componentName: string; passed: boolean;
  violations: Violation[]; checkedProperties: number; passedProperties: number;
}

export interface ValidationReport {
  passed: boolean; timestamp: number; totalComponents: number;
  totalChecks: number; totalPassed: number; totalViolations: number;
  errorCount: number; warningCount: number; infoCount: number;
  healthScore: number; componentResults: ComponentValidationResult[];
  violations: Violation[]; summary: string;
}

// ═══════════════════════════════════════
// SAFE PRIMITIVES
// ═══════════════════════════════════════

function s(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

function safeNumArr(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  const r: number[] = [];
  for (let i = 0; i < v.length; i++) {
    const x = v[i];
    if (typeof x === 'number' && isFinite(x)) r.push(x);
  }
  return r;
}

function safeStrArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const r: string[] = [];
  for (let i = 0; i < v.length; i++) {
    if (typeof v[i] === 'string') r.push(v[i]);
  }
  return r;
}

// ═══════════════════════════════════════
// COLOR
// ═══════════════════════════════════════

function normHex(input: string): string {
  let h = input.trim().toLowerCase();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6 || !/^[0-9a-f]{6}$/.test(h)) return '';
  return '#' + h;
}

function parseCol(val: string): string {
  const v = val.trim().toLowerCase();
  if (!v||v==='transparent'||v==='inherit'||v==='initial'||v==='unset'||v==='currentcolor'||v==='none') return '';
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return normHex(v);
  const m = v.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (m) return '#'+Math.round(Number(m[1])).toString(16).padStart(2,'0')+Math.round(Number(m[2])).toString(16).padStart(2,'0')+Math.round(Number(m[3])).toString(16).padStart(2,'0');
  const named: Record<string,string> = {white:'#ffffff',black:'#000000',red:'#ff0000',green:'#008000',blue:'#0000ff',yellow:'#ffff00',gray:'#808080',grey:'#808080',orange:'#ffa500',purple:'#800080',pink:'#ffc0cb'};
  return named[v] || '';
}

function cDist(a: string, b: string): number {
  if (a.length!==7||b.length!==7) return 999;
  const r1=parseInt(a.slice(1,3),16),g1=parseInt(a.slice(3,5),16),b1_=parseInt(a.slice(5,7),16);
  const r2=parseInt(b.slice(1,3),16),g2=parseInt(b.slice(3,5),16),b2=parseInt(b.slice(5,7),16);
  return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1_-b2)**2);
}

function pxVal(v: unknown): number|null {
  if (typeof v === 'number') return v;
  const x = s(v).trim();
  const m = x.match(/^(-?[\d.]+)\s*px$/i);
  if (m) return parseFloat(m[1]);
  const n = parseFloat(x);
  if (isFinite(n) && x === String(n)) return n;
  return null;
}

function nearest(value: number, arr: number[]): {n: number; d: number} {
  if (!arr.length) return {n:value,d:0};
  let b=arr[0], bd=Math.abs(value-arr[0]);
  for (let i=1;i<arr.length;i++){const d=Math.abs(value-arr[i]);if(d<bd){b=arr[i];bd=d;}}
  return {n:b,d:bd};
}

// ═══════════════════════════════════════
// DATA EXTRACTION (manual, no JSON.stringify)
// ═══════════════════════════════════════

interface PC { nm: string; hx: string }
interface PT { fs:number[];fw:number[];lh:number[];ls:string[];sp:number[];mw:number[];br:number[];bw:number[];bs:string[];sh:string[];op:number[];is:number[];mh:number[] }
// Named token lookup: type → array of {id, name, value}
interface NTEntry { id: string; nm: string; val: string }
interface PD { colors: PC[]; fonts: string[]; t: PT; nt: Record<string, NTEntry[]> }
interface FC { id:string; tp:string; ct:string; st: Record<string,string|number> }

const STYLE_KEYS = [
  'backgroundColor','color','borderColor','background','border',
  'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing',
  'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
  'margin','marginTop','marginRight','marginBottom','marginLeft',
  'gap','rowGap','columnGap',
  'borderRadius','borderTopLeftRadius','borderTopRightRadius',
  'borderBottomLeftRadius','borderBottomRightRadius',
  'borderWidth','boxShadow','opacity','minHeight','maxWidth',
  'width','height','outlineColor','fill','stroke',
  'borderTopColor','borderRightColor','borderBottomColor','borderLeftColor',
];

function getDS(ds: any): PD {
  const colors: PC[] = [];
  try {
    const rc = ds?.colors;
    if (Array.isArray(rc)) {
      for (let i=0; i<rc.length && i<200; i++) {
        const c = rc[i]; if (!c) continue;
        const hx = normHex(s(c.value));
        if (hx) colors.push({nm: s(c.name), hx});
      }
    }
  } catch {/* */}
  const fonts: string[] = [];
  try { const rf=ds?.fonts; if(Array.isArray(rf)){for(let i=0;i<rf.length&&i<50;i++){if(typeof rf[i]==='string')fonts.push(rf[i]);}} } catch{/* */}
  const tk = ds?.tokens || {};

  // Extract named tokens safely — group by type
  const nt: Record<string, NTEntry[]> = {};
  try {
    const raw = ds?.namedTokens;
    if (Array.isArray(raw)) {
      for (let i = 0; i < raw.length && i < 500; i++) {
        const t = raw[i]; if (!t) continue;
        const tp = s(t.type); const id = s(t.id); const nm = s(t.name); const val = s(t.value);
        if (!tp || !id || !val) continue;
        if (!nt[tp]) nt[tp] = [];
        nt[tp].push({ id, nm, val });
      }
    }
    // Also add named token colors to the colors array for matching
    if (nt['color']) {
      for (const entry of nt['color']) {
        const hx = normHex(entry.val);
        if (hx && !colors.some(c => c.hx === hx)) {
          colors.push({ nm: entry.nm, hx });
        }
      }
    }
  } catch {/* */}

  return {
    colors, fonts, nt,
    t: {
      fs:safeNumArr(tk.fontSizes), fw:safeNumArr(tk.fontWeights), lh:safeNumArr(tk.lineHeights),
      ls:safeStrArr(tk.letterSpacing), sp:safeNumArr(tk.spacing), mw:safeNumArr(tk.maxWidths),
      br:safeNumArr(tk.borderRadius), bw:safeNumArr(tk.borderWidths), bs:safeStrArr(tk.borderStyles),
      sh:safeStrArr(tk.shadows), op:safeNumArr(tk.opacities), is:safeNumArr(tk.iconSizes), mh:safeNumArr(tk.minHeights),
    },
  };
}

function getComps(components: any[]): FC[] {
  if (!Array.isArray(components)) return [];
  const result: FC[] = [];
  const seen = new Set<string>();
  const q: any[] = [];
  for (let i=0; i<components.length && i<100; i++) { if (components[i]) q.push(components[i]); }
  let safe=0;
  while (q.length>0 && safe<500) {
    safe++;
    const c = q.shift();
    if (!c) continue;
    const id = s(c.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const st: Record<string,string|number> = {};
    const rs = c.styles;
    if (rs && typeof rs === 'object') {
      for (let k=0; k<STYLE_KEYS.length; k++) {
        try {
          const key = STYLE_KEYS[k];
          const val = rs[key];
          if (val !== undefined && val !== null && val !== '') {
            if (typeof val === 'string') st[key] = val;
            else if (typeof val === 'number') st[key] = val;
          }
        } catch{/* */}
      }
    }
    result.push({id, tp: s(c.type)||'div', ct: s(c.content), st});
    try {
      const ch = c.children;
      if (Array.isArray(ch)) { for(let i=0;i<ch.length&&i<50;i++){if(ch[i]&&ch[i].id&&!seen.has(s(ch[i].id)))q.push(ch[i]);} }
    } catch{/* */}
  }
  return result;
}

// ═══════════════════════════════════════
// VALIDATE
// ═══════════════════════════════════════

const COL_P = ['backgroundColor','color','borderColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','outlineColor','fill','stroke'];
const SPC_P = ['padding','paddingTop','paddingRight','paddingBottom','paddingLeft','margin','marginTop','marginRight','marginBottom','marginLeft','gap','rowGap','columnGap'];
const RAD_P = ['borderRadius','borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius'];

let vid = 0;
function mv(cI:string,cN:string,p:string,cur:string,cat:TokenCategory,sev:ViolationSeverity,msg:string,fix:string|null,dist?:number): Violation {
  return {id:`v-${++vid}`,componentId:cI,componentName:cN,property:p,currentValue:cur,category:cat,severity:sev,message:msg,nearestValidToken:fix,distance:dist};
}

function chk(comp: FC, ds: PD): {v:Violation[];ck:number;p:number} {
  const v: Violation[] = [];
  const st = comp.st;
  const t = ds.t;
  const nt = ds.nt;
  let ck=0, p=0;
  const cn = comp.ct.slice(0,30)||comp.tp;
  const ci = comp.id;

  // Build merged sets from flat tokens + named tokens
  const mergedSpacing = [...t.sp];
  if (nt['spacing']) for (const e of nt['spacing']) { const n = pxVal(e.val); if (n !== null && mergedSpacing.indexOf(n) === -1) mergedSpacing.push(n); }
  const mergedRadius = [...t.br];
  if (nt['radius']) for (const e of nt['radius']) { const n = pxVal(e.val); if (n !== null && mergedRadius.indexOf(n) === -1) mergedRadius.push(n); }
  const mergedShadows = [...t.sh];
  if (nt['shadow']) for (const e of nt['shadow']) { if (mergedShadows.indexOf(e.val) === -1) mergedShadows.push(e.val); }

  // Find named token name for a value
  const findTokenName = (type: string, value: string): string | null => {
    const entries = nt[type];
    if (!entries) return null;
    for (const e of entries) { if (e.val === value) return e.nm; }
    return null;
  };

  // Find nearest named color token (returns name + hex)
  const findNearestColorToken = (hex: string): { name: string; hex: string; dist: number } | null => {
    const colorEntries = nt['color'];
    if (!colorEntries || colorEntries.length === 0) return null;
    let best: { name: string; hex: string; dist: number } | null = null;
    for (const e of colorEntries) {
      const eHex = normHex(e.val);
      if (!eHex) continue;
      const d = cDist(hex, eHex);
      if (!best || d < best.dist) best = { name: e.nm, hex: eHex, dist: d };
    }
    return best;
  };

  const colChk = (prop: string, raw: string|number) => {
    const hex = parseCol(s(raw));
    if (!hex) return;
    ck++;
    if (hex==='#000000'||hex==='#ffffff'){p++;return;}
    for (let i=0;i<ds.colors.length;i++){if(ds.colors[i].hx===hex){p++;return;}}
    // Find nearest — prefer named token suggestion
    const nearestNT = findNearestColorToken(hex);
    let bN='',bH='',bD=999;
    for (let i=0;i<ds.colors.length;i++){const d=cDist(hex,ds.colors[i].hx);if(d<bD){bD=d;bH=ds.colors[i].hx;bN=ds.colors[i].nm;}}
    // Use named token suggestion if it's closer or equally close
    if (nearestNT && nearestNT.dist <= bD) { bN = nearestNT.name; bH = nearestNT.hex; bD = nearestNT.dist; }
    v.push(mv(ci,cn,prop,s(raw),'color','error',`Color not in palette${bN?`. Nearest: ${bN} (${bH})`:''}`,bH||null,bD));
  };

  const numChk = (prop: string, raw: string|number, allowed: number[], cat: TokenCategory) => {
    const n = pxVal(raw);
    if (n===null||n===0) return;
    ck++;
    if (allowed.indexOf(n)!==-1){p++;return;}
    const {n:nr,d}=nearest(n,allowed);
    // Try to find a named token for the suggestion
    const tokenType = cat === 'spacing' ? 'spacing' : cat === 'borderRadius' ? 'radius' : null;
    const tokenName = tokenType ? findTokenName(tokenType, `${nr}px`) : null;
    const suggestion = tokenName ? `${tokenName} (${nr}px)` : `${nr}px`;
    v.push(mv(ci,cn,prop,s(raw),cat,d<=2?'warning':'error',`${prop}: ${n} not in scale. Nearest: ${suggestion}`,`${nr}px`,d));
  };

  for(let i=0;i<COL_P.length;i++){if(st[COL_P[i]]!==undefined)colChk(COL_P[i],st[COL_P[i]]);}
  if (st.background!==undefined) {
    const bg=s(st.background); const bgH=parseCol(bg);
    if(bgH){colChk('background',bg);}
    else{const hx=bg.match(/#[0-9a-fA-F]{3,8}/g);if(hx)for(let i=0;i<hx.length;i++)colChk('background(grad)',hx[i]);}
  }
  if(st.border!==undefined){const pts=s(st.border).split(/\s+/);for(let i=0;i<pts.length;i++){if(parseCol(pts[i])){colChk('border(col)',pts[i]);continue;}const px=pxVal(pts[i]);if(px!==null&&px>0)numChk('border(w)',pts[i],t.bw,'borderWidth');}}

  if(st.fontSize!==undefined)numChk('fontSize',st.fontSize,t.fs,'fontSize');
  if(st.fontWeight!==undefined&&t.fw.length){const w=typeof st.fontWeight==='number'?st.fontWeight:parseInt(s(st.fontWeight));if(isFinite(w)&&w>0){ck++;if(t.fw.indexOf(w)!==-1)p++;else{const{n:nr,d}=nearest(w,t.fw);v.push(mv(ci,cn,'fontWeight',String(w),'fontWeight',d<=100?'warning':'error',`fontWeight ${w} not in scale. Nearest: ${nr}`,String(nr),d));}}}
  if(st.fontFamily!==undefined&&ds.fonts.length){ck++;const raw=s(st.fontFamily).replace(/["']/g,'').split(',')[0].trim().toLowerCase();let found=false;for(let i=0;i<ds.fonts.length;i++){if(ds.fonts[i].toLowerCase()===raw){found=true;break;}}if(found)p++;else v.push(mv(ci,cn,'fontFamily',s(st.fontFamily),'fontFamily','error','Font not in system',ds.fonts[0]));}
  if(st.lineHeight!==undefined&&t.lh.length){const lh=parseFloat(s(st.lineHeight));if(isFinite(lh)&&lh>0){ck++;if(t.lh.indexOf(lh)!==-1)p++;else{const{n:nr}=nearest(lh,t.lh);v.push(mv(ci,cn,'lineHeight',s(st.lineHeight),'lineHeight','warning',`lineHeight ${lh} not in scale`,String(nr)));}}}
  if(st.letterSpacing!==undefined&&t.ls.length){ck++;if(t.ls.indexOf(s(st.letterSpacing).trim())!==-1)p++;else v.push(mv(ci,cn,'letterSpacing',s(st.letterSpacing),'letterSpacing','warning','letterSpacing not in scale',t.ls[0]));}

  for(let i=0;i<SPC_P.length;i++){if(st[SPC_P[i]]===undefined)continue;const pts=s(st[SPC_P[i]]).split(/\s+/);for(let j=0;j<pts.length;j++){const n=pxVal(pts[j]);if(n!==null&&n!==0)numChk(SPC_P[i],pts[j],mergedSpacing,'spacing');}}
  for(let i=0;i<RAD_P.length;i++){if(st[RAD_P[i]]===undefined)continue;const pts=s(st[RAD_P[i]]).split(/\s+/);for(let j=0;j<pts.length;j++){const n=pxVal(pts[j]);if(n!==null&&n!==0)numChk(RAD_P[i],pts[j],mergedRadius,'borderRadius');}}
  if(st.borderWidth!==undefined)numChk('borderWidth',st.borderWidth,t.bw,'borderWidth');

  if(st.boxShadow!==undefined&&mergedShadows.length){ck++;const val=s(st.boxShadow).trim().replace(/\s+/g,' ').toLowerCase();let found=val==='none';if(!found)for(let i=0;i<mergedShadows.length;i++){if(mergedShadows[i].replace(/\s+/g,' ').toLowerCase()===val){found=true;break;}}if(found)p++;else{const shadowName=findTokenName('shadow',s(st.boxShadow))||null;const suggestion=shadowName||mergedShadows[0]||null;v.push(mv(ci,cn,'boxShadow',s(st.boxShadow),'shadow','error','Shadow not in system'+(shadowName?`. Try: ${shadowName}`:''),suggestion));}}
  if(st.opacity!==undefined&&t.op.length){const op=parseFloat(s(st.opacity));if(isFinite(op)){ck++;if(t.op.indexOf(op)!==-1)p++;else{const{n:nr}=nearest(op,t.op);v.push(mv(ci,cn,'opacity',String(op),'opacity','warning',`opacity not in scale`,String(nr)));}}}
  if(st.minHeight!==undefined&&t.mh.length)numChk('minHeight',st.minHeight,t.mh,'minHeight');
  if(st.maxWidth!==undefined&&t.mw.length)numChk('maxWidth',st.maxWidth,t.mw,'maxWidth');
  if(comp.tp==='icon'&&t.is.length){if(st.width!==undefined)numChk('width(icon)',st.width,t.is,'iconSize');if(st.height!==undefined)numChk('height(icon)',st.height,t.is,'iconSize');}

  return {v,ck,p};
}

// ═══════════════════════════════════════
// ACCESSIBILITY CHECKS (WCAG AA)
// ═══════════════════════════════════════

function hexToRgb(hex: string): [number, number, number] | null {
  const h = normHex(hex);
  if (!h || h.length !== 7) return null;
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}

function srgbLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r/255, g/255, b/255].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 21; // assume pass if can't parse
  const l1 = srgbLuminance(...rgb1);
  const l2 = srgbLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface A11yConfig {
  minContrastRatio: number;  // WCAG AA = 4.5 for normal text, 3.0 for large
  minFontSize: number;       // px
  minTouchTarget: number;    // px (44 for iOS, 36 for web)
  largeTextThreshold: number; // px — text above this uses 3.0 ratio instead of 4.5
}

const A11Y_CONFIGS: Record<string, A11yConfig> = {
  web:     { minContrastRatio: 4.5, minFontSize: 12, minTouchTarget: 36, largeTextThreshold: 18.66 },
  ios:     { minContrastRatio: 4.5, minFontSize: 11, minTouchTarget: 44, largeTextThreshold: 18.66 },
  android: { minContrastRatio: 4.5, minFontSize: 12, minTouchTarget: 48, largeTextThreshold: 18.66 },
};

function a11yCheck(comp: FC, allComps: FC[], platform: string): Violation[] {
  const v: Violation[] = [];
  const cfg = A11Y_CONFIGS[platform] || A11Y_CONFIGS.web;
  const cn = comp.ct.slice(0,30) || comp.tp;
  const ci = comp.id;
  const st = comp.st;

  // 1. Contrast ratio: text color against background
  const textColor = parseCol(s(st.color));
  const bgColor = parseCol(s(st.backgroundColor || st.background));
  if (textColor && bgColor) {
    const fontSize = pxVal(st.fontSize);
    const fontWeight = typeof st.fontWeight === 'number' ? st.fontWeight : parseInt(s(st.fontWeight)) || 400;
    const isLargeText = (fontSize !== null && fontSize >= cfg.largeTextThreshold) ||
                        (fontSize !== null && fontSize >= 14 && fontWeight >= 700);
    const requiredRatio = isLargeText ? 3.0 : cfg.minContrastRatio;
    const ratio = contrastRatio(textColor, bgColor);
    if (ratio < requiredRatio) {
      v.push(mv(ci, cn, 'color/backgroundColor', `${ratio.toFixed(1)}:1`, 'color', 'error',
        `Contrast ${ratio.toFixed(1)}:1 fails WCAG AA (need ${requiredRatio}:1). Text ${textColor} on ${bgColor}`,
        null));
    }
  }

  // 2. Minimum font size
  if (st.fontSize !== undefined) {
    const fs = pxVal(st.fontSize);
    if (fs !== null && fs > 0 && fs < cfg.minFontSize) {
      v.push(mv(ci, cn, 'fontSize', `${fs}px`, 'fontSize', 'warning',
        `Font size ${fs}px below minimum ${cfg.minFontSize}px for ${platform}`,
        `${cfg.minFontSize}px`, cfg.minFontSize - fs));
    }
  }

  // 3. Touch target size for interactive elements
  const isInteractive = comp.tp === 'button' || comp.tp === 'input' ||
    (st.cursor === 'pointer') || (comp.ct && comp.ct.length <= 30 && /btn|button|link|cta/i.test(comp.ct));
  if (isInteractive) {
    const w = pxVal(st.width);
    const h = pxVal(st.height) || pxVal(st.minHeight);
    if (w !== null && w > 0 && w < cfg.minTouchTarget) {
      v.push(mv(ci, cn, 'width', `${w}px`, 'minHeight' as TokenCategory, 'warning',
        `Touch target width ${w}px below ${cfg.minTouchTarget}px minimum (${platform})`,
        `${cfg.minTouchTarget}px`, cfg.minTouchTarget - w));
    }
    if (h !== null && h > 0 && h < cfg.minTouchTarget) {
      v.push(mv(ci, cn, 'height/minHeight', `${h}px`, 'minHeight' as TokenCategory, 'warning',
        `Touch target height ${h}px below ${cfg.minTouchTarget}px minimum (${platform})`,
        `${cfg.minTouchTarget}px`, cfg.minTouchTarget - h));
    }
  }

  return v;
}

// ═══════════════════════════════════════
// PUBLIC
// ═══════════════════════════════════════

export function validateAll(components: any[], designSystem: any): ValidationReport {
  vid=0;
  const ds = getDS(designSystem);
  const comps = getComps(components);
  const platform = designSystem?.platform || 'web';
  const cr: ComponentValidationResult[] = [];
  const av: Violation[] = [];
  for (let i=0;i<comps.length;i++){
    try{
      const r=chk(comps[i],ds);
      // Accessibility checks (always run)
      const a11y = a11yCheck(comps[i], comps, platform);
      const allViolations = [...r.v, ...a11y];
      cr.push({componentId:comps[i].id,componentName:comps[i].ct.slice(0,30)||comps[i].tp,passed:allViolations.length===0,violations:allViolations,checkedProperties:r.ck + a11y.length,passedProperties:r.p});
      for(let j=0;j<allViolations.length;j++)av.push(allViolations[j]);
    }catch{/* */}
  }
  // ═══ Apple HIG Cross-Component Checks ═══
  const appleViolations = checkAppleHIG(components);
  for (const v of appleViolations) av.push(v);
  const tc=cr.reduce((a,r)=>a+r.checkedProperties,0);
  const tp=cr.reduce((a,r)=>a+r.passedProperties,0);
  let ec=0,wc=0,ic=0;
  for(let i=0;i<av.length;i++){if(av[i].severity==='error')ec++;else if(av[i].severity==='warning')wc++;else ic++;}
  const hs=tc>0?Math.round((tp/tc)*100):100;
  let pc=0;for(let i=0;i<cr.length;i++)if(cr[i].passed)pc++;
  return {
    passed:av.length===0, timestamp:Date.now(), totalComponents:cr.length,
    totalChecks:tc, totalPassed:tp, totalViolations:av.length,
    errorCount:ec, warningCount:wc, infoCount:ic, healthScore:hs,
    componentResults:cr, violations:av,
    summary:av.length===0?`All ${cr.length} components pass`:`${ec} errors, ${wc} warnings (${pc} clean)`,
  };
}

export function autoFixStyles(styles: Record<string,any>, violations: Violation[]): Record<string,any> {
  const f={...styles};
  for(let i=0;i<violations.length;i++){
    const vi=violations[i];
    if(!vi.nearestValidToken) continue;
    const prop = vi.property;
    
    // Handle gradient colors: background(grad) → replace hex inside background string
    if (prop === 'background(grad)' && typeof f.background === 'string') {
      const oldHex = vi.currentValue;
      const newHex = vi.nearestValidToken;
      // Replace the specific hex color in the gradient string (case-insensitive)
      f.background = f.background.replace(new RegExp(oldHex.replace('#', '#?'), 'gi'), newHex);
      continue;
    }
    // Handle border compound: border(col) → replace color in border shorthand
    if (prop === 'border(col)' && typeof f.border === 'string') {
      f.border = f.border.replace(new RegExp(vi.currentValue.replace('#', '#?'), 'gi'), vi.nearestValidToken);
      continue;
    }
    // Handle border(w) → replace width in border shorthand
    if (prop === 'border(w)' && typeof f.border === 'string') {
      const oldPx = vi.currentValue.replace('px', '');
      f.border = f.border.replace(new RegExp(oldPx + '\\s*px', 'i'), vi.nearestValidToken);
      continue;
    }
    // Skip other compound properties
    if(prop.indexOf('(')!==-1) continue;
    // Direct property replacement
    if(prop in f) f[prop]=vi.nearestValidToken;
  }
  return f;
}

// ═══ Apple HIG Cross-Component Checks ═══
function checkAppleHIG(components: any[]): Violation[] {
  const violations: Violation[] = [];
  // 1. Concentricity — nested radii should = parent - padding
  for (const comp of components) {
    if (!comp.children?.length || comp.cornerRadiusMode === 'fixed') continue;
    const pR = parseFloat(comp.styles?.borderRadius) || 0;
    const pP = parseFloat(comp.styles?.padding) || 0;
    if (pR <= 0 || pP <= 0) continue;
    const expected = Math.max(0, pR - pP);
    for (const child of comp.children) {
      const cR = parseFloat(child.styles?.borderRadius) || 0;
      if (cR > 0 && Math.abs(cR - expected) > 2) {
        violations.push({
          id: `apple-concentric-${++vid}`, componentId: child.id,
          componentName: child.content?.slice(0, 20) || child.type || '',
          property: 'borderRadius', currentValue: `${cR}px`,
          nearestValidToken: `${expected}px`,
          severity: 'warning', category: 'Apple HIG',
          message: `Nested radius ${cR}px not concentric with parent (${pR}px - ${pP}px = ${expected}px expected)`,
        });
      }
    }
  }
  // 2. Font family count — max 2
  const fonts = new Set<string>();
  const skipFonts = ['system-ui','sans-serif','serif','monospace','inherit','initial','unset','-apple-system','BlinkMacSystemFont'];
  const collectFonts = (el: any) => {
    const ff = el.styles?.fontFamily;
    if (ff && typeof ff === 'string') {
      const clean = ff.split(',')[0].trim().replace(/['"]/g, '');
      if (clean && !skipFonts.includes(clean.toLowerCase())) fonts.add(clean);
    }
  };
  for (const comp of components) {
    collectFonts(comp);
    for (const ch of (comp.children || [])) {
      collectFonts(ch);
      for (const gc of (ch.children || [])) collectFonts(gc);
    }
  }
  if (fonts.size > 2) {
    violations.push({
      id: `apple-fonts-${++vid}`, componentId: 'global', componentName: 'All Components',
      property: 'fontFamily', currentValue: `${fonts.size} families`,
      nearestValidToken: null, severity: 'warning', category: 'Apple HIG',
      message: `${fonts.size} font families used (${[...fonts].join(', ')}). Apple HIG recommends max 2.`,
    });
  }
  // 3. Tint color count — max 1 action color across buttons
  const tintColors = new Set<string>();
  const collectTints = (el: any) => {
    if (el.type === 'button') {
      const bg = el.styles?.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== '#ffffff' && bg !== '#000000' && bg !== 'inherit') tintColors.add(parseCol(bg) || bg.toLowerCase());
    }
  };
  for (const comp of components) {
    collectTints(comp);
    for (const ch of (comp.children || [])) {
      collectTints(ch);
      for (const gc of (ch.children || [])) collectTints(gc);
    }
  }
  // Filter out empty strings from failed parses
  tintColors.delete('');
  if (tintColors.size > 2) {
    violations.push({
      id: `apple-tint-${++vid}`, componentId: 'global', componentName: 'All Buttons',
      property: 'backgroundColor', currentValue: `${tintColors.size} tint colors`,
      nearestValidToken: null, severity: 'warning', category: 'Apple HIG',
      message: `${tintColors.size} different action colors on buttons. Apple HIG recommends one tint color.`,
    });
  }

  // 4. Menu items without icons — warn if a component looks like a menu/list with text-only items
  for (const comp of components) {
    if (!comp.children?.length) continue;
    const children = comp.children || [];
    // Heuristic: a vertical flex container with 3+ children that are all similar = likely a menu
    const isVerticalList = comp.styles?.display === 'flex' && comp.styles?.flexDirection === 'column' && children.length >= 3;
    if (!isVerticalList) continue;
    const textOnlyItems = children.filter((ch: any) => ch.type === 'text' || (ch.type === 'div' && !ch.children?.some((gc: any) => gc.type === 'icon')));
    const hasAnyIcons = children.some((ch: any) => ch.type === 'icon' || ch.children?.some((gc: any) => gc.type === 'icon'));
    // If it looks like a menu/nav and has NO icons at all
    if (textOnlyItems.length >= 3 && !hasAnyIcons && /menu|nav|sidebar|dropdown|list/i.test(comp.content || comp.name || '')) {
      violations.push({
        id: `apple-menuicons-${++vid}`, componentId: comp.id,
        componentName: comp.content?.slice(0, 20) || comp.type || '',
        property: 'children', currentValue: `${textOnlyItems.length} items without icons`,
        nearestValidToken: null, severity: 'info', category: 'Apple HIG',
        message: `Menu/nav items should include icons for better scannability (Apple HIG).`,
      });
    }
  }
  return violations;
}
