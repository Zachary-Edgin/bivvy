import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { buildAIDesignContext } from '../lib/aiTokenContext';
import { validateVariations, buildViolationFeedback, ValidatedVariation } from '../lib/serverConstraintValidator';

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('⚠️ ANTHROPIC_API_KEY is not set. Create a .env.local file with your API key.');
}

const anthropic = new Anthropic({
  apiKey: apiKey || 'missing-key',
});

const MAX_RETRIES = 2;

// ═══════════════════════════════════════
// BUILD SYSTEM PROMPT
// ═══════════════════════════════════════

function buildSystemPrompt(
  varCount: number,
  designContext: string,
  variantContext: string,
  violationFeedback: string = '',
  hasTokens: boolean = false,
  platform: string = 'web',
): string {
  const constraintBlock = hasTokens ? `

CRITICAL — CONSTRAINT ENFORCEMENT:
Every CSS value you output MUST exist in the design system tokens above. If the tokens list specific hex colors, spacing values, font sizes, or border radii — you may ONLY use those exact values. No approximations. #1DB955 when the token is #1DB954 is a FAILURE. 17px when the spacing scale is [4, 8, 12, 16, 24] is a FAILURE. This is binary — pass or fail.
${violationFeedback ? '\n' + violationFeedback : ''}` : '';

  const platformBlock = platform === 'ios'
    ? `\nPLATFORM: iOS — Use SF Pro / -apple-system fonts by default. Min touch target 44×44px. Use 8pt grid. Blue #007AFF for primary actions. Ensure 4.5:1 contrast ratio.`
    : platform === 'android'
    ? `\nPLATFORM: Android — Use Roboto / system-ui fonts by default. Min touch target 48×48px. Use 4pt grid. Follow Material tonal palette. Ensure 4.5:1 contrast ratio.`
    : `\nPLATFORM: Web — Use Inter / system-ui fonts by default. Min touch target 36×36px. Ensure WCAG AA 4.5:1 contrast ratio.`;


  return `You are an expert UI/UX designer generating ${varCount} style variations.

CRITICAL — SCOPE AWARENESS:
Read the user's prompt carefully. ONLY change the properties they asked about.
- "change font" → ONLY change fontFamily (and optionally fontWeight/letterSpacing). Do NOT change colors, backgrounds, borders, shadows, or anything else.
- "make it darker" → change backgroundColor and ensure text contrast. Don't change fonts or layout.
- "redesign" or "restyle" or vague prompts → you may change multiple properties freely.
- If the user mentions specific properties (font, color, padding, etc.), ONLY modify those properties and directly related ones (e.g. changing background requires adjusting text color for contrast).
If unsure whether a property is in scope, DON'T change it. Less is more.

RULES:
- Return ONLY style changes (diffs) for each component, not full objects
- Each variation has an array of "changes" — objects with "id" and "styles" (only changed properties)
- If content should change (icons only), include "content"
- If switching a component's variant, include "variantProps" in the change object
- Keep JSON compact — no extra whitespace
- For icons: change color/content/size only, no backgroundColor
- For lines/arrows: change only stroke and strokeWidth, never content
- For text elements (type="text"): NEVER set backgroundColor. Only change color, fontSize, fontWeight, fontFamily, letterSpacing, lineHeight on text elements.
- CONTRAST RULE: When changing a container's backgroundColor, ALWAYS also change ALL descendant text colors to ensure readability. Dark backgrounds (#000-#444) need light text (#ffffff or #f0f0f0). Light backgrounds (#ccc-#fff) need dark text (#1a1a2e or #111111). NEVER leave white text on a white/light background or dark text on a dark background.
- BADGE OVERFLOW RULE: When a card has a badge/label (like "Most Popular") positioned at its edge with position:absolute and negative top, the card container MUST have overflow:visible. Without this, the badge gets clipped by the card border. Always include "overflow":"visible" in the container styles when adding or keeping edge badges.

DESIGNER FEEDBACK:
Components may include a "feedback" array with unresolved designer notes.
Your variations should ADDRESS this feedback while staying within scope.

PROBLEM-FRAMED UNDERSTANDING:
The user may describe problems rather than solutions. Interpret these as design challenges:
- "The text hierarchy is flat" → Vary font sizes, weights, letter-spacing to create clear hierarchy
- "It feels generic" → Try distinctive color palettes, unique font pairings, interesting spacing
- "Not enough contrast" → Experiment with dark/light inversions, color emphasis, weight contrast
- "Needs more polish" → Add shadows, borders, gradients, subtle animations, refined spacing
- "Too busy/cluttered" → Simplify, increase whitespace, reduce visual elements, mute colors
When the user describes a problem, each variation should propose a DIFFERENT solution to that problem.

VARIATION DISTINCTNESS:
Each variation should feel different from the others, but ONLY within the scope of what the user asked for.
- For font changes: use different font families/weights but keep everything else identical
- For color changes: use different palettes but keep layout/fonts identical
- For full restyling: vary backgrounds, colors, fonts, shadows, borders together
- Each variant name should communicate its theme (e.g., "Plus Jakarta Modern", "Space Grotesk Bold")

FONT OPTIONS (when fonts are in scope):
- SaaS/modern: Plus Jakarta Sans, DM Sans, Outfit, Lexend
- Bold/techy: Space Grotesk, Sora, Unbounded
- Elegant/editorial: Playfair Display, Fraunces, Instrument Serif
- Clean/minimal: General Sans, Switzer, Cabinet Grotesk
${designContext}${variantContext}${constraintBlock}${platformBlock}

APPLE DESIGN SYSTEM (HIG) PROPERTIES:
Components can include these optional Apple HIG properties in changes:
- "tintProminence": "primary"|"secondary"|"none"|"auto" — Button emphasis (primary = main action)
- "controlSize": "mini"|"sm"|"md"|"lg"|"xl" — Control sizing. lg/xl use capsule (pill) shape
- "glassEffect": true — Liquid Glass backdrop (blur(20px) saturate(1.8), translucent bg)
- "aiGenerated": true — Set on ALL components you modify
- "cornerRadiusMode": "concentric"|"capsule"|"fixed" — Radius strategy
- "scrollEdgeEffect": "soft"|"hard"|"none" — Scroll edge style
Apple rules: concentricity (child radius = parent - padding), max 2 fonts, 1 tint color, every menu item needs icon, sidebar components use floating inset glass pattern.

RESPONSE FORMAT (compact JSON, no markdown):
{"variations":[{"id":"var-1","name":"Name","description":"Brief desc","changes":[{"id":"comp-id","styles":{"fontFamily":"Plus Jakarta Sans"},"aiGenerated":true},{"id":"child-id","styles":{"fontFamily":"Plus Jakarta Sans"},"aiGenerated":true}]}]}

CRITICAL: Include changes for ALL component and child IDs that need updating. Keep it compact.`;
}

