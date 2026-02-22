/**
 * Bivvy Server-Side Constraint Validator
 * Runs in API routes to validate AI-generated variations BEFORE returning to client.
 * Uses the same logic as the client validator but optimized for server-side batch validation.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ServerViolation {
  property: string;
  currentValue: string;
  category: string;
  message: string;
  nearestValidToken: string | null;
}

interface VariationValidationResult {
  variationId: string;
  passed: boolean;
  errorCount: number;
  warningCount: number;
  violations: ServerViolation[];
  postFixViolations: ServerViolation[];
  wasAutoFixed: boolean;
}

// ═══════════════════════════════════════
// HELPERS
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
  const x = String(v).trim();
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
// TOKEN SET EXTRACTION
// ═══════════════════════════════════════

interface TokenSet {
  colorHexes: Set<string>;
  colorNames: Map<string, string>; // hex → name
  fontSizes: number[];
  fontWeights: number[];
  lineHeights: number[];
  letterSpacing: string[];
  spacing: number[];
  borderRadius: number[];
  borderWidths: number[];
  shadows: string[];
  opacities: number[];
  fonts: string[];
}

function extractTokenSet(designTokens: any): TokenSet {
  const ts: TokenSet = {
    colorHexes: new Set<string>(),
    colorNames: new Map<string, string>(),
    fontSizes: [], fontWeights: [], lineHeights: [], letterSpacing: [],
    spacing: [], borderRadius: [], borderWidths: [],
    shadows: [], opacities: [], fonts: [],
  };

  // Colors from palette
  if (Array.isArray(designTokens?.colors)) {
    for (const c of designTokens.colors) {
      const hex = normHex(String(c?.value || ''));
      if (hex) { ts.colorHexes.add(hex); ts.colorNames.set(hex, c.name || hex); }
    }
  }

  // Colors from named tokens
  if (Array.isArray(designTokens?.namedTokens)) {
    for (const t of designTokens.namedTokens) {
      if (t.type === 'color') {
        const hex = normHex(String(t.value || ''));
        if (hex) { ts.colorHexes.add(hex); ts.colorNames.set(hex, t.name || hex); }
      }
      if (t.type === 'spacing') {
        const px = pxVal(t.value);
        if (px !== null && !ts.spacing.includes(px)) ts.spacing.push(px);
      }
      if (t.type === 'radius') {
        const px = pxVal(t.value);
        if (px !== null && !ts.borderRadius.includes(px)) ts.borderRadius.push(px);
      }
      if (t.type === 'shadow' && t.value) {
        ts.shadows.push(t.value);
      }
      if (t.type === 'opacity' && t.value) {
        const op = parseFloat(t.value);
        if (isFinite(op) && !ts.opacities.includes(op)) ts.opacities.push(op);
      }
    }
  }

  // Always allow black and white
  ts.colorHexes.add('#000000');
  ts.colorHexes.add('#ffffff');

  // Flat token arrays
  const tk = designTokens?.tokens;
  if (tk) {
    if (Array.isArray(tk.fontSizes)) ts.fontSizes = tk.fontSizes.filter((n: any) => typeof n === 'number');
    if (Array.isArray(tk.fontWeights)) ts.fontWeights = tk.fontWeights.filter((n: any) => typeof n === 'number');
    if (Array.isArray(tk.lineHeights)) ts.lineHeights = tk.lineHeights.filter((n: any) => typeof n === 'number');
    if (Array.isArray(tk.letterSpacing)) ts.letterSpacing = tk.letterSpacing.filter((s: any) => typeof s === 'string');
    if (Array.isArray(tk.spacing)) for (const n of tk.spacing) { if (typeof n === 'number' && !ts.spacing.includes(n)) ts.spacing.push(n); }
    if (Array.isArray(tk.borderRadius)) for (const n of tk.borderRadius) { if (typeof n === 'number' && !ts.borderRadius.includes(n)) ts.borderRadius.push(n); }
    if (Array.isArray(tk.borderWidths)) ts.borderWidths = tk.borderWidths.filter((n: any) => typeof n === 'number');
    if (Array.isArray(tk.shadows)) ts.shadows.push(...tk.shadows.filter((s: any) => typeof s === 'string'));
    if (Array.isArray(tk.opacities)) ts.opacities = tk.opacities.filter((n: any) => typeof n === 'number');
  }

  if (Array.isArray(designTokens?.fonts)) ts.fonts = designTokens.fonts;

  return ts;
}

// ═══════════════════════════════════════
// VALIDATE + AUTO-FIX STYLES
// ═══════════════════════════════════════

const COLOR_PROPS = ['backgroundColor', 'color', 'borderColor', 'outlineColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'fill', 'stroke'];
const SPACING_PROPS = ['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'gap', 'rowGap', 'columnGap'];
const RADIUS_PROPS = ['borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'];

interface StyleCheckResult {
  violations: ServerViolation[];
  fixedStyles: Record<string, any>;
  wasFixed: boolean;
}

function validateAndFixStyles(styles: Record<string, any>, ts: TokenSet, elementType: string): StyleCheckResult {
  const violations: ServerViolation[] = [];
  const fixed = { ...styles };
  let wasFixed = false;

  // ── Color checks ──
  for (const prop of COLOR_PROPS) {
    if (styles[prop] === undefined) continue;
    const hex = parseCol(String(styles[prop]));
    if (!hex) continue; // transparent, inherit, etc — skip
    if (ts.colorHexes.has(hex)) continue; // valid

    // Find nearest
    let bestHex = '', bestDist = 999, bestName = '';
    for (const valid of ts.colorHexes) {
      const d = cDist(hex, valid);
      if (d < bestDist) { bestDist = d; bestHex = valid; bestName = ts.colorNames.get(valid) || valid; }
    }

    violations.push({
      property: prop,
      currentValue: String(styles[prop]),
      category: 'color',
      message: `Color ${hex} not in design system. Nearest: ${bestName} (${bestHex})`,
      nearestValidToken: bestHex,
    });

    // Auto-fix
    if (bestHex) { fixed[prop] = bestHex; wasFixed = true; }
  }

  // ── Background (may contain gradients) ──
  if (styles.background !== undefined) {
    const bg = String(styles.background);
    const hex = parseCol(bg);
    if (hex && !ts.colorHexes.has(hex)) {
      let bestHex = '', bestDist = 999, bestName = '';
      for (const valid of ts.colorHexes) {
        const d = cDist(hex, valid);
        if (d < bestDist) { bestDist = d; bestHex = valid; bestName = ts.colorNames.get(valid) || valid; }
      }
      violations.push({ property: 'background', currentValue: bg, category: 'color', message: `Background color ${hex} not in system. Nearest: ${bestName}`, nearestValidToken: bestHex });
      if (bestHex) { fixed.background = bestHex; wasFixed = true; }
    } else {
      // Check hex values inside gradients
      const hexMatches = bg.match(/#[0-9a-fA-F]{3,8}/g);
      if (hexMatches) {
        let fixedBg = bg;
        for (const rawHex of hexMatches) {
          const nh = normHex(rawHex);
          if (!nh || ts.colorHexes.has(nh)) continue;
          let bestHex = '', bestDist = 999;
          for (const valid of ts.colorHexes) {
            const d = cDist(nh, valid);
            if (d < bestDist) { bestDist = d; bestHex = valid; }
          }
          if (bestHex) {
            violations.push({ property: 'background(gradient)', currentValue: rawHex, category: 'color', message: `Gradient color ${nh} not in system`, nearestValidToken: bestHex });
            fixedBg = fixedBg.replace(new RegExp(rawHex.replace('#', '#?'), 'gi'), bestHex);
            wasFixed = true;
          }
        }
        fixed.background = fixedBg;
      }
    }
  }

  // ── Border shorthand ──
  if (styles.border !== undefined) {
    const parts = String(styles.border).split(/\s+/);
    let fixedBorder = String(styles.border);
    for (const part of parts) {
      const colHex = parseCol(part);
      if (colHex && !ts.colorHexes.has(colHex)) {
        let bestHex = '', bestDist = 999;
        for (const valid of ts.colorHexes) {
          const d = cDist(colHex, valid);
          if (d < bestDist) { bestDist = d; bestHex = valid; }
        }
        if (bestHex) {
          violations.push({ property: 'border(color)', currentValue: part, category: 'color', message: `Border color not in system`, nearestValidToken: bestHex });
          fixedBorder = fixedBorder.replace(new RegExp(part.replace('#', '#?'), 'gi'), bestHex);
          wasFixed = true;
        }
      }
    }
    fixed.border = fixedBorder;
  }

  // ── Font size ──
  if (styles.fontSize !== undefined && ts.fontSizes.length > 0) {
    const px = pxVal(styles.fontSize);
    if (px !== null && px > 0 && !ts.fontSizes.includes(px)) {
      const { n: nr } = nearest(px, ts.fontSizes);
      violations.push({ property: 'fontSize', currentValue: String(styles.fontSize), category: 'fontSize', message: `fontSize ${px} not in scale. Nearest: ${nr}px`, nearestValidToken: `${nr}px` });
      fixed.fontSize = `${nr}px`; wasFixed = true;
    }
  }

  // ── Font weight ──
  if (styles.fontWeight !== undefined && ts.fontWeights.length > 0) {
    const w = typeof styles.fontWeight === 'number' ? styles.fontWeight : parseInt(String(styles.fontWeight));
    if (isFinite(w) && w > 0 && !ts.fontWeights.includes(w)) {
      const { n: nr } = nearest(w, ts.fontWeights);
      violations.push({ property: 'fontWeight', currentValue: String(w), category: 'fontWeight', message: `fontWeight ${w} not in scale`, nearestValidToken: String(nr) });
      fixed.fontWeight = nr; wasFixed = true;
    }
  }

  // ── Spacing checks ──
  if (ts.spacing.length > 0) {
    for (const prop of SPACING_PROPS) {
      if (styles[prop] === undefined) continue;
      // Handle multi-value shorthand (e.g., "8px 16px")
      const parts = String(styles[prop]).split(/\s+/);
      const fixedParts: string[] = [];
      let partFixed = false;
      for (const part of parts) {
        const px = pxVal(part);
        if (px !== null && px !== 0 && !ts.spacing.includes(px)) {
          const { n: nr } = nearest(px, ts.spacing);
          violations.push({ property: prop, currentValue: part, category: 'spacing', message: `${prop} ${px}px not in spacing scale. Nearest: ${nr}px`, nearestValidToken: `${nr}px` });
          fixedParts.push(`${nr}px`); partFixed = true;
        } else {
          fixedParts.push(part);
        }
      }
      if (partFixed) { fixed[prop] = fixedParts.join(' '); wasFixed = true; }
    }
  }

  // ── Border radius ──
  if (ts.borderRadius.length > 0) {
    for (const prop of RADIUS_PROPS) {
      if (styles[prop] === undefined) continue;
      const parts = String(styles[prop]).split(/\s+/);
      const fixedParts: string[] = [];
      let partFixed = false;
      for (const part of parts) {
        const px = pxVal(part);
        if (px !== null && px !== 0 && !ts.borderRadius.includes(px)) {
          const { n: nr } = nearest(px, ts.borderRadius);
          violations.push({ property: prop, currentValue: part, category: 'borderRadius', message: `${prop} ${px}px not in radius scale. Nearest: ${nr}px`, nearestValidToken: `${nr}px` });
          fixedParts.push(`${nr}px`); partFixed = true;
        } else {
          fixedParts.push(part);
        }
      }
      if (partFixed) { fixed[prop] = fixedParts.join(' '); wasFixed = true; }
    }
  }

  // ── Opacity ──
  if (styles.opacity !== undefined && ts.opacities.length > 0) {
    const op = parseFloat(String(styles.opacity));
    if (isFinite(op) && !ts.opacities.includes(op)) {
      const { n: nr } = nearest(op, ts.opacities);
      violations.push({ property: 'opacity', currentValue: String(op), category: 'opacity', message: `opacity not in scale`, nearestValidToken: String(nr) });
      fixed.opacity = nr; wasFixed = true;
    }
  }

  return { violations, fixedStyles: fixed, wasFixed };
}

// ═══════════════════════════════════════
// PUBLIC: VALIDATE FULL VARIATION SET
// ═══════════════════════════════════════

export interface ValidatedVariation {
  id: string;
  name: string;
  description: string;
  changes: any[];
  validation: VariationValidationResult;
}

/**
 * Validate and auto-fix an array of AI-generated variations.
 * Returns the variations with fixed styles and validation metadata.
 */
