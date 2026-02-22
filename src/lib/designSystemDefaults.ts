/**
 * Bivvy Default Design System — Named Tokens, Component Definitions, Token Mappings
 * Based on Nick's Design_System_Structure.docx specification
 */

import type { DesignToken, ComponentDefinition, ComponentTokenMapping } from '@/store/componentStore';

let _id = 0;
const uid = (prefix: string) => `${prefix}-${++_id}`;

// ═══════════════════════════════════════
// 1. NAMED TOKENS
// ═══════════════════════════════════════

// ── 1.1 Color Primitives ──
const colorPrimitives: DesignToken[] = [
  { id: 'blue-500', name: 'blue-500', type: 'color', value: '#1976d2', category: 'primitive', theme: null, description: 'Primary blue' },
  { id: 'blue-600', name: 'blue-600', type: 'color', value: '#1565c0', category: 'primitive', theme: null, description: 'Dark primary blue' },
  { id: 'blue-700', name: 'blue-700', type: 'color', value: '#0d47a1', category: 'primitive', theme: null, description: 'Darker blue for active states' },
  { id: 'blue-100', name: 'blue-100', type: 'color', value: '#bbdefb', category: 'primitive', theme: null, description: 'Light blue tint' },
  { id: 'purple-500', name: 'purple-500', type: 'color', value: '#9c27b0', category: 'primitive', theme: null, description: 'Secondary purple' },
  { id: 'purple-600', name: 'purple-600', type: 'color', value: '#7b1fa2', category: 'primitive', theme: null, description: 'Dark secondary purple' },
  { id: 'green-500', name: 'green-500', type: 'color', value: '#2e7d32', category: 'primitive', theme: null, description: 'Success green' },
  { id: 'green-600', name: 'green-600', type: 'color', value: '#1b5e20', category: 'primitive', theme: null, description: 'Dark success green' },
  { id: 'red-500', name: 'red-500', type: 'color', value: '#c62828', category: 'primitive', theme: null, description: 'Error red' },
  { id: 'red-600', name: 'red-600', type: 'color', value: '#b71c1c', category: 'primitive', theme: null, description: 'Dark error red' },
  { id: 'red-700', name: 'red-700', type: 'color', value: '#7f0000', category: 'primitive', theme: null, description: 'Deeper red for active states' },
  { id: 'orange-500', name: 'orange-500', type: 'color', value: '#e65100', category: 'primitive', theme: null, description: 'Warning orange' },
  { id: 'cyan-500', name: 'cyan-500', type: 'color', value: '#0288d1', category: 'primitive', theme: null, description: 'Info cyan' },
  { id: 'gray-50', name: 'gray-50', type: 'color', value: '#fafafa', category: 'primitive', theme: null, description: 'Lightest gray' },
  { id: 'gray-100', name: 'gray-100', type: 'color', value: '#f5f5f5', category: 'primitive', theme: null, description: 'Very light gray' },
  { id: 'gray-200', name: 'gray-200', type: 'color', value: '#eeeeee', category: 'primitive', theme: null, description: 'Light gray' },
  { id: 'gray-300', name: 'gray-300', type: 'color', value: '#e0e0e0', category: 'primitive', theme: null, description: 'Border gray' },
  { id: 'gray-400', name: 'gray-400', type: 'color', value: '#bdbdbd', category: 'primitive', theme: null, description: 'Disabled gray' },
  { id: 'gray-500', name: 'gray-500', type: 'color', value: '#9e9e9e', category: 'primitive', theme: null, description: 'Mid gray' },
  { id: 'gray-600', name: 'gray-600', type: 'color', value: '#757575', category: 'primitive', theme: null, description: 'Secondary text gray' },
  { id: 'gray-700', name: 'gray-700', type: 'color', value: '#616161', category: 'primitive', theme: null, description: 'Dark gray' },
  { id: 'gray-800', name: 'gray-800', type: 'color', value: '#424242', category: 'primitive', theme: null, description: 'Very dark gray' },
  { id: 'gray-900', name: 'gray-900', type: 'color', value: '#212121', category: 'primitive', theme: null, description: 'Near-black gray' },
  { id: 'white', name: 'white', type: 'color', value: '#ffffff', category: 'primitive', theme: null, description: 'Pure white' },
  { id: 'black', name: 'black', type: 'color', value: '#000000', category: 'primitive', theme: null, description: 'Pure black' },
];

// ── 1.1b Color Semantics (Dark theme) ──
const colorSemanticsDark: DesignToken[] = [
  { id: 'color-bg-primary', name: 'color-background-primary', type: 'color', value: '#0a0a0a', referenceId: 'black', category: 'semantic', theme: 'dark', description: 'Primary background' },
  { id: 'color-bg-secondary', name: 'color-background-secondary', type: 'color', value: '#141414', referenceId: 'gray-900', category: 'semantic', theme: 'dark', description: 'Secondary/card background' },
  { id: 'color-bg-tertiary', name: 'color-background-tertiary', type: 'color', value: '#1c1c1c', referenceId: 'gray-800', category: 'semantic', theme: 'dark', description: 'Tertiary/hover background' },
  { id: 'color-text-primary', name: 'color-text-primary', type: 'color', value: '#f5f5f5', referenceId: 'gray-100', category: 'semantic', theme: 'dark', description: 'Primary text' },
  { id: 'color-text-secondary', name: 'color-text-secondary', type: 'color', value: '#9e9e9e', referenceId: 'gray-500', category: 'semantic', theme: 'dark', description: 'Secondary/muted text' },
  { id: 'color-text-inverse', name: 'color-text-inverse', type: 'color', value: '#ffffff', referenceId: 'white', category: 'semantic', theme: 'dark', description: 'Inverse text (on colored bg)' },
  { id: 'color-text-disabled', name: 'color-text-disabled', type: 'color', value: '#616161', referenceId: 'gray-700', category: 'semantic', theme: 'dark', description: 'Disabled text' },
  { id: 'color-border-default', name: 'color-border-default', type: 'color', value: '#2a2a2a', referenceId: 'gray-800', category: 'semantic', theme: 'dark', description: 'Default border' },
  { id: 'color-border-hover', name: 'color-border-hover', type: 'color', value: '#404040', referenceId: 'gray-700', category: 'semantic', theme: 'dark', description: 'Hover border' },
  { id: 'color-interactive-primary', name: 'color-interactive-primary', type: 'color', value: '#1976d2', referenceId: 'blue-500', category: 'semantic', theme: 'dark', description: 'Primary interactive' },
  { id: 'color-interactive-primary-hover', name: 'color-interactive-primary-hover', type: 'color', value: '#1565c0', referenceId: 'blue-600', category: 'semantic', theme: 'dark', description: 'Primary interactive hover' },
  { id: 'color-interactive-primary-active', name: 'color-interactive-primary-active', type: 'color', value: '#0d47a1', referenceId: 'blue-700', category: 'semantic', theme: 'dark', description: 'Primary interactive active' },
  { id: 'color-interactive-secondary', name: 'color-interactive-secondary', type: 'color', value: 'transparent', referenceId: undefined, category: 'semantic', theme: 'dark', description: 'Secondary interactive bg' },
  { id: 'color-interactive-secondary-hover', name: 'color-interactive-secondary-hover', type: 'color', value: 'rgba(25,118,210,0.08)', referenceId: 'blue-500', category: 'semantic', theme: 'dark', description: 'Secondary interactive hover' },
  { id: 'color-interactive-destructive', name: 'color-interactive-destructive', type: 'color', value: '#c62828', referenceId: 'red-500', category: 'semantic', theme: 'dark', description: 'Destructive action' },
  { id: 'color-interactive-destructive-hover', name: 'color-interactive-destructive-hover', type: 'color', value: '#b71c1c', referenceId: 'red-600', category: 'semantic', theme: 'dark', description: 'Destructive action hover' },
  { id: 'color-status-success', name: 'color-status-success', type: 'color', value: '#2e7d32', referenceId: 'green-500', category: 'semantic', theme: 'dark', description: 'Success status' },
  { id: 'color-status-error', name: 'color-status-error', type: 'color', value: '#c62828', referenceId: 'red-500', category: 'semantic', theme: 'dark', description: 'Error status' },
  { id: 'color-status-warning', name: 'color-status-warning', type: 'color', value: '#e65100', referenceId: 'orange-500', category: 'semantic', theme: 'dark', description: 'Warning status' },
  { id: 'color-status-info', name: 'color-status-info', type: 'color', value: '#0288d1', referenceId: 'cyan-500', category: 'semantic', theme: 'dark', description: 'Info status' },
];

