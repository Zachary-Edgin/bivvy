'use client';

import { useState } from 'react';
import { useStore, ComponentElement } from '@/store/componentStore';
import { ChevronRight, ChevronDown, Square, Type, Image as ImageIcon, Box, ArrowUp, ArrowDown, Minus, ArrowRight, Smile } from 'lucide-react';

const getIconForType = (type: string) => {
  switch (type) {
    case 'button': return <Square className="w-3.5 h-3.5" />;
    case 'text': return <Type className="w-3.5 h-3.5" />;
    case 'input': return <Square className="w-3.5 h-3.5" />;
    case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
    case 'line': return <Minus className="w-3.5 h-3.5" />;
    case 'arrow': return <ArrowRight className="w-3.5 h-3.5" />;
    case 'icon': return <Smile className="w-3.5 h-3.5" />;
    default: return <Box className="w-3.5 h-3.5" />;
  }
};

const getDisplayName = (comp: ComponentElement): string => {
  // Show content text for text elements
  if (comp.content && comp.type === 'text') {
    const truncated = comp.content.substring(0, 20);
    return truncated.length < comp.content.length ? truncated + '...' : truncated;
  }
  // Show content text for buttons
  if (comp.content && comp.type === 'button') {
    const truncated = comp.content.substring(0, 20);
    return truncated.length < comp.content.length ? truncated + '...' : truncated;
  }
  // Show icon name for icons
  if (comp.type === 'icon' && comp.content) {
    return `Icon: ${comp.content}`;
  }
  // Lines and arrows just show type
  return comp.type.charAt(0).toUpperCase() + comp.type.slice(1);
};

interface LayerItemProps {
  component: ComponentElement;
  depth: number;
  index: number;
  totalItems: number;
  parentId?: string;
}

function LayerItem({ component, depth, index, totalItems, parentId }: LayerItemProps) {
  const { 
    selectedId,
    selectedIds,
    expandedIds, 
    selectComponent,
    toggleSelection,
    toggleExpanded, 
    hoveredId, 
    setHoveredComponent,
    reorderComponent,
    reorderChild 
  } = useStore();
  
  const [isDragging, setIsDragging] = useState(false);
  
  const isSelected = selectedIds.includes(component.id);
  const isExpanded = expandedIds.has(component.id);
  const hasChildren = component.children && component.children.length > 0;
  const isHovered = hoveredId === component.id;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentId', component.id);
    e.dataTransfer.setData('fromIndex', index.toString());
    e.dataTransfer.setData('fromParentId', parentId || '');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fromIndex = parseInt(e.dataTransfer.getData('fromIndex'));
    const fromParentId = e.dataTransfer.getData('fromParentId');
    // Only allow reorder within the same parent level
    if (fromParentId !== (parentId || '')) return;
    if (fromIndex !== index && !isNaN(fromIndex)) {
      if (parentId) {
        reorderChild(parentId, fromIndex, index);
      } else {
        reorderComponent(fromIndex, index);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      // Shift+click toggles selection
      toggleSelection(component.id);
    } else {
      // Normal click selects single
      selectComponent(component.id);
    }
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      if (parentId) {
        reorderChild(parentId, index, index - 1);
      } else {
        reorderComponent(index, index - 1);
      }
    }
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < totalItems - 1) {
      if (parentId) {
        reorderChild(parentId, index, index + 1);
      } else {
        reorderComponent(index, index + 1);
      }
    }
  };

  return (
    <div>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          flex items-center gap-1.5 px-2 py-1.5 cursor-pointer group relative
          ${isSelected ? 'bg-[#2296FF] text-white' : isHovered ? 'bg-gray-700 text-gray-200' : 'hover:bg-gray-700 text-gray-200'}
          ${isDragging ? 'opacity-50' : ''}
          ${component.hidden ? 'opacity-40' : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setHoveredComponent(component.id)}
        onMouseLeave={() => setHoveredComponent(null)}
      >
        {/* Expand/collapse arrow */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(component.id);
            }}
            className="flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="w-3.5" />
        )}

        {/* Icon */}
        <div className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-[#2296FF]'}`}>
          {getIconForType(component.type)}
        </div>

        {/* Name */}
        <span className="flex-1 text-xs truncate">
          {getDisplayName(component)}
        </span>

        {/* Symbol indicators */}
        {component.isSymbolMaster && (
          <span className="flex-shrink-0 px-1 py-0 rounded text-[8px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30" title="Symbol Master">M</span>
        )}
        {component.isSymbolInstance && (
          <span className="flex-shrink-0 px-1 py-0 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" title="Symbol Instance">I</span>
        )}

        {/* Layer order controls - show on hover */}
        <div className={`flex-shrink-0 flex gap-0.5 ${isSelected || isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          {index > 0 && (
            <button
              onClick={handleMoveUp}
              className="p-0.5 rounded hover:bg-gray-600 transition-colors"
              title="Move up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}
          {index < totalItems - 1 && (
            <button
              onClick={handleMoveDown}
              className="p-0.5 rounded hover:bg-gray-600 transition-colors"
              title="Move down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Z-index indicator */}
        <div className="flex-shrink-0 text-[10px] text-gray-400 font-mono">
          {totalItems - index}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {component.children!.map((child, childIndex) => (
            <LayerItem
              key={child.id}
              component={child}
              depth={depth + 1}
              index={childIndex}
              totalItems={component.children!.length}
              parentId={component.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LayerTree({ hideHeader }: { hideHeader?: boolean }) {
  const { components } = useStore();

  return (
    <div className="h-full flex flex-col bg-[#121212]">
      {/* Header — hidden when parent provides its own */}
      {!hideHeader && (
        <div className="p-3 border-b border-gray-800">
          <h2 className="text-white font-semibold text-xs flex items-center gap-2">
            <Box className="w-4 h-4 text-[#2296FF]" />
            Layers
          </h2>
        </div>
      )}

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto">
        {components.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            No layers yet
          </div>
        ) : (
          <div>
            {components.map((component, index) => (
              <LayerItem
                key={component.id}
                component={component}
                depth={0}
                index={index}
                totalItems={components.length}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer — hidden when header is hidden (parent controls this) */}
      {!hideHeader && (
        <div className="p-2 border-t border-gray-800 text-[10px] text-gray-500 text-center">
          {components.length} layer{components.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
