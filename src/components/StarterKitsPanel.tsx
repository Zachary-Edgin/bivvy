'use client';

import { useState, useMemo } from 'react';
import { useStore, DesignToken, ComponentDefinition, ComponentTokenMapping, ComponentElement } from '@/store/componentStore';
import { X, Package, Check, Search } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// STARTER KIT DEFINITIONS
// Each kit provides: tokens, component definitions, and ready-made components
// ═══════════════════════════════════════════════════════════

interface StarterKit {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: { bg: string; accent: string; text: string };
  tokens: DesignToken[];
  componentDefs: ComponentDefinition[];
  tokenMappings: ComponentTokenMapping[];
  sampleComponents: ComponentElement[];
}

// ── Material Design 3 Kit ──────────────────────────
const materialKit: StarterKit = {
  id: 'material-3',
  name: 'Material Design 3',
  description: 'Google\'s latest design system with dynamic color, updated components, and accessibility-first principles.',
  category: 'System',
  preview: { bg: '#1C1B1F', accent: '#D0BCFF', text: '#E6E1E5' },
  tokens: [
    { id: 'md3-primary', name: 'md3-primary', type: 'color', value: '#D0BCFF', category: 'semantic', theme: 'dark', description: 'M3 Primary' },
    { id: 'md3-on-primary', name: 'md3-on-primary', type: 'color', value: '#381E72', category: 'semantic', theme: 'dark', description: 'M3 On Primary' },
    { id: 'md3-surface', name: 'md3-surface', type: 'color', value: '#1C1B1F', category: 'semantic', theme: 'dark', description: 'M3 Surface' },
    { id: 'md3-on-surface', name: 'md3-on-surface', type: 'color', value: '#E6E1E5', category: 'semantic', theme: 'dark', description: 'M3 On Surface' },
    { id: 'md3-surface-variant', name: 'md3-surface-variant', type: 'color', value: '#49454F', category: 'semantic', theme: 'dark', description: 'M3 Surface Variant' },
    { id: 'md3-outline', name: 'md3-outline', type: 'color', value: '#938F99', category: 'semantic', theme: 'dark', description: 'M3 Outline' },
    { id: 'md3-secondary', name: 'md3-secondary', type: 'color', value: '#CCC2DC', category: 'semantic', theme: 'dark', description: 'M3 Secondary' },
    { id: 'md3-tertiary', name: 'md3-tertiary', type: 'color', value: '#EFB8C8', category: 'semantic', theme: 'dark', description: 'M3 Tertiary' },
    { id: 'md3-error', name: 'md3-error', type: 'color', value: '#F2B8B5', category: 'semantic', theme: 'dark', description: 'M3 Error' },
    { id: 'md3-radius-sm', name: 'md3-radius-sm', type: 'radius', value: '8px', category: 'primitive', theme: null, description: 'Small radius' },
    { id: 'md3-radius-md', name: 'md3-radius-md', type: 'radius', value: '12px', category: 'primitive', theme: null, description: 'Medium radius' },
    { id: 'md3-radius-lg', name: 'md3-radius-lg', type: 'radius', value: '16px', category: 'primitive', theme: null, description: 'Large radius' },
    { id: 'md3-radius-xl', name: 'md3-radius-xl', type: 'radius', value: '28px', category: 'primitive', theme: null, description: 'Extra-large radius' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'md3-btn-' + Date.now(),
      type: 'button',
      content: 'Filled Button',
      position: { x: 60, y: 60 },
      size: { width: 180, height: 48 },
      styles: { backgroundColor: '#D0BCFF', color: '#381E72', borderRadius: '28px', fontWeight: '500', fontSize: '14px', fontFamily: '"Roboto", sans-serif', letterSpacing: '0.1px', padding: '0 24px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      hoverStyles: { backgroundColor: '#C4AFF0', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
    },
    {
      id: 'md3-card-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 60, y: 140 },
      size: { width: 320, height: 200 },
      styles: { backgroundColor: '#2B2930', borderRadius: '12px', border: '1px solid #49454F', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
      children: [
        { id: 'md3-ct-' + Date.now(), type: 'text', content: 'Card Title', position: { x: 0, y: 0 }, size: { width: 272, height: 28 }, styles: { color: '#E6E1E5', fontSize: '22px', fontWeight: '400', fontFamily: '"Roboto", sans-serif' } },
        { id: 'md3-cd-' + Date.now(), type: 'text', content: 'Supporting text that describes the content of this card component.', position: { x: 0, y: 0 }, size: { width: 272, height: 40 }, styles: { color: '#CAC4D0', fontSize: '14px', fontWeight: '400', fontFamily: '"Roboto", sans-serif', lineHeight: '1.4' } },
        { id: 'md3-cb-' + Date.now(), type: 'button', content: 'Action', position: { x: 0, y: 0 }, size: { width: 100, height: 40 }, styles: { backgroundColor: 'transparent', color: '#D0BCFF', borderRadius: '20px', fontWeight: '500', fontSize: '14px', fontFamily: '"Roboto", sans-serif', border: 'none', padding: '0 16px' }, hoverStyles: { backgroundColor: 'rgba(208,188,255,0.08)' } },
      ],
    },
    {
      id: 'md3-input-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 370 }, size: { width: 320, height: 56 },
      styles: { backgroundColor: '#2B2930', borderRadius: '4px 4px 0 0', borderBottom: '2px solid #D0BCFF', padding: '8px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
      children: [
        { id: 'md3-il-' + Date.now(), type: 'text', content: 'Email address', position: { x: 0, y: 0 }, size: { width: 288, height: 14 }, styles: { color: '#D0BCFF', fontSize: '12px', fontWeight: '400', fontFamily: '"Roboto", sans-serif' } },
        { id: 'md3-iv-' + Date.now(), type: 'text', content: 'user@example.com', position: { x: 0, y: 0 }, size: { width: 288, height: 22 }, styles: { color: '#E6E1E5', fontSize: '16px', fontWeight: '400', fontFamily: '"Roboto", sans-serif' } },
      ],
    },
    {
      id: 'md3-chips-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 450 }, size: { width: 320, height: 40 },
      styles: { display: 'flex', gap: '8px', alignItems: 'center' },
      children: [
        { id: 'md3-ch1-' + Date.now(), type: 'button', content: 'Design', position: { x: 0, y: 0 }, size: { width: 80, height: 32 }, styles: { backgroundColor: '#4A4458', color: '#E6E1E5', borderRadius: '8px', fontSize: '14px', fontWeight: '500', fontFamily: '"Roboto", sans-serif', border: 'none', padding: '0 16px' } },
        { id: 'md3-ch2-' + Date.now(), type: 'button', content: 'Code', position: { x: 0, y: 0 }, size: { width: 70, height: 32 }, styles: { backgroundColor: 'transparent', color: '#CAC4D0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', fontFamily: '"Roboto", sans-serif', border: '1px solid #49454F', padding: '0 16px' } },
        { id: 'md3-ch3-' + Date.now(), type: 'button', content: 'Research', position: { x: 0, y: 0 }, size: { width: 90, height: 32 }, styles: { backgroundColor: 'transparent', color: '#CAC4D0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', fontFamily: '"Roboto", sans-serif', border: '1px solid #49454F', padding: '0 16px' } },
      ],
    },
    {
      id: 'md3-fab-' + Date.now(), type: 'button', content: '+', position: { x: 340, y: 300 }, size: { width: 56, height: 56 },
      styles: { backgroundColor: '#D0BCFF', color: '#381E72', borderRadius: '16px', fontSize: '28px', fontWeight: '400', fontFamily: '"Roboto", sans-serif', border: 'none', boxShadow: '0 3px 5px rgba(0,0,0,0.2), 0 6px 10px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      hoverStyles: { boxShadow: '0 5px 8px rgba(0,0,0,0.2), 0 10px 16px rgba(0,0,0,0.14)' },
    },
    {
      id: 'md3-snack-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 510 }, size: { width: 340, height: 48 },
      styles: { backgroundColor: '#2B2930', borderRadius: '4px', padding: '0 8px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 3px 5px rgba(0,0,0,0.2)' },
      children: [
        { id: 'md3-snt-' + Date.now(), type: 'text', content: 'Changes saved successfully', position: { x: 0, y: 0 }, size: { width: 200, height: 20 }, styles: { color: '#E6E1E5', fontSize: '14px', fontWeight: '400', fontFamily: '"Roboto", sans-serif' } },
        { id: 'md3-snb-' + Date.now(), type: 'button', content: 'UNDO', position: { x: 0, y: 0 }, size: { width: 60, height: 36 }, styles: { backgroundColor: 'transparent', color: '#D0BCFF', fontSize: '14px', fontWeight: '500', fontFamily: '"Roboto", sans-serif', border: 'none', letterSpacing: '0.1px' } },
      ],
    },
  ],
};

// ── Apple HIG Kit ──────────────────────────
const appleKit: StarterKit = {
  id: 'apple-hig',
  name: 'Apple HIG',
  description: 'Human Interface Guidelines tokens with SF Pro typography, vibrancy effects, and platform-native styling.',
  category: 'System',
  preview: { bg: '#000000', accent: '#0A84FF', text: '#F5F5F7' },
  tokens: [
    { id: 'hig-blue', name: 'hig-system-blue', type: 'color', value: '#0A84FF', category: 'semantic', theme: 'dark', description: 'System Blue' },
    { id: 'hig-green', name: 'hig-system-green', type: 'color', value: '#30D158', category: 'semantic', theme: 'dark', description: 'System Green' },
    { id: 'hig-red', name: 'hig-system-red', type: 'color', value: '#FF453A', category: 'semantic', theme: 'dark', description: 'System Red' },
    { id: 'hig-orange', name: 'hig-system-orange', type: 'color', value: '#FF9F0A', category: 'semantic', theme: 'dark', description: 'System Orange' },
    { id: 'hig-purple', name: 'hig-system-purple', type: 'color', value: '#BF5AF2', category: 'semantic', theme: 'dark', description: 'System Purple' },
    { id: 'hig-label', name: 'hig-label', type: 'color', value: '#F5F5F7', category: 'semantic', theme: 'dark', description: 'Primary Label' },
    { id: 'hig-label-secondary', name: 'hig-label-secondary', type: 'color', value: 'rgba(235,235,245,0.6)', category: 'semantic', theme: 'dark', description: 'Secondary Label' },
    { id: 'hig-bg', name: 'hig-background', type: 'color', value: '#000000', category: 'semantic', theme: 'dark', description: 'System Background' },
    { id: 'hig-bg-secondary', name: 'hig-background-secondary', type: 'color', value: '#1C1C1E', category: 'semantic', theme: 'dark', description: 'Secondary Background' },
    { id: 'hig-bg-tertiary', name: 'hig-background-tertiary', type: 'color', value: '#2C2C2E', category: 'semantic', theme: 'dark', description: 'Tertiary Background' },
    { id: 'hig-separator', name: 'hig-separator', type: 'color', value: 'rgba(84,84,88,0.65)', category: 'semantic', theme: 'dark', description: 'Separator' },
    { id: 'hig-radius-sm', name: 'hig-radius-sm', type: 'radius', value: '10px', category: 'primitive', theme: null, description: 'Small radius (iOS)' },
    { id: 'hig-radius-md', name: 'hig-radius-md', type: 'radius', value: '12px', category: 'primitive', theme: null, description: 'Medium radius (iOS)' },
    { id: 'hig-radius-lg', name: 'hig-radius-lg', type: 'radius', value: '20px', category: 'primitive', theme: null, description: 'Large radius (iOS)' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'hig-btn-' + Date.now(),
      type: 'button',
      content: 'Continue',
      position: { x: 60, y: 60 },
      size: { width: 320, height: 50 },
      styles: { backgroundColor: '#0A84FF', color: '#FFFFFF', borderRadius: '12px', fontWeight: '600', fontSize: '17px', fontFamily: '"SF Pro Display", -apple-system, sans-serif', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      hoverStyles: { backgroundColor: '#0070E0' },
    },
    {
      id: 'hig-list-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 60, y: 140 },
      size: { width: 320, height: 180 },
      styles: { backgroundColor: '#1C1C1E', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
      children: [
        { id: 'hig-li1-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 320, height: 44 }, styles: { display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '0.5px solid rgba(84,84,88,0.65)' }, children: [
          { id: 'hig-li1t-' + Date.now(), type: 'text', content: 'General', position: { x: 0, y: 0 }, size: { width: 200, height: 22 }, styles: { color: '#F5F5F7', fontSize: '17px', fontFamily: '"SF Pro Text", -apple-system, sans-serif' } },
        ]},
        { id: 'hig-li2-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 320, height: 44 }, styles: { display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '0.5px solid rgba(84,84,88,0.65)' }, children: [
          { id: 'hig-li2t-' + Date.now(), type: 'text', content: 'Display & Brightness', position: { x: 0, y: 0 }, size: { width: 200, height: 22 }, styles: { color: '#F5F5F7', fontSize: '17px', fontFamily: '"SF Pro Text", -apple-system, sans-serif' } },
        ]},
        { id: 'hig-li3-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 320, height: 44 }, styles: { display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '0.5px solid rgba(84,84,88,0.65)' }, children: [
          { id: 'hig-li3t-' + Date.now(), type: 'text', content: 'Accessibility', position: { x: 0, y: 0 }, size: { width: 200, height: 22 }, styles: { color: '#F5F5F7', fontSize: '17px', fontFamily: '"SF Pro Text", -apple-system, sans-serif' } },
        ]},
        { id: 'hig-li4-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 320, height: 44 }, styles: { display: 'flex', alignItems: 'center', padding: '0 16px' }, children: [
          { id: 'hig-li4t-' + Date.now(), type: 'text', content: 'Privacy & Security', position: { x: 0, y: 0 }, size: { width: 200, height: 22 }, styles: { color: '#F5F5F7', fontSize: '17px', fontFamily: '"SF Pro Text", -apple-system, sans-serif' } },
        ]},
      ],
    },
    {
      id: 'hig-search-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 350 }, size: { width: 320, height: 36 },
      styles: { backgroundColor: '#1C1C1E', borderRadius: '10px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px' },
      children: [
        { id: 'hig-si-' + Date.now(), type: 'text', content: '🔍', position: { x: 0, y: 0 }, size: { width: 20, height: 20 }, styles: { fontSize: '14px', opacity: '0.5' } },
        { id: 'hig-sp-' + Date.now(), type: 'text', content: 'Search', position: { x: 0, y: 0 }, size: { width: 260, height: 20 }, styles: { color: 'rgba(235,235,245,0.3)', fontSize: '17px', fontFamily: '"SF Pro Text", -apple-system, sans-serif' } },
      ],
    },
    {
      id: 'hig-toggle-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 400 }, size: { width: 320, height: 88 },
      styles: { backgroundColor: '#1C1C1E', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
      children: [
        { id: 'hig-tr1-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 320, height: 44 }, styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '0.5px solid rgba(84,84,88,0.65)' }, children: [
          { id: 'hig-tr1l-' + Date.now(), type: 'text', content: 'Airplane Mode', position: { x: 0, y: 0 }, size: { width: 200, height: 22 }, styles: { color: '#F5F5F7', fontSize: '17px', fontFamily: '"SF Pro Text", -apple-system, sans-serif' } },
          { id: 'hig-tr1t-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 51, height: 31 }, styles: { backgroundColor: '#30D158', borderRadius: '16px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }, children: [
            { id: 'hig-tr1k-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 27, height: 27 }, styles: { backgroundColor: '#FFFFFF', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' } },
          ]},
        ]},
        { id: 'hig-tr2-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 320, height: 44 }, styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }, children: [
          { id: 'hig-tr2l-' + Date.now(), type: 'text', content: 'Wi-Fi', position: { x: 0, y: 0 }, size: { width: 200, height: 22 }, styles: { color: '#F5F5F7', fontSize: '17px', fontFamily: '"SF Pro Text", -apple-system, sans-serif' } },
          { id: 'hig-tr2v-' + Date.now(), type: 'text', content: 'Home Network ›', position: { x: 0, y: 0 }, size: { width: 120, height: 22 }, styles: { color: 'rgba(235,235,245,0.6)', fontSize: '17px', fontFamily: '"SF Pro Text", -apple-system, sans-serif', textAlign: 'right' } },
        ]},
      ],
    },
    {
      id: 'hig-seg-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 510 }, size: { width: 320, height: 32 },
      styles: { backgroundColor: '#1C1C1E', borderRadius: '8px', padding: '2px', display: 'flex', gap: '0px' },
      children: [
        { id: 'hig-sg1-' + Date.now(), type: 'button', content: 'Hourly', position: { x: 0, y: 0 }, size: { width: 105, height: 28 }, styles: { backgroundColor: '#636366', color: '#FFFFFF', borderRadius: '7px', fontSize: '13px', fontWeight: '600', fontFamily: '"SF Pro Text", -apple-system, sans-serif', border: 'none' } },
        { id: 'hig-sg2-' + Date.now(), type: 'button', content: 'Daily', position: { x: 0, y: 0 }, size: { width: 105, height: 28 }, styles: { backgroundColor: 'transparent', color: 'rgba(235,235,245,0.6)', borderRadius: '7px', fontSize: '13px', fontWeight: '500', fontFamily: '"SF Pro Text", -apple-system, sans-serif', border: 'none' } },
        { id: 'hig-sg3-' + Date.now(), type: 'button', content: 'Weekly', position: { x: 0, y: 0 }, size: { width: 106, height: 28 }, styles: { backgroundColor: 'transparent', color: 'rgba(235,235,245,0.6)', borderRadius: '7px', fontSize: '13px', fontWeight: '500', fontFamily: '"SF Pro Text", -apple-system, sans-serif', border: 'none' } },
      ],
    },
    {
      id: 'hig-tab-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 565 }, size: { width: 320, height: 50 },
      styles: { backgroundColor: 'rgba(30,30,30,0.9)', borderRadius: '0px', borderTop: '0.5px solid rgba(84,84,88,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 0', backdropFilter: 'blur(20px)' },
      children: [
        { id: 'hig-tb1-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 64, height: 38 }, styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }, children: [
          { id: 'hig-tb1i-' + Date.now(), type: 'text', content: '⭐', position: { x: 0, y: 0 }, size: { width: 24, height: 20 }, styles: { fontSize: '16px', textAlign: 'center' } },
          { id: 'hig-tb1l-' + Date.now(), type: 'text', content: 'Featured', position: { x: 0, y: 0 }, size: { width: 64, height: 14 }, styles: { color: '#0A84FF', fontSize: '10px', fontWeight: '500', fontFamily: '"SF Pro Text", -apple-system, sans-serif', textAlign: 'center' } },
        ]},
        { id: 'hig-tb2-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 64, height: 38 }, styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }, children: [
          { id: 'hig-tb2i-' + Date.now(), type: 'text', content: '🔍', position: { x: 0, y: 0 }, size: { width: 24, height: 20 }, styles: { fontSize: '16px', textAlign: 'center' } },
          { id: 'hig-tb2l-' + Date.now(), type: 'text', content: 'Search', position: { x: 0, y: 0 }, size: { width: 64, height: 14 }, styles: { color: 'rgba(235,235,245,0.6)', fontSize: '10px', fontWeight: '500', fontFamily: '"SF Pro Text", -apple-system, sans-serif', textAlign: 'center' } },
        ]},
        { id: 'hig-tb3-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 64, height: 38 }, styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }, children: [
          { id: 'hig-tb3i-' + Date.now(), type: 'text', content: '📱', position: { x: 0, y: 0 }, size: { width: 24, height: 20 }, styles: { fontSize: '16px', textAlign: 'center' } },
          { id: 'hig-tb3l-' + Date.now(), type: 'text', content: 'Apps', position: { x: 0, y: 0 }, size: { width: 64, height: 14 }, styles: { color: 'rgba(235,235,245,0.6)', fontSize: '10px', fontWeight: '500', fontFamily: '"SF Pro Text", -apple-system, sans-serif', textAlign: 'center' } },
        ]},
      ],
    },
  ],
};