// ── 1.1c Color Semantics (Light theme) ──
const colorSemanticsLight: DesignToken[] = [
  { id: 'color-bg-primary-light', name: 'color-background-primary', type: 'color', value: '#ffffff', referenceId: 'white', category: 'semantic', theme: 'light', description: 'Primary background' },
  { id: 'color-bg-secondary-light', name: 'color-background-secondary', type: 'color', value: '#f5f5f5', referenceId: 'gray-100', category: 'semantic', theme: 'light', description: 'Secondary/card background' },
  { id: 'color-bg-tertiary-light', name: 'color-background-tertiary', type: 'color', value: '#eeeeee', referenceId: 'gray-200', category: 'semantic', theme: 'light', description: 'Tertiary/hover background' },
  { id: 'color-text-primary-light', name: 'color-text-primary', type: 'color', value: '#212121', referenceId: 'gray-900', category: 'semantic', theme: 'light', description: 'Primary text' },
  { id: 'color-text-secondary-light', name: 'color-text-secondary', type: 'color', value: '#757575', referenceId: 'gray-600', category: 'semantic', theme: 'light', description: 'Secondary/muted text' },
  { id: 'color-text-disabled-light', name: 'color-text-disabled', type: 'color', value: '#bdbdbd', referenceId: 'gray-400', category: 'semantic', theme: 'light', description: 'Disabled text' },
  { id: 'color-text-inverse-light', name: 'color-text-inverse', type: 'color', value: '#ffffff', referenceId: 'white', category: 'semantic', theme: 'light', description: 'Inverse text' },
  { id: 'color-interactive-primary-light', name: 'color-interactive-primary', type: 'color', value: '#1976d2', referenceId: 'blue-500', category: 'semantic', theme: 'light', description: 'Primary interactive' },
  { id: 'color-interactive-primary-hover-light', name: 'color-interactive-primary-hover', type: 'color', value: '#1565c0', referenceId: 'blue-600', category: 'semantic', theme: 'light', description: 'Primary interactive hover' },
  { id: 'color-interactive-primary-active-light', name: 'color-interactive-primary-active', type: 'color', value: '#0d47a1', referenceId: 'blue-700', category: 'semantic', theme: 'light', description: 'Primary interactive active' },
  { id: 'color-interactive-secondary-light', name: 'color-interactive-secondary', type: 'color', value: '#9c27b0', referenceId: 'purple-500', category: 'semantic', theme: 'light', description: 'Secondary interactive' },
  { id: 'color-interactive-secondary-hover-light', name: 'color-interactive-secondary-hover', type: 'color', value: '#7b1fa2', referenceId: 'purple-600', category: 'semantic', theme: 'light', description: 'Secondary interactive hover' },
  { id: 'color-interactive-destructive-light', name: 'color-interactive-destructive', type: 'color', value: '#c62828', referenceId: 'red-500', category: 'semantic', theme: 'light', description: 'Destructive interactive' },
  { id: 'color-interactive-destructive-hover-light', name: 'color-interactive-destructive-hover', type: 'color', value: '#b71c1c', referenceId: 'red-600', category: 'semantic', theme: 'light', description: 'Destructive interactive hover' },
  { id: 'color-border-default-light', name: 'color-border-default', type: 'color', value: '#e0e0e0', referenceId: 'gray-300', category: 'semantic', theme: 'light', description: 'Default border' },
  { id: 'color-border-hover-light', name: 'color-border-hover', type: 'color', value: '#bdbdbd', referenceId: 'gray-400', category: 'semantic', theme: 'light', description: 'Hover border' },
  { id: 'color-status-success-light', name: 'color-status-success', type: 'color', value: '#2e7d32', referenceId: 'green-500', category: 'semantic', theme: 'light', description: 'Success status' },
  { id: 'color-status-error-light', name: 'color-status-error', type: 'color', value: '#c62828', referenceId: 'red-500', category: 'semantic', theme: 'light', description: 'Error status' },
  { id: 'color-status-warning-light', name: 'color-status-warning', type: 'color', value: '#e65100', referenceId: 'orange-500', category: 'semantic', theme: 'light', description: 'Warning status' },
  { id: 'color-status-info-light', name: 'color-status-info', type: 'color', value: '#0288d1', referenceId: 'cyan-500', category: 'semantic', theme: 'light', description: 'Info status' },
];

