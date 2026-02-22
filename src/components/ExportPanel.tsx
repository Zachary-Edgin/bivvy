'use client';

import { useState, useMemo, useRef } from 'react';
import { useStore, ComponentElement } from '@/store/componentStore';
import { Code, Copy, Check, X, Download, Layers, Component, ExternalLink } from 'lucide-react';

// ─── Tailwind Mapping ─────────────────────────────────────────────

const cssToTailwind: Record<string, (v: string) => string> = {
  backgroundColor: (v) => {
    const m: Record<string, string> = {
      '#ffffff': 'bg-white', '#000000': 'bg-black', 'transparent': 'bg-transparent',
      '#f8fafc': 'bg-slate-50', '#f1f5f9': 'bg-slate-100', '#e2e8f0': 'bg-slate-200',
      '#cbd5e1': 'bg-slate-300', '#94a3b8': 'bg-slate-400', '#64748b': 'bg-slate-500',
      '#475569': 'bg-slate-600', '#334155': 'bg-slate-700', '#1e293b': 'bg-slate-800',
      '#0f172a': 'bg-slate-900',
      '#f9fafb': 'bg-gray-50', '#f3f4f6': 'bg-gray-100', '#e5e7eb': 'bg-gray-200',
      '#d1d5db': 'bg-gray-300', '#9ca3af': 'bg-gray-400', '#6b7280': 'bg-gray-500',
      '#4b5563': 'bg-gray-600', '#374151': 'bg-gray-700', '#1f2937': 'bg-gray-800',
      '#111827': 'bg-gray-900',
    };
    return m[v?.toLowerCase()] || `bg-[${v}]`;
  },
  color: (v) => {
    const m: Record<string, string> = {
      '#ffffff': 'text-white', '#000000': 'text-black',
      '#f9fafb': 'text-gray-50', '#f3f4f6': 'text-gray-100', '#e5e7eb': 'text-gray-200',
      '#d1d5db': 'text-gray-300', '#9ca3af': 'text-gray-400', '#6b7280': 'text-gray-500',
      '#4b5563': 'text-gray-600', '#374151': 'text-gray-700', '#1f2937': 'text-gray-800',
      '#111827': 'text-gray-900',
    };
    return m[v?.toLowerCase()] || `text-[${v}]`;
  },
  fontSize: (v) => {
    const m: Record<string, string> = {
      '12px': 'text-xs', '14px': 'text-sm', '16px': 'text-base', '18px': 'text-lg',
      '20px': 'text-xl', '24px': 'text-2xl', '30px': 'text-3xl', '36px': 'text-4xl',
      '48px': 'text-5xl', '60px': 'text-6xl', '72px': 'text-7xl',
    };
    return m[v] || `text-[${v}]`;
  },
  fontWeight: (v) => {
    const m: Record<string, string> = {
      '100': 'font-thin', '200': 'font-extralight', '300': 'font-light',
      '400': 'font-normal', '500': 'font-medium', '600': 'font-semibold',
      '700': 'font-bold', '800': 'font-extrabold', '900': 'font-black',
    };
    return m[v] || `font-[${v}]`;
  },
  borderRadius: (v) => {
    const m: Record<string, string> = {
      '0px': 'rounded-none', '2px': 'rounded-sm', '4px': 'rounded',
      '6px': 'rounded-md', '8px': 'rounded-lg', '12px': 'rounded-xl',
      '16px': 'rounded-2xl', '24px': 'rounded-3xl', '50%': 'rounded-full',
      '9999px': 'rounded-full',
    };
    return m[v] || `rounded-[${v}]`;
  },
  padding: (v) => {
    if (v.includes(' ')) {
      const p = v.split(' ').map(s => s.trim());
      if (p.length === 2) return `py-[${p[0]}] px-[${p[1]}]`;
      if (p.length === 4) return `pt-[${p[0]}] pr-[${p[1]}] pb-[${p[2]}] pl-[${p[3]}]`;
    }
    const m: Record<string, string> = {
      '4px': 'p-1', '8px': 'p-2', '12px': 'p-3', '16px': 'p-4',
      '20px': 'p-5', '24px': 'p-6', '32px': 'p-8',
    };
    return m[v] || `p-[${v}]`;
  },
  display: (v) => v === 'flex' ? 'flex' : v === 'grid' ? 'grid' : v === 'inline-flex' ? 'inline-flex' : '',
  flexDirection: (v) => v === 'column' ? 'flex-col' : v === 'row' ? 'flex-row' : '',
  alignItems: (v) => {
    const m: Record<string, string> = { center: 'items-center', 'flex-start': 'items-start', 'flex-end': 'items-end', stretch: 'items-stretch' };
    return m[v] || '';
  },
  justifyContent: (v) => {
    const m: Record<string, string> = { center: 'justify-center', 'flex-start': 'justify-start', 'flex-end': 'justify-end', 'space-between': 'justify-between' };
    return m[v] || '';
  },
  gap: (v) => {
    const m: Record<string, string> = {
      '4px': 'gap-1', '8px': 'gap-2', '12px': 'gap-3', '16px': 'gap-4',
      '20px': 'gap-5', '24px': 'gap-6', '32px': 'gap-8',
    };
    return m[v] || `gap-[${v}]`;
  },
  textAlign: (v) => {
    const m: Record<string, string> = { center: 'text-center', left: 'text-left', right: 'text-right' };
    return m[v] || '';
  },
  overflow: (v) => v === 'hidden' ? 'overflow-hidden' : '',
  cursor: (v) => v === 'pointer' ? 'cursor-pointer' : '',
  marginTop: (v) => v === 'auto' ? 'mt-auto' : '',
  opacity: (v) => {
    const m: Record<string, string> = { '0': 'opacity-0', '0.5': 'opacity-50', '0.75': 'opacity-75', '1': 'opacity-100' };
    return m[v] || `opacity-[${v}]`;
  },
  width: (v) => {
    if (v === '100%') return 'w-full';
    if (v === 'auto') return 'w-auto';
    return `w-[${v}]`;
  },
  height: (v) => {
    if (v === '100%') return 'h-full';
    if (v === 'auto') return 'h-auto';
    return `h-[${v}]`;
  },
  lineHeight: (v) => {
    const m: Record<string, string> = { '1': 'leading-none', '1.25': 'leading-tight', '1.375': 'leading-snug', '1.5': 'leading-normal', '1.625': 'leading-relaxed', '2': 'leading-loose' };
    return m[v] || `leading-[${v}]`;
  },
  letterSpacing: (v) => {
    const m: Record<string, string> = { '-0.05em': 'tracking-tighter', '-0.025em': 'tracking-tight', '0em': 'tracking-normal', '0.025em': 'tracking-wide', '0.05em': 'tracking-wider', '0.1em': 'tracking-widest' };
    return m[v] || `tracking-[${v}]`;
  },
};

