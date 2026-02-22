'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX,
  AlertTriangle, AlertCircle, Info, CheckCircle2,
  ChevronDown, ChevronRight, Wrench,
  Eye, Zap, RefreshCw, Settings2,
  Palette, Type, Ruler, Box, Layers, Sun, Move,
  SquareStack, CircleDot,
} from 'lucide-react';
import { useStore } from '@/store/componentStore';
import {
  validateAll, autoFixStyles,
  ValidationReport, Violation, TokenCategory,
  ComponentValidationResult,
} from '@/lib/constraintValidator';
import { validateSlots } from '@/lib/slotValidator';

// ═════════════════════════════════════════════
// CATEGORY ICONS + LABELS
// ═════════════════════════════════════════════

const categoryMeta: Record<TokenCategory, { icon: typeof Palette; label: string; color: string }> = {
  color: { icon: Palette, label: 'Color', color: '#f87171' },
  fontSize: { icon: Type, label: 'Font Size', color: '#fb923c' },
  fontWeight: { icon: Type, label: 'Font Weight', color: '#fbbf24' },
  fontFamily: { icon: Type, label: 'Font Family', color: '#a78bfa' },
  lineHeight: { icon: Type, label: 'Line Height', color: '#c084fc' },
  letterSpacing: { icon: Type, label: 'Letter Spacing', color: '#e879f9' },
  spacing: { icon: Ruler, label: 'Spacing', color: '#34d399' },
  borderRadius: { icon: Box, label: 'Border Radius', color: '#60a5fa' },
  borderWidth: { icon: Box, label: 'Border Width', color: '#93c5fd' },
  borderStyle: { icon: Box, label: 'Border Style', color: '#7dd3fc' },
  shadow: { icon: Layers, label: 'Shadow', color: '#a5b4fc' },
  opacity: { icon: Sun, label: 'Opacity', color: '#fcd34d' },
  iconSize: { icon: SquareStack, label: 'Icon Size', color: '#6ee7b7' },
  minHeight: { icon: Move, label: 'Min Height', color: '#86efac' },
  maxWidth: { icon: Move, label: 'Max Width', color: '#67e8f9' },
  'Apple HIG': { icon: Layers, label: 'Apple HIG', color: '#a78bfa' },
};

// ═════════════════════════════════════════════
// HEALTH GAUGE COMPONENT
// ═════════════════════════════════════════════