// ── 1.2 Typography Tokens ──
const typographyTokens: DesignToken[] = [
  // Font families
  { id: 'font-sans', name: 'font-family-sans', type: 'typography', value: '"Inter", sans-serif', category: 'primitive', theme: null, description: 'Primary sans-serif font' },
  { id: 'font-mono', name: 'font-family-mono', type: 'typography', value: '"Fira Code", monospace', category: 'primitive', theme: null, description: 'Monospace font' },
  { id: 'font-display', name: 'font-family-display', type: 'typography', value: '"DM Sans", sans-serif', category: 'primitive', theme: null, description: 'Display/heading font' },
  // Font sizes
  { id: 'font-size-xs', name: 'font-size-xs', type: 'typography', value: '12px', category: 'primitive', theme: null, description: 'Extra small text' },
  { id: 'font-size-sm', name: 'font-size-sm', type: 'typography', value: '14px', category: 'primitive', theme: null, description: 'Small text' },
  { id: 'font-size-md', name: 'font-size-md', type: 'typography', value: '16px', category: 'primitive', theme: null, description: 'Body text' },
  { id: 'font-size-lg', name: 'font-size-lg', type: 'typography', value: '18px', category: 'primitive', theme: null, description: 'Large text' },
  { id: 'font-size-xl', name: 'font-size-xl', type: 'typography', value: '20px', category: 'primitive', theme: null, description: 'Extra large text' },
  { id: 'font-size-2xl', name: 'font-size-2xl', type: 'typography', value: '24px', category: 'primitive', theme: null, description: 'Heading size' },
  { id: 'font-size-3xl', name: 'font-size-3xl', type: 'typography', value: '32px', category: 'primitive', theme: null, description: 'Large heading' },
  { id: 'font-size-4xl', name: 'font-size-4xl', type: 'typography', value: '40px', category: 'primitive', theme: null, description: 'Display heading' },
  { id: 'font-size-5xl', name: 'font-size-5xl', type: 'typography', value: '48px', category: 'primitive', theme: null, description: 'Hero heading' },
  // Font weights
  { id: 'font-weight-regular', name: 'font-weight-regular', type: 'typography', value: '400', category: 'primitive', theme: null, description: 'Regular weight' },
  { id: 'font-weight-medium', name: 'font-weight-medium', type: 'typography', value: '500', category: 'primitive', theme: null, description: 'Medium weight' },
  { id: 'font-weight-semibold', name: 'font-weight-semibold', type: 'typography', value: '600', category: 'primitive', theme: null, description: 'Semibold weight' },
  { id: 'font-weight-bold', name: 'font-weight-bold', type: 'typography', value: '700', category: 'primitive', theme: null, description: 'Bold weight' },
  // Line heights
  { id: 'line-height-tight', name: 'line-height-tight', type: 'typography', value: '1.25', category: 'primitive', theme: null, description: 'Tight line height (headings)' },
  { id: 'line-height-normal', name: 'line-height-normal', type: 'typography', value: '1.5', category: 'primitive', theme: null, description: 'Normal line height (body)' },
  { id: 'line-height-relaxed', name: 'line-height-relaxed', type: 'typography', value: '1.75', category: 'primitive', theme: null, description: 'Relaxed line height' },
  // Composed type styles (semantic)
  { id: 'type-display', name: 'type-display', type: 'typography', value: '48px/1.1 700 "DM Sans"', category: 'semantic', theme: null, description: 'Display/hero heading' },
  { id: 'type-heading-1', name: 'type-heading-1', type: 'typography', value: '32px/1.25 700 "DM Sans"', category: 'semantic', theme: null, description: 'H1 heading style' },
  { id: 'type-heading-2', name: 'type-heading-2', type: 'typography', value: '24px/1.25 600 "DM Sans"', category: 'semantic', theme: null, description: 'H2 heading style' },
  { id: 'type-heading-3', name: 'type-heading-3', type: 'typography', value: '20px/1.25 600 "Inter"', category: 'semantic', theme: null, description: 'H3 heading style' },
  { id: 'type-body-lg', name: 'type-body-lg', type: 'typography', value: '18px/1.6 400 "Inter"', category: 'semantic', theme: null, description: 'Large body text' },
  { id: 'type-body', name: 'type-body', type: 'typography', value: '16px/1.5 400 "Inter"', category: 'semantic', theme: null, description: 'Body text style' },
  { id: 'type-body-sm', name: 'type-body-sm', type: 'typography', value: '14px/1.5 400 "Inter"', category: 'semantic', theme: null, description: 'Small body text' },
  { id: 'type-label', name: 'type-label', type: 'typography', value: '14px/1.25 500 "Inter"', category: 'semantic', theme: null, description: 'Label/button text style' },
  { id: 'type-caption', name: 'type-caption', type: 'typography', value: '12px/1.5 400 "Inter"', category: 'semantic', theme: null, description: 'Caption text style' },
  { id: 'type-overline', name: 'type-overline', type: 'typography', value: '12px/1.5 600 "Inter"', category: 'semantic', theme: null, description: 'Overline — small uppercase labels' },
  { id: 'type-code', name: 'type-code', type: 'typography', value: '14px/1.6 400 "Fira Code"', category: 'semantic', theme: null, description: 'Code/monospace text' },
];

// ── 1.3 Spacing Tokens ──
const spacingTokens: DesignToken[] = [
  { id: 'spacing-0', name: 'spacing-0', type: 'spacing', value: '0px', category: 'primitive', theme: null, description: 'No space' },
  { id: 'spacing-1', name: 'spacing-1', type: 'spacing', value: '4px', category: 'primitive', theme: null, description: '4px (xs)' },
  { id: 'spacing-2', name: 'spacing-2', type: 'spacing', value: '8px', category: 'primitive', theme: null, description: '8px (sm)' },
  { id: 'spacing-3', name: 'spacing-3', type: 'spacing', value: '12px', category: 'primitive', theme: null, description: '12px (md-sm)' },
  { id: 'spacing-4', name: 'spacing-4', type: 'spacing', value: '16px', category: 'primitive', theme: null, description: '16px (md)' },
  { id: 'spacing-5', name: 'spacing-5', type: 'spacing', value: '20px', category: 'primitive', theme: null, description: '20px' },
  { id: 'spacing-6', name: 'spacing-6', type: 'spacing', value: '24px', category: 'primitive', theme: null, description: '24px (lg)' },
  { id: 'spacing-8', name: 'spacing-8', type: 'spacing', value: '32px', category: 'primitive', theme: null, description: '32px (xl)' },
  { id: 'spacing-10', name: 'spacing-10', type: 'spacing', value: '40px', category: 'primitive', theme: null, description: '40px' },
  { id: 'spacing-12', name: 'spacing-12', type: 'spacing', value: '48px', category: 'primitive', theme: null, description: '48px (2xl)' },
  { id: 'spacing-16', name: 'spacing-16', type: 'spacing', value: '64px', category: 'primitive', theme: null, description: '64px (3xl)' },
];

// ── 1.4 Border Radius Tokens ──
const radiusTokens: DesignToken[] = [
  { id: 'radius-none', name: 'radius-none', type: 'radius', value: '0px', category: 'primitive', theme: null, description: 'No radius' },
  { id: 'radius-sm', name: 'radius-sm', type: 'radius', value: '4px', category: 'primitive', theme: null, description: 'Subtle rounding' },
  { id: 'radius-md', name: 'radius-md', type: 'radius', value: '8px', category: 'primitive', theme: null, description: 'Standard rounding' },
  { id: 'radius-lg', name: 'radius-lg', type: 'radius', value: '12px', category: 'primitive', theme: null, description: 'More rounding' },
  { id: 'radius-xl', name: 'radius-xl', type: 'radius', value: '16px', category: 'primitive', theme: null, description: 'Large rounding' },
  { id: 'radius-2xl', name: 'radius-2xl', type: 'radius', value: '24px', category: 'primitive', theme: null, description: 'Very large rounding' },
  { id: 'radius-full', name: 'radius-full', type: 'radius', value: '9999px', category: 'primitive', theme: null, description: 'Pill / circle' },
];

