/**
 * Shared AI Token Context Builder
 * Generates design system context strings for AI prompts.
 * Used by both /api/ai-update and /api/ai-variations routes.
 */

import { componentLibrary } from '@/lib/componentLibrary';
import { parseTypeStyle } from '@/lib/designSystemDefaults';

// Generate compact library reference for AI context
function getLibraryPatternsCompact(): string {
  const byCategory = new Map<string, string[]>();
  for (const t of componentLibrary) {
    const list = byCategory.get(t.category) || [];
    list.push(t.name);
    byCategory.set(t.category, list);
  }
  return Array.from(byCategory.entries())
    .map(([cat, names]) => `${cat}: ${names.join(', ')}`)
    .join('\n');
}

interface AIDesignContext {
  /** Legacy flat token constraints (MANDATORY values) */
  tokenConstraints: string;
  /** Named semantic token reference */
  namedTokenContext: string;
  /** Component variant system context */
  componentDefContext: string;
  /** Guideline rules + library patterns */
  guidelineConstraints: string;
  /** Annotation feedback from designer */
  annotationContext: string;
  /** All sections combined */
  combined: string;
}

export function buildAIDesignContext(designTokens: any, annotations?: any[]): AIDesignContext {
  // 1. Legacy flat token constraints
  let tokenConstraints = '';
  if (designTokens?.tokens?.enabled) {
    const t = designTokens.tokens;
    const colors = designTokens.colors?.map((c: any) => `${c.name}: ${c.value}`).join(', ');
    const fonts = designTokens.fonts?.join(', ');
    tokenConstraints = `
DESIGN TOKEN CONSTRAINTS (MANDATORY — only use these values):
Colors: ${colors || 'any'}
Fonts: ${fonts || 'any'}
Font sizes: ${t.fontSizes?.join(', ') || 'any'}px
Font weights: ${t.fontWeights?.join(', ') || 'any'}
Line heights: ${t.lineHeights?.join(', ') || 'any'}
Letter spacing: ${t.letterSpacing?.join(', ') || 'any'}
Spacing (padding/margin/gap): ${t.spacing?.join(', ') || 'any'}px
Max widths: ${t.maxWidths?.join(', ') || 'any'}px
Border radius: ${t.borderRadius?.join(', ') || 'any'}px
Border widths: ${t.borderWidths?.join(', ') || 'any'}px
Border styles: ${t.borderStyles?.join(', ') || 'any'}
Box shadows: ${t.shadows?.join(' | ') || 'any'}
Opacities: ${t.opacities?.join(', ') || 'any'}
Icon sizes: ${t.iconSizes?.join(', ') || 'any'}px
Min heights (buttons/inputs): ${t.minHeights?.join(', ') || 'any'}px
STRICT: Do NOT use any values outside these tokens. Every CSS value must come from the defined set.`;
  }

  // 2. Named semantic tokens (when design system has named tokens loaded)
  let namedTokenContext = '';
  if (designTokens?.namedTokens?.length > 0) {
    const nt = designTokens.namedTokens;
    const semanticColors = nt.filter((t: any) => t.type === 'color' && t.category === 'semantic' && t.theme === 'dark');
    if (semanticColors.length > 0) {
      namedTokenContext += `\nSEMANTIC COLOR TOKENS (dark theme — primary palette):
${semanticColors.map((t: any) => `  ${t.name}: ${t.value} — ${t.description}`).join('\n')}`;
    }
    const lightColors = nt.filter((t: any) => t.type === 'color' && t.category === 'semantic' && t.theme === 'light');
    if (lightColors.length > 0) {
      namedTokenContext += `\nSEMANTIC COLOR TOKENS (light theme — for light mode generation):
${lightColors.map((t: any) => `  ${t.name}: ${t.value} — ${t.description}`).join('\n')}`;
    }
    // Include spacing tokens
    const spacingTokens = nt.filter((t: any) => t.type === 'spacing');
    if (spacingTokens.length > 0) {
      namedTokenContext += `\nSPACING TOKENS:
${spacingTokens.map((t: any) => `  ${t.name}: ${t.value}`).join('\n')}`;
    }
    // Include radius tokens
    const radiusTokens = nt.filter((t: any) => t.type === 'radius');
    if (radiusTokens.length > 0) {
      namedTokenContext += `\nBORDER RADIUS TOKENS:
${radiusTokens.map((t: any) => `  ${t.name}: ${t.value}`).join('\n')}`;
    }
    // Include shadow tokens
    const shadowTokens = nt.filter((t: any) => t.type === 'shadow');
    if (shadowTokens.length > 0) {
      namedTokenContext += `\nSHADOW TOKENS:
${shadowTokens.map((t: any) => `  ${t.name}: ${t.value}`).join('\n')}`;
    }
    // Include opacity tokens
    const opacityTokens = nt.filter((t: any) => t.type === 'opacity');
    if (opacityTokens.length > 0) {
      namedTokenContext += `\nOPACITY TOKENS:
${opacityTokens.map((t: any) => `  ${t.name}: ${t.value} — ${t.description}`).join('\n')}`;
    }
    // Include motion tokens (durations + easings)
    const motionTokens = nt.filter((t: any) => t.type === 'motion');
    if (motionTokens.length > 0) {
      const durations = motionTokens.filter((t: any) => t.name.startsWith('duration'));
      const easings = motionTokens.filter((t: any) => t.name.startsWith('easing'));
      if (durations.length > 0) namedTokenContext += `\nMOTION — DURATION TOKENS:\n${durations.map((t: any) => `  ${t.name}: ${t.value}`).join('\n')}`;
      if (easings.length > 0) namedTokenContext += `\nMOTION — EASING TOKENS:\n${easings.map((t: any) => `  ${t.name}: ${t.value}`).join('\n')}`;
    }
    // Include z-index tokens
    const zIndexTokens = nt.filter((t: any) => t.type === 'z-index');
    if (zIndexTokens.length > 0) {
      namedTokenContext += `\nZ-INDEX TOKENS:\n${zIndexTokens.map((t: any) => `  ${t.name}: ${t.value} — ${t.description}`).join('\n')}`;
    }
    // Include breakpoint tokens
    const breakpointTokens = nt.filter((t: any) => t.type === 'breakpoint');
    if (breakpointTokens.length > 0) {
      namedTokenContext += `\nBREAKPOINT TOKENS:\n${breakpointTokens.map((t: any) => `  ${t.name}: ${t.value} — ${t.description}`).join('\n')}`;
    }
    // Include composed type styles with decomposed values
    const typeStyles = nt.filter((t: any) => t.type === 'typography' && t.name.startsWith('type-'));
    if (typeStyles.length > 0) {
      namedTokenContext += `\nTYPE STYLES — composed typography presets. Apply via "typeStyle" field on a component update, or set individual CSS properties:`;
      for (const t of typeStyles) {
        const parsed = parseTypeStyle(t.value);
        if (parsed) {
          namedTokenContext += `\n  ${t.name}: fontSize=${parsed.fontSize} lineHeight=${parsed.lineHeight} fontWeight=${parsed.fontWeight} fontFamily=${parsed.fontFamily} — ${t.description}`;
        } else {
          namedTokenContext += `\n  ${t.name}: ${t.value} — ${t.description}`;
        }
      }
      namedTokenContext += `\nTo apply a type style: include "typeStyle": "${typeStyles[0].id}" in the component update. This sets fontSize, lineHeight, fontWeight, and fontFamily from the preset. Individual font properties in "styles" override the preset.`;
    }
  }

  // 3. Component variant system (when component definitions are loaded)
  let componentDefContext = '';
  if (designTokens?.componentDefs?.length > 0) {
    componentDefContext = `\nCOMPONENT VARIANT SYSTEM:
Components can be linked to the design system via componentDefId and variantProps.
Available component types:
${designTokens.componentDefs.map((d: any) => {
  const props = d.properties.map((p: any) => `${p.name}=[${p.options.join('|')}]`).join(', ');
  const states = d.states?.length > 0 ? ` | states: ${d.states.join(', ')}` : '';
  const useWhen = d.useWhen?.length > 0 ? `
      Use when: ${d.useWhen.join('; ')}` : '';
  const dontUse = d.dontUseWhen?.length > 0 ? `
      Avoid when: ${d.dontUseWhen.join('; ')}` : '';
  const builtFrom = d.builtFrom?.length > 0 ? `
      Composed of: ${d.builtFrom.join(', ')}` : '';
  const platformInfo = d.platformOverrides ? Object.entries(d.platformOverrides).map(([p, info]: [string, any]) =>
    `${p}: ${info.notes}`).join(' | ') : '';
  const platformLine = platformInfo ? `\n      Platforms: ${platformInfo}` : '';
  return `  ${d.name} (id: ${d.id}): ${props}${states}${useWhen}${dontUse}${builtFrom}${platformLine}`;
}).join('\n')}
When a component has a componentDefId, its styles are derived from token mappings for every variant×size×state combination. Respect variant boundaries — generate variations that stay within the variant system (e.g. change variant from "primary" to "secondary", or size from "md" to "lg", rather than applying arbitrary colors). Include variantProps in changes if switching variants.`;
  }

  // 4. Guidelines + library patterns
  let guidelineConstraints = '';
  if (designTokens?.guidelines?.enabled) {
    const g = designTokens.guidelines;
    if (g.rules && g.rules.length > 0) {
      guidelineConstraints += `\nDESIGN GUIDELINES (follow these patterns):\n${g.rules.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}`;
    }
    if (g.referenceLibrary) {
      const libraryRef = getLibraryPatternsCompact();
      guidelineConstraints += `\nCOMPONENT LIBRARY REFERENCE — Match these existing patterns when creating new components:\n${libraryRef}\nNew components should feel consistent with these established patterns.`;
    }
  }

  // 5. Annotation feedback (designer's notes on previous iterations)
  let annotationContext = '';
  if (annotations && annotations.length > 0) {
    const unresolved = annotations.filter((a: any) => !a.resolved);
    const resolved = annotations.filter((a: any) => a.resolved);
    if (unresolved.length > 0) {
      annotationContext += `\nDESIGNER ANNOTATIONS (active feedback — incorporate these into your response):
${unresolved.map((a: any, i: number) => `  ${i + 1}. "${a.text}"${a.type ? ` [${a.type}]` : ''}`).join('\n')}`;
    }
    if (resolved.length > 0) {
      annotationContext += `\nPREVIOUS ANNOTATIONS (resolved — for context only):
${resolved.map((a: any, i: number) => `  ${i + 1}. "${a.text}" ✓`).join('\n')}`;
    }
  }

  const combined = `${tokenConstraints}${namedTokenContext}${componentDefContext}${guidelineConstraints}${annotationContext}`;

  return { tokenConstraints, namedTokenContext, componentDefContext, guidelineConstraints, annotationContext, combined };
}
