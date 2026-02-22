'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStore, ComponentElement } from '@/store/componentStore';
import { Wand2, X, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { loadFontsFromComponents } from '@/utils/fontLoader';
import { apiUrl } from '@/utils/apiBase';

function sanitizeChildBackgrounds(children: any[]): any[] {
  if (!children) return children;
  return children.map((child: any) => {
    const sanitized = { ...child };
    if (child.type === 'text' && (child.styles?.backgroundColor || child.styles?.background)) {
      sanitized.styles = { ...child.styles };
      delete sanitized.styles.backgroundColor;
      delete sanitized.styles.background;
    }
    if (child.children?.length) {
      sanitized.children = sanitizeChildBackgrounds(child.children);
    }
    return sanitized;
  });
}

interface Variation {
  id: string;
  name: string;
  components: ComponentElement[];
  description: string;
}

export function AIVariationGenerator() {
  const selectedIds = useStore(s => s.selectedIds);
  const editingParentId = useStore(s => s.editingParentId);
  const canvasVariations = useStore(s => s.canvasVariations);
  const findComponent = useStore(s => s.findComponent);
  const addToast = useStore(s => s.addToast);
  const setCanvasVariations = useStore(s => s.setCanvasVariations);

  const [isOpen, setIsOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [buttonPos, setButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [dialogPos, setDialogPos] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [referenceImage, setReferenceImage] = useState<{ base64: string; preview: string; name: string; mimeType: string } | null>(null);

  // Portal needs mounted state
  useEffect(() => { setMounted(true); return () => { abortRef.current?.abort(); }; }, []);

  const getVariationTargetComponents = useCallback((): ComponentElement[] => {
    const state = useStore.getState();
    
    // Helper: find top-level component that contains a given element ID
    const findTopLevelAncestor = (targetId: string): ComponentElement | null => {
      for (const comp of state.components) {
        if (comp.id === targetId) return comp;
        const findInChildren = (children?: ComponentElement[]): boolean => {
          if (!children) return false;
          for (const c of children) {
            if (c.id === targetId) return true;
            if (findInChildren(c.children)) return true;
          }
          return false;
        };
        if (findInChildren(comp.children)) return comp;
      }
      return null;
    };
    
    if (state.editingParentId) {
      const parent = findComponent(state.editingParentId);
      if (parent && parent.position && parent.size) return [parent];
      // editingParentId is a nested element — find top-level ancestor
      const ancestor = findTopLevelAncestor(state.editingParentId);
      if (ancestor) return [ancestor];
    }
    
    // Check selected IDs — they might be deeply nested
    const results: ComponentElement[] = [];
    for (const id of state.selectedIds) {
      const comp = findComponent(id);
      if (comp && comp.position && comp.size) {
        results.push(comp);
      } else {
        // Nested element — find top-level ancestor
        const ancestor = findTopLevelAncestor(id);
        if (ancestor && !results.find(r => r.id === ancestor.id)) {
          results.push(ancestor);
        }
      }
    }
    return results;
  }, [findComponent]);

  // Position the floating button next to the selected component
  useEffect(() => {
    if (selectedIds.length === 0 || isOpen || canvasVariations) {
      if (!isOpen) setButtonPos(null);
      return;
    }

    const updatePosition = () => {
      const state = useStore.getState();
      let anchorId = state.selectedIds[0];
      // Try to anchor to the selected element first, then editing parent
      let el = document.querySelector(`[data-component-id="${anchorId}"]`) as HTMLElement
            || document.querySelector(`[data-child-id="${anchorId}"]`) as HTMLElement
            || document.querySelector(`[data-bivvy-id="${anchorId}"]`) as HTMLElement;
      // Fallback to editing parent
      if (!el && state.editingParentId) {
        anchorId = state.editingParentId;
        el = document.querySelector(`[data-component-id="${anchorId}"]`) as HTMLElement
              || document.querySelector(`[data-child-id="${anchorId}"]`) as HTMLElement
              || document.querySelector(`[data-bivvy-id="${anchorId}"]`) as HTMLElement;
      }
      if (!el) { setButtonPos(null); return; }

      const rect = el.getBoundingClientRect();
      const btnSize = 44;
      // Prefer right side of element, but clamp within viewport
      let x = rect.right + 12;
      let y = rect.top + rect.height / 2 - 22;
      
      // If button would go off right edge, put it inside the element's right edge
      if (x + btnSize > window.innerWidth - 20) {
        x = rect.right - btnSize - 12;
      }
      // Clamp Y within viewport
      y = Math.max(8, Math.min(y, window.innerHeight - btnSize - 8));
      
      setButtonPos({ x, y });
    };

    updatePosition();
    let rafId: number;
    const loop = () => { updatePosition(); rafId = requestAnimationFrame(loop); };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [selectedIds, isOpen, canvasVariations, editingParentId]);

  // Close dialog when selection clears (but not in create mode)
  useEffect(() => {
    if (selectedIds.length === 0 && isOpen && !createMode) {
      setIsOpen(false);
      setDialogPos(null);
    }
  }, [selectedIds, isOpen, createMode]);

  // Watch for iterate/create signal from Canvas
  useEffect(() => {
    const unsub = useStore.subscribe((state, prev) => {
      if (state.pendingIterateTarget && !prev.pendingIterateTarget) {
        const targetId = state.pendingIterateTarget;
        useStore.setState({ pendingIterateTarget: null });
        
        if (targetId === '__create_new__') {
          // Create from scratch mode — open dialog in center
          setCreateMode(true);
          setDialogPos({
            x: window.innerWidth / 2 - 160,
            y: window.innerHeight / 2 - 100,
          });
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 150);
        } else {
          // Iterate mode — select component and open dialog next to it
          setCreateMode(false);
          useStore.getState().selectComponent(targetId);
          setTimeout(() => {
            const el = document.querySelector(`[data-component-id="${targetId}"]`) as HTMLElement;
            if (el) {
              const rect = el.getBoundingClientRect();
              setDialogPos({ x: rect.right + 12, y: rect.top + rect.height / 2 - 60 });
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 150);
            }
          }, 200);
        }
      }
    });
    return unsub;
  }, []);

  const openDialog = useCallback(() => {
    // Use current button position OR calculate fresh from DOM
    const state = useStore.getState();
    let anchorId = state.selectedIds[0];
    if (state.editingParentId) anchorId = state.editingParentId;
    
    const el = document.querySelector(`[data-component-id="${anchorId}"]`) as HTMLElement;
    if (el) {
      const rect = el.getBoundingClientRect();
      setDialogPos({ x: rect.right + 12, y: rect.top + rect.height / 2 - 60 });
    } else if (buttonPos) {
      setDialogPos({ ...buttonPos });
    }
    
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  }, [buttonPos]);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setDialogPos(null);
    setCreateMode(false);
  }, []);

  const diffToFull = (variation: any): Variation => {
    const changesMap = new Map<string, any>();
    if (variation.changes) {
      for (const change of variation.changes) changesMap.set(change.id, change);
    }
    const targetComps = getVariationTargetComponents();
    
    // Recursively apply changes to children at any depth
    const applyChildChanges = (children?: ComponentElement[]): ComponentElement[] | undefined => {
      if (!children) return undefined;
      return children.map(child => {
        const cc = changesMap.get(child.id);
        const mergedStyles = cc?.styles ? { ...child.styles, ...cc.styles } : { ...child.styles };
        if (child.type === 'text') { delete mergedStyles.backgroundColor; delete mergedStyles.background; }
        return {
          ...child,
          styles: mergedStyles,
          content: cc?.content !== undefined ? cc.content : child.content,
          children: applyChildChanges(child.children),
        };
      });
    };
    
    const comps = targetComps.map(comp => {
      const change = changesMap.get(comp.id);
      return {
        ...comp,
        styles: change?.styles ? { ...comp.styles, ...change.styles } : { ...comp.styles },
        content: change?.content !== undefined ? change.content : comp.content,
        size: change?.size ? { ...comp.size, ...change.size } : { ...comp.size },
        ...(change?.variantProps ? { variantProps: change.variantProps } : {}),
        children: applyChildChanges(comp.children),
      };
    });
    return {
      id: variation.id || `var-${Math.random().toString(36).slice(2, 6)}`,
      name: variation.name || 'Variation',
      description: variation.description || '',
      components: comps,
    };
  };

  const handleGenerate = async () => {
    if (createMode) {
      // Create from scratch — use ai-update route (returns a text stream with JSON)
      if (!prompt.trim()) { addToast('Describe what you want to create', 'error'); return; }
      setIsGenerating(true);
      setGenerationStatus('Creating...');
      try {
        const state = useStore.getState();
        const response = await fetch(apiUrl('/api/ai-update'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: prompt.trim(),
            components: state.components,
            selectedId: null,
            editingParentId: null,
            canvasBg: 'dark',
            designTokens: state.designSystem,
            history: [],
            referenceImage: referenceImage?.base64 || null,
            referenceImageType: referenceImage?.mimeType || null,
          }),
        });


        // ai-update returns a text stream, not JSON — read the full stream
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let fullText = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }


        // Check for stream error
        if (fullText.includes('__ERROR__:')) {
          throw new Error(fullText.split('__ERROR__:')[1]?.trim() || 'Stream error');
        }

        // Extract JSON from the response — find the outermost { ... } block
        // The AI sometimes wraps JSON in markdown fences or adds text before/after
        let jsonStr = '';
        // Try to find JSON between code fences first
        const fenceMatch = fullText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (fenceMatch) {
          jsonStr = fenceMatch[1];
        } else {
          // Find the first { and last } for the outermost JSON object
          const firstBrace = fullText.indexOf('{');
          const lastBrace = fullText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = fullText.substring(firstBrace, lastBrace + 1);
          }
        }

        if (!jsonStr) {
          console.error('[Bivvy] No JSON found in response:', fullText.substring(0, 1000));
          throw new Error('No JSON found in AI response');
        }


        const data = JSON.parse(jsonStr);
        
        const store = useStore.getState();

        // Load fonts if specified
        if (data.fonts && Array.isArray(data.fonts)) {
          for (const font of data.fonts) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
        }

        if (data.action === 'create' && data.component) {
          loadFontsFromComponents([data.component]);
          store.addComponent(data.component);
          addToast(data.message || 'Component created!', 'success');
        } else if (data.action === 'create_page' && data.components) {
          loadFontsFromComponents(data.components);
          store.batchAddComponents(data.components);
          addToast(data.message || `Created ${data.components.length} components`, 'success');
        } else {
          addToast('AI responded but no component was created. Try being more specific.', 'error');
        }

        setPrompt('');
        closeDialog();
      } catch (error: any) {
        const msg = error?.message || '';
        console.error('[Bivvy] Create error:', error);
        console.error('[Bivvy] Error message:', msg);
        if (msg.includes('JSON')) {
          addToast('AI response parsing failed — try again', 'error');
        } else {
          addToast(`Creation failed: ${msg.substring(0, 80)}`, 'error');
        }
      } finally {
        setIsGenerating(false);
        setReferenceImage(null);
      }
      return;
    }

    // Variation mode — existing logic
    const targetComps = getVariationTargetComponents();
    if (targetComps.length === 0) {
      addToast('Select a component first', 'error');
      return;
    }
    setIsGenerating(true);
    setGenerationStatus('Generating...');

    const totalElements = targetComps.reduce((sum, c) => sum + 1 + (c.children?.length || 0), 0);
    const variationCount = totalElements > 8 ? 2 : totalElements > 4 ? 3 : 4;

    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const stripChildren = (children?: ComponentElement[]): any[] | undefined => {
        if (!children || children.length === 0) return undefined;
        return children.map(ch => ({
          id: ch.id, type: ch.type, content: ch.content || '', styles: ch.styles,
          ...(ch.annotations?.filter((a: any) => !a.resolved).length ? { annotations: ch.annotations!.filter((a: any) => !a.resolved) } : {}),
          ...(ch.children && ch.children.length > 0 ? { children: stripChildren(ch.children) } : {}),
        }));
      };

      const strippedComponents = targetComps.map(c => ({
        id: c.id, type: c.type, content: c.content || '', styles: c.styles, size: c.size, position: c.position,
        ...(c.componentDefId ? { componentDefId: c.componentDefId, variantProps: c.variantProps } : {}),
        ...(c.annotations?.filter((a: any) => !a.resolved).length ? { annotations: c.annotations!.filter((a: any) => !a.resolved) } : {}),
        ...(c.children ? { children: stripChildren(c.children) } : {}),
      }));

      const state = useStore.getState();
      let subElementContext = '';
      if (state.editingParentId && state.selectedId && state.selectedId !== state.editingParentId) {
        const child = findComponent(state.selectedId);
        if (child) {
          subElementContext = `\nFOCUS: User selected sub-element (id: ${child.id}, type: ${child.type}${child.content ? `, "${child.content.substring(0, 40)}"` : ''}). Prioritize changes to THIS element. Every variation MUST include changes to "${child.id}".`;
        }
      }

      const response = await fetch(apiUrl('/api/ai-variations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          components: strippedComponents,
          prompt: (prompt.trim() || (referenceImage ? 'Match the style of the reference image' : '')) + subElementContext,
          numVariations: variationCount,
          designTokens: state.designSystem,
          referenceImage: referenceImage?.base64 || null,
          referenceImageType: referenceImage?.mimeType || null,
        }),
        signal: controller.signal,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let parsedVariations: Variation[] = [];
      if (data.variations && Array.isArray(data.variations)) {
        const usesDiffs = data.variations.length > 0 && data.variations[0].changes && !data.variations[0].components;
        parsedVariations = usesDiffs ? data.variations.map((v: any) => diffToFull(v)) : data.variations;
        for (const v of parsedVariations) {
          if (v.components) {
            for (const comp of v.components) {
              if (comp.children) comp.children = sanitizeChildBackgrounds(comp.children as any[]);
            }
          }
        }
      }

      if (parsedVariations.length > 0) {
        for (const v of parsedVariations) loadFontsFromComponents(v.components);
        setCanvasVariations({
          targetIds: targetComps.map(c => c.id),
          sourceComponents: JSON.parse(JSON.stringify(targetComps)),
          variations: parsedVariations.map(v => ({
            id: v.id, name: v.name, description: v.description, components: v.components, isFavorited: false,
          })),
          prompt: prompt.trim(),
          livePreviewId: null,
        });
        setPrompt('');
        closeDialog();
        addToast(`${parsedVariations.length} variations generated`, 'success');
      } else {
        addToast('No variations generated. Try a different prompt.', 'error');
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      const msg = error?.message || 'Unknown error';
      if (msg.includes('API_KEY')) addToast('API key not configured — add ANTHROPIC_API_KEY to .env.local', 'error');
      else addToast(`Generation failed: ${msg.substring(0, 80)}`, 'error');
    } finally {
      setIsGenerating(false);
      setReferenceImage(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please upload an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { addToast('Image must be under 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setReferenceImage({ base64, preview: dataUrl, name: file.name, mimeType: file.type || 'image/png' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getComponentLabel = (): string => {
    const state = useStore.getState();
    if (state.editingParentId && state.selectedId && state.selectedId !== state.editingParentId) {
      const child = findComponent(state.selectedId);
      if (child) {
        const labels: Record<string, string> = { div: 'Container', text: 'Text', button: 'Button', input: 'Input', icon: 'Icon' };
        return (labels[child.type] || child.type) + (child.content ? `: "${child.content.substring(0, 20)}"` : '');
      }
    }
    const comps = getVariationTargetComponents();
    if (comps.length === 1) {
      const comp = comps[0];
      if (comp.type === 'div' && comp.children?.length) {
        const tc = comp.children.find(c => c.type === 'text' && c.content);
        if (tc?.content) return tc.content.substring(0, 28);
        return `Container (${comp.children.length} items)`;
      }
      return comp.content?.substring(0, 28) || comp.type;
    }
    return `${comps.length} components`;
  };

  if (!mounted) return null;
  if (selectedIds.length === 0 && !canvasVariations && !isOpen) return null;

  const showButton = buttonPos && !isOpen && !canvasVariations;
  const dPos = dialogPos;

  // Render via Portal to document.body — completely outside Canvas event tree
  return createPortal(
    <>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* ── Floating AI Button ── */}
      {showButton && (
        <div
          ref={buttonRef}
          data-variation-trigger
          style={{
            position: 'fixed',
            left: buttonPos.x,
            top: buttonPos.y,
            zIndex: 99999,
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDialog(); }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2296FF, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(34,150,255,0.35)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.12)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(34,150,255,0.5)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(34,150,255,0.35)'; }}
          >
            <Wand2 style={{ width: 20, height: 20, color: 'white' }} />
          </div>
        </div>
      )}

      {/* ── Floating Dialog — Problem-Framed UX ── */}
      {isOpen && dPos && (
        <div
          ref={dialogRef}
          style={{
            position: 'fixed',
            left: Math.min(dPos.x, window.innerWidth - 380),
            top: Math.max(8, Math.min(dPos.y, window.innerHeight - 420)),
            zIndex: 99999,
            pointerEvents: 'auto',
            width: 360,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            background: '#1a1a2e',
            border: '1px solid rgba(107,114,128,0.4)',
            borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(107,114,128,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles style={{ width: 14, height: 14, color: '#2296FF' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb' }}>{createMode ? 'Create with AI' : 'Iterate'}</span>
                {!createMode && <span style={{ fontSize: 11, color: '#6b7280', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getComponentLabel()}</span>}
              </div>
              <button onClick={closeDialog} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
                <X style={{ width: 14, height: 14, color: '#6b7280' }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '12px 14px' }}>
              {/* Screen Presets — create mode */}
              {createMode && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginBottom: 6, display: 'block' }}>Quick Start</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {[
                      { label: '🏠 Landing Page', prompt: 'A modern landing page hero section with headline, subtext, CTA button, and trust badges' },
                      { label: '💳 Pricing', prompt: 'A pricing page with 3 plan cards (Basic, Pro, Enterprise) with feature lists and CTA buttons' },
                      { label: '📊 Dashboard', prompt: 'A dashboard card with metrics, a small chart area, and status indicators' },
                      { label: '📝 Form', prompt: 'A clean sign-up form with email, password fields, submit button, and social login options' },
                      { label: '🃏 Card', prompt: 'A product card with image placeholder, title, description, price, and add-to-cart button' },
                      { label: '🧭 Nav Bar', prompt: 'A navigation bar with logo, menu links, and a CTA button on the right' },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => setPrompt(preset.prompt)}
                        style={{
                          fontSize: 11, padding: '4px 10px', borderRadius: 20,
                          border: prompt === preset.prompt ? '1px solid #6366f1' : '1px solid rgba(107,114,128,0.35)',
                          background: prompt === preset.prompt ? 'rgba(99,102,241,0.15)' : 'rgba(31,41,55,0.4)',
                          color: prompt === preset.prompt ? '#a5b4fc' : '#9ca3af',
                          cursor: 'pointer', transition: 'all 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                      >{preset.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action Chips — only in iterate mode */}
              {!createMode && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginBottom: 6, display: 'block' }}>Quick Focus</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {[
                      { label: '🎨 Colors', prompt: 'Explore different color palettes and contrast' },
                      { label: '🔤 Typography', prompt: 'Try different fonts and text hierarchy' },
                      { label: '📐 Layout', prompt: 'Improve layout, spacing and alignment' },
                      { label: '✨ Polish', prompt: 'Add visual polish — shadows, borders, subtle effects' },
                      { label: '🔄 Full Restyle', prompt: 'Complete visual redesign with different aesthetic' },
                      { label: '📱 Mobile', prompt: 'Optimize for mobile — larger touch targets, simpler layout' },
                    ].map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => setPrompt(chip.prompt)}
                        style={{
                          fontSize: 11, padding: '4px 10px', borderRadius: 20,
                          border: prompt === chip.prompt ? '1px solid #2296FF' : '1px solid rgba(107,114,128,0.35)',
                          background: prompt === chip.prompt ? 'rgba(34,150,255,0.15)' : 'rgba(31,41,55,0.4)',
                          color: prompt === chip.prompt ? '#60b5ff' : '#9ca3af',
                          cursor: 'pointer', transition: 'all 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                      >{chip.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* View Previous Variations — only in iterate mode when history exists */}
              {!createMode && (() => {
                const targets = getVariationTargetComponents();
                const targetIds = targets.map(c => c.id);
                const targetKey = targetIds.join(',');
                const historyCount = (useStore.getState().variationHistory[targetKey] || []).length;
                if (historyCount === 0) return null;
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const restored = useStore.getState().restoreVariationHistory(targetIds);
                      if (restored) {
                        closeDialog();
                        useStore.getState().addToast(`Showing ${historyCount} previous generation${historyCount > 1 ? 's' : ''}`, 'success');
                      }
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '7px 12px', marginBottom: 10, borderRadius: 8, fontSize: 11, fontWeight: 500,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                      color: '#a5b4fc', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'; }}
                  >
                    <span style={{ fontSize: 13 }}>↩</span>
                    <span>View Previous Variations ({historyCount} generation{historyCount > 1 ? 's' : ''})</span>
                  </button>
                );
              })()}

              {/* Problem-framed prompt input */}
              <label style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginBottom: 4, display: 'block' }}>
                {createMode ? 'What do you want to create?' : 'What needs to improve?'}
              </label>
              <textarea
                ref={inputRef as any}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter' && !e.shiftKey && !isGenerating) { e.preventDefault(); handleGenerate(); }
                  if (e.key === 'Escape') closeDialog();
                }}
                placeholder={createMode 
                  ? "e.g., A pricing page with 3 plan cards and a toggle for monthly/annual..."
                  : "e.g., The text hierarchy is flat — needs clearer visual distinction between heading and body..."
                }
                rows={3}
                style={{
                  width: '100%', background: 'rgba(31,41,55,0.6)', border: '1px solid rgba(107,114,128,0.35)',
                  borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#e5e7eb',
                  outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 56,
                  lineHeight: '1.5', fontFamily: 'inherit',
                }}
              />

              {/* Reference image */}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {referenceImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(31,41,55,0.3)', borderRadius: 8, padding: '6px 10px', border: '1px solid rgba(107,114,128,0.2)', flex: 1 }}>
                    <img src={referenceImage.preview} alt="Ref" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', border: '1px solid #4b5563' }} />
                    <span style={{ fontSize: 10, color: '#9ca3af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{referenceImage.name}</span>
                    <button onClick={() => setReferenceImage(null)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X style={{ width: 12, height: 12, color: '#6b7280' }} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                  >
                    <ImageIcon style={{ width: 12, height: 12 }} /><span>Add reference image</span>
                  </button>
                )}
                {!createMode && (
                  <span style={{ fontSize: 9, color: '#4b5563' }}>Shift+Enter for new line</span>
                )}
              </div>
            </div>

            {/* Generate button */}
            <div style={{ padding: '0 14px 12px' }}>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: isGenerating ? 'rgba(34,150,255,0.4)' : 'linear-gradient(90deg, #2296FF, #6366f1)',
                  color: 'white', fontSize: 12, fontWeight: 600, padding: '10px 0',
                  borderRadius: 8, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(34,150,255,0.2)',
                  transition: 'opacity 0.2s',
                }}
              >
                {isGenerating ? (
                  <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /><span>{generationStatus}</span></>
                ) : (
                  <><Wand2 style={{ width: 14, height: 14 }} /><span>{createMode ? 'Create Component' : 'Generate Variations'}</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