// ── 1.5 Shadow Tokens ──
const shadowTokens: DesignToken[] = [
  { id: 'shadow-none', name: 'shadow-none', type: 'shadow', value: 'none', category: 'primitive', theme: null, description: 'No shadow' },
  { id: 'shadow-sm', name: 'shadow-sm', type: 'shadow', value: '0 1px 3px rgba(0,0,0,0.12)', category: 'primitive', theme: null, description: 'Subtle shadow' },
  { id: 'shadow-md', name: 'shadow-md', type: 'shadow', value: '0 4px 12px rgba(0,0,0,0.15)', category: 'primitive', theme: null, description: 'Medium shadow (cards)' },
  { id: 'shadow-lg', name: 'shadow-lg', type: 'shadow', value: '0 8px 30px rgba(0,0,0,0.2)', category: 'primitive', theme: null, description: 'Large shadow (modals)' },
  { id: 'shadow-xl', name: 'shadow-xl', type: 'shadow', value: '0 20px 40px rgba(0,0,0,0.25)', category: 'primitive', theme: null, description: 'Extra large shadow' },
  // Focus ring shadows (semantic)
  { id: 'shadow-focus-primary', name: 'shadow-focus-primary', type: 'shadow', value: '0 0 0 3px rgba(25,118,210,0.4)', category: 'semantic', theme: null, description: 'Primary focus ring' },
  { id: 'shadow-focus-destructive', name: 'shadow-focus-destructive', type: 'shadow', value: '0 0 0 3px rgba(198,40,40,0.4)', category: 'semantic', theme: null, description: 'Destructive focus ring' },
  { id: 'shadow-focus-success', name: 'shadow-focus-success', type: 'shadow', value: '0 0 0 3px rgba(46,125,50,0.4)', category: 'semantic', theme: null, description: 'Success focus ring' },
];