// ═══ Apple HIG Server-Side Checks ═══
function checkAppleHIGServer(changes: any[]): ServerViolation[] {
  const violations: ServerViolation[] = [];
  for (const c of changes) {
    if (!c.children?.length) continue;
    if (c.cornerRadiusMode === 'fixed') continue;
    const pR = parseFloat(c.styles?.borderRadius) || 0;
    const pP = parseFloat(c.styles?.padding) || 0;
    if (pR <= 0 || pP <= 0) continue;
    const expected = Math.max(0, pR - pP);
    for (const child of c.children) {
      const cR = parseFloat(child.styles?.borderRadius) || 0;
      if (cR > 0 && Math.abs(cR - expected) > 2) {
        violations.push({ property: 'borderRadius', currentValue: `${cR}px`, nearestValidToken: `${expected}px`, category: 'apple-concentricity', message: `Child radius ${cR}px should be ${expected}px (concentric)` });
      }
    }
  }
  const fonts = new Set<string>();
  const skip = ['system-ui','sans-serif','serif','monospace','inherit','-apple-system'];
  for (const c of changes) {
    const ff = c.styles?.fontFamily;
    if (ff && !skip.includes(ff.toLowerCase().split(',')[0].trim())) fonts.add(ff.split(',')[0].trim());
    for (const ch of (c.children || [])) {
      const cff = ch.styles?.fontFamily;
      if (cff && !skip.includes(cff.toLowerCase().split(',')[0].trim())) fonts.add(cff.split(',')[0].trim());
    }
  }
  if (fonts.size > 2) {
    violations.push({ property: 'fontFamily', currentValue: `${fonts.size} families`, nearestValidToken: null, category: 'apple-fonts', message: `${fonts.size} font families. Apple HIG recommends max 2.` });
  }
  const tints = new Set<string>();
  for (const c of changes) {
    if (c.type === 'button') { const bg = c.styles?.backgroundColor; if (bg && bg !== 'transparent' && bg !== '#ffffff' && bg !== '#000000') tints.add(bg); }
    for (const ch of (c.children || [])) {
      if (ch.type === 'button') { const bg = ch.styles?.backgroundColor; if (bg && bg !== 'transparent' && bg !== '#ffffff' && bg !== '#000000') tints.add(bg); }
    }
  }
  if (tints.size > 2) {
    violations.push({ property: 'backgroundColor', currentValue: `${tints.size} tint colors`, nearestValidToken: null, category: 'apple-tint', message: `${tints.size} action colors. Apple HIG recommends one tint.` });
  }
  return violations;
}

