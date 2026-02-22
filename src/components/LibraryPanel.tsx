'use client';

import { useState } from 'react';
import { useStore } from '@/store/componentStore';
import { componentLibrary } from '@/lib/componentLibrary';
import { availableFonts } from '@/lib/assetLibrary';
import { Plus, Search, Type, Layers, Grid3x3, Bookmark, Trash2 } from 'lucide-react';
import { IconBrowser } from './IconBrowser';
import { IconRenderer } from './IconRenderer';

type LibraryTab = 'components' | 'icons' | 'fonts' | 'templates';

const categoryGroups = [
  { label: 'Primitives', categories: ['Buttons', 'Inputs', 'Badges'] },
  { label: 'Composite', categories: ['Cards', 'Forms', 'Navigation', 'Feedback', 'Data', 'Layout'] },
  { label: 'Pages', categories: ['Heroes', 'Sections', 'Templates'] },
];

const quickIcons = [
  'home', 'user', 'settings', 'search', 'heart', 'star',
  'menu', 'x', 'check', 'arrow-right', 'plus', 'mail',
  'phone', 'calendar', 'clock', 'lock', 'edit', 'trash-2',
  'download', 'upload', 'image', 'bell', 'bookmark', 'map-pin',
  'eye', 'copy', 'external-link', 'share-2', 'filter', 'sliders',
  'folder', 'file', 'globe', 'code', 'terminal', 'zap',
  'shield', 'award', 'trending-up', 'bar-chart', 'pie-chart', 'activity',
  'sun', 'moon', 'cloud', 'wifi', 'bluetooth', 'cpu',
];

const iconCategories = [
  { label: 'All', filter: null as string[] | null },
  { label: 'Navigation', filter: ['home', 'menu', 'x', 'arrow-right', 'external-link'] },
  { label: 'Actions', filter: ['plus', 'edit', 'trash-2', 'download', 'upload', 'copy', 'share-2', 'filter', 'sliders', 'search', 'check'] },
  { label: 'Media', filter: ['image', 'eye', 'sun', 'moon', 'cloud'] },
  { label: 'Social', filter: ['heart', 'star', 'bookmark', 'bell', 'mail', 'phone', 'user'] },
  { label: 'Data', filter: ['bar-chart', 'pie-chart', 'activity', 'trending-up'] },
  { label: 'Interface', filter: ['settings', 'lock', 'globe', 'code', 'terminal', 'zap', 'shield', 'award', 'folder', 'file', 'wifi', 'bluetooth', 'cpu', 'calendar', 'clock', 'map-pin'] },
];

function ComponentPreview({ template }: { template: typeof componentLibrary[0] }) {
  const comp = template.component;
  const style: React.CSSProperties = {
    ...comp.styles,
    width: `${comp.size.width}px`,
    height: `${comp.size.height}px`,
    display: 'flex',
    alignItems: comp.styles.alignItems || 'center',
    justifyContent: comp.styles.justifyContent || 'center',
    overflow: 'hidden',
    fontSize: comp.styles.fontSize || '14px',
  };

  if (comp.type === 'button' || comp.type === 'input' || comp.type === 'text') {
    return <div style={style}>{comp.content}</div>;
  }

  return (
    <div style={style}>
      {comp.children?.map((child, idx) => (
        <div
          key={idx}
          style={{
            ...child.styles,
            marginBottom: idx < comp.children!.length - 1 ? '8px' : '0',
          }}
        >
          {child.content}
        </div>
      ))}
    </div>
  );
}