// ── 1.6 Motion Tokens ──
const motionTokens: DesignToken[] = [
  { id: 'duration-instant', name: 'duration-instant', type: 'motion', value: '0ms', category: 'primitive', theme: null, description: 'Instant' },
  { id: 'duration-fast', name: 'duration-fast', type: 'motion', value: '100ms', category: 'primitive', theme: null, description: 'Fast transition' },
  { id: 'duration-normal', name: 'duration-normal', type: 'motion', value: '200ms', category: 'primitive', theme: null, description: 'Normal transition' },
  { id: 'duration-slow', name: 'duration-slow', type: 'motion', value: '300ms', category: 'primitive', theme: null, description: 'Slow transition' },
  { id: 'duration-slower', name: 'duration-slower', type: 'motion', value: '500ms', category: 'primitive', theme: null, description: 'Slower transition' },
  { id: 'easing-linear', name: 'easing-linear', type: 'motion', value: 'linear', category: 'primitive', theme: null, description: 'Linear easing' },
  { id: 'easing-ease-in', name: 'easing-ease-in', type: 'motion', value: 'cubic-bezier(0.4, 0, 1, 1)', category: 'primitive', theme: null, description: 'Ease in' },
  { id: 'easing-ease-out', name: 'easing-ease-out', type: 'motion', value: 'cubic-bezier(0, 0, 0.2, 1)', category: 'primitive', theme: null, description: 'Ease out' },
  { id: 'easing-ease-in-out', name: 'easing-ease-in-out', type: 'motion', value: 'cubic-bezier(0.4, 0, 0.2, 1)', category: 'primitive', theme: null, description: 'Ease in-out' },
  { id: 'easing-spring', name: 'easing-spring', type: 'motion', value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', category: 'primitive', theme: null, description: 'Spring overshoot easing' },
];

// ── 1.7 Opacity Tokens ──
const opacityTokens: DesignToken[] = [
  { id: 'opacity-disabled', name: 'opacity-disabled', type: 'opacity', value: '0.5', category: 'semantic', theme: null, description: 'Disabled element opacity' },
  { id: 'opacity-loading', name: 'opacity-loading', type: 'opacity', value: '0.7', category: 'semantic', theme: null, description: 'Loading state opacity' },
  { id: 'opacity-subtle', name: 'opacity-subtle', type: 'opacity', value: '0.08', category: 'semantic', theme: null, description: 'Subtle overlay (hover tints)' },
];

// ── 1.8 Breakpoint Tokens ──
const breakpointTokens: DesignToken[] = [
  { id: 'breakpoint-sm', name: 'breakpoint-sm', type: 'breakpoint', value: '640px', category: 'primitive', theme: null, description: 'Small screens (mobile landscape)' },
  { id: 'breakpoint-md', name: 'breakpoint-md', type: 'breakpoint', value: '768px', category: 'primitive', theme: null, description: 'Medium screens (tablets)' },
  { id: 'breakpoint-lg', name: 'breakpoint-lg', type: 'breakpoint', value: '1024px', category: 'primitive', theme: null, description: 'Large screens (small laptops)' },
  { id: 'breakpoint-xl', name: 'breakpoint-xl', type: 'breakpoint', value: '1280px', category: 'primitive', theme: null, description: 'Extra large screens (desktops)' },
  { id: 'breakpoint-2xl', name: 'breakpoint-2xl', type: 'breakpoint', value: '1536px', category: 'primitive', theme: null, description: 'Wide screens (large monitors)' },
];

// ── 1.9 Z-Index Tokens ──
const zIndexTokens: DesignToken[] = [
  { id: 'z-index-base', name: 'z-index-base', type: 'z-index', value: '0', category: 'semantic', theme: null, description: 'Base stacking level' },
  { id: 'z-index-dropdown', name: 'z-index-dropdown', type: 'z-index', value: '100', category: 'semantic', theme: null, description: 'Dropdowns and select menus' },
  { id: 'z-index-sticky', name: 'z-index-sticky', type: 'z-index', value: '200', category: 'semantic', theme: null, description: 'Sticky headers and navs' },
  { id: 'z-index-overlay', name: 'z-index-overlay', type: 'z-index', value: '300', category: 'semantic', theme: null, description: 'Background overlays/scrims' },
  { id: 'z-index-modal', name: 'z-index-modal', type: 'z-index', value: '400', category: 'semantic', theme: null, description: 'Modal dialogs' },
  { id: 'z-index-popover', name: 'z-index-popover', type: 'z-index', value: '500', category: 'semantic', theme: null, description: 'Popovers and tooltips' },
  { id: 'z-index-toast', name: 'z-index-toast', type: 'z-index', value: '600', category: 'semantic', theme: null, description: 'Toast notifications (highest)' },
];

// ── Combine all tokens ──
export const defaultNamedTokens: DesignToken[] = [
  ...colorPrimitives,
  ...colorSemanticsDark,
  ...colorSemanticsLight,
  ...typographyTokens,
  ...spacingTokens,
  ...radiusTokens,
  ...shadowTokens,
  ...motionTokens,
  ...opacityTokens,
  ...breakpointTokens,
  ...zIndexTokens,
];


// ═══════════════════════════════════════
// 2. COMPONENT DEFINITIONS
// ═══════════════════════════════════════

export const defaultComponentDefs: ComponentDefinition[] = [
  {
    id: 'def-button',
    name: 'Button',
    description: 'Interactive button for actions and form submissions',
    properties: [
      { name: 'variant', options: ['primary', 'secondary', 'ghost', 'destructive'], default: 'primary' },
      { name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
    states: ['default', 'hover', 'active', 'focused', 'disabled', 'loading'],
    slots: [
      { name: 'iconLeft', required: false, description: 'Icon before label' },
      { name: 'label', required: true, description: 'Button text' },
      { name: 'iconRight', required: false, description: 'Icon after label' },
    ],
    guidelines: 'One primary button per section. Use destructive for irreversible actions. Use ghost for tertiary actions.',
    useWhen: ['User needs to take an action', 'Submitting a form', 'Navigating to a new flow', 'Confirming a dialog'],
    dontUseWhen: ['Navigation within same page (use Link)', 'Toggling a setting (use Switch)', 'Selecting from options (use Radio/Checkbox)'],
    accessibility: 'Min touch target 44×44px. Must have visible focus state. Loading state must announce to screen reader. Use aria-disabled instead of disabled attribute.',
    responsiveRules: [
      { breakpoint: 'breakpoint-sm', behavior: 'Full width buttons in mobile views' },
      { breakpoint: 'breakpoint-md', behavior: 'Auto width, inline layout' },
    ],
    platformOverrides: {
      ios: { notes: 'Use SF Pro font. Min touch target 44×44px. Primary = filled capsule, secondary = gray capsule, ghost = plain text link. Use system blue #007AFF.', styles: { fontFamily: '-apple-system, SF Pro, system-ui', borderRadius: '9999px', minHeight: '44px' } },
      android: { notes: 'Use Roboto font. Min touch target 48×48px. Follow Material 3 tonal button system. Use container color from tonal palette.', styles: { fontFamily: 'Roboto, system-ui', borderRadius: '20px', minHeight: '48px' } },
      web: { notes: 'Use Inter/system-ui. Min touch target 36×36px. Follow WCAG AA contrast.', styles: { fontFamily: 'Inter, system-ui', minHeight: '36px' } },
    },
  },
  {
    id: 'def-card',
    name: 'Card',
    description: 'Content container with optional media, header, body, and footer',
    properties: [
      { name: 'variant', options: ['elevated', 'outlined', 'filled'], default: 'elevated' },
      { name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
    states: ['default', 'hover', 'active', 'focused', 'disabled'],
    slots: [
      { name: 'media', required: false, description: 'Image or video at top' },
      { name: 'header', required: false, description: 'Title and subtitle' },
      { name: 'body', required: true, description: 'Main content area' },
      { name: 'footer', required: false, description: 'Actions (max 3 buttons)' },
    ],
    guidelines: 'Use elevated for primary cards, outlined for secondary, filled for subtle grouping.',
    useWhen: ['Grouping related content', 'Displaying a preview of linked content', 'Presenting a list item with rich detail'],
    dontUseWhen: ['Simple text lists (use List)', 'Full-page sections (use Section)', 'Just wrapping one element'],
    accessibility: 'If interactive, use role="article" or role="button". Ensure focus visible.',
    builtFrom: ['Typography', 'Button'],
    responsiveRules: [
      { breakpoint: 'breakpoint-sm', behavior: 'Vertical layout (media on top), full width' },
      { breakpoint: 'breakpoint-md', behavior: 'Horizontal layout (media on side) OR vertical, constrained width (max 400px)' },
    ],
    platformOverrides: {
      ios: { notes: 'Use grouped inset style with system background colors. Rounded 10px corners. Avoid heavy shadows — use subtle separator lines.', styles: { borderRadius: '10px' } },
      android: { notes: 'Follow Material 3 card specs. Elevated = shadow, Outlined = 1px outline, Filled = tonal surface.', styles: { borderRadius: '12px' } },
      web: { notes: 'Standard card patterns. Use elevation tokens for shadow depth.', styles: {} },
    },
  },
  {
    id: 'def-input',
    name: 'Input',
    description: 'Text input field for forms',
    properties: [
      { name: 'variant', options: ['default', 'error', 'success'], default: 'default' },
      { name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
    states: ['default', 'hover', 'focused', 'disabled'],
    slots: [
      { name: 'label', required: false, description: 'Input label' },
      { name: 'input', required: true, description: 'The input element' },
      { name: 'helperText', required: false, description: 'Description or error message' },
    ],
    guidelines: 'Always pair with a label. Show inline validation. Error messages should be specific.',
    useWhen: ['Collecting user text input', 'Search fields', 'Form fields'],
    dontUseWhen: ['Selecting from predefined options (use Select)', 'Boolean choices (use Checkbox/Switch)', 'Long-form text (use Textarea)'],
    accessibility: 'Use aria-describedby for helper text. Use aria-invalid for error state. Labels must be associated via htmlFor.',
    platformOverrides: {
      ios: { notes: 'Use rounded rect style with system gray backgrounds. Inset grouped form style preferred.', styles: { borderRadius: '8px', padding: '10px 12px' } },
      android: { notes: 'Follow Material 3 text field. Outlined or Filled variants. Label animates on focus.', styles: { borderRadius: '4px' } },
      web: { notes: 'Standard input with visible borders. Focus ring required.', styles: {} },
    },
  },
  {
    id: 'def-badge',
    name: 'Badge',
    description: 'Small status indicator or count',
    properties: [
      { name: 'variant', options: ['default', 'success', 'error', 'warning', 'info'], default: 'default' },
      { name: 'size', options: ['sm', 'md'], default: 'sm' },
    ],
    states: ['default'],
    slots: [
      { name: 'label', required: true, description: 'Badge text' },
    ],
    guidelines: 'Keep text short (1-3 words). Use semantic colors for status.',
    useWhen: ['Showing status of an item', 'Displaying a count or notification', 'Tagging or categorizing content'],
    dontUseWhen: ['Long text labels (use Tag/Chip)', 'Interactive selection (use Chip)'],
    accessibility: 'Use role="status" for dynamic badges. Ensure color is not the only indicator.',
    platformOverrides: {
      ios: { notes: 'Use capsule shape. SF Pro 12px semibold. System colors for status.', styles: { borderRadius: '9999px', fontSize: '12px', fontWeight: '600' } },
      android: { notes: 'Follow Material 3 badge. Small = dot only, Large = with number.', styles: { borderRadius: '9999px' } },
      web: { notes: 'Standard badge with semantic colors.', styles: {} },
    },
  },
  {
    id: 'def-avatar',
    name: 'Avatar',
    description: 'User profile image or initials',
    properties: [
      { name: 'size', options: ['sm', 'md', 'lg', 'xl'], default: 'md' },
    ],
    states: ['default'],
    slots: [
      { name: 'image', required: false, description: 'Profile photo' },
      { name: 'initials', required: false, description: 'Fallback initials' },
    ],
    guidelines: 'Always provide initials fallback when image may not load.',
    useWhen: ['Representing a user or entity', 'Comment attribution', 'Contact lists'],
    dontUseWhen: ['Decorative images (use Image)', 'Logo display (use Logo component)'],
    accessibility: 'Use alt text for images. Decorative avatars use aria-hidden.',
    platformOverrides: {
      ios: { notes: 'Circular clip. Use system gray placeholder background.', styles: { borderRadius: '9999px' } },
      android: { notes: 'Circular clip. Follow Material 3 avatar specs.', styles: { borderRadius: '9999px' } },
      web: { notes: 'Circular with fallback initials.', styles: { borderRadius: '9999px' } },
    },
  },
  {
    id: 'def-dialog',
    name: 'Dialog',
    description: 'Modal dialog for confirmations, forms, and focused tasks',
    properties: [
      { name: 'variant', options: ['default', 'destructive', 'form'], default: 'default' },
      { name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
    states: ['default'],
    slots: [
      { name: 'title', required: true, description: 'Dialog title' },
      { name: 'body', required: false, description: 'Content area' },
      { name: 'actions', required: true, description: '1-3 action buttons' },
    ],
    guidelines: 'Always has a title. Body is optional. 1-3 action buttons. Primary action on right.',
    useWhen: ['Confirming destructive actions', 'Focused form entry', 'Critical information requiring acknowledgment'],
    dontUseWhen: ['Simple notifications (use Toast)', 'Non-blocking info (use Banner)', 'Complex multi-step flows (use full page)'],
    accessibility: 'Trap focus within dialog. Escape key closes. Return focus to trigger on close. Use role="dialog" and aria-modal.',
    builtFrom: ['Card', 'Typography', 'Button'],
    platformOverrides: {
      ios: { notes: 'Centered alert style. Title + message + stacked or side-by-side buttons. Blur backdrop. 270px width for alerts.', styles: { borderRadius: '14px', width: '270px' } },
      android: { notes: 'Follow Material 3 dialog. Title + content + actions row. Max width 560px. 28px corner radius.', styles: { borderRadius: '28px', maxWidth: '560px' } },
      web: { notes: 'Centered modal with scrim overlay. Max width based on size prop.', styles: {} },
    },
  },
  {
    id: 'def-nav',
    name: 'Navigation',
    description: 'Navigation bar or tab bar for app-level navigation',
    properties: [
      { name: 'variant', options: ['top', 'bottom', 'sidebar'], default: 'top' },
    ],
    states: ['default'],
    slots: [
      { name: 'items', required: true, description: 'Navigation items' },
      { name: 'logo', required: false, description: 'Brand logo' },
      { name: 'actions', required: false, description: 'Right-side actions (search, profile)' },
    ],
    guidelines: 'Keep to 5-7 top-level items maximum. Highlight active item clearly.',
    useWhen: ['App-level page navigation', 'Section switching within a feature'],
    dontUseWhen: ['In-page anchor links (use Table of Contents)', 'Step-by-step flows (use Stepper)'],
    accessibility: 'Use nav element with aria-label. Active item uses aria-current="page".',
    builtFrom: ['Button', 'Avatar', 'Badge'],
    responsiveRules: [
      { breakpoint: 'breakpoint-sm', behavior: 'Bottom tab bar or hamburger menu' },
      { breakpoint: 'breakpoint-lg', behavior: 'Full horizontal nav bar or sidebar' },
    ],
    platformOverrides: {
      ios: { notes: 'Use UITabBar for bottom nav (49pt height). SF Symbols for icons. Use system blur for nav bar backgrounds.', styles: { height: '49px' } },
      android: { notes: 'Follow Material 3 Navigation Bar (80dp height). 3-5 destinations. Active = filled icon + label.', styles: { height: '80px' } },
      web: { notes: 'Horizontal nav bar or sidebar. Responsive: hamburger on mobile, full nav on desktop.', styles: {} },
    },
  },
];


// ═══════════════════════════════════════
// 3. COMPONENT TOKEN MAPPINGS
// ═══════════════════════════════════════

// Helper
const m = (defId: string, combo: string, state: string, css: string, tokenId: string): ComponentTokenMapping => ({
  id: uid('ctm'),
  componentDefId: defId,
  propertyCombo: combo,
  state,
  cssProperty: css,
  tokenId,
});

// ═══════════════════════════════════════
// GENERATORS — produce complete mapping sets
// ═══════════════════════════════════════

function generateButtonMappings(): ComponentTokenMapping[] {
  const out: ComponentTokenMapping[] = [];

  const variants: Record<string, {
    bg: string; color: string; hoverBg: string; activeBg: string;
    border?: string; hoverBorder?: string; focusShadow: string;
  }> = {
    primary: {
      bg: 'color-interactive-primary', color: 'color-text-inverse',
      hoverBg: 'color-interactive-primary-hover', activeBg: 'color-interactive-primary-active',
      focusShadow: 'shadow-focus-primary',
    },
    secondary: {
      bg: 'color-interactive-secondary', color: 'color-interactive-primary',
      hoverBg: 'color-interactive-secondary-hover', activeBg: 'color-interactive-secondary-hover',
      border: 'color-interactive-primary', hoverBorder: 'color-interactive-primary-hover',
      focusShadow: 'shadow-focus-primary',
    },
    ghost: {
      bg: 'color-interactive-secondary', color: 'color-text-primary',
      hoverBg: 'color-bg-tertiary', activeBg: 'color-bg-tertiary',
      focusShadow: 'shadow-focus-primary',
    },
    destructive: {
      bg: 'color-interactive-destructive', color: 'color-text-inverse',
      hoverBg: 'color-interactive-destructive-hover', activeBg: 'color-interactive-destructive-hover',
      focusShadow: 'shadow-focus-destructive',
    },
  };

  const sizes: Record<string, {
    fontSize: string; fontWeight: string; radius: string;
    pt: string; pb: string; pl: string; pr: string;
  }> = {
    sm: { fontSize: 'font-size-sm', fontWeight: 'font-weight-medium', radius: 'radius-md',
          pt: 'spacing-1', pb: 'spacing-1', pl: 'spacing-3', pr: 'spacing-3' },
    md: { fontSize: 'font-size-md', fontWeight: 'font-weight-medium', radius: 'radius-md',
          pt: 'spacing-2', pb: 'spacing-2', pl: 'spacing-4', pr: 'spacing-4' },
    lg: { fontSize: 'font-size-lg', fontWeight: 'font-weight-semibold', radius: 'radius-lg',
          pt: 'spacing-3', pb: 'spacing-3', pl: 'spacing-6', pr: 'spacing-6' },
  };

  for (const [variant, vc] of Object.entries(variants)) {
    for (const [size, sc] of Object.entries(sizes)) {
      const combo = `size:${size},variant:${variant}`;

      // ── Default state ──
      out.push(
        m('def-button', combo, 'default', 'backgroundColor', vc.bg),
        m('def-button', combo, 'default', 'color', vc.color),
        m('def-button', combo, 'default', 'borderRadius', sc.radius),
        m('def-button', combo, 'default', 'fontSize', sc.fontSize),
        m('def-button', combo, 'default', 'fontWeight', sc.fontWeight),
        m('def-button', combo, 'default', 'paddingTop', sc.pt),
        m('def-button', combo, 'default', 'paddingBottom', sc.pb),
        m('def-button', combo, 'default', 'paddingLeft', sc.pl),
        m('def-button', combo, 'default', 'paddingRight', sc.pr),
      );
      if (vc.border) {
        out.push(m('def-button', combo, 'default', 'border', vc.border));
      }

      // ── Hover ──
      out.push(m('def-button', combo, 'hover', 'backgroundColor', vc.hoverBg));
      if (vc.hoverBorder) {
        out.push(m('def-button', combo, 'hover', 'border', vc.hoverBorder));
      }

      // ── Active ──
      out.push(m('def-button', combo, 'active', 'backgroundColor', vc.activeBg));

      // ── Focused ──
      out.push(m('def-button', combo, 'focused', 'boxShadow', vc.focusShadow));

      // ── Disabled ──
      out.push(
        m('def-button', combo, 'disabled', 'backgroundColor', 'gray-400'),
        m('def-button', combo, 'disabled', 'color', 'color-text-disabled'),
        m('def-button', combo, 'disabled', 'opacity', 'opacity-disabled'),
      );

      // ── Loading ──
      out.push(m('def-button', combo, 'loading', 'opacity', 'opacity-loading'));
    }
  }

  return out;
}

function generateCardMappings(): ComponentTokenMapping[] {
  const out: ComponentTokenMapping[] = [];

  const variants: Record<string, {
    bg: string; shadow?: string; border?: string;
    hoverShadow?: string; hoverBorder?: string;
  }> = {
    elevated: {
      bg: 'color-bg-secondary', shadow: 'shadow-md',
      hoverShadow: 'shadow-lg',
    },
    outlined: {
      bg: 'color-bg-secondary', border: 'color-border-default',
      hoverBorder: 'color-border-hover',
    },
    filled: {
      bg: 'color-bg-tertiary',
    },
  };

  const sizes: Record<string, { padding: string; radius: string }> = {
    sm: { padding: 'spacing-4', radius: 'radius-md' },
    md: { padding: 'spacing-6', radius: 'radius-lg' },
    lg: { padding: 'spacing-8', radius: 'radius-xl' },
  };

  for (const [variant, vc] of Object.entries(variants)) {
    for (const [size, sc] of Object.entries(sizes)) {
      const combo = `size:${size},variant:${variant}`;

      // ── Default ──
      out.push(
        m('def-card', combo, 'default', 'backgroundColor', vc.bg),
        m('def-card', combo, 'default', 'borderRadius', sc.radius),
        m('def-card', combo, 'default', 'padding', sc.padding),
      );
      if (vc.shadow) out.push(m('def-card', combo, 'default', 'boxShadow', vc.shadow));
      if (vc.border) out.push(m('def-card', combo, 'default', 'border', vc.border));

      // ── Hover ──
      if (vc.hoverShadow) out.push(m('def-card', combo, 'hover', 'boxShadow', vc.hoverShadow));
      if (vc.hoverBorder) out.push(m('def-card', combo, 'hover', 'border', vc.hoverBorder));
      // Filled cards get a subtle bg shift on hover
      if (variant === 'filled') out.push(m('def-card', combo, 'hover', 'backgroundColor', 'color-bg-secondary'));

      // ── Active ── (pressed card — slightly reduce shadow for elevated, darken border for outlined)
      if (vc.shadow) out.push(m('def-card', combo, 'active', 'boxShadow', 'shadow-sm'));
      if (vc.border) out.push(m('def-card', combo, 'active', 'border', 'color-interactive-primary'));

      // ── Focused ──
      out.push(m('def-card', combo, 'focused', 'boxShadow', 'shadow-focus-primary'));

      // ── Disabled ──
      out.push(m('def-card', combo, 'disabled', 'opacity', 'opacity-disabled'));
    }
  }

  return out;
}

function generateInputMappings(): ComponentTokenMapping[] {
  const out: ComponentTokenMapping[] = [];

  const variants: Record<string, {
    border: string; focusBorder: string; focusShadow: string;
    helperColor?: string;
  }> = {
    default: {
      border: 'color-border-default', focusBorder: 'color-interactive-primary',
      focusShadow: 'shadow-focus-primary',
    },
    error: {
      border: 'color-status-error', focusBorder: 'color-status-error',
      focusShadow: 'shadow-focus-destructive', helperColor: 'color-status-error',
    },
    success: {
      border: 'color-status-success', focusBorder: 'color-status-success',
      focusShadow: 'shadow-focus-success', helperColor: 'color-status-success',
    },
  };

  const sizes: Record<string, {
    fontSize: string; padding: string; radius: string;
  }> = {
    sm: { fontSize: 'font-size-sm', padding: 'spacing-2', radius: 'radius-sm' },
    md: { fontSize: 'font-size-md', padding: 'spacing-3', radius: 'radius-md' },
    lg: { fontSize: 'font-size-lg', padding: 'spacing-4', radius: 'radius-md' },
  };

  for (const [variant, vc] of Object.entries(variants)) {
    for (const [size, sc] of Object.entries(sizes)) {
      const combo = `size:${size},variant:${variant}`;

      // ── Default ──
      out.push(
        m('def-input', combo, 'default', 'backgroundColor', 'color-bg-secondary'),
        m('def-input', combo, 'default', 'borderRadius', sc.radius),
        m('def-input', combo, 'default', 'border', vc.border),
        m('def-input', combo, 'default', 'fontSize', sc.fontSize),
        m('def-input', combo, 'default', 'padding', sc.padding),
        m('def-input', combo, 'default', 'color', 'color-text-primary'),
      );

      // ── Hover ──
      out.push(m('def-input', combo, 'hover', 'border', 'color-border-hover'));

      // ── Focused ──
      out.push(
        m('def-input', combo, 'focused', 'border', vc.focusBorder),
        m('def-input', combo, 'focused', 'boxShadow', vc.focusShadow),
      );

      // ── Disabled ──
      out.push(
        m('def-input', combo, 'disabled', 'backgroundColor', 'color-bg-tertiary'),
        m('def-input', combo, 'disabled', 'color', 'color-text-disabled'),
        m('def-input', combo, 'disabled', 'opacity', 'opacity-disabled'),
      );
    }
  }

  return out;
}

function generateBadgeMappings(): ComponentTokenMapping[] {
  const out: ComponentTokenMapping[] = [];

  const variants: Record<string, { bg: string; color: string }> = {
    default:  { bg: 'gray-700', color: 'gray-200' },
    success:  { bg: 'color-status-success', color: 'color-text-inverse' },
    error:    { bg: 'color-status-error', color: 'color-text-inverse' },
    warning:  { bg: 'color-status-warning', color: 'color-text-inverse' },
    info:     { bg: 'color-status-info', color: 'color-text-inverse' },
  };

  const sizes: Record<string, {
    fontSize: string; fontWeight: string;
    pt: string; pb: string; pl: string; pr: string;
  }> = {
    sm: { fontSize: 'font-size-xs', fontWeight: 'font-weight-medium',
          pt: 'spacing-0', pb: 'spacing-0', pl: 'spacing-2', pr: 'spacing-2' },
    md: { fontSize: 'font-size-sm', fontWeight: 'font-weight-medium',
          pt: 'spacing-1', pb: 'spacing-1', pl: 'spacing-3', pr: 'spacing-3' },
  };

  for (const [variant, vc] of Object.entries(variants)) {
    for (const [size, sc] of Object.entries(sizes)) {
      const combo = `size:${size},variant:${variant}`;

      out.push(
        m('def-badge', combo, 'default', 'backgroundColor', vc.bg),
        m('def-badge', combo, 'default', 'color', vc.color),
        m('def-badge', combo, 'default', 'borderRadius', 'radius-full'),
        m('def-badge', combo, 'default', 'fontSize', sc.fontSize),
        m('def-badge', combo, 'default', 'fontWeight', sc.fontWeight),
        m('def-badge', combo, 'default', 'paddingTop', sc.pt),
        m('def-badge', combo, 'default', 'paddingBottom', sc.pb),
        m('def-badge', combo, 'default', 'paddingLeft', sc.pl),
        m('def-badge', combo, 'default', 'paddingRight', sc.pr),
      );
    }
  }

  return out;
}

function generateAvatarMappings(): ComponentTokenMapping[] {
  const out: ComponentTokenMapping[] = [];

  // Avatar sizes map to fontSize for initials fallback + consistent radius
  const sizes: Record<string, { fontSize: string }> = {
    sm: { fontSize: 'font-size-xs' },
    md: { fontSize: 'font-size-sm' },
    lg: { fontSize: 'font-size-lg' },
    xl: { fontSize: 'font-size-2xl' },
  };

  for (const [size, sc] of Object.entries(sizes)) {
    const combo = `size:${size}`;

    out.push(
      m('def-avatar', combo, 'default', 'borderRadius', 'radius-full'),
      m('def-avatar', combo, 'default', 'backgroundColor', 'gray-600'),
      m('def-avatar', combo, 'default', 'color', 'white'),
      m('def-avatar', combo, 'default', 'fontSize', sc.fontSize),
      m('def-avatar', combo, 'default', 'fontWeight', 'font-weight-semibold'),
    );
  }

  return out;
}

// ═══════════════════════════════════════
// COMBINED: All component token mappings
// ═══════════════════════════════════════

export const defaultTokenMappings: ComponentTokenMapping[] = [
  ...generateButtonMappings(),
  ...generateCardMappings(),
  ...generateInputMappings(),
  ...generateBadgeMappings(),
  ...generateAvatarMappings(),
];


// ═══════════════════════════════════════
// RESOLVER: Resolve mappings to actual CSS
// ═══════════════════════════════════════

export function resolveTokenValue(tokenId: string, tokens: DesignToken[]): string | null {
  const token = tokens.find(t => t.id === tokenId);
  return token?.value ?? null;
}

/**
 * Parse a composed type style shorthand into individual CSS properties.
 * Format: "fontSize/lineHeight fontWeight fontFamily"
 * e.g. '32px/1.25 700 "DM Sans"' → { fontSize: '32px', lineHeight: '1.25', fontWeight: '700', fontFamily: '"DM Sans", sans-serif' }
 */
export function parseTypeStyle(value: string): { fontSize: string; lineHeight: string; fontWeight: string; fontFamily: string } | null {
  if (!value) return null;
  // Match: fontSize/lineHeight weight "fontFamily" (or fontFamily without quotes)
  const match = value.match(/^(\d+(?:\.\d+)?px)\/([\d.]+)\s+(\d+)\s+(.+)$/);
  if (!match) return null;
  const [, fontSize, lineHeight, fontWeight, rawFamily] = match;
  // Clean up font family — strip outer quotes if present, then wrap for CSS
  let fontFamily = rawFamily.trim();
  // If already has quotes, keep as-is and add generic fallback
  if (fontFamily.startsWith('"') || fontFamily.startsWith("'")) {
    // Add generic fallback if not already present
    if (!fontFamily.includes('sans-serif') && !fontFamily.includes('monospace') && !fontFamily.includes('serif')) {
      const isMonospace = fontFamily.toLowerCase().includes('code') || fontFamily.toLowerCase().includes('mono');
      fontFamily = `${fontFamily}, ${isMonospace ? 'monospace' : 'sans-serif'}`;
    }
  }
  return { fontSize, lineHeight, fontWeight, fontFamily };
}

/**
 * Detect which type style preset (if any) matches the given CSS properties.
 * Returns the token id (e.g. 'type-heading-1') or null if no match.
 */
export function detectTypeStyle(
  styles: Record<string, any>,
  tokens: DesignToken[]
): string | null {
  const typeTokens = tokens.filter(t => t.type === 'typography' && t.category === 'semantic' && t.id.startsWith('type-'));
  for (const token of typeTokens) {
    const parsed = parseTypeStyle(token.value);
    if (!parsed) continue;
    // Compare fontSize, fontWeight, and lineHeight (fontFamily is more flexible)
    if (
      styles.fontSize === parsed.fontSize &&
      String(styles.fontWeight) === parsed.fontWeight &&
      String(styles.lineHeight) === parsed.lineHeight
    ) {
      return token.id;
    }
  }
  return null;
}

export function resolveMappingsToCSS(
  defId: string,
  variantProps: Record<string, string>,
  state: string,
  tokens: DesignToken[],
  mappings: ComponentTokenMapping[]
): Record<string, string> {
  // Build the propertyCombo string — sorted for consistent matching
  const combo = Object.entries(variantProps)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');

  const relevant = mappings.filter(
    m => m.componentDefId === defId && m.propertyCombo === combo && m.state === state
  );

  const styles: Record<string, string> = {};
  for (const mapping of relevant) {
    const val = resolveTokenValue(mapping.tokenId, tokens);
    if (val !== null) {
      // Handle special cases
      if (mapping.cssProperty === 'border' && !val.includes('px')) {
        styles['borderColor'] = val;
        styles['borderWidth'] = '1px';
        styles['borderStyle'] = 'solid';
      } else if (mapping.cssProperty === 'typeStyle') {
        // Expand composed type style into individual CSS properties
        const parsed = parseTypeStyle(val);
        if (parsed) {
          styles['fontSize'] = parsed.fontSize;
          styles['lineHeight'] = parsed.lineHeight;
          styles['fontWeight'] = parsed.fontWeight;
          styles['fontFamily'] = parsed.fontFamily;
        }
      } else {
        styles[mapping.cssProperty] = val;
      }
    }
  }
  return styles;
}

/**
 * Build a value→value swap map for theme switching.
 * Maps dark theme token values to their light counterparts (matched by name).
 * Returns { darkToLight: Map<darkValue, lightValue>, lightToDark: Map<lightValue, darkValue> }
 */
export function buildThemeSwapMap(tokens: DesignToken[]): { darkToLight: Map<string, string>; lightToDark: Map<string, string> } {
  const darkToLight = new Map<string, string>();
  const lightToDark = new Map<string, string>();

  // Values too generic to swap — would affect unrelated elements
  const skipValues = new Set(['transparent', 'inherit', 'initial', 'unset', 'none', 'currentcolor']);

  const darkTokens = tokens.filter(t => t.category === 'semantic' && t.theme === 'dark');
  const lightTokens = tokens.filter(t => t.category === 'semantic' && t.theme === 'light');

  for (const dark of darkTokens) {
    const light = lightTokens.find(l => l.name === dark.name);
    if (light && dark.value !== light.value) {
      const darkVal = dark.value.toLowerCase();
      const lightVal = light.value.toLowerCase();
      // Skip generic values that would cause false swaps
      if (skipValues.has(darkVal) || skipValues.has(lightVal)) continue;
      // Skip non-hex values (rgba, etc.) — they rarely match inline styles exactly
      if (!darkVal.startsWith('#') || !lightVal.startsWith('#')) continue;
      darkToLight.set(darkVal, lightVal);
      lightToDark.set(lightVal, darkVal);
    }
  }

  return { darkToLight, lightToDark };
}