function stylesToTailwind(styles: Record<string, any>): { classes: string; inlineStyles: Record<string, any> } {
  const classes: string[] = [];
  const inlineStyles: Record<string, any> = {};
  // Skip canvas-only properties
  const skipKeys = new Set(['transition', 'pointerEvents', 'outline', 'outlineOffset', 'userSelect', 'WebkitUserSelect']);

  for (const [key, value] of Object.entries(styles)) {
    if (!value || value === 'inherit' || value === 'none' || value === 'normal') continue;
    if (skipKeys.has(key)) continue;
    const converter = cssToTailwind[key];
    if (converter) {
      const cls = converter(String(value));
      if (cls) classes.push(cls);
      else inlineStyles[key] = value;
    } else {
      inlineStyles[key] = value;
    }
  }

  return { classes: classes.join(' '), inlineStyles };
}

// ─── Syntax Highlighting ──────────────────────────────────────────

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code: string, format: 'react' | 'html'): string {
  const escaped = escapeHtml(code);
  const lines = escaped.split('\n');

  return lines.map(line => {
    let result = line;

    // Comments
    result = result.replace(/(\/\/.*$)/gm, '<span class="tok-cmt">$1</span>');
    result = result.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-cmt">$1</span>');

    // Strings (double-quoted)
    result = result.replace(/"([^"]*)"/g, '<span class="tok-str">"$1"</span>');

    // Keywords
    result = result.replace(/\b(import|from|export|default|function|return|const|let|var)\b/g, '<span class="tok-kw">$1</span>');

    // JSX/HTML tags
    result = result.replace(/(&lt;\/?)([\w-]+)/g, (_, bracket, tag) => {
      const isComponent = tag[0] === tag[0].toUpperCase();
      return `${bracket}<span class="${isComponent ? 'tok-comp' : 'tok-tag'}">${tag}</span>`;
    });

    // Attributes
    result = result.replace(/\b(className|style|placeholder|onClick|key|class|href|src|alt|type|lang|charset|name|content|rel)(?==)/g, '<span class="tok-attr">$1</span>');

    // Braces in JSX
    if (format === 'react') {
      result = result.replace(/(\{|\})/g, '<span class="tok-brace">$1</span>');
    }

    return result;
  }).join('\n');
}

// ─── Code Generators ──────────────────────────────────────────────

// Strip canvas-only positioning from child elements for clean export
function cleanChildStyles(styles: Record<string, any>, isChild: boolean): Record<string, any> {
  if (!isChild) return styles;
  const clean = { ...styles };
  // Remove absolute positioning artifacts from children in flex/grid parents
  if (clean.position === 'absolute' || clean.position === 'relative') delete clean.position;
  delete clean.left;
  delete clean.top;
  return clean;
}