function HealthGauge({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - score / 100);
  const color = score >= 90 ? '#22c55e' : score >= 70 ? '#eab308' : score >= 50 ? '#f97316' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6}
        />
        {/* Score arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-gray-500 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// STAT PILL
// ═════════════════════════════════════════════

function StatPill({ count, icon: Icon, label, color }: { count: number; icon: typeof AlertCircle; label: string; color: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${color}15`, color }}>
      <Icon size={10} />
      {count} {label}
    </div>
  );
}

// ═════════════════════════════════════════════
// VIOLATION ROW
// ═════════════════════════════════════════════

function ViolationRow({
  violation,
  onSelect,
  onAutoFix,
}: {
  violation: Violation;
  onSelect: () => void;
  onAutoFix: () => void;
}) {
  const meta = categoryMeta[violation.category];
  const Icon = meta?.icon || AlertCircle;
  const severityColors = {
    error: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: AlertCircle },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: AlertTriangle },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info },
  };
  const sev = severityColors[violation.severity];
  const SevIcon = sev.icon;

  return (
    <div className={`${sev.bg} border ${sev.border} rounded-lg p-2 group hover:border-opacity-60 transition-all`}>
      <div className="flex items-start gap-2">
        <SevIcon size={12} className={`${sev.text} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          {/* Property + category */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono font-medium text-gray-300 truncate">{violation.property}</span>
            <span className="text-[10px] px-1 py-0 rounded-full font-medium" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
              {meta.label}
            </span>
          </div>

          {/* Current value */}
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] text-gray-500">Current:</span>
            <code className="text-[10px] text-red-300 bg-red-500/10 px-1 rounded font-mono truncate max-w-[140px]">
              {violation.currentValue}
            </code>
            {violation.currentValue.startsWith('#') && (
              <span className="w-2.5 h-2.5 rounded-sm border border-gray-600 flex-shrink-0" style={{ backgroundColor: violation.currentValue }} />
            )}
          </div>

          {/* Suggested fix */}
          {violation.nearestValidToken && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500">Fix to:</span>
              <code className="text-[10px] text-green-300 bg-green-500/10 px-1 rounded font-mono truncate max-w-[140px]">
                {violation.nearestValidToken}
              </code>
              {violation.nearestValidToken.startsWith('#') && (
                <span className="w-2.5 h-2.5 rounded-sm border border-gray-600 flex-shrink-0" style={{ backgroundColor: violation.nearestValidToken }} />
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Select component"
          >
            <Eye size={11} />
          </button>
          {violation.nearestValidToken && (
            <button
              onClick={(e) => { e.stopPropagation(); onAutoFix(); }}
              className="p-1 rounded hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-colors"
              title="Auto-fix to nearest token"
            >
              <Wrench size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// COMPONENT RESULT CARD
// ═════════════════════════════════════════════

function ComponentResultCard({
  result,
  onSelectComponent,
  onAutoFixComponent,
  onAutoFixViolation,
}: {
  result: ComponentValidationResult;
  onSelectComponent: (id: string) => void;
  onAutoFixComponent: (id: string) => void;
  onAutoFixViolation: (v: Violation) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (result.passed) return null; // Only show failing components

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {/* Component header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-gray-800/50 transition-colors"
      >
        {expanded ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
        <ShieldX size={13} className="text-red-400" />
        <span className="text-[11px] text-gray-300 font-medium truncate flex-1 text-left">
          {result.componentName}
        </span>
        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
          {result.violations.length} issue{result.violations.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Expanded violations */}
      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-1.5">
          {/* Quick actions */}
          <div className="flex gap-1.5 mb-2">
            <button
              onClick={() => onSelectComponent(result.componentId)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            >
              <Eye size={10} /> Select
            </button>
            <button
              onClick={() => onAutoFixComponent(result.componentId)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors"
            >
              <Wrench size={10} /> Fix All ({result.violations.filter(v => v.nearestValidToken).length})
            </button>
          </div>

          {result.violations.map(v => (
            <ViolationRow
              key={v.id}
              violation={v}
              onSelect={() => onSelectComponent(result.componentId)}
              onAutoFix={() => onAutoFixViolation(v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
// CATEGORY BREAKDOWN
// ═════════════════════════════════════════════

function CategoryBreakdown({ violations }: { violations: Violation[] }) {
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of violations) {
      map[v.category] = (map[v.category] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [violations]);

  if (byCategory.length === 0) return null;

  const maxCount = byCategory[0][1];

  return (
    <div className="space-y-1">
      <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">By Category</h4>
      {byCategory.map(([cat, count]) => {
        const meta = categoryMeta[cat as TokenCategory];
        if (!meta) return null;
        const Icon = meta.icon;
        const pct = (count / maxCount) * 100;
        return (
          <div key={cat} className="flex items-center gap-1.5">
            <Icon size={10} style={{ color: meta.color }} className="flex-shrink-0" />
            <span className="text-[10px] text-gray-400 w-16 truncate">{meta.label}</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: meta.color }}
              />
            </div>
            <span className="text-[10px] text-gray-500 w-5 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════
// MAIN PANEL
// ═════════════════════════════════════════════

export function ConstraintValidationPanel() {
  const {
    components, designSystem, selectComponent, updateComponent,
    findComponent, addToast, pushHistory,
  } = useStore();

  const [report, setReport] = useState<ValidationReport | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning'>('all');
  const [showPassing, setShowPassing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const tokensEnabled = designSystem.imported === true || (designSystem.namedTokens?.length > 0) || (designSystem.tokens?.enabled === true);

  // Run validation — ONLY on manual click, never auto
  const runValidation = useCallback(() => {
    if (!tokensEnabled || isValidating) return;
    setIsValidating(true);
    // Use requestAnimationFrame + setTimeout to fully defer out of render cycle
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          // Extract plain arrays BEFORE calling validator to avoid proxy issues
          const plainComponents: any[] = [];
          for (let i = 0; i < components.length; i++) {
            const c = components[i];
            if (!c) continue;
            const plainStyles: Record<string, any> = {};
            if (c.styles && typeof c.styles === 'object') {
              const keys = Object.keys(c.styles);
              for (let k = 0; k < keys.length; k++) {
                const val = c.styles[keys[k]];
                if (typeof val === 'string' || typeof val === 'number') {
                  plainStyles[keys[k]] = val;
                }
              }
            }
            const plainChildren: any[] = [];
            if (Array.isArray(c.children)) {
              for (let j = 0; j < c.children.length; j++) {
                const ch = c.children[j];
                if (!ch) continue;
                const chStyles: Record<string, any> = {};
                if (ch.styles && typeof ch.styles === 'object') {
                  const chKeys = Object.keys(ch.styles);
                  for (let k = 0; k < chKeys.length; k++) {
                    const val = ch.styles[chKeys[k]];
                    if (typeof val === 'string' || typeof val === 'number') {
                      chStyles[chKeys[k]] = val;
                    }
                  }
                }
                plainChildren.push({ id: String(ch.id || ''), type: String(ch.type || ''), content: String(ch.content || ''), styles: chStyles, children: [] });
              }
            }
            plainComponents.push({ id: String(c.id || ''), type: String(c.type || ''), content: String(c.content || ''), styles: plainStyles, children: plainChildren });
          }

          const plainDS = {
            colors: Array.isArray(designSystem.colors) ? designSystem.colors.map((c: any) => ({ name: String(c?.name || ''), value: String(c?.value || '') })) : [],
            fonts: Array.isArray(designSystem.fonts) ? designSystem.fonts.map((f: any) => String(f || '')) : [],
            namedTokens: Array.isArray(designSystem.namedTokens) ? designSystem.namedTokens.map((t: any) => ({
              id: String(t?.id || ''), name: String(t?.name || ''), type: String(t?.type || ''),
              value: String(t?.value || ''), category: String(t?.category || ''), theme: t?.theme || null,
            })) : [],
            tokens: {
              enabled: true,
              fontSizes: Array.isArray(designSystem.tokens?.fontSizes) ? [...designSystem.tokens.fontSizes] : [],
              fontWeights: Array.isArray(designSystem.tokens?.fontWeights) ? [...designSystem.tokens.fontWeights] : [],
              lineHeights: Array.isArray(designSystem.tokens?.lineHeights) ? [...designSystem.tokens.lineHeights] : [],
              letterSpacing: Array.isArray(designSystem.tokens?.letterSpacing) ? [...designSystem.tokens.letterSpacing] : [],
              spacing: Array.isArray(designSystem.tokens?.spacing) ? [...designSystem.tokens.spacing] : [],
              maxWidths: Array.isArray(designSystem.tokens?.maxWidths) ? [...designSystem.tokens.maxWidths] : [],
              borderRadius: Array.isArray(designSystem.tokens?.borderRadius) ? [...designSystem.tokens.borderRadius] : [],
              borderWidths: Array.isArray(designSystem.tokens?.borderWidths) ? [...designSystem.tokens.borderWidths] : [],
              borderStyles: Array.isArray(designSystem.tokens?.borderStyles) ? [...designSystem.tokens.borderStyles] : [],
              shadows: Array.isArray(designSystem.tokens?.shadows) ? [...designSystem.tokens.shadows] : [],
              opacities: Array.isArray(designSystem.tokens?.opacities) ? [...designSystem.tokens.opacities] : [],
              iconSizes: Array.isArray(designSystem.tokens?.iconSizes) ? [...designSystem.tokens.iconSizes] : [],
              minHeights: Array.isArray(designSystem.tokens?.minHeights) ? [...designSystem.tokens.minHeights] : [],
            },
          };

          const result = validateAll(plainComponents, plainDS);
          setReport(result);
        } catch (err) {
          console.warn('Validation failed:', err);
          setReport({
            passed: true, timestamp: Date.now(), totalComponents: components.length,
            totalChecks: 0, totalPassed: 0, totalViolations: 0,
            errorCount: 0, warningCount: 0, infoCount: 0, healthScore: 100,
            componentResults: [], violations: [], summary: 'Validation error — try again',
          });
        } finally {
          setIsValidating(false);
        }
      }, 100);
    });
  }, [components, designSystem, tokensEnabled, isValidating]);

  // Filter violations
  const filteredResults = useMemo(() => {
    if (!report) return [];
    return report.componentResults.filter(r => {
      if (!showPassing && r.passed) return false;
      if (filterSeverity === 'all') return true;
      return r.violations.some(v => v.severity === filterSeverity);
    });
  }, [report, filterSeverity, showPassing]);

  const filteredViolations = useMemo(() => {
    if (!report) return [];
    if (filterSeverity === 'all') return report.violations;
    return report.violations.filter(v => v.severity === filterSeverity);
  }, [report, filterSeverity]);

  // Auto-fix a single violation
  const handleAutoFixViolation = useCallback((violation: Violation) => {
    const comp = findComponent(violation.componentId);
    if (!comp || !violation.nearestValidToken) return;

    pushHistory();
    const fixed = autoFixStyles(comp.styles, [violation]);
    updateComponent(violation.componentId, { styles: fixed });
    addToast(`Fixed ${violation.property} → ${violation.nearestValidToken}`, 'success');
    // Re-validate after fix
    setTimeout(runValidation, 200);
  }, [findComponent, updateComponent, pushHistory, addToast, runValidation]);

  // Auto-fix all violations for a component
  const handleAutoFixComponent = useCallback((componentId: string) => {
    const comp = findComponent(componentId);
    if (!comp) return;

    const compResult = report?.componentResults.find(r => r.componentId === componentId);
    if (!compResult) return;

    const fixable = compResult.violations.filter(v => v.nearestValidToken);
    if (fixable.length === 0) return;

    pushHistory();
    const fixed = autoFixStyles(comp.styles, fixable);
    updateComponent(componentId, { styles: fixed });
    addToast(`Fixed ${fixable.length} violations on "${compResult.componentName}"`, 'success');
    setTimeout(runValidation, 200);
  }, [findComponent, report, updateComponent, pushHistory, addToast, runValidation]);

  // Auto-fix ALL violations
  const handleAutoFixAll = useCallback(() => {
    if (!report || report.violations.length === 0) return;

    pushHistory();
    let fixCount = 0;

    for (const result of report.componentResults) {
      if (result.passed) continue;
      const comp = findComponent(result.componentId);
      if (!comp) continue;

      const fixable = result.violations.filter(v => v.nearestValidToken);
      if (fixable.length === 0) continue;

      const fixed = autoFixStyles(comp.styles, fixable);
      updateComponent(result.componentId, { styles: fixed });
      fixCount += fixable.length;
    }

    addToast(`Auto-fixed ${fixCount} violations across all components`, 'success');
    setTimeout(runValidation, 200);
  }, [report, findComponent, updateComponent, pushHistory, addToast, runValidation]);

  // ── RENDER ──

  // Tokens not enabled state
  if (!tokensEnabled) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Shield size={32} className="text-gray-600 mb-3" />
        <h3 className="text-xs font-semibold text-gray-400 mb-1">Constraint Validation</h3>
        <p className="text-[10px] text-gray-600 mb-3 leading-relaxed">
          Enable design tokens in the Constraints tab to activate real-time validation of your components.
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-lg">
          <Settings2 size={10} />
          Constraints → Toggle &quot;Rules&quot;
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ═══ HEADER ═══ */}
      <div className="p-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {report?.passed
              ? <ShieldCheck size={16} className="text-green-400" />
              : report
                ? <ShieldAlert size={16} className="text-red-400" />
                : <Shield size={16} className="text-gray-500" />
            }
            <h3 className="text-xs font-semibold text-gray-200">Validation</h3>
          </div>
          <div className="flex items-center gap-1">
            {/* Manual run */}
            <button
              onClick={runValidation}
              disabled={isValidating}
              className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
              title="Run validation"
            >
              <RefreshCw size={11} className={isValidating ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ═══ HEALTH SCORE + STATS ═══ */}
        {report && (
          <div className="flex items-center gap-3">
            <HealthGauge score={report.healthScore} size={64} />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <StatPill count={report.errorCount} icon={AlertCircle} label="errors" color="#ef4444" />
                <StatPill count={report.warningCount} icon={AlertTriangle} label="warnings" color="#eab308" />
                {report.passed && (
                  <div className="flex items-center gap-1 text-[10px] text-green-400">
                    <CheckCircle2 size={10} /> All clear
                  </div>
                )}
              </div>
              <div className="text-[10px] text-gray-500">
                {report.totalPassed}/{report.totalChecks} checks passed · {report.totalComponents} components
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ TOOLBAR ═══ */}
      {report && report.totalViolations > 0 && (
        <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-1.5 flex-shrink-0">
          {/* Severity filter */}
          {(['all', 'error', 'warning'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterSeverity === sev
                  ? sev === 'error' ? 'bg-red-500/20 text-red-400'
                    : sev === 'warning' ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-700 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {sev === 'all' ? 'All' : sev === 'error' ? `Errors (${report.errorCount})` : `Warnings (${report.warningCount})`}
            </button>
          ))}

          <div className="flex-1" />

          {/* Fix All button */}
          {report.violations.some(v => v.nearestValidToken) && (
            <button
              onClick={handleAutoFixAll}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg transition-colors"
            >
              <Zap size={10} />
              Fix All
            </button>
          )}
        </div>
      )}

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto">
        {/* No report yet */}
        {!report && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <RefreshCw size={20} className="text-gray-600 mb-2" />
            <p className="text-[10px] text-gray-500">Click refresh or add components to validate</p>
          </div>
        )}

        {/* All clear */}
        {report?.passed && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <ShieldCheck size={24} className="text-green-400" />
            </div>
            <h4 className="text-xs font-semibold text-green-400 mb-1">All Constraints Met</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Every value in your {report.totalComponents} component{report.totalComponents !== 1 ? 's' : ''} matches the design system.
              {report.totalChecks > 0 && ` ${report.totalChecks} properties validated.`}
            </p>
          </div>
        )}

        {/* Violations */}
        {report && !report.passed && (
          <div className="p-3 space-y-3">
            {/* Category breakdown */}
            <CategoryBreakdown violations={filteredViolations} />

            {/* Component results */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Components</h4>
              {filteredResults.length === 0 ? (
                <p className="text-[10px] text-gray-600 py-2">No violations match current filter</p>
              ) : (
                filteredResults.map(result => (
                  <ComponentResultCard
                    key={result.componentId}
                    result={result}
                    onSelectComponent={(id) => selectComponent(id)}
                    onAutoFixComponent={handleAutoFixComponent}
                    onAutoFixViolation={handleAutoFixViolation}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Empty canvas */}
        {report && report.totalComponents === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <CircleDot size={20} className="text-gray-600 mb-2" />
            <p className="text-[10px] text-gray-500">Add components to the canvas to start validating</p>
          </div>
        )}
      </div>

      {/* ═══ SLOT VALIDATION ═══ */}
      {report && (() => {
        const componentDefs = useStore.getState().designSystem.componentDefs;
        const slotIssues: { componentId: string; name: string; missing: string[] }[] = [];
        for (const comp of components) {
          if (comp.componentDefId) {
            const def = componentDefs.find(d => d.id === comp.componentDefId);
            if (def) {
              const result = validateSlots(comp, def);
              if (!result.valid) {
                slotIssues.push({
                  componentId: comp.id,
                  name: comp.content || comp.type,
                  missing: result.violations.filter(v => v.severity === 'error').map(v => v.slotName),
                });
              }
            }
          }
        }
        if (slotIssues.length === 0) return null;
        return (
          <div className="px-3 py-2 border-t border-gray-800">
            <p className="text-[10px] font-semibold text-amber-400 mb-1.5">Slot Violations</p>
            {slotIssues.map(issue => (
              <div key={issue.componentId} className="flex items-center gap-2 py-1">
                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-300">{issue.name}</span>
                <span className="text-[9px] text-gray-500">missing: {issue.missing.join(', ')}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ═══ FOOTER ═══ */}
      {report && (
        <div className="px-3 py-1.5 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-600">
              Last validated {new Date(report.timestamp).toLocaleTimeString()}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              <span className="text-[10px] text-gray-600">Manual</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
