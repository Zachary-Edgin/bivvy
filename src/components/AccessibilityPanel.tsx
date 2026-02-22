'use client';

import { useStore } from '@/store/componentStore';
import { getSlotSummary, validateSlots } from '@/lib/slotValidator';
import { CheckCircle, XCircle, AlertTriangle, Accessibility, Puzzle, Smartphone, Monitor, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function AccessibilityPanel() {
  const selectedId = useStore(s => s.selectedId);
  const components = useStore(s => s.components);
  const componentDefs = useStore(s => s.designSystem.componentDefs);
  const devicePreview = useStore(s => s.devicePreview);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    accessibility: true,
    slots: true,
    platform: true,
  });

  const toggle = (section: string) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  // Find selected component
  let selectedComponent = components.find(c => c.id === selectedId);
  if (!selectedComponent) {
    for (const comp of components) {
      if (comp.children) {
        const child = comp.children.find(ch => ch.id === selectedId);
        if (child) { selectedComponent = child; break; }
        for (const ch of comp.children) {
          if (ch.children) {
            const gc = ch.children.find(g => g.id === selectedId);
            if (gc) { selectedComponent = gc; break; }
          }
        }
      }
    }
  }

  if (!selectedComponent) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <Accessibility className="w-8 h-8 text-gray-600 mb-3" />
        <p className="text-xs text-gray-500">Select a component to view accessibility info, slot validation, and platform guidelines.</p>
      </div>
    );
  }

  // Find the component definition if linked
  const compDef = selectedComponent.componentDefId
    ? componentDefs.find(d => d.id === selectedComponent!.componentDefId)
    : undefined;

  // Find by type match if no explicit link
  const matchedDef = compDef || componentDefs.find(d =>
    d.name.toLowerCase() === selectedComponent!.type.toLowerCase() ||
    (selectedComponent!.type === 'div' && selectedComponent!.children && selectedComponent!.children.length > 0 && d.name === 'Card')
  );

  // Slot validation
  const slotSummary = matchedDef ? getSlotSummary(selectedComponent, matchedDef) : [];
  const slotValidation = matchedDef ? validateSlots(selectedComponent, matchedDef) : null;

  // Platform info
  const currentPlatform: 'ios' | 'android' | 'web' =
    devicePreview === 'phone' || devicePreview === 'tablet' ? 'ios' : 'web';
  const platformOverride = matchedDef?.platformOverrides?.[currentPlatform];

  return (
    <div className="p-3 space-y-3">

      {/* Component Identity */}
      <div className="px-3 py-2.5 bg-[#1a1a1a] rounded-lg border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-white">{matchedDef?.name || selectedComponent.type}</span>
          {matchedDef && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-medium">
              Linked to {matchedDef.id}
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          {matchedDef?.description || `${selectedComponent.type} element`}
        </p>
      </div>

      {/* ═══ Accessibility Section ═══ */}
      <div className="border border-white/[0.06] rounded-lg overflow-hidden">
        <button
          onClick={() => toggle('accessibility')}
          className="w-full flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-white/[0.03] transition-colors"
        >
          {expandedSections.accessibility ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
          <Accessibility className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-semibold text-white">Accessibility</span>
        </button>
        {expandedSections.accessibility && (
          <div className="px-3 py-2.5 space-y-2.5 bg-[#141414]">
            {matchedDef?.accessibility ? (
              <>
                <div className="space-y-1.5">
                  {matchedDef.accessibility.split('. ').filter(Boolean).map((rule, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-gray-300 leading-relaxed">{rule.trim()}{!rule.endsWith('.') ? '.' : ''}</span>
                    </div>
                  ))}
                </div>
                {/* ARIA quick reference */}
                <div className="pt-2 border-t border-white/[0.04]">
                  <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quick ARIA Reference</p>
                  <div className="space-y-1">
                    {getAriaHints(matchedDef.name).map((hint, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <code className="text-[9px] px-1 py-0.5 bg-white/[0.05] rounded text-blue-300 font-mono">{hint.attr}</code>
                        <span className="text-[9px] text-gray-500">{hint.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[10px] text-gray-500 italic">No accessibility metadata for this component type.</p>
            )}
          </div>
        )}
      </div>

      {/* ═══ Slot Validation Section ═══ */}
      {slotSummary.length > 0 && (
        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
          <button
            onClick={() => toggle('slots')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-white/[0.03] transition-colors"
          >
            {expandedSections.slots ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
            <Puzzle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold text-white">Slots</span>
            {slotValidation && !slotValidation.valid && (
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">
                {slotValidation.violations.filter(v => v.severity === 'error').length} missing
              </span>
            )}
            {slotValidation?.valid && (
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-medium">
                Valid
              </span>
            )}
          </button>
          {expandedSections.slots && (
            <div className="px-3 py-2.5 space-y-1.5 bg-[#141414]">
              {slotSummary.map(slot => (
                <div key={slot.name} className="flex items-center gap-2 py-1">
                  {slot.filled ? (
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  ) : slot.required ? (
                    <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-white">{slot.name}</span>
                      {slot.required && <span className="text-[8px] px-1 py-0.5 rounded bg-red-500/15 text-red-400">Required</span>}
                      {!slot.required && <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.05] text-gray-500">Optional</span>}
                    </div>
                    <p className="text-[9px] text-gray-500 truncate">{slot.description}</p>
                  </div>
                  <span className={`text-[9px] font-medium ${slot.filled ? 'text-green-400' : 'text-gray-600'}`}>
                    {slot.filled ? 'Filled' : 'Empty'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Platform Guidelines Section ═══ */}
      {matchedDef?.platformOverrides && (
        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
          <button
            onClick={() => toggle('platform')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-white/[0.03] transition-colors"
          >
            {expandedSections.platform ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold text-white">Platform Guidelines</span>
          </button>
          {expandedSections.platform && (
            <div className="px-3 py-2.5 space-y-2 bg-[#141414]">
              {Object.entries(matchedDef.platformOverrides).map(([platform, info]) => {
                if (!info) return null;
                const isActive = (platform === 'ios' && (devicePreview === 'phone' || devicePreview === 'tablet')) ||
                                 (platform === 'android' && devicePreview === 'phone') ||
                                 (platform === 'web' && (!devicePreview || devicePreview === 'desktop'));
                const Icon = platform === 'ios' ? Smartphone : platform === 'android' ? Smartphone : Monitor;
                return (
                  <div
                    key={platform}
                    className={`px-2.5 py-2 rounded-md border transition-colors ${
                      isActive ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/[0.04] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3 h-3 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                      <span className={`text-[10px] font-semibold capitalize ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>
                        {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Web'}
                      </span>
                      {isActive && <span className="text-[8px] px-1 py-0.5 rounded bg-cyan-500/15 text-cyan-400 ml-auto">Active</span>}
                    </div>
                    <p className="text-[9px] text-gray-400 leading-relaxed">{info.notes}</p>
                    {info.styles && Object.keys(info.styles).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(info.styles).map(([prop, val]) => (
                          <code key={prop} className="text-[8px] px-1 py-0.5 bg-white/[0.04] rounded text-gray-400 font-mono">
                            {prop}: {String(val)}
                          </code>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ Usage Guidelines Section ═══ */}
      {matchedDef && (matchedDef.useWhen || matchedDef.dontUseWhen || matchedDef.guidelines) && (
        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-[#1a1a1a]">
            <span className="text-[11px] font-semibold text-white">Usage Guidelines</span>
          </div>
          <div className="px-3 py-2.5 space-y-2 bg-[#141414]">
            {matchedDef.guidelines && (
              <p className="text-[10px] text-gray-400 leading-relaxed">{matchedDef.guidelines}</p>
            )}
            {matchedDef.useWhen && matchedDef.useWhen.length > 0 && (
              <div>
                <p className="text-[9px] font-semibold text-green-400 mb-1">✓ Use when</p>
                {matchedDef.useWhen.map((rule, i) => (
                  <p key={i} className="text-[9px] text-gray-400 pl-3 leading-relaxed">• {rule}</p>
                ))}
              </div>
            )}
            {matchedDef.dontUseWhen && matchedDef.dontUseWhen.length > 0 && (
              <div>
                <p className="text-[9px] font-semibold text-red-400 mb-1">✗ Don't use when</p>
                {matchedDef.dontUseWhen.map((rule, i) => (
                  <p key={i} className="text-[9px] text-gray-400 pl-3 leading-relaxed">• {rule}</p>
                ))}
              </div>
            )}
            {matchedDef.builtFrom && matchedDef.builtFrom.length > 0 && (
              <div className="pt-1.5 border-t border-white/[0.04]">
                <p className="text-[9px] text-gray-500">
                  Composed of: {matchedDef.builtFrom.join(' + ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ ARIA Hint Generator ═══
function getAriaHints(componentName: string): { attr: string; desc: string }[] {
  const hints: Record<string, { attr: string; desc: string }[]> = {
    Button: [
      { attr: 'role="button"', desc: 'Implicit for <button>' },
      { attr: 'aria-disabled', desc: 'Better than disabled attr' },
      { attr: 'aria-busy', desc: 'For loading state' },
      { attr: 'aria-label', desc: 'When icon-only' },
    ],
    Card: [
      { attr: 'role="article"', desc: 'For content cards' },
      { attr: 'tabindex="0"', desc: 'If interactive' },
      { attr: 'aria-labelledby', desc: 'Point to card title' },
    ],
    Input: [
      { attr: 'aria-invalid', desc: 'For error state' },
      { attr: 'aria-describedby', desc: 'Link to helper text' },
      { attr: 'aria-required', desc: 'For required fields' },
    ],
    Badge: [
      { attr: 'role="status"', desc: 'For dynamic badges' },
      { attr: 'aria-live="polite"', desc: 'Announce changes' },
    ],
    Avatar: [
      { attr: 'alt="Name"', desc: 'For profile images' },
      { attr: 'aria-hidden', desc: 'If decorative' },
    ],
    Dialog: [
      { attr: 'role="dialog"', desc: 'Required for modals' },
      { attr: 'aria-modal="true"', desc: 'Indicates modal behavior' },
      { attr: 'aria-labelledby', desc: 'Point to dialog title' },
    ],
    Navigation: [
      { attr: '<nav>', desc: 'Use semantic nav element' },
      { attr: 'aria-label', desc: 'Describe nav purpose' },
      { attr: 'aria-current="page"', desc: 'Active page indicator' },
    ],
  };
  return hints[componentName] || [
    { attr: 'role', desc: 'Define component role' },
    { attr: 'aria-label', desc: 'Accessible name' },
  ];
}