function generateReactCode(comp: ComponentElement, indent = '      ', isChild = false): string {
  const cleanedStyles = cleanChildStyles(comp.styles, isChild);
  const { classes, inlineStyles } = stylesToTailwind(cleanedStyles);
  const hasInline = Object.keys(inlineStyles).length > 0;
  const styleAttr = hasInline ? ` style={${JSON.stringify(inlineStyles)}}` : '';

  let stateClasses = '';
  if (comp.hoverStyles) {
    const { classes: hc } = stylesToTailwind(comp.hoverStyles);
    if (hc) stateClasses += ' ' + hc.split(' ').map(c => `hover:${c}`).join(' ');
  }
  if (comp.activeStyles) {
    const { classes: ac } = stylesToTailwind(comp.activeStyles);
    if (ac) stateClasses += ' ' + ac.split(' ').map(c => `active:${c}`).join(' ');
  }
  if (comp.disabledStyles) {
    const { classes: dc } = stylesToTailwind(comp.disabledStyles);
    if (dc) stateClasses += ' ' + dc.split(' ').map(c => `disabled:${c}`).join(' ');
  }
  if (comp.focusedStyles) {
    const { classes: fc } = stylesToTailwind(comp.focusedStyles);
    if (fc) stateClasses += ' ' + fc.split(' ').map(c => `focus:${c}`).join(' ');
  }
  if (comp.loadingStyles) {
    const { classes: lc } = stylesToTailwind(comp.loadingStyles);
    if (lc) stateClasses += ' ' + lc.split(' ').map(c => `aria-busy:${c}`).join(' ');
  }

  // Apple Design System Tailwind
  let appleClasses = '';
  if (comp.glassEffect) appleClasses += ' backdrop-blur-xl backdrop-saturate-150 bg-white/15 border border-white/20';
  if (comp.controlSize === 'lg' || comp.controlSize === 'xl' || comp.cornerRadiusMode === 'capsule') appleClasses += ' rounded-full';

  const allClasses = (classes + stateClasses + appleClasses).trim();
  const classAttr = allClasses ? ` className="${allClasses}"` : '';

  // Variant-aware export: if component has a variant definition, export as a semantic component
  if (comp.componentDefId && comp.variantProps && Object.keys(comp.variantProps).length > 0 && !isChild) {
    const defName = comp.componentDefId.replace('def-', '').charAt(0).toUpperCase() + comp.componentDefId.replace('def-', '').slice(1);
    const propsStr = Object.entries(comp.variantProps).map(([k, v]) => `${k}="${v}"`).join(' ');
    const hasChildren = comp.children && comp.children.length > 0;
    const childCode = hasChildren ? comp.children!.map(child => generateReactCode(child, indent + '  ', true)).join('\n') : '';
    
    // Build inner content: text content + children
    const parts: string[] = [];
    if (comp.content) parts.push(`${indent}  ${comp.content}`);
    if (childCode) parts.push(childCode);
    
    if (parts.length > 0) {
      return `${indent}<${defName} ${propsStr}${classAttr}>\n${parts.join('\n')}\n${indent}</${defName}>`;
    }
    return `${indent}<${defName} ${propsStr}${classAttr} />`;
  }

  if (comp.type === 'icon') {
    const iconName = comp.content || 'circle';
    const pascal = iconName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const sz = Math.min(parseInt(String(comp.size?.width) || '24'), 48);
    const colorProp = comp.styles?.color ? ` color="${comp.styles.color}"` : '';
    return `${indent}<${pascal} size={${sz}}${colorProp} />`;
  }

  if (comp.type === 'text') {
    const fs = parseInt(comp.styles?.fontSize || '16');
    const tag = fs >= 28 ? 'h2' : fs >= 22 ? 'h3' : 'p';
    return `${indent}<${tag}${classAttr}${styleAttr}>\n${indent}  ${comp.content || ''}\n${indent}</${tag}>`;
  }

  if (comp.type === 'button') {
    // If button has icon children, render them inline
    if (comp.children && comp.children.length > 0) {
      const childCode = comp.children.map(child => generateReactCode(child, indent + '  ', true)).join('\n');
      return `${indent}<button${classAttr}${styleAttr}>\n${childCode}\n${indent}</button>`;
    }
    return `${indent}<button${classAttr}${styleAttr}>\n${indent}  ${comp.content || 'Button'}\n${indent}</button>`;
  }

  if (comp.type === 'input') {
    return `${indent}<input${classAttr}${styleAttr} placeholder="${comp.content || ''}" />`;
  }

  if (comp.children && comp.children.length > 0) {
    const childCode = comp.children.map(child => generateReactCode(child, indent + '  ', true)).join('\n');
    return `${indent}<div${classAttr}${styleAttr}>\n${childCode}\n${indent}</div>`;
  }

  if (comp.content) {
    return `${indent}<div${classAttr}${styleAttr}>${comp.content}</div>`;
  }

  return `${indent}<div${classAttr}${styleAttr} />`;
}

