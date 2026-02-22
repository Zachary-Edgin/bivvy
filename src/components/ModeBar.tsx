'use client';

import { useState } from 'react';
import { Lightbulb, Paintbrush, Code2, Lock } from 'lucide-react';

export type AppMode = 'plan' | 'design' | 'implement';

interface ModeBarProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const modes: { id: AppMode; label: string; icon: typeof Lightbulb; enabled: boolean; tooltip: string }[] = [
  { id: 'plan', label: 'Plan', icon: Lightbulb, enabled: false, tooltip: 'Problem-solving, user flows, wireframing — coming soon' },
  { id: 'design', label: 'Design', icon: Paintbrush, enabled: true, tooltip: 'High-fidelity visual design with AI variations' },
  { id: 'implement', label: 'Implement', icon: Code2, enabled: false, tooltip: 'Animations, prototypes, code generation — coming soon' },
];

export function ModeBar({ activeMode, onModeChange }: ModeBarProps) {
  return (
    <div className="flex items-center gap-0.5 bg-[#1a1a1a] rounded-lg p-0.5 border border-white/[0.06]">
      {modes.map(m => {
        const Icon = m.icon;
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => m.enabled && onModeChange(m.id)}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150
              ${isActive
                ? 'bg-[#2296FF]/15 text-[#2296FF] shadow-sm'
                : m.enabled
                  ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  : 'text-gray-600 cursor-not-allowed'
              }
            `}
            title={m.tooltip}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{m.label}</span>
            {!m.enabled && <Lock className="w-2.5 h-2.5 ml-0.5 opacity-50" />}
          </button>
        );
      })}
    </div>
  );
}

// ═══ Plan Mode Placeholder ═══
export function PlanModePlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
        <Lightbulb className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Plan Mode</h2>
      <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
        Define problems before touching visual design. AI generates user flow options,
        suggests missing screens, and simulates navigation.
      </p>
      <div className="grid grid-cols-3 gap-3 max-w-lg">
        {['User Flows', 'Wireframing', 'Information Architecture'].map(feat => (
          <div key={feat} className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] text-gray-500">{feat}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
        <span className="text-[11px] text-amber-400 font-medium">Coming in a future release</span>
      </div>
    </div>
  );
}

// ═══ Implement Mode Placeholder ═══
export function ImplementModePlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
        <Code2 className="w-8 h-8 text-emerald-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Implement Mode</h2>
      <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
        Finalize designs for development. Add animations, transitions, interactive prototypes,
        generate production code, and prepare engineering handoff.
      </p>
      <div className="grid grid-cols-3 gap-3 max-w-lg">
        {['Animations', 'Prototyping', 'Code Export'].map(feat => (
          <div key={feat} className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] text-gray-500">{feat}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-[11px] text-emerald-400 font-medium">Coming in a future release</span>
      </div>
    </div>
  );
}
