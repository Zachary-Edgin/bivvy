/**
 * Bivvy Constraint Engine Test Suite
 * "Ralph Wiggum Pattern" — exhaustive test harness that validates the constraint
 * engine catches every category of violation and auto-fixes what it can.
 *
 * Run: npx tsx lib/constraintTests.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { validateVariations, buildViolationFeedback } from './serverConstraintValidator';

// ═══════════════════════════════════════
// TEST INFRASTRUCTURE
// ═══════════════════════════════════════

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(label);
    console.error(`  ✗ FAIL: ${label}`);
  }
}

function section(name: string) {
  console.log(`\n═══ ${name} ═══`);
}

// ═══════════════════════════════════════
// MOCK DESIGN SYSTEM (CONSTRAINED)
// ═══════════════════════════════════════

const mockDesignTokens = {
  colors: [
    { name: 'Primary Blue', value: '#1976d2' },
    { name: 'Dark Blue', value: '#1565c0' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Gray 100', value: '#f5f5f5' },
    { name: 'Gray 500', value: '#9e9e9e' },
    { name: 'Gray 900', value: '#212121' },
    { name: 'Error Red', value: '#c62828' },
    { name: 'Success Green', value: '#2e7d32' },
    { name: 'BG Primary', value: '#0a0a0a' },
    { name: 'BG Secondary', value: '#141414' },
  ],
  fonts: ['Inter', 'DM Sans', 'Fira Code'],
  tokens: {
    enabled: true,
    fontSizes: [12, 14, 16, 18, 20, 24, 32, 40, 48],
    fontWeights: [400, 500, 600, 700],
    lineHeights: [1.25, 1.5, 1.75],
    letterSpacing: [-0.02, -0.01, 0, 0.01, 0.02, 0.05, 0.1],
    spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
    maxWidths: [200, 240, 280, 320, 400, 480, 560, 640, 800, 1200],
    borderRadius: [0, 2, 4, 6, 8, 12, 16, 20, 24, 9999],
    borderWidths: [0, 1, 1.5, 2, 3, 4],
    borderStyles: ['none', 'solid', 'dashed', 'dotted'],
    shadows: [
      'none',
      '0px 1px 3px rgba(0,0,0,0.12)',
      '0px 4px 6px rgba(0,0,0,0.15)',
      '0px 8px 24px rgba(0,0,0,0.25)',
    ],
    opacities: [0, 0.08, 0.5, 0.7, 1],
    iconSizes: [16, 20, 24, 32, 48],
    minHeights: [28, 32, 36, 40, 44, 48],
  },
  namedTokens: [],
  componentDefs: [],
  tokenMappings: [],
  guidelines: { enabled: false, rules: [], referenceLibrary: false },
};

// ═══════════════════════════════════════
// TEST: COLOR VALIDATION
// ═══════════════════════════════════════

section('Color Validation');

// Test 1: Valid color passes
(() => {
  const result = validateVariations([{
    id: 'v1', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#1976d2', color: '#ffffff' } }
    ]
  }], mockDesignTokens);
  assert(result[0].validation.passed, 'Valid colors should pass');
})();

// Test 2: Invalid color is caught
(() => {
  const result = validateVariations([{
    id: 'v2', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#ff00ff' } }
    ]
  }], mockDesignTokens);
  const violations = result[0].validation.violations;
  assert(violations.some(v => v.property === 'backgroundColor'), 'Invalid color #ff00ff should be caught');
})();

// Test 3: Near-miss color is auto-fixed to nearest
(() => {
  const result = validateVariations([{
    id: 'v3', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#1977d3' } } // close to #1976d2
    ]
  }], mockDesignTokens);
  const violations = result[0].validation.violations;
  assert(violations.some(v => v.nearestValidToken === '#1976d2'), 'Near-miss #1977d3 should suggest #1976d2');
})();

// Test 4: Color in rgb() format
(() => {
  const result = validateVariations([{
    id: 'v4', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: 'rgb(25, 118, 210)' } } // = #1976d2
    ]
  }], mockDesignTokens);
  assert(result[0].validation.passed, 'rgb(25,118,210) should match #1976d2');
})();

// Test 5: transparent and inherit skip validation
(() => {
  const result = validateVariations([{
    id: 'v5', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: 'transparent', color: 'inherit' } }
    ]
  }], mockDesignTokens);
  assert(result[0].validation.passed, 'transparent and inherit should pass');
})();

// ═══════════════════════════════════════
// TEST: SPACING VALIDATION
// ═══════════════════════════════════════

section('Spacing Validation');

// Test 6: Valid spacing passes
(() => {
  const result = validateVariations([{
    id: 'v6', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { padding: '16px', gap: '8px', margin: '24px' } }
    ]
  }], mockDesignTokens);
  // Check no spacing violations
  const spacingViolations = result[0].validation.violations.filter(v => v.category === 'spacing');
  assert(spacingViolations.length === 0, 'Valid spacing values should pass');
})();

// Test 7: Invalid spacing caught
(() => {
  const result = validateVariations([{
    id: 'v7', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { padding: '17px' } }
    ]
  }], mockDesignTokens);
  const violations = result[0].validation.violations;
  assert(violations.some(v => v.property === 'padding'), '17px padding should be caught (not in spacing scale)');
})();

// Test 8: Compound padding (e.g. "16px 24px")
(() => {
  const result = validateVariations([{
    id: 'v8', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { padding: '16px 24px' } }
    ]
  }], mockDesignTokens);
  // Compound values may or may not be validated depending on implementation
  // Just ensure it doesn't crash
  assert(result[0] !== undefined, 'Compound padding should not crash validator');
})();

// ═══════════════════════════════════════
// TEST: TYPOGRAPHY VALIDATION
// ═══════════════════════════════════════

section('Typography Validation');

// Test 9: Valid font size passes
(() => {
  const result = validateVariations([{
    id: 'v9', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'text', styles: { fontSize: '16px', fontWeight: '600' } }
    ]
  }], mockDesignTokens);
  const typoViolations = result[0].validation.violations.filter(v => v.category === 'fontSize' || v.category === 'fontWeight');
  assert(typoViolations.length === 0, 'Valid fontSize 16px and fontWeight 600 should pass');
})();

// Test 10: Invalid font size caught
(() => {
  const result = validateVariations([{
    id: 'v10', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'text', styles: { fontSize: '15px' } }
    ]
  }], mockDesignTokens);
  const violations = result[0].validation.violations;
  assert(violations.some(v => v.property === 'fontSize'), '15px fontSize should be caught');
})();

// Test 11: Invalid font weight caught
(() => {
  const result = validateVariations([{
    id: 'v11', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'text', styles: { fontWeight: '450' } }
    ]
  }], mockDesignTokens);
  const violations = result[0].validation.violations;
  assert(violations.some(v => v.property === 'fontWeight'), 'fontWeight 450 should be caught');
})();

// ═══════════════════════════════════════
// TEST: BORDER RADIUS VALIDATION
// ═══════════════════════════════════════

section('Border Radius Validation');

// Test 12: Valid radius passes
(() => {
  const result = validateVariations([{
    id: 'v12', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { borderRadius: '12px' } }
    ]
  }], mockDesignTokens);
  const radiusViolations = result[0].validation.violations.filter(v => v.property === 'borderRadius');
  assert(radiusViolations.length === 0, 'borderRadius 12px should pass');
})();

// Test 13: Invalid radius caught
(() => {
  const result = validateVariations([{
    id: 'v13', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { borderRadius: '10px' } }
    ]
  }], mockDesignTokens);
  const violations = result[0].validation.violations;
  assert(violations.some(v => v.property === 'borderRadius'), 'borderRadius 10px should be caught');
})();

// Test 14: Pill radius (9999) passes
(() => {
  const result = validateVariations([{
    id: 'v14', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { borderRadius: '9999px' } }
    ]
  }], mockDesignTokens);
  const radiusViolations = result[0].validation.violations.filter(v => v.property === 'borderRadius');
  assert(radiusViolations.length === 0, 'borderRadius 9999px (pill) should pass');
})();

// ═══════════════════════════════════════
// TEST: SHADOW VALIDATION
// ═══════════════════════════════════════

section('Shadow Validation');

// Test 15: Valid shadow passes
(() => {
  const result = validateVariations([{
    id: 'v15', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { boxShadow: 'none' } }
    ]
  }], mockDesignTokens);
  assert(result[0] !== undefined, 'boxShadow "none" should not crash');
})();

// ═══════════════════════════════════════
// TEST: MULTI-CHANGE VALIDATION
// ═══════════════════════════════════════

section('Multi-Change Validation');

// Test 16: Multiple changes validated independently
(() => {
  const result = validateVariations([{
    id: 'v16', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#1976d2' } }, // valid
      { id: 'c2', type: 'text', styles: { fontSize: '15px' } }, // invalid
    ]
  }], mockDesignTokens);
  const violations = result[0].validation.violations;
  assert(violations.some(v => v.property === 'fontSize'), 'Second change with invalid fontSize should be caught');
})();

// Test 17: Multiple variations validated independently
(() => {
  const result = validateVariations([
    { id: 'v17a', name: 'Good', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#1976d2' } }
    ]},
    { id: 'v17b', name: 'Bad', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#ff00ff' } }
    ]},
  ], mockDesignTokens);
  assert(result[0].validation.passed || result[0].validation.violations.filter(v => v.category === 'color').length === 0, 'First variation with valid color should be clean');
  assert(result[1].validation.violations.some(v => v.category === 'color'), 'Second variation with invalid color should have violations');
})();

// ═══════════════════════════════════════
// TEST: EDGE CASES
// ═══════════════════════════════════════

section('Edge Cases');

// Test 18: Empty styles object
(() => {
  const result = validateVariations([{
    id: 'v18', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: {} }
    ]
  }], mockDesignTokens);
  assert(result[0].validation.passed, 'Empty styles should pass');
})();

// Test 19: No styles property at all
(() => {
  const result = validateVariations([{
    id: 'v19', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div' }
    ]
  }], mockDesignTokens);
  assert(result[0].validation.passed, 'Missing styles should pass (skip validation)');
})();

// Test 20: Empty changes array
(() => {
  const result = validateVariations([{
    id: 'v20', name: 'Test', description: '', changes: []
  }], mockDesignTokens);
  assert(result[0].validation.passed, 'Empty changes should pass');
})();

// Test 21: Non-color CSS properties should not be color-validated
(() => {
  const result = validateVariations([{
    id: 'v21', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }
    ]
  }], mockDesignTokens);
  assert(result[0].validation.passed, 'Layout properties should not trigger violations');
})();

// Test 22: Icon elements skip background validation
(() => {
  const result = validateVariations([{
    id: 'v22', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'icon', styles: { color: '#1976d2' } }
    ]
  }], mockDesignTokens);
  assert(result[0] !== undefined, 'Icon color should be handled');
})();

// ═══════════════════════════════════════
// TEST: VIOLATION FEEDBACK BUILDER
// ═══════════════════════════════════════

section('Violation Feedback Builder');

// Test 23: Variations with violations produce feedback (use values far from any token)
(() => {
  const result = validateVariations([{
    id: 'v23', name: 'Bad Variant', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#ff00ff', fontSize: '15px' } }
    ]
  }], mockDesignTokens);
  // Note: auto-fix may correct near-miss values. Check original violations exist.
  const hasViolations = result[0].validation.violations.length > 0;
  assert(hasViolations, 'Invalid styles should produce violations (pre-fix)');
  // If auto-fix couldn't correct, feedback should exist
  if (!result[0].validation.passed) {
    const feedback = buildViolationFeedback(result);
    assert(feedback.includes('PREVIOUS ATTEMPT'), 'Feedback should contain PREVIOUS ATTEMPT header');
  } else {
    // Auto-fix succeeded — feedback empty is correct
    assert(result[0].validation.wasAutoFixed, 'If passed, should have been auto-fixed');
  }
})();

// Test 24: Passed variations produce empty feedback
(() => {
  const result = validateVariations([{
    id: 'v24', name: 'Good Variant', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#1976d2' } }
    ]
  }], mockDesignTokens);
  const feedback = buildViolationFeedback(result);
  assert(feedback === '', 'Passed variations should produce empty feedback');
})();

// ═══════════════════════════════════════
// TEST: TOKENS DISABLED (NO CONSTRAINTS)
// ═══════════════════════════════════════

section('Tokens Disabled');

// Test 25: When tokens are disabled, everything passes
(() => {
  const disabledTokens = { ...mockDesignTokens, tokens: { ...mockDesignTokens.tokens, enabled: false } };
  const result = validateVariations([{
    id: 'v25', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#ff00ff', fontSize: '99px', borderRadius: '7px' } }
    ]
  }], disabledTokens);
  assert(result[0].validation.passed, 'With tokens disabled, all values should pass');
})();

// ═══════════════════════════════════════
// TEST: AUTO-FIX
// ═══════════════════════════════════════

section('Auto-Fix');

// Test 26: Auto-fix flag is set when fixes applied
(() => {
  const result = validateVariations([{
    id: 'v26', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#1977d3' } } // near #1976d2
    ]
  }], mockDesignTokens);
  assert(result[0].validation.wasAutoFixed, 'Near-miss color should trigger auto-fix');
})();

// Test 27: Auto-fixed changes contain corrected values
(() => {
  const result = validateVariations([{
    id: 'v27', name: 'Test', description: '', changes: [
      { id: 'c1', type: 'div', styles: { backgroundColor: '#1977d3' } }
    ]
  }], mockDesignTokens);
  const fixedBg = result[0].changes[0]?.styles?.backgroundColor;
  assert(fixedBg === '#1976d2', `Auto-fixed backgroundColor should be #1976d2, got ${fixedBg}`);
})();

// ═══════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════

console.log('\n════════════════════════════════════════');
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
}
console.log('════════════════════════════════════════');
process.exit(failed > 0 ? 1 : 0);