function generateFullReact(components: ComponentElement[]): string {
  const iconImports = new Set<string>();
  const fonts = new Set<string>();
  const variantComponents = new Set<string>();

  const collectMeta = (comp: ComponentElement) => {
    if (comp.type === 'icon' && comp.content) {
      const pascal = comp.content.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
      iconImports.add(pascal);
    }
    if (comp.componentDefId) {
      const defName = comp.componentDefId.replace('def-', '').charAt(0).toUpperCase() + comp.componentDefId.replace('def-', '').slice(1);
      variantComponents.add(defName);
    }
    const ff = comp.styles?.fontFamily;
    if (ff) {
      const primary = ff.split(',')[0].trim().replace(/['"]/g, '');
      if (primary && !['Arial', 'Helvetica', 'sans-serif', 'serif', 'monospace'].includes(primary)) {
        fonts.add(primary);
      }
    }
    comp.children?.forEach(collectMeta);
  };
  components.forEach(collectMeta);

  let code = '';

  if (fonts.size > 0) {
    code += `// Fonts: ${[...fonts].join(', ')}\n`;
    code += `// <link href="https://fonts.googleapis.com/css2?family=${[...fonts].map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap" rel="stylesheet" />\n\n`;
  }

  if (iconImports.size > 0) {
    code += `import { ${[...iconImports].sort().join(', ')} } from 'lucide-react';\n\n`;
  }

  if (variantComponents.size > 0) {
    code += `// Design System Components (implement these with your design tokens):\n`;
    code += `// import { ${[...variantComponents].sort().join(', ')} } from './components/design-system';\n\n`;
  }

  const body = components.map(c => generateReactCode(c)).join('\n\n');

  code += `export default function Component() {\n  return (\n    <section className="relative">\n${body}\n    </section>\n  );\n}`;

  return code;
}

// ─── HTML/CSS Generator ──────────────────────────────────────────

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function generateHTMLEl(comp: ComponentElement, indent: string, cssMap: Map<string, string>, stateMap: Map<string, Map<string, string>>, counter: { n: number }, isChild = false): string {
  const cls = `bivvy-${counter.n++}`;
  const cleanedStyles = cleanChildStyles(comp.styles || {}, isChild);
  const styleEntries = Object.entries(cleanedStyles).filter(([, v]) => v && v !== 'inherit' && v !== 'none');
  
  // Add animation CSS
  const animEntries: string[] = [];
  if (comp.animation?.entrance && comp.animation.entrance !== 'none') {
    const dur = comp.animation.duration || 300;
    const delay = comp.animation.delay || 0;
    const ease = comp.animation.easing || 'ease';
    animEntries.push(`  animation: bivvy-${comp.animation.entrance} ${dur}ms ${ease} ${delay}ms backwards;`);
  }
  if (comp.animation?.hoverTransition) {
    const ms = comp.animation.hoverTransition;
    animEntries.push(`  transition: background-color ${ms}ms ease, color ${ms}ms ease, border-color ${ms}ms ease, box-shadow ${ms}ms ease, transform ${ms}ms ease;`);
  }
  
  // Apple Design System CSS
  const appleEntries: string[] = [];
  if (comp.glassEffect) {
    appleEntries.push('  -webkit-backdrop-filter: blur(20px) saturate(1.8);');
    appleEntries.push('  backdrop-filter: blur(20px) saturate(1.8);');
    appleEntries.push('  background-color: rgba(255, 255, 255, 0.15);');
    appleEntries.push('  border: 1px solid rgba(255, 255, 255, 0.2);');
  }
  if (comp.cornerRadiusMode === 'capsule') {
    appleEntries.push('  border-radius: 9999px;');
  }
  if (comp.cornerRadiusMode === 'concentric' && comp.children?.length) {
    const parentRadius = parseInt(comp.styles?.borderRadius || '0') || 0;
    const parentPadding = parseInt(comp.styles?.padding || '0') || 0;
    const childRadius = Math.max(0, parentRadius - parentPadding);
    if (childRadius > 0) appleEntries.push(`  /* concentric child radius: ${childRadius}px */`);
  }
  // Control Size for buttons/inputs
  if (comp.controlSize && (comp.type === 'button' || comp.type === 'input')) {
    const sizeCSS: Record<string, { padding: string; fontSize: string }> = {
      mini: { padding: '2px 6px', fontSize: '10px' },
      sm: { padding: '4px 10px', fontSize: '12px' },
      md: { padding: '8px 16px', fontSize: '14px' },
      lg: { padding: '12px 24px', fontSize: '16px' },
      xl: { padding: '16px 32px', fontSize: '18px' },
    };
    const s = sizeCSS[comp.controlSize];
    if (s) {
      appleEntries.push(`  padding: ${s.padding};`);
      appleEntries.push(`  font-size: ${s.fontSize};`);
    }
  }
  // Tint Prominence for buttons
  if (comp.tintProminence && comp.type === 'button') {
    const bg = comp.styles?.backgroundColor || '#2296FF';
    if (comp.tintProminence === 'secondary') {
      appleEntries.push(`  background-color: transparent;`);
      appleEntries.push(`  border: 1.5px solid ${bg};`);
      appleEntries.push(`  color: ${bg};`);
    } else if (comp.tintProminence === 'none') {
      appleEntries.push(`  background-color: transparent;`);
      appleEntries.push(`  border: none;`);
      appleEntries.push(`  color: ${bg};`);
    }
  }
  if (comp.scrollEdgeEffect === 'soft') {
    appleEntries.push('  -webkit-mask-image: linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent);');
    appleEntries.push('  mask-image: linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent);');
  } else if (comp.scrollEdgeEffect === 'hard') {
    appleEntries.push('  border-top: 1px solid rgba(0, 0, 0, 0.1);');
    appleEntries.push('  border-bottom: 1px solid rgba(0, 0, 0, 0.1);');
  }

  const allEntries = [
    ...styleEntries.map(([k, v]) => `  ${camelToKebab(k)}: ${v};`),
    ...animEntries,
    ...appleEntries,
  ];
  if (allEntries.length > 0) {
    cssMap.set(cls, allEntries.join('\n'));
  }
  
  const stateStyles: [string, Record<string, any> | undefined][] = [
    ['hover', comp.hoverStyles],
    ['active', comp.activeStyles],
    ['disabled', comp.disabledStyles],
    ['focus', comp.focusedStyles],
    ['loading', comp.loadingStyles],
  ];
  for (const [pseudo, styles] of stateStyles) {
    if (styles && Object.keys(styles).length > 0) {
      if (!stateMap.has(pseudo)) stateMap.set(pseudo, new Map());
      stateMap.get(pseudo)!.set(cls, Object.entries(styles).map(([k, v]) => `  ${camelToKebab(k)}: ${v};`).join('\n'));
    }
  }

  if (comp.type === 'icon') {
    return `${indent}<!-- Icon: ${comp.content} -->`;
  }

  const tag = comp.type === 'button' ? 'button' : comp.type === 'input' ? 'input' : comp.type === 'text' ? 'p' : 'div';

  if (comp.type === 'input') {
    return `${indent}<${tag} class="${cls}" placeholder="${comp.content || ''}" />`;
  }

  if (comp.children && comp.children.length > 0) {
    const childHTML = comp.children.map(child => generateHTMLEl(child, indent + '  ', cssMap, stateMap, counter, true)).join('\n');
    return `${indent}<${tag} class="${cls}">\n${childHTML}\n${indent}</${tag}>`;
  }

  return `${indent}<${tag} class="${cls}">${comp.content || ''}</${tag}>`;
}

export function generateFullHTML(components: ComponentElement[]): string {
  const cssMap = new Map<string, string>();
  const stateMap = new Map<string, Map<string, string>>();
  const counter = { n: 0 };
  const fonts = new Set<string>();

  const collectFonts = (comp: ComponentElement) => {
    const ff = comp.styles?.fontFamily;
    if (ff) {
      const primary = ff.split(',')[0].trim().replace(/['"]/g, '');
      if (primary && !['Arial', 'Helvetica', 'sans-serif', 'serif', 'monospace'].includes(primary)) {
        fonts.add(primary);
      }
    }
    comp.children?.forEach(collectFonts);
  };
  components.forEach(collectFonts);

  const body = components.map(c => generateHTMLEl(c, '    ', cssMap, stateMap, counter)).join('\n\n');

  let fontLink = '';
  if (fonts.size > 0) {
    fontLink = `\n  <link href="https://fonts.googleapis.com/css2?family=${[...fonts].map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap" rel="stylesheet" />`;
  }

  let css = '* { margin: 0; padding: 0; box-sizing: border-box; }\n\n';
  cssMap.forEach((rules, cls) => {
    css += `.${cls} {\n${rules}\n}\n\n`;
  });
  // Output :hover, :active, :disabled pseudo-classes
  for (const [pseudo, map] of stateMap) {
    map.forEach((rules, cls) => {
      // 'loading' is not a CSS pseudo-class — use a class selector instead
      const selector = pseudo === 'loading' ? `.${cls}.is-loading` : `.${cls}:${pseudo}`;
      css += `${selector} {\n${rules}\n}\n\n`;
    });
  }

  // Add animation keyframes if any component uses animations
  const animKeyframes = `@keyframes bivvy-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes bivvy-slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bivvy-slideDown { from { opacity: 0; transform: translateY(-24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bivvy-slideLeft { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bivvy-slideRight { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bivvy-scaleUp { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
@keyframes bivvy-bounce { 0% { opacity: 0; transform: translateY(24px); } 60% { opacity: 1; transform: translateY(-6px); } 80% { transform: translateY(2px); } 100% { opacity: 1; transform: translateY(0); } }`;
  
  let hasAnims = false;
  const checkAnims = (comps: ComponentElement[]) => {
    for (const c of comps) {
      if (c.animation?.entrance && c.animation.entrance !== 'none') { hasAnims = true; return; }
      if (c.children) checkAnims(c.children);
    }
  };
  checkAnims(components);
  if (hasAnims) css = animKeyframes + '\n\n' + css;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bivvy Export</title>${fontLink}
  <style>
${css.trim()}
  </style>
</head>
<body>
  <main>
${body}
  </main>
</body>
</html>`;
}

// ─── Shareable Preview HTML Generator ─────────────────────────────
function generatePreviewHTML(components: ComponentElement[]): string {
  // Reuse existing HTML generation (already includes animation CSS + keyframes)
  const baseHTML = generateFullHTML(components);

  // Inject preview wrapper styles
  return baseHTML
    .replace('</style>', `\n    body { display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 40px 20px; background: #f0f0f0; font-family: system-ui, sans-serif; }\n    main { display: flex; flex-direction: column; gap: 24px; align-items: center; }\n  </style>`)
    .replace('</body>', '  <script>document.title = "Bivvy Preview";</script>\n</body>');
}

// ─── Spec Sheet (Markdown) Generator ──────────────────────────────
function generateSpecSheet(components: ComponentElement[]): string {
  const lines: string[] = [];
  lines.push('# Component Specification');
  lines.push(`Generated by Bivvy · ${new Date().toLocaleDateString()}`);
  lines.push('');
  
  // Component inventory
  lines.push('## Components');
  lines.push('');
  const flatAll: ComponentElement[] = [];
  const flatten = (comps: ComponentElement[], depth = 0) => {
    for (const c of comps) {
      flatAll.push(c);
      const indent = '  '.repeat(depth);
      const label = c.content ? `${c.type}: "${c.content.substring(0, 40)}"` : c.type;
      const sizeStr = c.size ? `${c.size.width}x${c.size.height}px` : (c.styles?.width || 'auto') + ' x ' + (c.styles?.height || 'auto');
      const posStr = c.position ? `(${Math.round(c.position.x)}, ${Math.round(c.position.y)})` : 'child';
      lines.push(`${indent}- **${label}** — ${sizeStr} at ${posStr}`);
      if (c.children) flatten(c.children, depth + 1);
    }
  };
  flatten(components);
  lines.push('');

  // Color palette
  const colors = new Set<string>();
  for (const c of flatAll) {
    if (c.styles?.backgroundColor && c.styles.backgroundColor !== 'transparent') colors.add(c.styles.backgroundColor);
    if (c.styles?.color) colors.add(c.styles.color);
    if (c.styles?.borderColor) colors.add(c.styles.borderColor);
  }
  if (colors.size > 0) {
    lines.push('## Colors');
    lines.push('');
    lines.push('| Color | Hex |');
    lines.push('|-------|-----|');
    for (const color of colors) {
      lines.push(`| ${color} | \`${color}\` |`);
    }
    lines.push('');
  }

  // Typography
  const fonts = new Set<string>();
  const sizes = new Set<string>();
  const weights = new Set<string>();
  const typePresets = new Map<string, string[]>(); // preset → component labels
  for (const c of flatAll) {
    if (c.styles?.fontFamily) fonts.add(c.styles.fontFamily.split(',')[0].replace(/'/g, '').trim());
    if (c.styles?.fontSize) sizes.add(c.styles.fontSize);
    if (c.styles?.fontWeight) weights.add(String(c.styles.fontWeight));
    if (c.typeStyle) {
      const label = c.content ? `${c.type}: "${c.content.substring(0, 30)}"` : c.type;
      if (!typePresets.has(c.typeStyle)) typePresets.set(c.typeStyle, []);
      typePresets.get(c.typeStyle)!.push(label);
    }
  }
  if (fonts.size > 0 || sizes.size > 0) {
    lines.push('## Typography');
    lines.push('');
    if (fonts.size > 0) lines.push(`**Fonts:** ${[...fonts].join(', ')}`);
    if (sizes.size > 0) lines.push(`**Sizes:** ${[...sizes].sort().join(', ')}`);
    if (weights.size > 0) lines.push(`**Weights:** ${[...weights].sort().join(', ')}`);
    if (typePresets.size > 0) {
      lines.push('');
      lines.push('**Type Style Presets:**');
      for (const [preset, labels] of typePresets) {
        lines.push(`- \`${preset}\` → ${labels.join(', ')}`);
      }
    }
    lines.push('');
  }

  // Spacing
  const spacings = new Set<string>();
  for (const c of flatAll) {
    if (c.styles?.padding) spacings.add(c.styles.padding);
    if (c.styles?.gap) spacings.add(c.styles.gap);
    if (c.styles?.margin) spacings.add(c.styles.margin);
  }
  if (spacings.size > 0) {
    lines.push('## Spacing');
    lines.push('');
    lines.push(`**Values used:** ${[...spacings].join(', ')}`);
    lines.push('');
  }

  // Component states
  const stateComps = flatAll.filter(c =>
    (c.hoverStyles && Object.keys(c.hoverStyles).length > 0) ||
    (c.activeStyles && Object.keys(c.activeStyles).length > 0) ||
    (c.disabledStyles && Object.keys(c.disabledStyles).length > 0) ||
    (c.focusedStyles && Object.keys(c.focusedStyles).length > 0) ||
    (c.loadingStyles && Object.keys(c.loadingStyles).length > 0)
  );
  if (stateComps.length > 0) {
    lines.push('## Interactive States');
    lines.push('');
    for (const c of stateComps) {
      const label = c.content ? `${c.type}: "${c.content.substring(0, 30)}"` : c.type;
      lines.push(`### ${label}`);
      if (c.hoverStyles && Object.keys(c.hoverStyles).length > 0) {
        lines.push(`- **Hover:** ${Object.entries(c.hoverStyles).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      }
      if (c.activeStyles && Object.keys(c.activeStyles).length > 0) {
        lines.push(`- **Active:** ${Object.entries(c.activeStyles).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      }
      if (c.focusedStyles && Object.keys(c.focusedStyles).length > 0) {
        lines.push(`- **Focused:** ${Object.entries(c.focusedStyles).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      }
      if (c.disabledStyles && Object.keys(c.disabledStyles).length > 0) {
        lines.push(`- **Disabled:** ${Object.entries(c.disabledStyles).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      }
      if (c.loadingStyles && Object.keys(c.loadingStyles).length > 0) {
        lines.push(`- **Loading:** ${Object.entries(c.loadingStyles).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      }
      lines.push('');
    }
  }

  // Animations
  const animComps = flatAll.filter(c => c.animation?.entrance && c.animation.entrance !== 'none');
  if (animComps.length > 0) {
    lines.push('## Animations');
    lines.push('');
    for (const c of animComps) {
      const label = c.content ? `${c.type}: "${c.content.substring(0, 30)}"` : c.type;
      const a = c.animation!;
      lines.push(`- **${label}:** ${a.entrance} · ${a.duration || 300}ms · ${a.easing || 'ease'}${a.delay ? ` · delay ${a.delay}ms` : ''}`);
    }
    lines.push('');
  }

  // Annotations
  const annotComps = flatAll.filter(c => c.annotations && c.annotations.length > 0);
  if (annotComps.length > 0) {
    lines.push('## Notes');
    lines.push('');
    for (const c of annotComps) {
      const label = c.content ? `${c.type}: "${c.content.substring(0, 30)}"` : c.type;
      lines.push(`### ${label}`);
      for (const a of c.annotations!) {
        lines.push(`- ${a.resolved ? '~~' : ''}${a.text}${a.resolved ? '~~ (resolved)' : ''}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ─── Export Panel Component ───────────────────────────────────────

export function ExportPanel({ onClose }: { onClose: () => void }) {
  const { components, selectedIds, selectedId, findComponent, importHTMLToExisting, addToast } = useStore();
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'react' | 'html' | 'spec'>('react');
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importing, setImporting] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const exportComponents = useMemo(() => {
    if (scope === 'selected' && selectedIds.length > 0) {
      return selectedIds.map(id => findComponent(id)).filter(Boolean) as ComponentElement[];
    }
    return components;
  }, [scope, selectedIds, components, findComponent]);

  const code = useMemo(() => {
    if (format === 'spec') return generateSpecSheet(exportComponents);
    return format === 'react' ? generateFullReact(exportComponents) : generateFullHTML(exportComponents);
  }, [format, exportComponents]);

  const highlighted = useMemo(() => format === 'spec' ? code : highlightCode(code, format), [code, format]);

  const lineCount = code.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'react' ? 'tsx' : format === 'spec' ? 'md' : 'html';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bivvy-export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreviewInBrowser = () => {
    const previewHTML = generatePreviewHTML(exportComponents);
    const blob = new Blob([previewHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100000] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-[#0d0d0d] border border-gray-800/60 rounded-2xl w-[780px] max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#2296FF]/10 flex items-center justify-center">
              <Code className="w-3.5 h-3.5 text-[#2296FF]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Export Code</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {exportComponents.length} component{exportComponents.length !== 1 ? 's' : ''} · {lineCount} lines
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex bg-gray-800/50 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setScope('all')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md transition-colors ${scope === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Layers className="w-3 h-3" />
                  All
                </button>
                <button
                  onClick={() => setScope('selected')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md transition-colors ${scope === 'selected' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Component className="w-3 h-3" />
                  Selected ({selectedIds.length})
                </button>
              </div>
            )}
            <div className="flex bg-gray-800/50 rounded-lg p-0.5">
              <button
                onClick={() => setFormat('react')}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${format === 'react' ? 'bg-[#2296FF] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                React
              </button>
              <button
                onClick={() => setFormat('html')}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${format === 'html' ? 'bg-[#2296FF] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                HTML
              </button>
              <button
                onClick={() => setFormat('spec')}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${format === 'spec' ? 'bg-[#2296FF] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                Spec
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors ml-1">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Code with line numbers + syntax highlighting */}
        <div className="flex-1 overflow-auto min-h-0">
          <style dangerouslySetInnerHTML={{ __html: `
            .tok-kw { color: #c792ea; }
            .tok-str { color: #c3e88d; }
            .tok-tag { color: #ff5572; }
            .tok-comp { color: #82aaff; }
            .tok-attr { color: #ffcb6b; }
            .tok-cmt { color: #546e7a; font-style: italic; }
            .tok-brace { color: #89ddff; }
          `}} />
          <div className="flex">
            <div className="flex-shrink-0 py-4 pl-4 pr-3 text-right select-none border-r border-gray-800/30 sticky left-0 bg-[#0d0d0d] z-10">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="text-[11px] text-gray-700 leading-[1.7] font-mono">
                  {i + 1}
                </div>
              ))}
            </div>
            <pre
              ref={codeRef}
              className="flex-1 py-4 pl-4 pr-6 text-xs text-gray-300 font-mono leading-[1.7] whitespace-pre overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        </div>

        {/* Round-Trip Import Section */}
        {showImport && (
          <div className="px-5 py-3 border-t border-gray-800/60 bg-[#111]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs text-white font-semibold">✏️ Edit & Reimport</span>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Make your changes below, then click "Apply Changes". AI will update {selectedId ? 'the selected component' : 'the canvas'}.
                </p>
              </div>
              <button onClick={() => setShowImport(false)} className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
            {/* Editable code area - pre-populated with current export */}
            <textarea
              value={importCode}
              onChange={e => setImportCode(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
              onCopy={e => e.stopPropagation()}
              onPaste={e => e.stopPropagation()}
              onCut={e => e.stopPropagation()}
              placeholder="Your exported code appears here — edit it, then reimport…"
              className="w-full h-40 bg-black/50 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 font-mono placeholder-gray-600 outline-none focus:border-purple-500/50 resize-y"
              spellCheck={false}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600">
                  {selectedId ? `Target: ${selectedId}` : 'Creates new component(s)'}
                </span>
                {importCode && importCode !== code && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">Modified</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImportCode(code)}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] text-gray-400 hover:text-white hover:bg-gray-800 transition-colors border border-gray-800"
                >
                  Reset to Export
                </button>
                <button
                  onClick={async () => {
                    if (!importCode.trim()) return;
                    setImporting(true);
                    const success = await importHTMLToExisting(importCode.trim(), selectedId || undefined);
                    setImporting(false);
                    if (success) {
                      setShowImport(false);
                    }
                  }}
                  disabled={!importCode.trim() || importing || importCode === code}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-xs text-purple-300 font-medium transition-colors border border-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <><div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Applying…</>
                  ) : (
                    <>↩ Apply Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800/60">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600 font-mono">
              {format === 'react' ? 'TSX' : format === 'spec' ? 'MD' : 'HTML'} · {(code.length / 1024).toFixed(1)}KB
            </span>
            {format !== 'spec' && (
              <button
                onClick={() => { setImportCode(code); setShowImport(!showImport); }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  showImport ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                ✏️ Edit & Reimport
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {format !== 'spec' && (
              <button
                onClick={handlePreviewInBrowser}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-xs text-green-400 transition-colors border border-green-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview in Browser
              </button>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-800/60 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors border border-gray-700/50"
            >
              <Download className="w-3.5 h-3.5" />
              Download .{format === 'react' ? 'tsx' : format === 'spec' ? 'md' : 'html'}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2296FF] hover:bg-[#1a7ad4] rounded-lg text-xs text-white font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