export function LibraryPanel() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('components');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIconCategory, setSelectedIconCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showIconBrowser, setShowIconBrowser] = useState(false);
  const { addComponent, savedTemplates, loadTemplate, deleteTemplate, addToast } = useStore();

  // Component filtering
  const filteredComponents = componentLibrary.filter(comp => {
    const matchesCategory = selectedCategory === 'All' || comp.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Icon filtering
  const selectedIconCatObj = iconCategories.find(c => c.label === selectedIconCategory);
  const filteredIcons = quickIcons.filter(icon => {
    const matchesSearch = !searchQuery || icon.includes(searchQuery.toLowerCase());
    const matchesCat = !selectedIconCatObj?.filter || selectedIconCatObj.filter.includes(icon);
    return matchesSearch && matchesCat;
  });

  // Font filtering
  const filteredFonts = availableFonts.filter(font =>
    !searchQuery || font.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddComponent = (template: typeof componentLibrary[0]) => {
    const deepCloneChildren = (children: any[] | undefined, parentIdx: number): any[] | undefined => {
      if (!children) return undefined;
      return children.map((child, idx) => ({
        ...child,
        id: `comp-${Date.now()}-${parentIdx}-${idx}`,
        children: deepCloneChildren(child.children, idx),
      }));
    };
    const newComponent = {
      ...template.component,
      id: `comp-${Date.now()}`,
      children: deepCloneChildren(template.component.children, 0),
    };
    addComponent(newComponent);
  };

  const handleAddIcon = (iconName: string) => {
    addComponent({
      id: `comp-${Date.now()}`,
      type: 'icon' as any,
      content: iconName,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { width: 48, height: 48 },
      styles: {
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    });
  };

  const handleAddTextWithFont = (fontName: string) => {
    addComponent({
      id: `comp-${Date.now()}`,
      type: 'text',
      content: 'Your text here',
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { width: 240, height: 40 },
      styles: {
        fontFamily: fontName,
        fontSize: '18px',
        fontWeight: '500',
        color: '#ffffff',
      },
    });
  };

  const searchPlaceholder = {
    components: `Search ${componentLibrary.length} components...`,
    icons: 'Search icons...',
    fonts: 'Search fonts...',
    templates: `Search ${savedTemplates.length} templates...`,
  }[activeTab];

  const footerText = {
    components: `${filteredComponents.length} components`,
    icons: '1,400+ icons',
    fonts: `${filteredFonts.length} fonts`,
    templates: `${savedTemplates.length} saved`,
  }[activeTab];

  return (
    <div className="h-full flex flex-col bg-[#121212]">
      {/* Tabs */}
      <div className="p-3 pb-0 space-y-2">
        {/* Top-level tabs */}
        <div className="flex bg-gray-800/60 rounded-lg p-0.5">
          {([
            { key: 'components' as LibraryTab, label: 'Components', icon: Layers },
            { key: 'icons' as LibraryTab, label: 'Icons', icon: Grid3x3 },
            { key: 'fonts' as LibraryTab, label: 'Fonts', icon: Type },
            { key: 'templates' as LibraryTab, label: 'My Templates', icon: Bookmark },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchQuery(''); }}
              className={`
                flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-all duration-150
                ${activeTab === key
                  ? 'bg-[#2296FF] text-white shadow-sm shadow-[#2296FF]/25'
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2296FF] transition-colors"
          />
        </div>
      </div>

      {/* ==================== COMPONENTS TAB ==================== */}
      {activeTab === 'components' && (
        <>
          {/* Category pills with group dividers */}
          <div className="px-2 pb-2 border-b border-gray-800/50">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                  selectedCategory === 'All'
                    ? 'bg-[#2296FF] text-white shadow-sm shadow-[#2296FF]/20'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                }`}
              >
                All
              </button>

              {categoryGroups.map((group, gIdx) => (
                <div key={group.label} className="contents">
                  <div className="w-px h-6 bg-gray-700/50 self-center mx-0.5" />
                  {group.categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-[#2296FF] text-white shadow-sm shadow-[#2296FF]/20'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Component grid */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredComponents.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredComponents.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleAddComponent(template)}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-out ${
                      hoveredId === template.id
                        ? 'scale-105 shadow-lg shadow-[#2296FF]/20 ring-2 ring-[#2296FF]'
                        : 'hover:scale-102 hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
                      <div className="w-full h-full overflow-hidden flex items-center justify-center bg-[#000000] rounded-lg">
                        <div style={{ transform: 'scale(0.35)', transformOrigin: 'center center', pointerEvents: 'none' }}>
                          <ComponentPreview template={template} />
                        </div>
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200 ${
                        hoveredId === template.id ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-[#2296FF] rounded-full p-2 shadow-lg shadow-[#2296FF]/30">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800/90 p-2 border-t border-gray-800/50">
                      <h3 className="text-white text-xs font-semibold truncate">{template.name}</h3>
                      <p className="text-gray-500 text-[10px] truncate">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500 text-xs">
                No components match your search
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== ICONS TAB ==================== */}
      {activeTab === 'icons' && (
        <>
          {/* Icon sub-filters */}
          <div className="px-2 pb-2 border-b border-gray-800/50">
            <div className="flex flex-wrap gap-1">
              {iconCategories.map(({ label }) => (
                <button
                  key={label}
                  onClick={() => setSelectedIconCategory(label)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                    selectedIconCategory === label
                      ? 'bg-[#2296FF] text-white shadow-sm shadow-[#2296FF]/20'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-1.5">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => handleAddIcon(iconName)}
                    onMouseEnter={() => setHoveredId(`icon-${iconName}`)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                      hoveredId === `icon-${iconName}`
                        ? 'bg-[#2296FF] scale-110 shadow-lg shadow-[#2296FF]/20'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    title={iconName}
                  >
                    <IconRenderer iconName={iconName} color="#fff" size={18} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500 text-xs">
                No icons match your search
              </div>
            )}

            <button
              onClick={() => setShowIconBrowser(true)}
              className="w-full px-3 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              Browse all 1,400+ icons →
            </button>
          </div>
        </>
      )}

      {/* ==================== FONTS TAB ==================== */}
      {activeTab === 'fonts' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredFonts.length > 0 ? (
            filteredFonts.map((font) => (
              <button
                key={font.name}
                onClick={() => handleAddTextWithFont(font.name)}
                onMouseEnter={() => setHoveredId(`font-${font.name}`)}
                onMouseLeave={() => setHoveredId(null)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 ${
                  hoveredId === `font-${font.name}`
                    ? 'bg-gray-700 ring-1 ring-[#2296FF]/50'
                    : 'bg-gray-800/70 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-sm font-medium" style={{ fontFamily: font.name }}>
                    {font.name}
                  </span>
                  <Plus className={`w-3.5 h-3.5 transition-opacity duration-150 ${
                    hoveredId === `font-${font.name}` ? 'opacity-100 text-[#2296FF]' : 'opacity-0'
                  }`} />
                </div>
                <div
                  className="text-gray-400 text-xs leading-relaxed mb-1.5"
                  style={{ fontFamily: font.name }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
                <div className="flex gap-1 flex-wrap">
                  {font.variants.map((v) => (
                    <span key={v} className="text-[10px] text-gray-500 bg-gray-900/60 px-1.5 py-0.5 rounded">
                      {v}
                    </span>
                  ))}
                </div>
              </button>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-500 text-xs">
              No fonts match your search
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {savedTemplates.length > 0 ? (
            savedTemplates
              .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((template, idx) => {
                const comp = template.component;
                const previewScale = Math.min(60 / comp.size.width, 40 / comp.size.height, 0.4);
                return (
                  <div
                    key={`template-${idx}-${template.timestamp}`}
                    onMouseEnter={() => setHoveredId(`tmpl-${idx}`)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`relative w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
                      hoveredId === `tmpl-${idx}`
                        ? 'bg-gray-700 ring-1 ring-[#2296FF]/50'
                        : 'bg-gray-800/70 hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      loadTemplate(idx);
                      addToast('Template added to canvas', 'success');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini preview */}
                      <div className="w-12 h-10 bg-gray-900 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        <div
                          style={{
                            ...comp.styles,
                            width: comp.size.width,
                            height: comp.size.height,
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {comp.type === 'icon' ? (
                            <IconRenderer iconName={comp.content || 'circle'} color={comp.styles?.color || '#fff'} size={20} />
                          ) : (
                            <div style={{ fontSize: '8px', color: '#fff', overflow: 'hidden' }}>
                              {comp.content?.substring(0, 20) || comp.type}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{template.name}</div>
                        <div className="text-[10px] text-gray-500">
                          {comp.type} · {comp.size.width}×{comp.size.height}
                          {comp.children?.length ? ` · ${comp.children.length} children` : ''}
                        </div>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(idx);
                          addToast('Template deleted', 'info');
                        }}
                        className={`flex-shrink-0 p-1 rounded transition-opacity ${
                          hoveredId === `tmpl-${idx}` ? 'opacity-100' : 'opacity-0'
                        } text-gray-500 hover:text-red-400 hover:bg-gray-800`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-xs">
              <Bookmark className="w-8 h-8 mb-3 opacity-20" />
              <p>No saved templates yet</p>
              <p className="mt-1 text-[10px] text-gray-600">Right-click a component → Save as Template</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-gray-800/50 bg-gray-900/50">
        <div className="text-[10px] text-gray-500 text-center">
          {footerText}
        </div>
      </div>

      {/* Icon Browser Modal */}
      {showIconBrowser && (
        <IconBrowser onClose={() => setShowIconBrowser(false)} />
      )}
    </div>
  );
}
