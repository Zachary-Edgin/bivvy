'use client';

import { useState, useRef } from 'react';
import { Palette, Type, Plus, X, ToggleLeft, ToggleRight, BookOpen, Shield, Lightbulb, Library, ChevronDown, ChevronRight, Ruler, Box, Layers, Maximize2, Circle, FileText, Image, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '@/store/componentStore';
import { apiUrl } from '@/utils/apiBase';

// Helper: editable comma-separated number array
function TokenInput({ label, icon, values, onChange }: { label: string; icon?: React.ReactNode; values: number[]; onChange: (v: number[]) => void }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        {icon}{label}
      </h4>
      <input
        type="text"
        defaultValue={values.join(', ')}
        onBlur={(e) => {
          const nums = e.target.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n >= 0);
          if (nums.length > 0) onChange(nums);
        }}
        className="w-full bg-gray-800 text-[10px] text-gray-300 px-1.5 py-1 rounded border border-gray-700 focus:outline-none focus:border-purple-500 font-mono"
      />
    </div>
  );
}

// Helper: editable comma-separated string array
function TokenStringInput({ label, icon, values, onChange }: { label: string; icon?: React.ReactNode; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        {icon}{label}
      </h4>
      <input
        type="text"
        defaultValue={values.join(', ')}
        onBlur={(e) => {
          const strs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
          if (strs.length > 0) onChange(strs);
        }}
        className="w-full bg-gray-800 text-[10px] text-gray-300 px-1.5 py-1 rounded border border-gray-700 focus:outline-none focus:border-purple-500 font-mono"
      />
    </div>
  );
}

