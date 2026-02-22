'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X, Image as ImageIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useStore } from '@/store/componentStore';

interface IconBrowserProps {
  onClose?: () => void;
}

// Dynamically build icon map from all lucide-react exports
function buildIconMap(): Record<string, any> {
  const map: Record<string, any> = {};
  const skipKeys = new Set([
    'createLucideIcon', 'default', 'icons', 'Icon',
    // Also skip non-icon utility exports
    'createElement', 'toKebabCase', 'mergeClasses',
  ]);

  for (const [key, value] of Object.entries(LucideIcons)) {
    if (
      skipKeys.has(key) ||
      key === 'default' ||
      // Must start with uppercase (PascalCase component name)
      key[0] !== key[0].toUpperCase()
    ) continue;

    // React components can be functions OR objects (forwardRef returns an object)
    if (
      typeof value === 'function' ||
      (value && typeof value === 'object' && ('$$typeof' in value || 'render' in value))
    ) {
      // PascalCase to kebab-case
      const kebabName = key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      map[kebabName] = value;
    }
  }
  return map;
}

const allIcons = buildIconMap();
const allIconNames = Object.keys(allIcons).sort();

// Category filters
const iconCategories: Record<string, string[]> = {
  'All': [],
  'Arrows': allIconNames.filter(n => /arrow|chevron|corner|move|expand|shrink|maximize|minimize/.test(n)),
  'Communication': allIconNames.filter(n => /mail|message|phone|send|inbox|at-sign|voicemail|rss/.test(n)),
  'Design': allIconNames.filter(n => /palette|pen|brush|paint|crop|grid|layout|align|frame|ruler/.test(n)),
  'Dev': allIconNames.filter(n => /code|terminal|bug|git|database|server|cpu|hard-drive|binary/.test(n)),
  'Files': allIconNames.filter(n => /file|folder|clipboard|archive|book|notebook/.test(n)),
  'Media': allIconNames.filter(n => /image|camera|video|film|music|play|pause|volume|mic|speaker/.test(n)),
  'Navigation': allIconNames.filter(n => /home|menu|search|compass|map|navigation|globe|flag/.test(n)),
  'Shopping': allIconNames.filter(n => /cart|shopping|credit|dollar|wallet|receipt|tag|percent|store|gift/.test(n)),
  'Social': allIconNames.filter(n => /user|heart|thumbs|share|bookmark|star|award|trophy/.test(n)),
  'System': allIconNames.filter(n => /settings|lock|key|shield|bell|clock|calendar|battery|wifi|bluetooth|power/.test(n)),
  'Weather': allIconNames.filter(n => /sun|moon|cloud|rain|snow|wind|thermometer|droplet|umbrella/.test(n)),
};

export function IconBrowser({ onClose }: IconBrowserProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(120);
  const { addComponent } = useStore();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filteredIcons = useMemo(() => {
    let icons = selectedCategory === 'All'
      ? allIconNames
      : iconCategories[selectedCategory] || [];

    if (search) {
      // When searching, always search all icons
      icons = allIconNames.filter(icon => icon.includes(search.toLowerCase()));
    }
    return icons;
  }, [search, selectedCategory]);

  const handleSelectIcon = (iconName: string) => {
    addComponent({
      id: `icon-${Date.now()}`,
      type: 'icon' as const,
      content: iconName,
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 300 },
      size: { width: 48, height: 48 },
      styles: {
        color: '#ffffff',
        backgroundColor: 'transparent',
      },
    });
    if (onClose) onClose();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      setVisibleCount(prev => Math.min(prev + 60, filteredIcons.length));
    }
  };

  const displayedIcons = filteredIcons.slice(0, visibleCount);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col border border-gray-800" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#2296FF]" />
              Icon Library
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {allIconNames.length} icons available · Click to add to canvas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search + Categories */}
        <div className="px-5 py-3 border-b border-gray-800 space-y-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(120); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-800 focus:border-[#2296FF] focus:outline-none text-sm"
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(iconCategories).map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setVisibleCount(120); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#2296FF] text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1 opacity-60">
                    {iconCategories[cat].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
          <div className="text-xs text-gray-500 mb-3">
            Showing {displayedIcons.length} of {filteredIcons.length} icons
          </div>
          <div className="grid grid-cols-8 gap-2">
            {displayedIcons.map((iconName) => {
              const IconComponent = allIcons[iconName];
              if (!IconComponent) return null;
              return (
                <button
                  key={iconName}
                  onClick={() => handleSelectIcon(iconName)}
                  className="aspect-square flex flex-col items-center justify-center gap-1.5 p-2 bg-gray-800 hover:bg-[#2296FF] rounded-lg transition-colors group"
                  title={iconName}
                >
                  <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  <span className="text-[10px] text-gray-500 group-hover:text-white text-center leading-tight line-clamp-1 w-full">
                    {iconName}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No icons found for "{search}"
            </div>
          )}

          {visibleCount < filteredIcons.length && (
            <div className="text-center py-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 120)}
                className="text-xs text-[#2296FF] hover:text-[#60b5ff]"
              >
                Load more ({filteredIcons.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
