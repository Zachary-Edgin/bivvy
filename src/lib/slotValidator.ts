/**
 * Slot Validation for Bivvy Components
 * Validates that component children match the slot schema defined in ComponentDefinition.
 */

import type { ComponentElement, ComponentDefinition } from '@/store/componentStore';

export interface SlotViolation {
  type: 'missing_required' | 'unknown_slot' | 'duplicate_slot';
  slotName: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SlotValidationResult {
  valid: boolean;
  violations: SlotViolation[];
  filledSlots: string[];
  emptySlots: string[];
}

/**
 * Validate a component's children against its definition's slot schema.
 * Returns violations for missing required slots and unknown slot assignments.
 */
export function validateSlots(
  component: ComponentElement,
  componentDef: ComponentDefinition | undefined
): SlotValidationResult {
  if (!componentDef || !componentDef.slots || componentDef.slots.length === 0) {
    return { valid: true, violations: [], filledSlots: [], emptySlots: [] };
  }

  const violations: SlotViolation[] = [];
  const filledSlots: string[] = [];
  const emptySlots: string[] = [];
  const children = component.children || [];

  // Build a set of slot names that are filled by children
  const childSlotNames = new Set<string>();
  for (const child of children) {
    if (child.slotName) {
      childSlotNames.add(child.slotName);
    }
  }

  // Also try to auto-detect slots by heuristics when slotName isn't set
  const autoDetected = autoDetectSlots(children, componentDef);

  const allFilledSlots = new Set([...childSlotNames, ...autoDetected]);

  // Check each defined slot
  for (const slot of componentDef.slots) {
    if (allFilledSlots.has(slot.name)) {
      filledSlots.push(slot.name);
    } else {
      emptySlots.push(slot.name);
      if (slot.required) {
        violations.push({
          type: 'missing_required',
          slotName: slot.name,
          message: `Required slot "${slot.name}" is empty: ${slot.description}`,
          severity: 'error',
        });
      }
    }
  }

  // Check for children assigned to unknown slots
  for (const child of children) {
    if (child.slotName && !componentDef.slots.some(s => s.name === child.slotName)) {
      violations.push({
        type: 'unknown_slot',
        slotName: child.slotName,
        message: `Child assigned to unknown slot "${child.slotName}"`,
        severity: 'warning',
      });
    }
  }

  return {
    valid: violations.filter(v => v.severity === 'error').length === 0,
    violations,
    filledSlots,
    emptySlots,
  };
}

/**
 * Heuristic slot detection — infer which slots are filled based on child type/content.
 */
function autoDetectSlots(children: ComponentElement[], def: ComponentDefinition): Set<string> {
  const detected = new Set<string>();
  const slotNames = def.slots.map(s => s.name.toLowerCase());

  for (const child of children) {
    const childType = child.type?.toLowerCase() || '';
    const childContent = (child.content || '').toLowerCase();

    // Match by type
    if (childType === 'button' && slotNames.includes('actions')) detected.add('actions');
    if (childType === 'button' && slotNames.includes('footer')) detected.add('footer');
    if (childType === 'text' && slotNames.includes('label')) detected.add('label');
    if (childType === 'text' && slotNames.includes('title')) detected.add('title');
    if (childType === 'text' && slotNames.includes('body')) detected.add('body');
    if (childType === 'image' && slotNames.includes('media')) detected.add('media');
    if (childType === 'image' && slotNames.includes('image')) detected.add('image');
    if (childType === 'icon' && slotNames.includes('iconleft')) detected.add('iconLeft');
    if (childType === 'icon' && slotNames.includes('iconright')) detected.add('iconRight');
    if (childType === 'input' && slotNames.includes('input')) detected.add('input');

    // Match by content keywords
    if (childContent && slotNames.includes('helpertext') && (childContent.includes('error') || childContent.includes('helper') || childContent.includes('hint'))) {
      detected.add('helperText');
    }

    // Match by containing children (compound detection)
    if (child.children && child.children.length > 0) {
      if (slotNames.includes('header') && child.children.some(gc => gc.type === 'text' && (gc.styles?.fontSize && parseInt(gc.styles.fontSize) >= 18))) {
        detected.add('header');
      }
      if (slotNames.includes('body') && child.children.some(gc => gc.type === 'text' && (!gc.styles?.fontSize || parseInt(gc.styles.fontSize) < 18))) {
        detected.add('body');
      }
      if (slotNames.includes('footer') && child.children.some(gc => gc.type === 'button')) {
        detected.add('footer');
      }
      if (slotNames.includes('items') && child.children.length >= 2) {
        detected.add('items');
      }
    }

    // If child is a div with content that looks like initials (1-2 uppercase letters)
    if (slotNames.includes('initials') && childContent && /^[A-Z]{1,2}$/i.test(childContent.trim())) {
      detected.add('initials');
    }
  }

  return detected;
}

/**
 * Get slot fill status as a summary for display.
 */
export function getSlotSummary(
  component: ComponentElement,
  componentDef: ComponentDefinition | undefined
): { name: string; required: boolean; filled: boolean; description: string }[] {
  if (!componentDef?.slots) return [];
  const result = validateSlots(component, componentDef);
  return componentDef.slots.map(slot => ({
    name: slot.name,
    required: slot.required,
    filled: result.filledSlots.includes(slot.name),
    description: slot.description,
  }));
}