export function validateVariations(
  variations: any[],
  designTokens: any
): ValidatedVariation[] {
  const ts = extractTokenSet(designTokens);
  const results: ValidatedVariation[] = [];

  for (const variation of variations) {
    const changes = variation.changes || [];
    const allViolations: ServerViolation[] = [];
    let totalWasFixed = false;
    const fixedChanges: any[] = [];

    for (const change of changes) {
      if (!change.styles || typeof change.styles !== 'object') {
        fixedChanges.push(change);
        continue;
      }

      const elementType = change.type || 'div';
      const result = validateAndFixStyles(change.styles, ts, elementType);

      fixedChanges.push({
        ...change,
        styles: result.wasFixed ? result.fixedStyles : change.styles,
      });

      if (result.wasFixed) totalWasFixed = true;
      allViolations.push(...result.violations);
    }

    // Count errors (unfixable) vs auto-fixed
    // After auto-fix, re-validate to see if any remain
    let remainingErrors = 0;
    let remainingWarnings = 0;
    const postFixViolations: ServerViolation[] = [];
    for (const change of fixedChanges) {
      if (!change.styles) continue;
      const recheck = validateAndFixStyles(change.styles, ts, change.type || 'div');
      for (const v of recheck.violations) {
        if (v.category === 'color' || v.category === 'fontSize') remainingErrors++;
        else remainingWarnings++;
        postFixViolations.push(v);
      }
    }

    results.push({
      id: variation.id,
      name: variation.name,
      description: variation.description,
      changes: fixedChanges,
      validation: {
        variationId: variation.id,
        passed: remainingErrors === 0,
        errorCount: remainingErrors,
        warningCount: remainingWarnings,
        violations: [...allViolations, ...checkAppleHIGServer(fixedChanges)],
        postFixViolations,
        wasAutoFixed: totalWasFixed,
      },
    });
  }

  return results;
}

/**
 * Build a violation summary string for retry prompts.
 * Tells the AI exactly what went wrong so it can fix it.
 */
export function buildViolationFeedback(validated: ValidatedVariation[]): string {
  const failed = validated.filter(v => !v.validation.passed);
  if (failed.length === 0) return '';

  let feedback = 'PREVIOUS ATTEMPT HAD CONSTRAINT VIOLATIONS — FIX THESE:\n';
  for (const v of failed) {
    // Use postFixViolations — these are the violations that SURVIVED auto-fix
    const remaining = v.validation.postFixViolations;
    if (remaining.length === 0) continue;
    feedback += `\nVariation "${v.name}":\n`;
    for (const viol of remaining.slice(0, 10)) {
      feedback += `  ✗ ${viol.property}: used ${viol.currentValue} — must use ${viol.nearestValidToken || 'a value from the design system'}\n`;
    }
  }
  feedback += '\nEnsure ALL values come from the design system tokens listed above. No approximations.';
  return feedback;
}
