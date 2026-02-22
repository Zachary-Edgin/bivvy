'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="canvas"]',
    title: 'Your Design Canvas',
    description: 'This is where your components live. Scroll to zoom, hold Space + drag to pan around. Click to select, double-click to edit children inside a component.',
    position: 'bottom',
  },
  {
    target: '[data-tour="toolbar"]',
    title: 'Drawing Tools',
    description: 'Quick access to shapes and elements. Press V for select, R for rectangle, O for circle, L for line, A for arrow, T for text. Or just click them!',
    position: 'top',
  },
  {
    target: '[data-tour="library"]',
    title: 'Component Library',
    description: 'Pre-built components ready to use — buttons, cards, forms, navigation, and more. Click any component to add it to your canvas. You can also save your own templates here.',
    position: 'right',
  },
  {
    target: '[data-tour="layers"]',
    title: 'Layers Panel',
    description: 'See all your components in a tree view. Drag to reorder layers, click the arrows to change z-order, and use the visibility toggle to show/hide elements.',
    position: 'right',
  },
  {
    target: '[data-tour="ai-chat"]',
    title: 'AI Assistant',
    description: 'Describe what you want in natural language — "Create a pricing card" or "Make it blue with rounded corners". The AI will create or modify components for you. You can even say "Build me a landing page"!',
    position: 'left',
  },
  {
    target: '[data-tour="properties"]',
    title: 'Properties Panel',
    description: 'Fine-tune your selected component — colors, typography, spacing, borders, shadows, and auto-layout controls. Select a component to see its properties here.',
    position: 'left',
  },
  {
    target: '[data-tour="workspace-bar"]',
    title: 'Workspace Controls',
    description: 'Zoom controls, grid toggle, snap-to-grid (magnet icon), device preview frames (phone/tablet/desktop), and code export. Press ? anytime to see all keyboard shortcuts.',
    position: 'bottom',
  },
];

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const currentStep = tourSteps[step];

  const positionTooltip = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setSpotlightRect(rect);

    const pad = 16;
    const tooltipW = 340;
    const tooltipH = 260; // generous estimate for content + buttons
    let style: React.CSSProperties = {};

    switch (currentStep.position) {
      case 'right':
        style = { left: rect.right + pad, top: Math.max(20, rect.top + rect.height / 2 - tooltipH / 2) };
        break;
      case 'left':
        style = { left: Math.max(20, rect.left - tooltipW - pad), top: Math.max(20, rect.top + rect.height / 2 - tooltipH / 2) };
        break;
      case 'bottom':
        style = { left: rect.left + rect.width / 2 - tooltipW / 2, top: rect.bottom + pad };
        break;
      case 'top':
        style = { left: rect.left + rect.width / 2 - tooltipW / 2, top: Math.max(20, rect.top - tooltipH - pad) };
        break;
    }

    // Keep well within screen bounds with generous margins
    const maxX = window.innerWidth - tooltipW - 20;
    const maxY = window.innerHeight - tooltipH - 20;
    style.left = Math.max(20, Math.min(Number(style.left) || 0, maxX));
    style.top = Math.max(20, Math.min(Number(style.top) || 0, maxY));

    setTooltipStyle(style);
  }, [currentStep]);

  useEffect(() => {
    positionTooltip();
    const handler = () => positionTooltip();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [step, positionTooltip]);

  const next = () => {
    if (step < tourSteps.length - 1) setStep(step + 1);
    else finish();
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };
  const finish = () => {
    try { localStorage.setItem('bivvy-tour-completed', 'true'); } catch {}
    onComplete();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step]);

  return (
    <div className="fixed inset-0 z-[300]">
      {/* Overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.x - 8}
                y={spotlightRect.y - 8}
                width={spotlightRect.width + 16}
                height={spotlightRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {spotlightRect && (
        <div
          className="absolute border-2 border-[#2296FF] rounded-xl pointer-events-none"
          style={{
            left: spotlightRect.x - 8,
            top: spotlightRect.y - 8,
            width: spotlightRect.width + 16,
            height: spotlightRect.height + 16,
            boxShadow: '0 0 20px rgba(34, 150, 255, 0.4), inset 0 0 20px rgba(34, 150, 255, 0.1)',
          }}
        />
      )}

      {/* Click blocker */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      {/* Tooltip */}
      <div
        className="fixed w-[340px] bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        style={{ ...tooltipStyle, zIndex: 301 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2296FF]" />
            <span className="text-[#2296FF] text-xs font-medium">
              Step {step + 1} of {tourSteps.length}
            </span>
          </div>
          <button
            onClick={finish}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-2">
          <h3 className="text-white text-base font-semibold mb-1.5">{currentStep.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{currentStep.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {tourSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-[#2296FF]' : i < step ? 'w-1.5 bg-[#2296FF]/50' : 'w-1.5 bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
          <button
            onClick={finish}
            className="text-gray-500 text-sm hover:text-gray-300 transition-colors outline-none"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors outline-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium bg-[#2296FF] text-white hover:bg-[#1a82e6] transition-colors outline-none"
            >
              {step < tourSteps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              ) : (
                'Get Started!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Welcome screen shown on empty canvas
export function WelcomeScreen({ onStartTour, onDismiss }: { onStartTour: () => void; onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="pointer-events-auto bg-[#1a1a1a]/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl shadow-black/40 p-8 max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2296FF] to-[#1a6fd4] flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Welcome to Bivvy</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Design beautiful UI components with AI. Describe what you want, iterate instantly, and export production-ready code.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onStartTour}
            className="w-full py-3 rounded-xl bg-[#2296FF] text-white font-medium hover:bg-[#1a82e6] transition-colors outline-none"
          >
            Take a Quick Tour
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors outline-none"
          >
            Jump Right In
          </button>
        </div>
      </div>
    </div>
  );
}