// ═══════════════════════════════════════
// CALL CLAUDE (non-streaming for validation)
// ═══════════════════════════════════════

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  referenceImage?: string | null,
  referenceImageType?: string | null,
): Promise<string> {
  // Build message content — with image if provided
  let content: any;
  if (referenceImage) {
    content = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: referenceImageType || 'image/png',
          data: referenceImage,
        },
      },
      {
        type: 'text',
        text: `[REFERENCE IMAGE] The user uploaded a reference screenshot/mockup. Analyze its visual style — colors, typography, spacing, shadows, layout — and make each variation reflect aspects of this reference image's design.\n\n${userMessage}`,
      },
    ];
  } else {
    content = userMessage;
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: 'user', content }],
  });

  let text = '';
  for (const block of response.content) {
    if (block.type === 'text') text += block.text;
  }
  return text;
}

// ═══════════════════════════════════════
// PARSE AI RESPONSE
// ═══════════════════════════════════════

function parseVariations(text: string): any[] {
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) return [];

  const jsonStr = jsonMatch[1] || jsonMatch[0];

  try {
    const parsed = JSON.parse(jsonStr);
    const vars = parsed.variations || parsed;
    if (Array.isArray(vars)) return vars;
  } catch {
    // Regex extraction fallback
    const results: any[] = [];
    const varPattern = /\{\s*"id"\s*:\s*"[^"]*"\s*,\s*"name"\s*:\s*"[^"]*"\s*,\s*"description"\s*:\s*"[^"]*"\s*,\s*"changes"\s*:\s*\[[\s\S]*?\]\s*\}/g;
    let match;
    while ((match = varPattern.exec(jsonStr)) !== null) {
      try {
        const v = JSON.parse(match[0]);
        if (v.changes && Array.isArray(v.changes)) results.push(v);
      } catch { /* skip */ }
    }
    return results;
  }

  return [];
}