// ── SaaS Dashboard Kit ──────────────────────────
const saasKit: StarterKit = {
  id: 'saas-dashboard',
  name: 'SaaS Dashboard',
  description: 'Enterprise-ready dashboard tokens with stat cards, data tables, sidebar nav, and metric visualization components.',
  category: 'Industry',
  preview: { bg: '#0F172A', accent: '#3B82F6', text: '#E2E8F0' },
  tokens: [
    { id: 'saas-primary', name: 'saas-primary', type: 'color', value: '#3B82F6', category: 'semantic', theme: 'dark', description: 'Primary Blue' },
    { id: 'saas-success', name: 'saas-success', type: 'color', value: '#22C55E', category: 'semantic', theme: 'dark', description: 'Success Green' },
    { id: 'saas-warning', name: 'saas-warning', type: 'color', value: '#F59E0B', category: 'semantic', theme: 'dark', description: 'Warning Amber' },
    { id: 'saas-danger', name: 'saas-danger', type: 'color', value: '#EF4444', category: 'semantic', theme: 'dark', description: 'Danger Red' },
    { id: 'saas-bg', name: 'saas-background', type: 'color', value: '#0F172A', category: 'semantic', theme: 'dark', description: 'Background' },
    { id: 'saas-card', name: 'saas-card', type: 'color', value: '#1E293B', category: 'semantic', theme: 'dark', description: 'Card Background' },
    { id: 'saas-border', name: 'saas-border', type: 'color', value: '#334155', category: 'semantic', theme: 'dark', description: 'Border' },
    { id: 'saas-text', name: 'saas-text-primary', type: 'color', value: '#E2E8F0', category: 'semantic', theme: 'dark', description: 'Primary Text' },
    { id: 'saas-text-muted', name: 'saas-text-muted', type: 'color', value: '#94A3B8', category: 'semantic', theme: 'dark', description: 'Muted Text' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'saas-stat-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 60, y: 60 },
      size: { width: 240, height: 120 },
      styles: { backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
      children: [
        { id: 'saas-sl-' + Date.now(), type: 'text', content: 'Total Revenue', position: { x: 0, y: 0 }, size: { width: 200, height: 18 }, styles: { color: '#94A3B8', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
        { id: 'saas-sv-' + Date.now(), type: 'text', content: '$45,231.89', position: { x: 0, y: 0 }, size: { width: 200, height: 32 }, styles: { color: '#E2E8F0', fontSize: '28px', fontWeight: '700', fontFamily: '"Inter", sans-serif', letterSpacing: '-0.02em' } },
        { id: 'saas-sc-' + Date.now(), type: 'text', content: '+20.1% from last month', position: { x: 0, y: 0 }, size: { width: 200, height: 16 }, styles: { color: '#22C55E', fontSize: '12px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
      ],
    },
    {
      id: 'saas-nav-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 60, y: 210 },
      size: { width: 220, height: 200 },
      styles: { backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' },
      children: [
        { id: 'saas-n1-' + Date.now(), type: 'button', content: '📊  Dashboard', position: { x: 0, y: 0 }, size: { width: 196, height: 36 }, styles: { backgroundColor: '#3B82F6', color: '#FFFFFF', borderRadius: '8px', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif', textAlign: 'left', padding: '0 12px', border: 'none' } },
        { id: 'saas-n2-' + Date.now(), type: 'button', content: '👥  Customers', position: { x: 0, y: 0 }, size: { width: 196, height: 36 }, styles: { backgroundColor: 'transparent', color: '#94A3B8', borderRadius: '8px', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif', textAlign: 'left', padding: '0 12px', border: 'none' }, hoverStyles: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#E2E8F0' } },
        { id: 'saas-n3-' + Date.now(), type: 'button', content: '📦  Products', position: { x: 0, y: 0 }, size: { width: 196, height: 36 }, styles: { backgroundColor: 'transparent', color: '#94A3B8', borderRadius: '8px', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif', textAlign: 'left', padding: '0 12px', border: 'none' }, hoverStyles: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#E2E8F0' } },
        { id: 'saas-n4-' + Date.now(), type: 'button', content: '⚙️  Settings', position: { x: 0, y: 0 }, size: { width: 196, height: 36 }, styles: { backgroundColor: 'transparent', color: '#94A3B8', borderRadius: '8px', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif', textAlign: 'left', padding: '0 12px', border: 'none' }, hoverStyles: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#E2E8F0' } },
      ],
    },
    {
      id: 'saas-table-' + Date.now(), type: 'div', content: '', position: { x: 310, y: 60 }, size: { width: 400, height: 180 },
      styles: { backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
      children: [
        { id: 'saas-th-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 400, height: 40 }, styles: { display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #334155', backgroundColor: '#1a2235' }, children: [
          { id: 'saas-th1-' + Date.now(), type: 'text', content: 'Customer', position: { x: 0, y: 0 }, size: { width: 140, height: 16 }, styles: { color: '#94A3B8', fontSize: '12px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-th2-' + Date.now(), type: 'text', content: 'Status', position: { x: 0, y: 0 }, size: { width: 80, height: 16 }, styles: { color: '#94A3B8', fontSize: '12px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-th3-' + Date.now(), type: 'text', content: 'Amount', position: { x: 0, y: 0 }, size: { width: 80, height: 16 }, styles: { color: '#94A3B8', fontSize: '12px', fontWeight: '600', fontFamily: '"Inter", sans-serif', textAlign: 'right' } },
        ]},
        { id: 'saas-tr1-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 400, height: 46 }, styles: { display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #334155' }, children: [
          { id: 'saas-tr1n-' + Date.now(), type: 'text', content: 'Olivia Martin', position: { x: 0, y: 0 }, size: { width: 140, height: 16 }, styles: { color: '#E2E8F0', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-tr1s-' + Date.now(), type: 'text', content: '● Active', position: { x: 0, y: 0 }, size: { width: 80, height: 16 }, styles: { color: '#22C55E', fontSize: '12px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-tr1a-' + Date.now(), type: 'text', content: '$1,999', position: { x: 0, y: 0 }, size: { width: 80, height: 16 }, styles: { color: '#E2E8F0', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif', textAlign: 'right' } },
        ]},
        { id: 'saas-tr2-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 400, height: 46 }, styles: { display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #334155' }, children: [
          { id: 'saas-tr2n-' + Date.now(), type: 'text', content: 'Jackson Lee', position: { x: 0, y: 0 }, size: { width: 140, height: 16 }, styles: { color: '#E2E8F0', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-tr2s-' + Date.now(), type: 'text', content: '● Pending', position: { x: 0, y: 0 }, size: { width: 80, height: 16 }, styles: { color: '#F59E0B', fontSize: '12px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-tr2a-' + Date.now(), type: 'text', content: '$3,450', position: { x: 0, y: 0 }, size: { width: 80, height: 16 }, styles: { color: '#E2E8F0', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif', textAlign: 'right' } },
        ]},
        { id: 'saas-tr3-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 400, height: 46 }, styles: { display: 'flex', alignItems: 'center', padding: '0 16px' }, children: [
          { id: 'saas-tr3n-' + Date.now(), type: 'text', content: 'Isabella Nguyen', position: { x: 0, y: 0 }, size: { width: 140, height: 16 }, styles: { color: '#E2E8F0', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-tr3s-' + Date.now(), type: 'text', content: '● Churned', position: { x: 0, y: 0 }, size: { width: 80, height: 16 }, styles: { color: '#EF4444', fontSize: '12px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-tr3a-' + Date.now(), type: 'text', content: '$899', position: { x: 0, y: 0 }, size: { width: 80, height: 16 }, styles: { color: '#E2E8F0', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif', textAlign: 'right' } },
        ]},
      ],
    },
    {
      id: 'saas-search-' + Date.now(), type: 'div', content: '', position: { x: 310, y: 260 }, size: { width: 400, height: 40 },
      styles: { backgroundColor: '#1E293B', borderRadius: '8px', border: '1px solid #334155', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px' },
      children: [
        { id: 'saas-sri-' + Date.now(), type: 'text', content: '🔍', position: { x: 0, y: 0 }, size: { width: 16, height: 16 }, styles: { fontSize: '14px', opacity: '0.5' } },
        { id: 'saas-srp-' + Date.now(), type: 'text', content: 'Search customers, invoices...', position: { x: 0, y: 0 }, size: { width: 300, height: 18 }, styles: { color: '#64748B', fontSize: '13px', fontFamily: '"Inter", sans-serif' } },
        { id: 'saas-srk-' + Date.now(), type: 'text', content: '⌘K', position: { x: 0, y: 0 }, size: { width: 30, height: 20 }, styles: { color: '#475569', fontSize: '11px', fontWeight: '500', fontFamily: '"Inter", sans-serif', backgroundColor: '#0F172A', borderRadius: '4px', padding: '2px 6px', textAlign: 'center' } },
      ],
    },
    {
      id: 'saas-metrics-' + Date.now(), type: 'div', content: '', position: { x: 310, y: 320 }, size: { width: 400, height: 80 },
      styles: { display: 'flex', gap: '12px' },
      children: [
        { id: 'saas-m1-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 125, height: 80 }, styles: { backgroundColor: '#1E293B', borderRadius: '10px', border: '1px solid #334155', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }, children: [
          { id: 'saas-m1l-' + Date.now(), type: 'text', content: 'MRR', position: { x: 0, y: 0 }, size: { width: 97, height: 14 }, styles: { color: '#94A3B8', fontSize: '11px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-m1v-' + Date.now(), type: 'text', content: '$12.4K', position: { x: 0, y: 0 }, size: { width: 97, height: 24 }, styles: { color: '#E2E8F0', fontSize: '20px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
        ]},
        { id: 'saas-m2-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 125, height: 80 }, styles: { backgroundColor: '#1E293B', borderRadius: '10px', border: '1px solid #334155', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }, children: [
          { id: 'saas-m2l-' + Date.now(), type: 'text', content: 'Churn', position: { x: 0, y: 0 }, size: { width: 97, height: 14 }, styles: { color: '#94A3B8', fontSize: '11px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-m2v-' + Date.now(), type: 'text', content: '2.4%', position: { x: 0, y: 0 }, size: { width: 97, height: 24 }, styles: { color: '#EF4444', fontSize: '20px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
        ]},
        { id: 'saas-m3-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 125, height: 80 }, styles: { backgroundColor: '#1E293B', borderRadius: '10px', border: '1px solid #334155', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }, children: [
          { id: 'saas-m3l-' + Date.now(), type: 'text', content: 'NPS', position: { x: 0, y: 0 }, size: { width: 97, height: 14 }, styles: { color: '#94A3B8', fontSize: '11px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'saas-m3v-' + Date.now(), type: 'text', content: '72', position: { x: 0, y: 0 }, size: { width: 97, height: 24 }, styles: { color: '#22C55E', fontSize: '20px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
        ]},
      ],
    },
  ],
};

// ── E-Commerce Kit ──────────────────────────
const ecomKit: StarterKit = {
  id: 'ecom-store',
  name: 'E-Commerce',
  description: 'Storefront-ready components with product cards, price badges, cart elements, and checkout flows.',
  category: 'Industry',
  preview: { bg: '#FAFAF9', accent: '#16A34A', text: '#1C1917' },
  tokens: [
    { id: 'ecom-green', name: 'ecom-accent', type: 'color', value: '#16A34A', category: 'semantic', theme: 'light', description: 'Accent Green' },
    { id: 'ecom-bg', name: 'ecom-background', type: 'color', value: '#FAFAF9', category: 'semantic', theme: 'light', description: 'Background' },
    { id: 'ecom-card', name: 'ecom-card', type: 'color', value: '#FFFFFF', category: 'semantic', theme: 'light', description: 'Card Background' },
    { id: 'ecom-text', name: 'ecom-text', type: 'color', value: '#1C1917', category: 'semantic', theme: 'light', description: 'Primary Text' },
    { id: 'ecom-muted', name: 'ecom-text-muted', type: 'color', value: '#78716C', category: 'semantic', theme: 'light', description: 'Muted Text' },
    { id: 'ecom-price', name: 'ecom-price', type: 'color', value: '#DC2626', category: 'semantic', theme: 'light', description: 'Sale Price' },
    { id: 'ecom-border', name: 'ecom-border', type: 'color', value: '#E7E5E4', category: 'semantic', theme: 'light', description: 'Border' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'ecom-product-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 60, y: 60 },
      size: { width: 260, height: 340 },
      styles: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E7E5E4', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
      children: [
        { id: 'ecom-img-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 260, height: 200 }, styles: { backgroundColor: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A29E', fontSize: '12px' } },
        { id: 'ecom-body-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 260, height: 140 }, styles: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }, children: [
          { id: 'ecom-pn-' + Date.now(), type: 'text', content: 'Classic Cotton T-Shirt', position: { x: 0, y: 0 }, size: { width: 228, height: 22 }, styles: { color: '#1C1917', fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'ecom-pp-' + Date.now(), type: 'text', content: '$29.99', position: { x: 0, y: 0 }, size: { width: 228, height: 20 }, styles: { color: '#1C1917', fontSize: '18px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
          { id: 'ecom-btn-' + Date.now(), type: 'button', content: 'Add to Cart', position: { x: 0, y: 0 }, size: { width: 228, height: 40 }, styles: { backgroundColor: '#16A34A', color: '#FFFFFF', borderRadius: '8px', fontWeight: '600', fontSize: '14px', fontFamily: '"Inter", sans-serif', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }, hoverStyles: { backgroundColor: '#15803D' } },
        ]},
      ],
    },
    {
      id: 'ecom-cart-' + Date.now(), type: 'div', content: '', position: { x: 350, y: 60 }, size: { width: 340, height: 100 },
      styles: { backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E7E5E4', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' },
      children: [
        { id: 'ecom-ci-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 76, height: 76 }, styles: { backgroundColor: '#F5F5F4', borderRadius: '8px' } },
        { id: 'ecom-cd-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 200, height: 76 }, styles: { display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }, children: [
          { id: 'ecom-cn-' + Date.now(), type: 'text', content: 'Classic Cotton T-Shirt', position: { x: 0, y: 0 }, size: { width: 200, height: 18 }, styles: { color: '#1C1917', fontSize: '14px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'ecom-cs-' + Date.now(), type: 'text', content: 'Size: M  •  Color: Black', position: { x: 0, y: 0 }, size: { width: 200, height: 16 }, styles: { color: '#78716C', fontSize: '12px', fontFamily: '"Inter", sans-serif' } },
          { id: 'ecom-cb-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 200, height: 28 }, styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [
            { id: 'ecom-cp-' + Date.now(), type: 'text', content: '$29.99', position: { x: 0, y: 0 }, size: { width: 60, height: 20 }, styles: { color: '#1C1917', fontSize: '15px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
            { id: 'ecom-cq-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 90, height: 28 }, styles: { display: 'flex', alignItems: 'center', gap: '0px', borderRadius: '6px', border: '1px solid #E7E5E4', overflow: 'hidden' }, children: [
              { id: 'ecom-cqm-' + Date.now(), type: 'button', content: '−', position: { x: 0, y: 0 }, size: { width: 28, height: 26 }, styles: { backgroundColor: '#FAFAF9', color: '#1C1917', fontSize: '14px', border: 'none', fontWeight: '500' } },
              { id: 'ecom-cqv-' + Date.now(), type: 'text', content: '1', position: { x: 0, y: 0 }, size: { width: 32, height: 26 }, styles: { color: '#1C1917', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif', textAlign: 'center' } },
              { id: 'ecom-cqp-' + Date.now(), type: 'button', content: '+', position: { x: 0, y: 0 }, size: { width: 28, height: 26 }, styles: { backgroundColor: '#FAFAF9', color: '#1C1917', fontSize: '14px', border: 'none', fontWeight: '500' } },
            ]},
          ]},
        ]},
      ],
    },
    {
      id: 'ecom-review-' + Date.now(), type: 'div', content: '', position: { x: 350, y: 180 }, size: { width: 340, height: 90 },
      styles: { backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E7E5E4', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
      children: [
        { id: 'ecom-rs-' + Date.now(), type: 'text', content: '⭐⭐⭐⭐⭐', position: { x: 0, y: 0 }, size: { width: 308, height: 20 }, styles: { fontSize: '16px' } },
        { id: 'ecom-rt-' + Date.now(), type: 'text', content: 'Great quality, fits perfectly!', position: { x: 0, y: 0 }, size: { width: 308, height: 18 }, styles: { color: '#1C1917', fontSize: '14px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
        { id: 'ecom-rm-' + Date.now(), type: 'text', content: 'Sarah K.  •  Verified Purchase  •  2 days ago', position: { x: 0, y: 0 }, size: { width: 308, height: 14 }, styles: { color: '#A8A29E', fontSize: '12px', fontFamily: '"Inter", sans-serif' } },
      ],
    },
    {
      id: 'ecom-bread-' + Date.now(), type: 'div', content: '', position: { x: 350, y: 290 }, size: { width: 340, height: 24 },
      styles: { display: 'flex', alignItems: 'center', gap: '6px' },
      children: [
        { id: 'ecom-br1-' + Date.now(), type: 'text', content: 'Home', position: { x: 0, y: 0 }, size: { width: 36, height: 16 }, styles: { color: '#78716C', fontSize: '13px', fontFamily: '"Inter", sans-serif' } },
        { id: 'ecom-brs1-' + Date.now(), type: 'text', content: '/', position: { x: 0, y: 0 }, size: { width: 8, height: 16 }, styles: { color: '#D6D3D1', fontSize: '13px' } },
        { id: 'ecom-br2-' + Date.now(), type: 'text', content: 'Men', position: { x: 0, y: 0 }, size: { width: 30, height: 16 }, styles: { color: '#78716C', fontSize: '13px', fontFamily: '"Inter", sans-serif' } },
        { id: 'ecom-brs2-' + Date.now(), type: 'text', content: '/', position: { x: 0, y: 0 }, size: { width: 8, height: 16 }, styles: { color: '#D6D3D1', fontSize: '13px' } },
        { id: 'ecom-br3-' + Date.now(), type: 'text', content: 'T-Shirts', position: { x: 0, y: 0 }, size: { width: 56, height: 16 }, styles: { color: '#1C1917', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
      ],
    },
  ],
};

// ── Minimal / Portfolio Kit ──────────────────────────
const minimalKit: StarterKit = {
  id: 'minimal-portfolio',
  name: 'Minimal Portfolio',
  description: 'Clean, typography-focused design for portfolios and personal websites with generous whitespace.',
  category: 'Style',
  preview: { bg: '#FFFFFF', accent: '#000000', text: '#111111' },
  tokens: [
    { id: 'min-black', name: 'min-primary', type: 'color', value: '#000000', category: 'semantic', theme: 'light', description: 'Primary Black' },
    { id: 'min-white', name: 'min-background', type: 'color', value: '#FFFFFF', category: 'semantic', theme: 'light', description: 'Background White' },
    { id: 'min-gray', name: 'min-muted', type: 'color', value: '#6B7280', category: 'semantic', theme: 'light', description: 'Muted Text' },
    { id: 'min-light', name: 'min-light', type: 'color', value: '#F3F4F6', category: 'semantic', theme: 'light', description: 'Light Background' },
    { id: 'min-border', name: 'min-border', type: 'color', value: '#E5E7EB', category: 'semantic', theme: 'light', description: 'Border' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'min-hero-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 60, y: 60 },
      size: { width: 400, height: 200 },
      styles: { backgroundColor: '#FFFFFF', padding: '48px', display: 'flex', flexDirection: 'column', gap: '16px' },
      children: [
        { id: 'min-ht-' + Date.now(), type: 'text', content: 'Designer & Developer', position: { x: 0, y: 0 }, size: { width: 304, height: 14 }, styles: { color: '#6B7280', fontSize: '12px', fontWeight: '500', fontFamily: '"Inter", sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' } },
        { id: 'min-hh-' + Date.now(), type: 'text', content: 'Creating thoughtful\ndigital experiences.', position: { x: 0, y: 0 }, size: { width: 304, height: 80 }, styles: { color: '#111111', fontSize: '36px', fontWeight: '300', fontFamily: '"Inter", sans-serif', lineHeight: '1.2', letterSpacing: '-0.02em' } },
        { id: 'min-hb-' + Date.now(), type: 'button', content: 'View Work →', position: { x: 0, y: 0 }, size: { width: 120, height: 40 }, styles: { backgroundColor: '#000000', color: '#FFFFFF', borderRadius: '0px', fontWeight: '500', fontSize: '14px', fontFamily: '"Inter", sans-serif', border: 'none', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }, hoverStyles: { backgroundColor: '#333333' } },
      ],
    },
    {
      id: 'min-proj-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 290 }, size: { width: 400, height: 120 },
      styles: { backgroundColor: '#FFFFFF', padding: '24px 0', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '24px', alignItems: 'center' },
      children: [
        { id: 'min-pi-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 160, height: 96 }, styles: { backgroundColor: '#F3F4F6', borderRadius: '4px' } },
        { id: 'min-pd-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 200, height: 96 }, styles: { display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }, children: [
          { id: 'min-pt-' + Date.now(), type: 'text', content: 'Brand Identity', position: { x: 0, y: 0 }, size: { width: 200, height: 20 }, styles: { color: '#111111', fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'min-ps-' + Date.now(), type: 'text', content: 'Visual identity system for a sustainable fashion label', position: { x: 0, y: 0 }, size: { width: 200, height: 32 }, styles: { color: '#6B7280', fontSize: '13px', fontFamily: '"Inter", sans-serif', lineHeight: '1.4' } },
          { id: 'min-py-' + Date.now(), type: 'text', content: '2025', position: { x: 0, y: 0 }, size: { width: 200, height: 14 }, styles: { color: '#9CA3AF', fontSize: '12px', fontFamily: '"Inter", sans-serif' } },
        ]},
      ],
    },
    {
      id: 'min-nav-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 440 }, size: { width: 400, height: 40 },
      styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', padding: '0 0 12px 0' },
      children: [
        { id: 'min-logo-' + Date.now(), type: 'text', content: 'STUDIO', position: { x: 0, y: 0 }, size: { width: 80, height: 20 }, styles: { color: '#111111', fontSize: '14px', fontWeight: '700', fontFamily: '"Inter", sans-serif', letterSpacing: '0.15em' } },
        { id: 'min-links-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 240, height: 20 }, styles: { display: 'flex', gap: '24px', justifyContent: 'flex-end' }, children: [
          { id: 'min-nl1-' + Date.now(), type: 'text', content: 'Work', position: { x: 0, y: 0 }, size: { width: 36, height: 18 }, styles: { color: '#111111', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
          { id: 'min-nl2-' + Date.now(), type: 'text', content: 'About', position: { x: 0, y: 0 }, size: { width: 40, height: 18 }, styles: { color: '#6B7280', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
          { id: 'min-nl3-' + Date.now(), type: 'text', content: 'Contact', position: { x: 0, y: 0 }, size: { width: 50, height: 18 }, styles: { color: '#6B7280', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
        ]},
      ],
    },
  ],
};

// ── Fintech / Banking Kit ──────────────────────────
const fintechKit: StarterKit = {
  id: 'fintech-banking',
  name: 'Fintech',
  description: 'Banking and finance UI with account cards, transaction lists, and metric displays.',
  category: 'Industry',
  preview: { bg: '#0A1628', accent: '#00D4AA', text: '#E0E7EF' },
  tokens: [
    { id: 'fin-mint', name: 'fin-accent', type: 'color', value: '#00D4AA', category: 'semantic', theme: 'dark', description: 'Accent Mint' },
    { id: 'fin-blue', name: 'fin-primary', type: 'color', value: '#2563EB', category: 'semantic', theme: 'dark', description: 'Primary Blue' },
    { id: 'fin-bg', name: 'fin-background', type: 'color', value: '#0A1628', category: 'semantic', theme: 'dark', description: 'Background' },
    { id: 'fin-card', name: 'fin-card', type: 'color', value: '#111D33', category: 'semantic', theme: 'dark', description: 'Card Background' },
    { id: 'fin-text', name: 'fin-text', type: 'color', value: '#E0E7EF', category: 'semantic', theme: 'dark', description: 'Primary Text' },
    { id: 'fin-muted', name: 'fin-muted', type: 'color', value: '#6B7F99', category: 'semantic', theme: 'dark', description: 'Muted Text' },
    { id: 'fin-positive', name: 'fin-positive', type: 'color', value: '#00D4AA', category: 'semantic', theme: 'dark', description: 'Positive / Gain' },
    { id: 'fin-negative', name: 'fin-negative', type: 'color', value: '#FF4D6A', category: 'semantic', theme: 'dark', description: 'Negative / Loss' },
    { id: 'fin-border', name: 'fin-border', type: 'color', value: '#1A2A44', category: 'semantic', theme: 'dark', description: 'Border' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'fin-balance-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 60 }, size: { width: 320, height: 180 },
      styles: { background: 'linear-gradient(135deg, #1A2A44 0%, #0A1628 100%)', borderRadius: '16px', border: '1px solid #1A2A44', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
      children: [
        { id: 'fin-bl-' + Date.now(), type: 'text', content: 'Total Balance', position: { x: 0, y: 0 }, size: { width: 272, height: 16 }, styles: { color: '#6B7F99', fontSize: '13px', fontWeight: '500', fontFamily: '"Inter", sans-serif', letterSpacing: '0.05em' } },
        { id: 'fin-bv-' + Date.now(), type: 'text', content: '$84,230.52', position: { x: 0, y: 0 }, size: { width: 272, height: 40 }, styles: { color: '#E0E7EF', fontSize: '36px', fontWeight: '700', fontFamily: '"Inter", sans-serif', letterSpacing: '-0.02em' } },
        { id: 'fin-bc-' + Date.now(), type: 'text', content: '↑ +12.4% this month', position: { x: 0, y: 0 }, size: { width: 272, height: 16 }, styles: { color: '#00D4AA', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
        { id: 'fin-bb-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 272, height: 36 }, styles: { display: 'flex', gap: '8px', marginTop: '4px' }, children: [
          { id: 'fin-bb1-' + Date.now(), type: 'button', content: 'Send', position: { x: 0, y: 0 }, size: { width: 80, height: 36 }, styles: { backgroundColor: '#2563EB', color: '#FFFFFF', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif', border: 'none' } },
          { id: 'fin-bb2-' + Date.now(), type: 'button', content: 'Receive', position: { x: 0, y: 0 }, size: { width: 80, height: 36 }, styles: { backgroundColor: 'rgba(37,99,235,0.15)', color: '#2563EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif', border: '1px solid rgba(37,99,235,0.3)' } },
        ]},
      ],
    },
    {
      id: 'fin-tx-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 270 }, size: { width: 320, height: 160 },
      styles: { backgroundColor: '#111D33', borderRadius: '12px', border: '1px solid #1A2A44', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
      children: [
        { id: 'fin-txh-' + Date.now(), type: 'text', content: 'Recent Transactions', position: { x: 0, y: 0 }, size: { width: 288, height: 18 }, styles: { color: '#E0E7EF', fontSize: '14px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
        { id: 'fin-tx1-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 288, height: 36 }, styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [
          { id: 'fin-tx1n-' + Date.now(), type: 'text', content: 'Spotify Premium', position: { x: 0, y: 0 }, size: { width: 180, height: 18 }, styles: { color: '#E0E7EF', fontSize: '13px', fontFamily: '"Inter", sans-serif' } },
          { id: 'fin-tx1v-' + Date.now(), type: 'text', content: '-$9.99', position: { x: 0, y: 0 }, size: { width: 80, height: 18 }, styles: { color: '#FF4D6A', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif', textAlign: 'right' } },
        ]},
        { id: 'fin-tx2-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 288, height: 36 }, styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [
          { id: 'fin-tx2n-' + Date.now(), type: 'text', content: 'Salary Deposit', position: { x: 0, y: 0 }, size: { width: 180, height: 18 }, styles: { color: '#E0E7EF', fontSize: '13px', fontFamily: '"Inter", sans-serif' } },
          { id: 'fin-tx2v-' + Date.now(), type: 'text', content: '+$4,500.00', position: { x: 0, y: 0 }, size: { width: 80, height: 18 }, styles: { color: '#00D4AA', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif', textAlign: 'right' } },
        ]},
      ],
    },
  ],
};

// ── Social / Feed Kit ──────────────────────────
const socialKit: StarterKit = {
  id: 'social-feed',
  name: 'Social Feed',
  description: 'Social media components with post cards, avatars, engagement bars, and story rings.',
  category: 'Industry',
  preview: { bg: '#000000', accent: '#E1306C', text: '#FAFAFA' },
  tokens: [
    { id: 'soc-pink', name: 'soc-accent', type: 'color', value: '#E1306C', category: 'semantic', theme: 'dark', description: 'Accent Pink' },
    { id: 'soc-blue', name: 'soc-link', type: 'color', value: '#0095F6', category: 'semantic', theme: 'dark', description: 'Link Blue' },
    { id: 'soc-bg', name: 'soc-background', type: 'color', value: '#000000', category: 'semantic', theme: 'dark', description: 'Background' },
    { id: 'soc-card', name: 'soc-card', type: 'color', value: '#121212', category: 'semantic', theme: 'dark', description: 'Card' },
    { id: 'soc-text', name: 'soc-text', type: 'color', value: '#FAFAFA', category: 'semantic', theme: 'dark', description: 'Text' },
    { id: 'soc-muted', name: 'soc-muted', type: 'color', value: '#8E8E8E', category: 'semantic', theme: 'dark', description: 'Muted' },
    { id: 'soc-border', name: 'soc-border', type: 'color', value: '#262626', category: 'semantic', theme: 'dark', description: 'Border' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'soc-post-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 60 }, size: { width: 360, height: 280 },
      styles: { backgroundColor: '#121212', borderRadius: '0px', border: '1px solid #262626', display: 'flex', flexDirection: 'column' },
      children: [
        { id: 'soc-ph-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 360, height: 56 }, styles: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }, children: [
          { id: 'soc-av-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 32, height: 32 }, styles: { borderRadius: '50%', background: 'linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)', padding: '2px' }, children: [
            { id: 'soc-avi-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 28, height: 28 }, styles: { borderRadius: '50%', backgroundColor: '#333', border: '2px solid #121212' } },
          ]},
          { id: 'soc-un-' + Date.now(), type: 'text', content: 'designstudio', position: { x: 0, y: 0 }, size: { width: 200, height: 18 }, styles: { color: '#FAFAFA', fontSize: '14px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
        ]},
        { id: 'soc-img-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 360, height: 140 }, styles: { backgroundColor: '#1a1a1a' } },
        { id: 'soc-eng-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 360, height: 44 }, styles: { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px' }, children: [
          { id: 'soc-like-' + Date.now(), type: 'text', content: '♡', position: { x: 0, y: 0 }, size: { width: 24, height: 24 }, styles: { color: '#FAFAFA', fontSize: '22px' } },
          { id: 'soc-cmt-' + Date.now(), type: 'text', content: '💬', position: { x: 0, y: 0 }, size: { width: 24, height: 24 }, styles: { color: '#FAFAFA', fontSize: '18px' } },
          { id: 'soc-shr-' + Date.now(), type: 'text', content: '↗', position: { x: 0, y: 0 }, size: { width: 24, height: 24 }, styles: { color: '#FAFAFA', fontSize: '20px' } },
        ]},
        { id: 'soc-cap-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 360, height: 40 }, styles: { padding: '0 16px 12px' }, children: [
          { id: 'soc-lc-' + Date.now(), type: 'text', content: '2,847 likes', position: { x: 0, y: 0 }, size: { width: 328, height: 16 }, styles: { color: '#FAFAFA', fontSize: '13px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
          { id: 'soc-ct-' + Date.now(), type: 'text', content: 'New design system components dropping soon 🔥', position: { x: 0, y: 0 }, size: { width: 328, height: 16 }, styles: { color: '#FAFAFA', fontSize: '13px', fontFamily: '"Inter", sans-serif' } },
        ]},
      ],
    },
  ],
};

// ── Healthcare Kit ──────────────────────────
const healthKit: StarterKit = {
  id: 'healthcare',
  name: 'Healthcare',
  description: 'Medical and wellness UI with patient cards, vitals displays, and appointment scheduling.',
  category: 'Industry',
  preview: { bg: '#F0F9FF', accent: '#0891B2', text: '#0F172A' },
  tokens: [
    { id: 'health-teal', name: 'health-primary', type: 'color', value: '#0891B2', category: 'semantic', theme: 'light', description: 'Primary Teal' },
    { id: 'health-green', name: 'health-success', type: 'color', value: '#059669', category: 'semantic', theme: 'light', description: 'Healthy/Normal' },
    { id: 'health-red', name: 'health-critical', type: 'color', value: '#DC2626', category: 'semantic', theme: 'light', description: 'Critical/Alert' },
    { id: 'health-amber', name: 'health-warning', type: 'color', value: '#D97706', category: 'semantic', theme: 'light', description: 'Warning' },
    { id: 'health-bg', name: 'health-background', type: 'color', value: '#F0F9FF', category: 'semantic', theme: 'light', description: 'Background' },
    { id: 'health-card', name: 'health-card', type: 'color', value: '#FFFFFF', category: 'semantic', theme: 'light', description: 'Card' },
    { id: 'health-text', name: 'health-text', type: 'color', value: '#0F172A', category: 'semantic', theme: 'light', description: 'Text' },
    { id: 'health-muted', name: 'health-muted', type: 'color', value: '#64748B', category: 'semantic', theme: 'light', description: 'Muted' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'health-vitals-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 60 }, size: { width: 340, height: 200 },
      styles: { backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E0F2FE', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
      children: [
        { id: 'health-vt-' + Date.now(), type: 'text', content: 'Patient Vitals', position: { x: 0, y: 0 }, size: { width: 292, height: 22 }, styles: { color: '#0F172A', fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", sans-serif' } },
        { id: 'health-vg-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 292, height: 120 }, styles: { display: 'flex', gap: '12px', flexWrap: 'wrap' }, children: [
          { id: 'health-hr-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 138, height: 56 }, styles: { backgroundColor: '#ECFDF5', borderRadius: '10px', padding: '10px 14px' }, children: [
            { id: 'health-hrl-' + Date.now(), type: 'text', content: 'Heart Rate', position: { x: 0, y: 0 }, size: { width: 110, height: 14 }, styles: { color: '#64748B', fontSize: '11px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
            { id: 'health-hrv-' + Date.now(), type: 'text', content: '72 BPM', position: { x: 0, y: 0 }, size: { width: 110, height: 24 }, styles: { color: '#059669', fontSize: '20px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
          ]},
          { id: 'health-bp-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 138, height: 56 }, styles: { backgroundColor: '#FEF2F2', borderRadius: '10px', padding: '10px 14px' }, children: [
            { id: 'health-bpl-' + Date.now(), type: 'text', content: 'Blood Pressure', position: { x: 0, y: 0 }, size: { width: 110, height: 14 }, styles: { color: '#64748B', fontSize: '11px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
            { id: 'health-bpv-' + Date.now(), type: 'text', content: '142/90', position: { x: 0, y: 0 }, size: { width: 110, height: 24 }, styles: { color: '#DC2626', fontSize: '20px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
          ]},
          { id: 'health-o2-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 138, height: 56 }, styles: { backgroundColor: '#F0F9FF', borderRadius: '10px', padding: '10px 14px' }, children: [
            { id: 'health-o2l-' + Date.now(), type: 'text', content: 'SpO2', position: { x: 0, y: 0 }, size: { width: 110, height: 14 }, styles: { color: '#64748B', fontSize: '11px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
            { id: 'health-o2v-' + Date.now(), type: 'text', content: '98%', position: { x: 0, y: 0 }, size: { width: 110, height: 24 }, styles: { color: '#0891B2', fontSize: '20px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
          ]},
          { id: 'health-tmp-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 138, height: 56 }, styles: { backgroundColor: '#FFFBEB', borderRadius: '10px', padding: '10px 14px' }, children: [
            { id: 'health-tl-' + Date.now(), type: 'text', content: 'Temperature', position: { x: 0, y: 0 }, size: { width: 110, height: 14 }, styles: { color: '#64748B', fontSize: '11px', fontWeight: '500', fontFamily: '"Inter", sans-serif' } },
            { id: 'health-tv-' + Date.now(), type: 'text', content: '99.1\u00B0F', position: { x: 0, y: 0 }, size: { width: 110, height: 24 }, styles: { color: '#D97706', fontSize: '20px', fontWeight: '700', fontFamily: '"Inter", sans-serif' } },
          ]},
        ]},
      ],
    },
  ],
};

// ── Dark Neon / Gaming Kit ──────────────────────────
const neonKit: StarterKit = {
  id: 'dark-neon',
  name: 'Dark Neon',
  description: 'Cyberpunk-inspired dark theme with neon accents, glow effects, and high-contrast UI for gaming and entertainment.',
  category: 'Style',
  preview: { bg: '#0D0D0D', accent: '#00FF88', text: '#E0FFE0' },
  tokens: [
    { id: 'neon-green', name: 'neon-accent', type: 'color', value: '#00FF88', category: 'semantic', theme: 'dark', description: 'Neon Green' },
    { id: 'neon-cyan', name: 'neon-secondary', type: 'color', value: '#00D4FF', category: 'semantic', theme: 'dark', description: 'Neon Cyan' },
    { id: 'neon-pink', name: 'neon-tertiary', type: 'color', value: '#FF00AA', category: 'semantic', theme: 'dark', description: 'Neon Pink' },
    { id: 'neon-bg', name: 'neon-background', type: 'color', value: '#0D0D0D', category: 'semantic', theme: 'dark', description: 'Background' },
    { id: 'neon-card', name: 'neon-card', type: 'color', value: '#141414', category: 'semantic', theme: 'dark', description: 'Card' },
    { id: 'neon-text', name: 'neon-text', type: 'color', value: '#E0FFE0', category: 'semantic', theme: 'dark', description: 'Text' },
    { id: 'neon-border', name: 'neon-border', type: 'color', value: '#1A3A2A', category: 'semantic', theme: 'dark', description: 'Border' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'neon-cta-' + Date.now(), type: 'button', content: 'PLAY NOW', position: { x: 60, y: 60 }, size: { width: 220, height: 56 },
      styles: { backgroundColor: 'transparent', color: '#00FF88', borderRadius: '4px', fontWeight: '800', fontSize: '16px', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.15em', border: '2px solid #00FF88', boxShadow: '0 0 20px rgba(0,255,136,0.3), inset 0 0 20px rgba(0,255,136,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      hoverStyles: { backgroundColor: 'rgba(0,255,136,0.1)', boxShadow: '0 0 30px rgba(0,255,136,0.5), inset 0 0 30px rgba(0,255,136,0.1)' },
    },
    {
      id: 'neon-stats-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 150 }, size: { width: 320, height: 120 },
      styles: { backgroundColor: '#141414', borderRadius: '8px', border: '1px solid #1A3A2A', padding: '20px', display: 'flex', gap: '20px' },
      children: [
        { id: 'neon-s1-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 85, height: 80 }, styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }, children: [
          { id: 'neon-s1v-' + Date.now(), type: 'text', content: '2,847', position: { x: 0, y: 0 }, size: { width: 85, height: 28 }, styles: { color: '#00FF88', fontSize: '24px', fontWeight: '800', fontFamily: '"Space Grotesk", sans-serif', textAlign: 'center', textShadow: '0 0 10px rgba(0,255,136,0.4)' } },
          { id: 'neon-s1l-' + Date.now(), type: 'text', content: 'ONLINE', position: { x: 0, y: 0 }, size: { width: 85, height: 14 }, styles: { color: '#4A7A5A', fontSize: '10px', fontWeight: '600', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.15em', textAlign: 'center' } },
        ]},
        { id: 'neon-s2-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 85, height: 80 }, styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }, children: [
          { id: 'neon-s2v-' + Date.now(), type: 'text', content: '156', position: { x: 0, y: 0 }, size: { width: 85, height: 28 }, styles: { color: '#00D4FF', fontSize: '24px', fontWeight: '800', fontFamily: '"Space Grotesk", sans-serif', textAlign: 'center', textShadow: '0 0 10px rgba(0,212,255,0.4)' } },
          { id: 'neon-s2l-' + Date.now(), type: 'text', content: 'MATCHES', position: { x: 0, y: 0 }, size: { width: 85, height: 14 }, styles: { color: '#4A7A8A', fontSize: '10px', fontWeight: '600', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.15em', textAlign: 'center' } },
        ]},
        { id: 'neon-s3-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 85, height: 80 }, styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }, children: [
          { id: 'neon-s3v-' + Date.now(), type: 'text', content: '#12', position: { x: 0, y: 0 }, size: { width: 85, height: 28 }, styles: { color: '#FF00AA', fontSize: '24px', fontWeight: '800', fontFamily: '"Space Grotesk", sans-serif', textAlign: 'center', textShadow: '0 0 10px rgba(255,0,170,0.4)' } },
          { id: 'neon-s3l-' + Date.now(), type: 'text', content: 'RANK', position: { x: 0, y: 0 }, size: { width: 85, height: 14 }, styles: { color: '#7A4A6A', fontSize: '10px', fontWeight: '600', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.15em', textAlign: 'center' } },
        ]},
      ],
    },
  ],
};

// ── News / Blog Kit ──────────────────────────
const newsKit: StarterKit = {
  id: 'news-blog',
  name: 'News & Blog',
  description: 'Editorial-style components with article cards, bylines, reading progress, and content typography.',
  category: 'Industry',
  preview: { bg: '#FFFFFF', accent: '#1A1A1A', text: '#1A1A1A' },
  tokens: [
    { id: 'news-black', name: 'news-primary', type: 'color', value: '#1A1A1A', category: 'semantic', theme: 'light', description: 'Primary Black' },
    { id: 'news-red', name: 'news-accent', type: 'color', value: '#DC2626', category: 'semantic', theme: 'light', description: 'Breaking/Accent Red' },
    { id: 'news-bg', name: 'news-background', type: 'color', value: '#FFFFFF', category: 'semantic', theme: 'light', description: 'Background' },
    { id: 'news-card', name: 'news-card', type: 'color', value: '#FAFAFA', category: 'semantic', theme: 'light', description: 'Card' },
    { id: 'news-text', name: 'news-text', type: 'color', value: '#1A1A1A', category: 'semantic', theme: 'light', description: 'Body Text' },
    { id: 'news-muted', name: 'news-muted', type: 'color', value: '#6B7280', category: 'semantic', theme: 'light', description: 'Byline / Meta' },
    { id: 'news-border', name: 'news-border', type: 'color', value: '#E5E7EB', category: 'semantic', theme: 'light', description: 'Border' },
  ],
  componentDefs: [],
  tokenMappings: [],
  sampleComponents: [
    {
      id: 'news-article-' + Date.now(), type: 'div', content: '', position: { x: 60, y: 60 }, size: { width: 380, height: 320 },
      styles: { backgroundColor: '#FFFFFF', borderRadius: '0px', borderBottom: '1px solid #E5E7EB', padding: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '16px' },
      children: [
        { id: 'news-img-' + Date.now(), type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 380, height: 180 }, styles: { backgroundColor: '#F3F4F6', borderRadius: '4px' } },
        { id: 'news-cat-' + Date.now(), type: 'text', content: 'TECHNOLOGY', position: { x: 0, y: 0 }, size: { width: 380, height: 14 }, styles: { color: '#DC2626', fontSize: '11px', fontWeight: '700', fontFamily: '"Inter", sans-serif', letterSpacing: '0.08em' } },
        { id: 'news-hed-' + Date.now(), type: 'text', content: 'The Future of AI-Powered Design Tools Is Already Here', position: { x: 0, y: 0 }, size: { width: 380, height: 56 }, styles: { color: '#1A1A1A', fontSize: '22px', fontWeight: '700', fontFamily: '"Georgia", serif', lineHeight: '1.3' } },
        { id: 'news-dek-' + Date.now(), type: 'text', content: 'How machine learning is transforming the way designers create interfaces and prototype interactions.', position: { x: 0, y: 0 }, size: { width: 380, height: 36 }, styles: { color: '#4B5563', fontSize: '15px', fontWeight: '400', fontFamily: '"Georgia", serif', lineHeight: '1.5' } },
        { id: 'news-meta-' + Date.now(), type: 'text', content: 'By Sarah Chen  •  8 min read  •  Feb 20, 2026', position: { x: 0, y: 0 }, size: { width: 380, height: 16 }, styles: { color: '#9CA3AF', fontSize: '12px', fontWeight: '400', fontFamily: '"Inter", sans-serif' } },
      ],
    },
  ],
};

const allKits: StarterKit[] = [materialKit, appleKit, saasKit, ecomKit, minimalKit, fintechKit, socialKit, healthKit, neonKit, newsKit];

// ═══════════════════════════════════════════════════════════
// STARTER KIT PANEL
// ═══════════════════════════════════════════════════════════

export function StarterKitsPanel({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selectedKit, setSelectedKit] = useState<StarterKit | null>(null);
  const [loadedKits, setLoadedKits] = useState<Set<string>>(new Set());
  const { updateDesignSystem, designSystem, batchAddComponents, addToast } = useStore();

  const categories = useMemo(() => {
    const cats = [...new Set(allKits.map(k => k.category))];
    return cats;
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return allKits;
    const q = search.toLowerCase();
    return allKits.filter(k =>
      k.name.toLowerCase().includes(q) ||
      k.description.toLowerCase().includes(q) ||
      k.category.toLowerCase().includes(q)
    );
  }, [search]);

  const loadKit = (kit: StarterKit) => {

    // Merge tokens (avoid duplicates by id)
    const existingTokenIds = new Set(designSystem.namedTokens.map(t => t.id));
    const newTokens = kit.tokens.filter(t => !existingTokenIds.has(t.id));

    // Merge component defs
    const existingDefIds = new Set(designSystem.componentDefs.map(d => d.id));
    const newDefs = kit.componentDefs.filter(d => !existingDefIds.has(d.id));

    // Merge token mappings
    const existingMappingIds = new Set(designSystem.tokenMappings.map(m => m.componentDefId));
    const newMappings = kit.tokenMappings.filter(m => !existingMappingIds.has(m.componentDefId));

    updateDesignSystem({
      namedTokens: [...designSystem.namedTokens, ...newTokens],
      componentDefs: [...designSystem.componentDefs, ...newDefs],
      tokenMappings: [...designSystem.tokenMappings, ...newMappings],
    });

    // Add sample components with fresh IDs at ALL levels to avoid conflicts
    const regenAllIds = (el: any): any => {
      const fresh = JSON.parse(JSON.stringify(el));
      fresh.id = `${el.type || 'div'}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      if (fresh.children) {
        fresh.children = fresh.children.map((ch: any) => regenAllIds(ch));
      }
      return fresh;
    };
    const freshComponents = kit.sampleComponents.map(c => regenAllIds(c));

    batchAddComponents(freshComponents);
    setLoadedKits(prev => new Set([...prev, kit.id]));
    addToast(`${kit.name} kit loaded — ${newTokens.length} tokens, ${freshComponents.length} components added`, 'success');
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 w-[720px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-[#2296FF]" />
            <div>
              <h2 className="text-white text-lg font-semibold">Starter UI Kits</h2>
              <p className="text-gray-500 text-xs mt-0.5">Load tokens + sample components to jumpstart your design</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800">
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search kits…"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Kit Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)] panel-scroll">
          {categories.map(cat => {
            const kits = filtered.filter(k => k.category === cat);
            if (kits.length === 0) return null;
            return (
              <div key={cat} className="mb-6">
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">{cat}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {kits.map(kit => {
                    const isLoaded = loadedKits.has(kit.id);
                    return (
                      <div
                        key={kit.id}
                        className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden ${
                          selectedKit?.id === kit.id
                            ? 'border-[#2296FF] bg-[#2296FF]/5'
                            : 'border-gray-800 hover:border-gray-600 bg-gray-900/50 hover:bg-gray-900'
                        }`}
                        onClick={() => setSelectedKit(kit)}
                      >
                        {/* Preview bar */}
                        <div className="h-12 flex items-center gap-2 px-4" style={{ backgroundColor: kit.preview.bg }}>
                          <div className="w-6 h-6 rounded-md" style={{ backgroundColor: kit.preview.accent }} />
                          <div className="flex-1">
                            <div className="h-2 w-16 rounded-full" style={{ backgroundColor: kit.preview.text, opacity: 0.8 }} />
                            <div className="h-1.5 w-24 rounded-full mt-1" style={{ backgroundColor: kit.preview.text, opacity: 0.3 }} />
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white text-sm font-semibold">{kit.name}</h4>
                            {isLoaded && <Check className="w-3.5 h-3.5 text-green-400" />}
                          </div>
                          <p className="text-gray-500 text-[11px] mt-1 line-clamp-2">{kit.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-600">
                            <span>{kit.tokens.length} tokens</span>
                            <span>•</span>
                            <span>{kit.sampleComponents.length} components</span>
                          </div>
                        </div>
                        {/* Load button */}
                        <div className="px-3 pb-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); loadKit(kit); }}
                            disabled={isLoaded}
                            className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isLoaded
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default'
                                : 'bg-[#2296FF] text-white hover:bg-[#2296FF]/80'
                            }`}
                          >
                            {isLoaded ? '✓ Loaded' : 'Load Kit'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No kits matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