export function DesignTokensPanel() {
  const { designSystem, updateDesignSystem, loadBuiltinDesignSystem, addToast } = useStore();
  const tokens = designSystem.tokens;
  const rawGuidelines = designSystem.guidelines;
  const guidelines = rawGuidelines && typeof rawGuidelines === 'object' && !Array.isArray(rawGuidelines)
    ? { enabled: rawGuidelines.enabled ?? false, rules: rawGuidelines.rules || [], referenceLibrary: rawGuidelines.referenceLibrary ?? false }
    : { enabled: false, rules: Array.isArray(rawGuidelines) ? rawGuidelines : [], referenceLibrary: false };
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#6366f1');
  const [newFont, setNewFont] = useState('');
  const [newRule, setNewRule] = useState('');
  const [rulesExpanded, setRulesExpanded] = useState(true);
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(true);
  const [typoExpanded, setTypoExpanded] = useState(true);
  const [spacingExpanded, setSpacingExpanded] = useState(false);
  const [borderExpanded, setBorderExpanded] = useState(false);
  const [effectsExpanded, setEffectsExpanded] = useState(false);
  const [sizingExpanded, setSizingExpanded] = useState(false);
  const [importMode, setImportMode] = useState<null | 'paste' | 'image'>(null);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const anyEnabled = tokens.enabled || guidelines.enabled;

  // Import from document — calls AI to extract tokens
  const handleImport = async (text?: string, imageBase64?: string, imageType?: string) => {
    if (!text && !imageBase64) return;
    setImporting(true);
    try {
      const res = await fetch(apiUrl('/api/extract-tokens'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, imageBase64, imageType }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Extraction failed');
      }
      const data = await res.json();

      // Apply extracted tokens
      const updates: any = {};
      if (data.colors?.length) updates.colors = data.colors;
      if (data.fonts?.length) updates.fonts = data.fonts;
      if (data.tokens) {
        const newTokens: any = { ...tokens, enabled: true };
        for (const key of Object.keys(data.tokens)) {
          if (Array.isArray(data.tokens[key]) && data.tokens[key].length > 0) {
            newTokens[key] = data.tokens[key];
          }
        }
        updates.tokens = newTokens;
      }
      if (data.guidelines?.length) {
        updates.guidelines = { ...guidelines, enabled: true, rules: data.guidelines };
      }

      updates.imported = true;
      updateDesignSystem(updates);
      setImportMode(null);
      setImportText('');

      // Count what was extracted
      const colorCount = data.colors?.length || 0;
      const fontCount = data.fonts?.length || 0;
      const ruleCount = data.guidelines?.length || 0;
      const tokenFields = data.tokens ? Object.keys(data.tokens).filter(k => data.tokens[k]?.length > 0).length : 0;
      addToast(`Extracted ${colorCount} colors, ${fontCount} fonts, ${tokenFields} token scales, ${ruleCount} design rules`, 'success');
    } catch (err: any) {
      addToast(`Import failed: ${err.message}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const mime = file.type || 'image/png';
      handleImport(undefined, base64, mime);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset
  };

  const toggleTokens = () => {
    updateDesignSystem({ tokens: { ...tokens, enabled: !tokens.enabled } });
    addToast(tokens.enabled ? 'Rules disabled' : 'Rules active — AI will follow your constraints', 'info');
  };

  const toggleGuidelines = () => {
    updateDesignSystem({ guidelines: { ...guidelines, enabled: !guidelines.enabled } });
    addToast(guidelines.enabled ? 'Guidelines disabled' : 'Guidelines active — AI follows your patterns', 'info');
  };

  const updateTokens = (partial: Partial<typeof tokens>) => {
    updateDesignSystem({ tokens: { ...tokens, ...partial } });
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    updateDesignSystem({ colors: [...designSystem.colors, { name: newColorName.trim(), value: newColorValue }] });
    setNewColorName('');
    setNewColorValue('#6366f1');
  };

  const removeColor = (i: number) => updateDesignSystem({ colors: designSystem.colors.filter((_, idx) => idx !== i) });

  const updateColor = (i: number, value: string) => {
    const updated = [...designSystem.colors];
    updated[i] = { ...updated[i], value };
    updateDesignSystem({ colors: updated });
  };

  const addFont = () => {
    if (!newFont.trim() || designSystem.fonts.includes(newFont.trim())) return;
    updateDesignSystem({ fonts: [...designSystem.fonts, newFont.trim()] });
    setNewFont('');
  };

  const removeFont = (i: number) => updateDesignSystem({ fonts: designSystem.fonts.filter((_, idx) => idx !== i) });

  const addRule = () => {
    if (!newRule.trim()) return;
    updateDesignSystem({ guidelines: { ...guidelines, rules: [...(guidelines.rules || []), newRule.trim()] } });
    setNewRule('');
  };

  const removeRule = (i: number) => updateDesignSystem({ guidelines: { ...guidelines, rules: (guidelines.rules || []).filter((_, idx) => idx !== i) } });

  const toggleLibraryRef = () => updateDesignSystem({ guidelines: { ...guidelines, referenceLibrary: !guidelines.referenceLibrary } });

  const applyPreset = (preset: 'apple' | 'material' | 'vercel') => {
    const presets: Record<string, any> = {
      apple: {
        colors: [
          { name: 'Blue', value: '#007AFF' }, { name: 'Purple', value: '#5856D6' },
          { name: 'Green', value: '#34C759' }, { name: 'Red', value: '#FF3B30' },
          { name: 'Orange', value: '#FF9500' }, { name: 'Gray', value: '#8E8E93' },
          { name: 'Gray Dark', value: '#636366' }, { name: 'Background', value: '#000000' },
          { name: 'Card', value: '#1C1C1E' }, { name: 'Label', value: '#FFFFFF' },
        ],
        fonts: ['SF Pro Display', 'SF Pro Text', 'SF Mono'],
        tokens: {
          enabled: true, fontSizes: [11, 13, 15, 17, 20, 22, 28, 34],
          fontWeights: [400, 500, 600, 700], lineHeights: [1.2, 1.3, 1.4, 1.5],
          letterSpacing: ['-0.02em', '0', '0.01em'], spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48],
          maxWidths: [320, 375, 428, 768, 1024], borderRadius: [0, 6, 10, 14, 20, 9999],
          borderWidths: [0, 1, 2], borderStyles: ['none', 'solid'],
          shadows: ['none', '0 2px 10px rgba(0,0,0,0.3)'], opacities: [0, 0.3, 0.5, 0.8, 1],
          iconSizes: [17, 20, 24, 28, 32, 44], minHeights: [34, 44, 50],
        },
        guidelines: { enabled: true, referenceLibrary: true, rules: [
          'SF Pro Display for headlines ≥20px, SF Pro Text for body <20px',
          'Minimum 44pt touch target for all interactive elements',
          'Cards: #1C1C1E background, 14px radius, no border',
          'Primary actions blue (#007AFF), destructive red (#FF3B30)',
          'Semibold (600) for headlines, regular (400) for body',
          '16px minimum padding inside cards and containers',
        ]},
        label: 'Apple HIG',
      },
      material: {
        colors: [
          { name: 'Primary', value: '#6750A4' }, { name: 'On Primary', value: '#FFFFFF' },
          { name: 'Secondary', value: '#625B71' }, { name: 'Tertiary', value: '#7D5260' },
          { name: 'Error', value: '#B3261E' }, { name: 'Surface', value: '#1C1B1F' },
          { name: 'On Surface', value: '#E6E1E5' }, { name: 'Outline', value: '#938F99' },
        ],
        fonts: ['Roboto', 'Roboto Mono'],
        tokens: {
          enabled: true, fontSizes: [11, 12, 14, 16, 22, 24, 28, 32, 36, 45, 57],
          fontWeights: [400, 500, 700], lineHeights: [1.2, 1.3, 1.4, 1.5, 1.6],
          letterSpacing: ['-0.01em', '0', '0.01em', '0.015em', '0.05em', '0.1em'],
          spacing: [4, 8, 12, 16, 24, 32, 48, 64], maxWidths: [360, 600, 840, 1200],
          borderRadius: [0, 4, 8, 12, 16, 28], borderWidths: [0, 1, 2, 3],
          borderStyles: ['none', 'solid'], shadows: ['none', '0 1px 2px rgba(0,0,0,0.3)', '0 1px 3px 1px rgba(0,0,0,0.15)', '0 4px 8px 3px rgba(0,0,0,0.15)'],
          opacities: [0, 0.08, 0.12, 0.38, 0.6, 0.87, 1], iconSizes: [18, 20, 24, 36, 40, 48],
          minHeights: [32, 40, 48, 56],
        },
        guidelines: { enabled: true, referenceLibrary: true, rules: [
          'Roboto for all text. Display uses regular weight, Body uses medium',
          'Filled buttons for primary, outlined for secondary, text for tertiary',
          'Cards: 12px radius with elevation shadow, no stroke border',
          'Primary (#6750A4) for key actions, Surface (#1C1B1F) for backgrounds',
          '16dp grid for spacing, 8dp for tight elements',
          'FABs and icon buttons use 28px radius (fully rounded)',
        ]},
        label: 'Material 3',
      },
      vercel: {
        colors: [
          { name: 'Foreground', value: '#EDEDED' }, { name: 'Background', value: '#000000' },
          { name: 'Accent', value: '#0070F3' }, { name: 'Error', value: '#EE0000' },
          { name: 'Warning', value: '#F5A623' }, { name: 'Gray 100', value: '#111111' },
          { name: 'Gray 200', value: '#333333' }, { name: 'Gray 400', value: '#888888' },
          { name: 'Gray 600', value: '#EAEAEA' },
        ],
        fonts: ['Inter', 'Geist', 'Geist Mono'],
        tokens: {
          enabled: true, fontSizes: [12, 14, 16, 20, 24, 32, 48],
          fontWeights: [400, 500, 600, 700], lineHeights: [1.4, 1.5, 1.6, 1.7],
          letterSpacing: ['-0.02em', '-0.01em', '0', '0.02em'], spacing: [4, 8, 16, 24, 32, 48, 64],
          maxWidths: [480, 640, 768, 1024, 1280], borderRadius: [0, 4, 6, 8, 12, 9999],
          borderWidths: [0, 1, 2], borderStyles: ['none', 'solid'],
          shadows: ['none', '0 4px 14px rgba(0,0,0,0.25)', '0 8px 30px rgba(0,0,0,0.12)'],
          opacities: [0, 0.1, 0.5, 0.8, 1], iconSizes: [16, 20, 24, 32],
          minHeights: [32, 36, 40, 48],
        },
        guidelines: { enabled: true, referenceLibrary: true, rules: [
          'Dark-first: pure black #000 backgrounds, light text #EDEDED',
          'Inter for UI, Geist for headlines, Geist Mono for code',
          'Solid buttons for primary, ghost/outline for secondary',
          'No gradients, no heavy shadows — minimal decoration',
          'Subtle 1px #333 borders to separate sections',
          'Cards: #111 background, 8px radius, 1px #333 border',
        ]},
        label: 'Vercel',
      },
    };
    const p = presets[preset];
    updateDesignSystem({ colors: p.colors, fonts: p.fonts, tokens: p.tokens, guidelines: p.guidelines, imported: true });
    addToast(`Applied ${p.label} design system`, 'success');
  };

  // Collapsible sub-section helper
  const SubSection = ({ label, icon, expanded, toggle, children }: { label: string; icon: React.ReactNode; expanded: boolean; toggle: () => void; children: React.ReactNode }) => (
    <div className="border-t border-gray-800/50 first:border-t-0">
      <button onClick={toggle} className="w-full py-1.5 flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-gray-200">
        {expanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
        {icon}
        <span className="font-medium">{label}</span>
      </button>
      {expanded && <div className="pb-2 space-y-2">{children}</div>}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      {/* Status header */}
      <div className="px-3 py-2 border-b border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-white">Design Constraints</span>
          </div>
          {anyEnabled && <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] text-purple-400 font-medium">ACTIVE</span>}
        </div>
        <p className="text-[10px] text-gray-600 leading-relaxed">
          Rules = hard limits the AI can never break. Guidelines = patterns the AI should follow.
        </p>
      </div>

      {/* Loaded Design System Status */}
      {designSystem.imported && (
        <div className="px-3 py-2 border-b border-gray-800 bg-purple-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-400">Custom Design System Loaded</span>
            </div>
            <button
              onClick={() => {
                updateDesignSystem({
                  imported: false,
                  namedTokens: [],
                  componentDefs: [],
                  tokenMappings: [],
                  colors: [
                    { name: 'Primary', value: '#1976d2' },
                    { name: 'Secondary', value: '#9c27b0' },
                    { name: 'Success', value: '#2e7d32' },
                    { name: 'Error', value: '#c62828' },
                    { name: 'Warning', value: '#e65100' },
                    { name: 'Info', value: '#0288d1' },
                  ],
                  fonts: ['Plus Jakarta Sans', 'DM Sans', 'Space Grotesk', 'Outfit', 'Sora', 'Lexend', 'Playfair Display', 'Inter'],
                  tokens: { ...designSystem.tokens, enabled: false },
                  guidelines: { enabled: false, rules: [], referenceLibrary: true },
                });
                addToast('Custom design system cleared — reverting to built-in tokens', 'info');
                loadBuiltinDesignSystem();
              }}
              className="text-[9px] text-gray-600 hover:text-red-400 transition-colors"
            >
              Clear Custom
            </button>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {designSystem.namedTokens?.length > 0 && (
              <span className="text-[10px] text-gray-400">{designSystem.namedTokens.length} tokens</span>
            )}
            {designSystem.componentDefs?.length > 0 && (
              <span className="text-[10px] text-gray-400">{designSystem.componentDefs.length} components</span>
            )}
            {designSystem.colors?.length > 0 && (
              <span className="text-[10px] text-gray-400">{designSystem.colors.length} colors</span>
            )}
            {designSystem.fonts?.length > 0 && (
              <span className="text-[10px] text-gray-400">{designSystem.fonts.length} fonts</span>
            )}
            {(designSystem.guidelines?.rules?.length || 0) > 0 && (
              <span className="text-[10px] text-gray-400">{designSystem.guidelines?.rules?.length || 0} rules</span>
            )}
          </div>
          <p className="text-[9px] text-gray-600 mt-1">AI generation is constrained to these tokens. Invalid values are auto-corrected.</p>
        </div>
      )}

      {/* Built-in Design System Active (default state — not imported, but tokens exist) */}
      {!designSystem.imported && (designSystem.namedTokens?.length > 0 || designSystem.tokens?.enabled) && (
        <div className="px-3 py-2 border-b border-gray-800 bg-teal-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-[10px] font-semibold text-teal-400">Built-in Design System</span>
            </div>
            <button
              onClick={() => {
                updateDesignSystem({
                  namedTokens: [],
                  componentDefs: [],
                  tokenMappings: [],
                  tokens: { ...designSystem.tokens, enabled: false },
                  guidelines: { enabled: false, rules: [], referenceLibrary: false },
                });
                addToast('Design system disabled — AI is now unconstrained', 'info');
              }}
              className="text-[9px] text-gray-600 hover:text-red-400 transition-colors"
            >
              Disable
            </button>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {designSystem.namedTokens?.length > 0 && (
              <span className="text-[10px] text-gray-400">{designSystem.namedTokens.length} tokens</span>
            )}
            {designSystem.componentDefs?.length > 0 && (
              <span className="text-[10px] text-gray-400">{designSystem.componentDefs.length} components</span>
            )}
            {designSystem.tokenMappings?.length > 0 && (
              <span className="text-[10px] text-gray-400">{designSystem.tokenMappings.length} mappings</span>
            )}
          </div>
          <p className="text-[9px] text-gray-600 mt-1">AI uses built-in tokens for generation. Pre-display auto-fix is active. Import a custom system to override.</p>
        </div>
      )}

      {/* No Design System Active (everything disabled) */}
      {!designSystem.imported && (!designSystem.namedTokens || designSystem.namedTokens.length === 0) && !designSystem.tokens?.enabled && (
        <div className="px-3 py-2 border-b border-gray-800 bg-yellow-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span className="text-[10px] font-semibold text-yellow-400">No Design System Active</span>
            </div>
          </div>
          <p className="text-[9px] text-gray-600 mb-2">AI generation is unconstrained. No auto-fix or token enforcement.</p>
          <button
            onClick={() => {
              loadBuiltinDesignSystem();
              addToast('Built-in design system enabled', 'success');
            }}
            className="w-full px-2 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded text-[10px] text-teal-400 font-medium transition-all"
          >
            Enable Built-in Design System
          </button>
        </div>
      )}

      {/* Import / Export */}
      <div className="px-3 py-2 border-b border-gray-800">
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              const config = { colors: designSystem.colors, fonts: designSystem.fonts, tokens: designSystem.tokens, namedTokens: designSystem.namedTokens, componentDefs: designSystem.componentDefs, tokenMappings: designSystem.tokenMappings, guidelines: designSystem.guidelines };
              const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'design-constraints.json'; a.click();
              URL.revokeObjectURL(url);
              addToast('Exported constraints config', 'success');
            }}
            className="flex-1 px-2 py-1 bg-gray-800/50 hover:bg-gray-700 border border-gray-700/50 rounded text-[10px] text-gray-500 hover:text-gray-300 transition-all text-center"
          >
            Export JSON
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file'; input.accept = '.json';
              input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const raw = JSON.parse(reader.result as string);
                    // Unwrap if nested under designSystem key
                    const config = raw.designSystem || raw;
                    const updates: any = {};
                    if (config.colors) updates.colors = config.colors;
                    if (config.fonts) updates.fonts = config.fonts;
                    if (config.tokens) updates.tokens = config.tokens;
                    if (config.namedTokens) updates.namedTokens = config.namedTokens;
                    if (config.componentDefs) updates.componentDefs = config.componentDefs;
                    if (config.tokenMappings) updates.tokenMappings = config.tokenMappings;
                    if (config.guidelines) {
                      // Handle both flat array ["rule1", "rule2"] and object { enabled, rules } formats
                      if (Array.isArray(config.guidelines)) {
                        updates.guidelines = { enabled: true, referenceLibrary: true, rules: config.guidelines };
                      } else {
                        updates.guidelines = config.guidelines;
                      }
                    }
                    // Mark as explicitly imported — this activates constraint enforcement
                    updates.imported = true;
                    // Auto-enable token constraints on import
                    if (config.tokens) updates.tokens = { ...config.tokens, enabled: true };
                    updateDesignSystem(updates);
                    // Count what was imported
                    const parts: string[] = [];
                    if (config.namedTokens?.length) parts.push(`${config.namedTokens.length} tokens`);
                    if (config.componentDefs?.length) parts.push(`${config.componentDefs.length} components`);
                    if (config.colors?.length) parts.push(`${config.colors.length} colors`);
                    if (config.fonts?.length) parts.push(`${config.fonts.length} fonts`);
                    if (config.guidelines?.rules?.length) parts.push(`${config.guidelines.rules.length} rules`);
                    const label = raw.name || raw.designSystem?.name || 'Design system';
                    addToast(parts.length > 0 ? `${label}: ${parts.join(', ')}` : 'Imported constraints config', 'success');
                  } catch { addToast('Invalid JSON file', 'error'); }
                };
                reader.readAsText(file);
              };
              input.click();
            }}
            className="flex-1 px-2 py-1 bg-gray-800/50 hover:bg-gray-700 border border-gray-700/50 rounded text-[10px] text-gray-500 hover:text-gray-300 transition-all text-center"
          >
            Import JSON
          </button>
        </div>
      </div>

      {/* Import from Document */}
      <div className="px-3 py-2 border-b border-gray-800">
        {!importMode && !importing && (
          <>
            <p className="text-[10px] text-gray-500 mb-1.5">Or import from a design document:</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setImportMode('paste')}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-[10px] text-gray-400 hover:text-white transition-all"
              >
                <FileText className="w-3 h-3" /> Paste Text
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-[10px] text-gray-400 hover:text-white transition-all"
              >
                <Image className="w-3 h-3" /> Upload Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <p className="text-[10px] text-gray-600 mt-1">
              Paste brand guidelines, CSS, style specs — or upload a screenshot. AI extracts all tokens automatically.
            </p>
          </>
        )}

        {importMode === 'paste' && !importing && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white font-medium">Paste your design spec</span>
              <button onClick={() => { setImportMode(null); setImportText(''); }} className="text-gray-600 hover:text-gray-400">
                <X className="w-3 h-3" />
              </button>
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={"Paste any of these — AI extracts tokens automatically:\n\n• CSS variables:  :root { --color-primary: #3b82f6; }\n• Tailwind config:  theme: { colors: { primary: '#3b82f6' } }\n• Brand guidelines text\n• Design spec / style documentation"}
              className="w-full h-28 bg-gray-800 text-[10px] text-gray-300 px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-purple-500 resize-none"
            />
            <button
              onClick={() => handleImport(importText)}
              disabled={!importText.trim()}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded text-[10px] text-purple-400 font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-3 h-3" /> Extract Design Tokens
            </button>
          </div>
        )}

        {importing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-[11px] text-purple-400">AI is reading your design document...</span>
          </div>
        )}
      </div>

      {/* ═══ RULES (Hard Constraints) ═══ */}
      <div className="border-b border-gray-800">
        <div role="button" onClick={() => setRulesExpanded(!rulesExpanded)} className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-800/30 cursor-pointer">
          <div className="flex items-center gap-1.5">
            {rulesExpanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
            <Shield className="w-3 h-3 text-red-400" />
            <span className="text-[11px] font-semibold text-white">Rules</span>
            <span className="text-[10px] text-gray-600">Hard constraints</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleTokens(); }} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${tokens.enabled ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-800 text-gray-600 border border-gray-700'}`}>
            {tokens.enabled ? <ToggleRight className="w-2.5 h-2.5" /> : <ToggleLeft className="w-2.5 h-2.5" />}
            {tokens.enabled ? 'On' : 'Off'}
          </button>
        </div>

        {rulesExpanded && (
          <div className="px-3 pb-3 space-y-2">
            {!tokens.enabled && <p className="text-[10px] text-gray-600 italic">When active, AI ONLY uses values defined here — no exceptions.</p>}

            {/* Colors */}
            <section>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Palette className="w-2.5 h-2.5" /> Colors</h4>
              <div className="space-y-0.5">
                {designSystem.colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5 group py-0.5">
                    <input type="color" value={color.value} onChange={(e) => updateColor(i, e.target.value)} className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent" />
                    <span className="text-[10px] text-gray-300 flex-1">{color.name}</span>
                    <span className="text-[10px] text-gray-600 font-mono">{color.value}</span>
                    <button onClick={() => removeColor(i)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <input type="color" value={newColorValue} onChange={(e) => setNewColorValue(e.target.value)} className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent" />
                <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addColor()} placeholder="Color name" className="flex-1 bg-gray-800 text-[10px] text-white px-1.5 py-0.5 rounded border border-gray-700 focus:outline-none focus:border-purple-500" />
                <button onClick={addColor} className="text-gray-500 hover:text-purple-400"><Plus className="w-3 h-3" /></button>
              </div>
            </section>

            {/* Fonts */}
            <section>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Type className="w-2.5 h-2.5" /> Fonts</h4>
              <div className="flex flex-wrap gap-1">
                {designSystem.fonts.map((font, i) => (
                  <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-300 group">
                    {font}
                    <button onClick={() => removeFont(i)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400"><X className="w-2 h-2" /></button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <input type="text" value={newFont} onChange={(e) => setNewFont(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFont()} placeholder="e.g. Poppins" className="flex-1 bg-gray-800 text-[10px] text-white px-1.5 py-0.5 rounded border border-gray-700 focus:outline-none focus:border-purple-500" />
                <button onClick={addFont} className="text-gray-500 hover:text-purple-400"><Plus className="w-3 h-3" /></button>
              </div>
            </section>

            {/* Typography */}
            <SubSection label="Typography" icon={<Type className="w-2.5 h-2.5 text-blue-400" />} expanded={typoExpanded} toggle={() => setTypoExpanded(!typoExpanded)}>
              <TokenInput label="Font Sizes (px)" values={tokens.fontSizes} onChange={(v) => updateTokens({ fontSizes: v })} />
              <TokenInput label="Font Weights" values={tokens.fontWeights} onChange={(v) => updateTokens({ fontWeights: v })} />
              <TokenInput label="Line Heights" values={tokens.lineHeights} onChange={(v) => updateTokens({ lineHeights: v })} />
              <TokenStringInput label="Letter Spacing" values={tokens.letterSpacing} onChange={(v) => updateTokens({ letterSpacing: v })} />
            </SubSection>

            {/* Spacing & Layout */}
            <SubSection label="Spacing & Layout" icon={<Ruler className="w-2.5 h-2.5 text-green-400" />} expanded={spacingExpanded} toggle={() => setSpacingExpanded(!spacingExpanded)}>
              <TokenInput label="Spacing Scale (px) — padding, margin, gap" values={tokens.spacing} onChange={(v) => updateTokens({ spacing: v })} />
              <TokenInput label="Max Widths (px) — container widths" values={tokens.maxWidths} onChange={(v) => updateTokens({ maxWidths: v })} />
            </SubSection>

            {/* Borders & Shape */}
            <SubSection label="Borders & Shape" icon={<Box className="w-2.5 h-2.5 text-orange-400" />} expanded={borderExpanded} toggle={() => setBorderExpanded(!borderExpanded)}>
              <TokenInput label="Border Radius (px)" values={tokens.borderRadius} onChange={(v) => updateTokens({ borderRadius: v })} />
              <TokenInput label="Border Widths (px)" values={tokens.borderWidths} onChange={(v) => updateTokens({ borderWidths: v })} />
              <TokenStringInput label="Border Styles" values={tokens.borderStyles} onChange={(v) => updateTokens({ borderStyles: v })} />
            </SubSection>

            {/* Effects */}
            <SubSection label="Effects" icon={<Layers className="w-2.5 h-2.5 text-purple-400" />} expanded={effectsExpanded} toggle={() => setEffectsExpanded(!effectsExpanded)}>
              <div>
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Box Shadows</h4>
                <div className="space-y-0.5">
                  {tokens.shadows.map((shadow, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-700 rounded" style={{ boxShadow: shadow === 'none' ? 'none' : shadow }} />
                      <span className="text-[10px] text-gray-400 font-mono flex-1 truncate">{shadow}</span>
                    </div>
                  ))}
                </div>
              </div>
              <TokenInput label="Opacity Values (0-1)" values={tokens.opacities} onChange={(v) => updateTokens({ opacities: v })} />
            </SubSection>

            {/* Sizing */}
            <SubSection label="Component Sizing" icon={<Maximize2 className="w-2.5 h-2.5 text-cyan-400" />} expanded={sizingExpanded} toggle={() => setSizingExpanded(!sizingExpanded)}>
              <TokenInput label="Icon Sizes (px)" values={tokens.iconSizes} onChange={(v) => updateTokens({ iconSizes: v })} />
              <TokenInput label="Min Heights (px) — buttons, inputs" values={tokens.minHeights} onChange={(v) => updateTokens({ minHeights: v })} />
            </SubSection>
          </div>
        )}
      </div>

      {/* ═══ NAMED TOKENS (Nick's Spec — Structured) ═══ */}
      <NamedTokensSection />

      {/* ═══ COMPONENT DEFINITIONS ═══ */}
      <ComponentDefsSection />

      {/* ═══ GUIDELINES (Soft Patterns) ═══ */}
      <div>
        <div role="button" onClick={() => setGuidelinesExpanded(!guidelinesExpanded)} className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-800/30 cursor-pointer">
          <div className="flex items-center gap-1.5">
            {guidelinesExpanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-semibold text-white">Guidelines</span>
            <span className="text-[10px] text-gray-600">Patterns & intelligence</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleGuidelines(); }} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${guidelines.enabled ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-600 border border-gray-700'}`}>
            {guidelines.enabled ? <ToggleRight className="w-2.5 h-2.5" /> : <ToggleLeft className="w-2.5 h-2.5" />}
            {guidelines.enabled ? 'On' : 'Off'}
          </button>
        </div>

        {guidelinesExpanded && (
          <div className="px-3 pb-3 space-y-3">
            {!guidelines.enabled && <p className="text-[10px] text-gray-600 italic">When active, AI follows your patterns and references your component library.</p>}

            {/* Library Reference */}
            <section>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Library className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] text-white font-medium">Reference Component Library</span>
                </div>
                <button onClick={toggleLibraryRef} className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${guidelines.referenceLibrary ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-600 border border-gray-700'}`}>
                  {guidelines.referenceLibrary ? 'On' : 'Off'}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-0.5 pl-[18px]">AI analyzes your 57 library components to match existing styles</p>
            </section>

            {/* Natural language rules */}
            <section>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> Design Rules</h4>
              {(guidelines.rules?.length ?? 0) === 0 && <p className="text-[10px] text-gray-600 italic mb-1.5">Write rules in plain English like "All buttons should have pill shape" or "Cards always use subtle shadow"</p>}
              <div className="space-y-1">
                {(guidelines.rules || []).map((rule, i) => (
                  <div key={i} className="flex items-start gap-1.5 group">
                    <span className="text-[10px] text-gray-600 mt-0.5 shrink-0">{i + 1}.</span>
                    <span className="text-[10px] text-gray-300 flex-1 leading-relaxed">{rule}</span>
                    <button onClick={() => removeRule(i)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 shrink-0 mt-0.5"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <input type="text" value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addRule()} placeholder="e.g. &quot;Buttons use pill shape&quot;" className="flex-1 bg-gray-800 text-[10px] text-white px-1.5 py-1 rounded border border-gray-700 focus:outline-none focus:border-amber-500" />
                <button onClick={addRule} className="text-gray-500 hover:text-amber-400 shrink-0"><Plus className="w-3 h-3" /></button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// NAMED TOKENS BROWSER
// ═══════════════════════════════════════

function NamedTokensSection() {
  const { designSystem } = useStore();
  const { namedTokens } = designSystem;
  const [expanded, setExpanded] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const tokenTypes = Array.from(new Set(namedTokens.map((t: any) => t.type)));
  const filtered = filterType === 'all' ? namedTokens : namedTokens.filter((t: any) => t.type === filterType);

  const primitives = filtered.filter((t: any) => t.category === 'primitive');
  const semanticDark = filtered.filter((t: any) => t.category === 'semantic' && t.theme === 'dark');
  const semanticLight = filtered.filter((t: any) => t.category === 'semantic' && t.theme === 'light');
  const semanticNeutral = filtered.filter((t: any) => t.category === 'semantic' && t.theme === null);

  const typeColors: Record<string, string> = {
    color: 'text-rose-400', spacing: 'text-green-400', typography: 'text-blue-400',
    radius: 'text-orange-400', shadow: 'text-purple-400', motion: 'text-yellow-400',
  };

  return (
    <div>
      <div role="button" onClick={() => setExpanded(!expanded)} className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-800/30 cursor-pointer">
        <div className="flex items-center gap-1.5">
          {expanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
          <Circle className="w-3 h-3 text-teal-400" />
          <span className="text-[11px] font-semibold text-white">Named Tokens</span>
          <span className="text-[10px] text-gray-600">{namedTokens.length} tokens</span>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setFilterType('all')} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${filterType === 'all' ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-800 text-gray-500'}`}>All ({namedTokens.length})</button>
            {tokenTypes.map((t: any) => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-1.5 py-0.5 rounded text-[9px] font-medium capitalize ${filterType === t ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-800 text-gray-500'}`}>{t} ({namedTokens.filter((tk: any) => tk.type === t).length})</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-teal-500/5 border border-teal-500/10">
            <span className="text-[9px] text-teal-400/70">💡 Click any value to edit — changes auto-sync to all components using it</span>
          </div>
          {primitives.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Primitives</h4>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">{primitives.map((t: any) => <TokenRow key={t.id} token={t} typeColors={typeColors} />)}</div>
            </div>
          )}
          {semanticDark.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Semantic — Dark</h4>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">{semanticDark.map((t: any) => <TokenRow key={t.id} token={t} typeColors={typeColors} />)}</div>
            </div>
          )}
          {semanticLight.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Semantic — Light</h4>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">{semanticLight.map((t: any) => <TokenRow key={t.id} token={t} typeColors={typeColors} />)}</div>
            </div>
          )}
          {semanticNeutral.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Semantic — Neutral</h4>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">{semanticNeutral.map((t: any) => <TokenRow key={t.id} token={t} typeColors={typeColors} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TokenRow({ token, typeColors }: { token: any; typeColors: Record<string, string> }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(token.value);
  const { updateTokenAndSync } = useStore();
  
  const isColor = token.type === 'color' && (/^#[0-9a-fA-F]{3,8}$/.test(token.value) || token.value.startsWith('rgba'));
  
  const handleSave = () => {
    if (editValue !== token.value) {
      updateTokenAndSync(token.id, editValue);
    }
    setEditing(false);
  };
  
  return (
    <div className="flex items-center gap-2 py-1 group rounded-md hover:bg-white/[0.03] px-1 -mx-1">
      {/* Color swatch or type icon — click to edit */}
      {isColor ? (
        <div
          className="w-4 h-4 rounded border border-gray-700 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-teal-500/40 transition-all"
          style={{ backgroundColor: token.value }}
          onClick={() => { setEditValue(token.value); setEditing(true); }}
          title="Click to edit"
        />
      ) : (
        <div
          className={`w-4 h-4 flex items-center justify-center text-[7px] font-bold rounded cursor-pointer hover:ring-2 hover:ring-teal-500/40 transition-all ${typeColors[token.type] || 'text-gray-500'}`}
          onClick={() => { setEditValue(token.value); setEditing(true); }}
          title="Click to edit"
        >{token.type[0].toUpperCase()}</div>
      )}
      
      {/* Token name */}
      <span className="text-[10px] text-gray-300 flex-1 truncate font-mono">{token.name}</span>
      
      {/* Value — click to edit or display */}
      {editing ? (
        <div className="flex items-center gap-1">
          {isColor && (
            <input
              type="color"
              value={editValue.startsWith('#') ? editValue : '#000000'}
              onChange={e => setEditValue(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0"
            />
          )}
          <input
            autoFocus
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditValue(token.value); setEditing(false); }}}
            className="text-[10px] text-white font-mono bg-gray-800 border border-teal-500/50 rounded px-1.5 py-0.5 w-[90px] outline-none"
          />
        </div>
      ) : (
        <span
          className="text-[10px] text-gray-500 font-mono truncate max-w-[90px] cursor-pointer hover:text-teal-400 hover:bg-teal-500/10 rounded px-1.5 py-0.5 transition-all border border-transparent hover:border-teal-500/20"
          onClick={() => { setEditValue(token.value); setEditing(true); }}
          title="Click to edit \u2014 changes sync to all components using this value"
        >
          {token.value}
        </span>
      )}
    </div>
  );
}


// ═══════════════════════════════════════
// COMPONENT DEFINITIONS VIEWER
// ═══════════════════════════════════════

function ComponentDefsSection() {
  const { designSystem, updateDesignSystem } = useStore();
  const { componentDefs, tokenMappings, namedTokens } = designSystem;
  const [expanded, setExpanded] = useState(false);
  const [selectedDef, setSelectedDef] = useState<string | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('default');
  const [editingMapping, setEditingMapping] = useState<string | null>(null); // mapping id being edited

  const def = componentDefs.find((d: any) => d.id === selectedDef);

  // Build all property combos for the selected def
  const getCombos = (): { combo: string; label: string }[] => {
    if (!def) return [];
    const props = def.properties;
    if (props.length === 0) return [];
    if (props.length === 1) {
      return props[0].options.map((opt: string) => ({
        combo: `${props[0].name}:${opt}`,
        label: opt,
      }));
    }
    // Cross-product for 2 properties
    const results: { combo: string; label: string }[] = [];
    const [p1, p2] = props;
    for (const v1 of p1.options) {
      for (const v2 of p2.options) {
        const parts = [[p1.name, v1], [p2.name, v2]].sort(([a], [b]) => a.localeCompare(b));
        results.push({
          combo: parts.map(([k, v]) => `${k}:${v}`).join(','),
          label: `${v1} / ${v2}`,
        });
      }
    }
    return results;
  };

  const combos = getCombos();
  const activeCombo = selectedCombo || (combos[0]?.combo || '');

  // Get mappings for a specific combo + state
  const getMappings = (combo: string, state: string) => {
    return tokenMappings.filter((m: any) =>
      m.componentDefId === selectedDef && m.propertyCombo === combo && m.state === state
    );
  };

  // Resolve token to its actual value
  const resolveToken = (tokenId: string) => {
    const token = namedTokens.find((t: any) => t.id === tokenId);
    if (!token) return { name: tokenId, value: '??', found: false };
    let val = token.value;
    if (token.referenceId) {
      const ref = namedTokens.find((t: any) => t.id === token.referenceId);
      if (ref) val = ref.value;
    }
    return { name: token.name, value: val, found: true };
  };

  // Get mapping count per state for the combo
  const stateCount = (combo: string, state: string) =>
    tokenMappings.filter((m: any) => m.componentDefId === selectedDef && m.propertyCombo === combo && m.state === state).length;

  // Handle changing a mapping's token
  const handleChangeToken = (mappingId: string, newTokenId: string) => {
    const updated = tokenMappings.map((m: any) =>
      m.id === mappingId ? { ...m, tokenId: newTokenId } : m
    );
    updateDesignSystem({ tokenMappings: updated });
    setEditingMapping(null);
  };

  // Get relevant token options for a CSS property
  const getTokenOptions = (cssProperty: string) => {
    if (cssProperty.toLowerCase().includes('color') || cssProperty === 'backgroundColor' || cssProperty === 'border')
      return namedTokens.filter((t: any) => t.type === 'color' && t.category === 'semantic');
    if (cssProperty.includes('adius'))
      return namedTokens.filter((t: any) => t.type === 'radius');
    if (cssProperty.includes('padding') || cssProperty.includes('margin') || cssProperty.includes('gap'))
      return namedTokens.filter((t: any) => t.type === 'spacing');
    if (cssProperty.includes('Shadow') || cssProperty === 'boxShadow')
      return namedTokens.filter((t: any) => t.type === 'shadow');
    if (cssProperty.includes('opacity'))
      return namedTokens.filter((t: any) => t.type === 'opacity');
    if (cssProperty.includes('fontSize'))
      return namedTokens.filter((t: any) => t.type === 'typography' && t.id.startsWith('font-size'));
    if (cssProperty.includes('fontWeight'))
      return namedTokens.filter((t: any) => t.type === 'typography' && t.id.startsWith('font-weight'));
    return namedTokens.filter((t: any) => t.category === 'semantic');
  };

  const currentMappings = activeCombo ? getMappings(activeCombo, selectedState) : [];

  return (
    <div>
      <div role="button" onClick={() => setExpanded(!expanded)} className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-800/30 cursor-pointer">
        <div className="flex items-center gap-1.5">
          {expanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
          <Box className="w-3 h-3 text-indigo-400" />
          <span className="text-[11px] font-semibold text-white">Component Definitions</span>
          <span className="text-[10px] text-gray-600">{componentDefs.length} types · {tokenMappings.length} mappings</span>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Def selector */}
          <div className="flex flex-wrap gap-1">
            {componentDefs.map((d: any) => (
              <button key={d.id} onClick={() => { setSelectedDef(selectedDef === d.id ? null : d.id); setSelectedCombo(null); setSelectedState('default'); }} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${selectedDef === d.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}>{d.name}</button>
            ))}
          </div>

          {def && (
            <div className="space-y-3">
              <p className="text-[10px] text-gray-400">{def.description}</p>

              {/* Properties overview */}
              <div>
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Properties</h4>
                <div className="space-y-1">
                  {def.properties.map((p: any) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-300 w-14 capitalize font-medium">{p.name}</span>
                      <div className="flex gap-1 flex-wrap">
                        {p.options.map((opt: string) => (
                          <span key={opt} className={`px-1.5 py-0.5 rounded text-[9px] ${opt === p.default ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>{opt}{opt === p.default ? ' ●' : ''}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Variant × State Matrix ── */}
              <div>
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Token Mapping Matrix</h4>

                {/* Combo selector tabs */}
                <div className="flex gap-1 flex-wrap mb-2">
                  {combos.map(({ combo, label }) => (
                    <button
                      key={combo}
                      onClick={() => { setSelectedCombo(combo); setSelectedState('default'); }}
                      className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${
                        activeCombo === combo
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-gray-800/60 text-gray-500 border border-gray-800 hover:text-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* State tabs */}
                <div className="flex gap-1 mb-2">
                  {def.states.map((s: string) => {
                    const count = stateCount(activeCombo, s);
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedState(s)}
                        className={`px-2 py-1 rounded text-[9px] transition-all flex items-center gap-1 ${
                          selectedState === s
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : count > 0
                              ? 'bg-gray-800/60 text-gray-400 border border-gray-800 hover:text-gray-300'
                              : 'bg-gray-800/30 text-gray-600 border border-gray-800/50'
                        }`}
                      >
                        {s}
                        {count > 0 && <span className="text-[8px] font-mono opacity-60">({count})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Mapping table */}
                {currentMappings.length > 0 ? (
                  <div className="bg-gray-800/20 rounded-lg border border-gray-800/50 overflow-hidden">
                    {currentMappings.map((mapping: any) => {
                      const resolved = resolveToken(mapping.tokenId);
                      const isEditing = editingMapping === mapping.id;
                      const tokenOptions = getTokenOptions(mapping.cssProperty);
                      return (
                        <div key={mapping.id} className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-800/30 last:border-0 hover:bg-gray-800/30 group">
                          <span className="text-[10px] text-gray-400 w-24 truncate flex-shrink-0">{mapping.cssProperty}</span>
                          <span className="text-[9px] text-gray-600">→</span>
                          {isEditing ? (
                            <select
                              value={mapping.tokenId}
                              onChange={(e) => handleChangeToken(mapping.id, e.target.value)}
                              onBlur={() => setEditingMapping(null)}
                              autoFocus
                              className="flex-1 bg-gray-700 text-[9px] text-gray-200 px-1.5 py-0.5 rounded border border-indigo-500/50 focus:outline-none"
                            >
                              {tokenOptions.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.name} ({t.value})</option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className="text-[9px] text-indigo-300 font-mono flex-1 truncate cursor-pointer hover:text-indigo-200"
                              title={`${resolved.name} → ${resolved.value}`}
                              onClick={() => setEditingMapping(mapping.id)}
                            >
                              {resolved.name}
                            </span>
                          )}
                          {resolved.value.startsWith('#') ? (
                            <div className="w-3.5 h-3.5 rounded border border-gray-600 flex-shrink-0" style={{ backgroundColor: resolved.value }} />
                          ) : (
                            <span className="text-[8px] text-gray-600 font-mono flex-shrink-0 max-w-[60px] truncate">{resolved.value}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-600 italic py-2">No mappings for {activeCombo} / {selectedState}</p>
                )}
              </div>

              {/* Slots */}
              <div>
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Slots</h4>
                {def.slots.map((s: any) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className={`text-[10px] ${s.required ? 'text-gray-300' : 'text-gray-500'}`}>{s.name}{s.required ? ' *' : ''}</span>
                    <span className="text-[9px] text-gray-600">{s.description}</span>
                  </div>
                ))}
              </div>

              {def.guidelines && <p className="text-[10px] text-gray-600 italic mt-1">{def.guidelines}</p>}
              {def.accessibility && <p className="text-[10px] text-gray-600 italic">{def.accessibility}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