// ═══════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════

export async function handleAIVariations(req: Request, res: Response) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json(
      { error: 'ANTHROPIC_API_KEY is not configured. Create a .env file with:\n\nANTHROPIC_API_KEY=sk-ant-your-key-here' }
    );
  }

  try {
    const { components, prompt, numVariations, designTokens, referenceImage, referenceImageType } = req.body;

    if (!components || !prompt) {
      return res.status(400).json({ error: 'Missing components or prompt' });
    }

    const varCount = Math.min(numVariations || 4, 4);
    const hasTokens = designTokens?.imported === true || (designTokens?.namedTokens?.length > 0) || (designTokens?.tokens?.enabled === true);
    const platform = designTokens?.platform || 'web';

    // Build compact component description
    const compactDesc = components.map((c: any) => {
      const desc: any = { id: c.id, type: c.type };
      if (c.content) desc.content = c.content;
      const keyStyles = ['backgroundColor', 'color', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'letterSpacing', 'borderRadius', 'border', 'borderWidth', 'borderColor', 'borderStyle', 'boxShadow', 'padding', 'margin', 'gap', 'opacity', 'minHeight', 'maxWidth', 'background', 'stroke', 'strokeWidth'];
      const filteredStyles: Record<string, any> = {};
      for (const k of keyStyles) {
        if (c.styles?.[k]) filteredStyles[k] = c.styles[k];
      }
      desc.styles = filteredStyles;
      // Include unresolved annotations as feedback
      const unresolvedNotes = (c.annotations || []).filter((a: any) => !a.resolved);
      if (unresolvedNotes.length > 0) {
        desc.feedback = unresolvedNotes.map((a: any) => a.text);
      }
      const serializeChildren = (children: any[]): any[] => {
        return children.map((ch: any) => {
          const chDesc: any = { id: ch.id, type: ch.type };
          if (ch.content) chDesc.content = ch.content;
          const chStyles: Record<string, any> = {};
          for (const k of keyStyles) {
            if (ch.styles?.[k]) chStyles[k] = ch.styles[k];
          }
          chDesc.styles = chStyles;
          const chNotes = (ch.annotations || []).filter((a: any) => !a.resolved);
          if (chNotes.length > 0) {
            chDesc.feedback = chNotes.map((a: any) => a.text);
          }
          if (ch.children && ch.children.length > 0) {
            chDesc.children = serializeChildren(ch.children);
          }
          return chDesc;
        });
      };
      if (c.children) {
        desc.children = serializeChildren(c.children);
      }
      return desc;
    });

    // Build design system context
    const allAnnotations = components?.flatMap((c: any) => (c.annotations || []).map((a: any) => ({ ...a, componentId: c.id }))) || [];
    const { combined: designContext } = buildAIDesignContext(designTokens, allAnnotations);

    // Build variant context
    let variantContext = '';
    if (designTokens?.componentDefs?.length > 0 && designTokens?.tokenMappings?.length > 0) {
      const variantComponents = components.filter((c: any) => c.componentDefId);
      if (variantComponents.length > 0) {
        variantContext = `\nVARIANT-LINKED COMPONENTS:
${variantComponents.map((c: any) => {
  const def = designTokens.componentDefs.find((d: any) => d.id === c.componentDefId);
  const props = c.variantProps ? Object.entries(c.variantProps).map(([k,v]: [string,any]) => `${k}=${v}`).join(', ') : 'default';
  return `  ${c.id}: ${def?.name || c.componentDefId} (${props})`;
}).join('\n')}
When generating variations for variant-linked components, prefer changing variant properties (e.g. variant: primary→secondary, size: md→lg) or adjusting within token boundaries. Include variantProps in changes if switching variants.`;
      }
    }

    const userMessage = `Components: ${JSON.stringify(compactDesc)}
Request: "${prompt}"
Generate ${varCount} variations as compact JSON.`;

    // ═══ GENERATION + VALIDATION LOOP ═══
    let attempt = 0;
    let violationFeedback = '';
    let finalResult: ValidatedVariation[] = [];
    let bestEffortResult: ValidatedVariation[] = []; // Fallback if retries produce unparseable output

    while (attempt <= MAX_RETRIES) {
      attempt++;
      const isRetry = attempt > 1;

      console.log(`[Bivvy] AI variation attempt ${attempt}/${MAX_RETRIES + 1}${isRetry ? ' (retry — fixing violations)' : ''}`);

      const systemPrompt = buildSystemPrompt(varCount, designContext, variantContext, violationFeedback, hasTokens, platform);
      const rawText = await callClaude(systemPrompt, userMessage, attempt === 1 ? referenceImage : null, attempt === 1 ? referenceImageType : null);
      const parsedVariations = parseVariations(rawText);

      if (parsedVariations.length === 0) {
        if (attempt <= MAX_RETRIES) {
          violationFeedback = 'PREVIOUS RESPONSE WAS INVALID JSON. Return ONLY valid JSON matching the format specified. No markdown, no commentary.';
          continue;
        }
        // Last attempt failed to parse — use best effort if available
        if (bestEffortResult.length > 0) {
          console.log('[Bivvy] Retry parse failed — falling back to best-effort result from earlier attempt');
          finalResult = bestEffortResult;
          break;
        }
        return res.status(422).json({ error: 'AI response could not be parsed. Try a simpler prompt.' });
      }

      // ═══ VALIDATE + AUTO-FIX ═══
      if (!hasTokens) {
        // No constraints — pass through
        finalResult = parsedVariations.map((v: any) => ({
          id: v.id, name: v.name, description: v.description, changes: v.changes || [],
          validation: { variationId: v.id, passed: true, errorCount: 0, warningCount: 0, violations: [], postFixViolations: [], wasAutoFixed: false },
        }));
        break;
      }

      const validated = validateVariations(parsedVariations, designTokens);

      // Always save as best-effort fallback
      bestEffortResult = validated;

      const allPass = validated.every(v => v.validation.passed);
      const totalErrors = validated.reduce((sum, v) => sum + v.validation.errorCount, 0);
      const totalFixed = validated.filter(v => v.validation.wasAutoFixed).length;

      console.log(`[Bivvy] Validation: ${allPass ? 'ALL PASS ✓' : `${totalErrors} errors remaining`} | ${totalFixed} auto-fixed | attempt ${attempt}`);

      if (allPass || attempt > MAX_RETRIES) {
        finalResult = validated;
        break;
      }

      // Build feedback for retry
      violationFeedback = buildViolationFeedback(validated);
    }

    // ═══ CONTRAST SAFETY CHECK ═══
    // Post-process all variations to ensure text is visible against backgrounds
    const ensureContrast = (variations: any[], sourceComponents: any[]) => {
      const hexToLuminance = (hex: string): number => {
        const clean = hex.replace('#', '');
        if (clean.length < 6) return 0.5;
        const r = parseInt(clean.substring(0, 2), 16) / 255;
        const g = parseInt(clean.substring(2, 4), 16) / 255;
        const b = parseInt(clean.substring(4, 6), 16) / 255;
        const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
      };
      const isDark = (color: string) => hexToLuminance(color) < 0.4;
      const isLight = (color: string) => hexToLuminance(color) > 0.6;
      
      // Build a map of all component backgrounds (original + changed)
      for (const variation of variations) {
        if (!variation.changes) continue;
        const changesMap = new Map<string, any>();
        for (const change of variation.changes) changesMap.set(change.id, change);
        
        // Collect background colors from changes and originals
        const bgColors = new Map<string, string>(); // id -> backgroundColor
        const collectBgs = (comps: any[], parentBg?: string) => {
          for (const comp of comps) {
            const change = changesMap.get(comp.id);
            const bg = change?.styles?.backgroundColor || comp.styles?.backgroundColor || parentBg;
            if (bg && bg !== 'transparent' && bg !== 'inherit') bgColors.set(comp.id, bg);
            if (comp.children) collectBgs(comp.children, bg || parentBg);
          }
        };
        collectBgs(sourceComponents);
        
        // Check each text element's color against its container's background
        const fixTextContrast = (comps: any[], parentBg?: string) => {
          for (const comp of comps) {
            const change = changesMap.get(comp.id);
            const myBg = change?.styles?.backgroundColor || comp.styles?.backgroundColor;
            const effectiveBg = (myBg && myBg !== 'transparent') ? myBg : parentBg;
            
            if (comp.type === 'text' || comp.type === 'button' || comp.type === 'input') {
              const textColor = change?.styles?.color || comp.styles?.color;
              if (effectiveBg && textColor) {
                try {
                  const bgIsLight = isLight(effectiveBg);
                  const textIsLight = isLight(textColor);
                  // Both light = invisible text on light bg
                  // Both dark = invisible text on dark bg
                  if (bgIsLight && textIsLight) {
                    if (!change) {
                      variation.changes.push({ id: comp.id, styles: { color: '#111111' } });
                    } else {
                      change.styles = { ...change.styles, color: '#111111' };
                    }
                  } else if (!bgIsLight && isDark(textColor)) {
                    if (!change) {
                      variation.changes.push({ id: comp.id, styles: { color: '#ffffff' } });
                    } else {
                      change.styles = { ...change.styles, color: '#ffffff' };
                    }
                  }
                } catch {}
              } else if (effectiveBg && !textColor) {
                // No explicit text color — check if default would be invisible
                try {
                  const bgIsLight = isLight(effectiveBg);
                  // Default text in dark themes is usually light
                  const defaultColor = comp.styles?.color || '#ffffff';
                  const defaultIsLight = isLight(defaultColor);
                  if (bgIsLight && defaultIsLight) {
                    if (!change) {
                      variation.changes.push({ id: comp.id, styles: { color: '#111111' } });
                    } else {
                      change.styles = { ...change.styles, color: '#111111' };
                    }
                  }
                } catch {}
              }
            }
            if (comp.children) fixTextContrast(comp.children, effectiveBg || parentBg);
          }
        };
        fixTextContrast(sourceComponents);
      }
    };
    ensureContrast(finalResult, components);

    // ═══ BUILD RESPONSE ═══
    const totalViolations = finalResult.reduce((sum, v) => sum + v.validation.violations.length, 0);
    const totalAutoFixed = finalResult.filter(v => v.validation.wasAutoFixed).length;
    const allPassed = finalResult.every(v => v.validation.passed);

    return res.json({
      variations: finalResult.map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        changes: v.changes,
      })),
      validation: {
        allPassed,
        totalVariations: finalResult.length,
        totalViolationsFound: totalViolations,
        totalAutoFixed,
        attempts: attempt,
        details: finalResult.map(v => v.validation),
      },
    });

  } catch (error: any) {
    console.error('Error in AI variations:', error);
    return res.status(500).json(
      { error: error.message || 'Internal server error' }
    );
  }
}
