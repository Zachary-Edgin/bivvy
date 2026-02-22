'use client';

import { useStore } from '@/store/componentStore';
import { ChevronRight } from 'lucide-react';

export function SelectionBreadcrumb() {
  const { editingParentId, selectedId, findComponent, selectComponent, exitComponent } = useStore();

  if (!editingParentId) return null;

  const parent = findComponent(editingParentId);
  if (!parent) return null;

  const selectedChild = selectedId && selectedId !== editingParentId ? findComponent(selectedId) : null;

  const getLabel = (comp: any) => {
    if (comp.content && comp.content.length <= 20) return `${comp.type}: "${comp.content}"`;
    return comp.type.charAt(0).toUpperCase() + comp.type.slice(1);
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-8 flex items-center gap-1 px-3 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-gray-800 text-[11px] z-[45] pointer-events-auto">
      <button
        onClick={() => { exitComponent(); selectComponent(editingParentId); }}
        className="text-gray-400 hover:text-white transition-colors"
      >
        Canvas
      </button>
      <ChevronRight className="w-3 h-3 text-gray-600" />
      <button
        onClick={() => selectComponent(editingParentId)}
        className={`transition-colors ${!selectedChild ? 'text-[#2296FF] font-medium' : 'text-gray-400 hover:text-white'}`}
      >
        {getLabel(parent)}
      </button>
      {selectedChild && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-[#2296FF] font-medium">
            {getLabel(selectedChild)}
          </span>
        </>
      )}
    </div>
  );
}
