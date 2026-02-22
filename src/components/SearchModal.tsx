'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Layout, Clock, User, ArrowRight, Plus } from 'lucide-react';
import { useStore } from '@/store/componentStore';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
  thumbnail?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectResult: (result: SearchResult) => void;
  onStartNew: () => void;
}

export function SearchModal({ isOpen, onClose, initialQuery = '', onSelectResult, onStartNew }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const components = useStore(s => s.components);
  const workspaces = useStore(s => s.workspaces);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable results from components + workspaces
  const allResults: SearchResult[] = [
    ...components.map(c => ({
      id: c.id,
      name: c.content || c.type,
      type: c.type,
      description: `${c.type} component · ${c.size.width}×${c.size.height}px`,
      updatedAt: 'Current session',
      updatedBy: 'You',
    })),
    ...workspaces.map(w => ({
      id: w.id,
      name: w.name,
      type: 'Workspace',
      description: `Workspace · ${w.components?.length || 0} components`,
      updatedAt: 'Saved',
      updatedBy: 'You',
    })),
  ];

  const filtered = query.trim()
    ? allResults.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.type.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase())
      )
    : allResults;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-[#1a1a1a] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search components, screens, workspaces..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400 mb-1">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-500">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {filtered.map(result => (
                <button
                  key={result.id}
                  onClick={() => onSelectResult(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left group"
                >
                  {/* Thumbnail placeholder */}
                  <div className="w-12 h-9 rounded-md bg-white/[0.05] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Layout className="w-4 h-4 text-gray-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{result.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{result.description}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{result.updatedAt}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{result.updatedBy}</span>
                    </div>
                  </div>

                  {/* Arrow on hover */}
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Start New */}
        <div className="border-t border-white/[0.06] px-4 py-3">
          <button
            onClick={onStartNew}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#2296FF]/10 border border-[#2296FF]/20 hover:bg-[#2296FF]/15 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#2296FF]" />
            <span className="text-xs font-medium text-[#2296FF]">Start New</span>
          </button>
        </div>
      </div>
    </div>
  );
}
