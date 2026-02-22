'use client';

import { useState, useEffect } from 'react';
import { Search, Clock, Star, Palette, ArrowRight, Plus, Sparkles, Layout, FolderOpen } from 'lucide-react';
import { useStore } from '@/store/componentStore';

interface HomeScreenProps {
  onEnterWorkspace: (workspaceId?: string) => void;
  onNewProject: () => void;
  onSearch: (query: string) => void;
}

export function HomeScreen({ onEnterWorkspace, onNewProject, onSearch }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const workspaces = useStore(s => s.workspaces);
  const designSystem = useStore(s => s.designSystem);
  const components = useStore(s => s.components);

  // Simulated recent searches
  const [recentSearches] = useState<string[]>([
    'Profile header component',
    'Button variations',
    'Card layout options',
  ]);

  // Simulated favorites
  const [favorites] = useState<{ name: string; type: string; updatedAt: string }[]>([
    { name: 'Profile Page', type: 'Screen', updatedAt: '2 hours ago' },
    { name: 'Settings Panel', type: 'Component', updatedAt: 'Yesterday' },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  const tokenCount = designSystem?.namedTokens?.length || 0;
  const componentCount = components.length;

  return (
    <div className="flex-1 flex flex-col items-center bg-[#0a0a0a] overflow-y-auto">
      {/* Hero / Search area */}
      <div className="w-full max-w-2xl px-6 pt-[12vh]">
        {/* Logo + greeting */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2296FF] to-[#2296FF]/60 flex items-center justify-center shadow-lg shadow-[#2296FF]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Bivvy</h1>
            <p className="text-xs text-gray-500">AI-native design tool</p>
          </div>
        </div>

        {/* "Start Work" search bar */}
        <form onSubmit={handleSearch} className="relative mb-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#2296FF] transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start work... describe what you want to build"
              className="w-full pl-12 pr-4 py-4 bg-[#141414] border border-white/[0.08] rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#2296FF]/40 focus:ring-1 focus:ring-[#2296FF]/20 transition-all"
              autoFocus
            />
          </div>
          {searchQuery && (
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#2296FF] text-white text-xs rounded-lg hover:bg-[#2296FF]/80 transition-colors flex items-center gap-1"
            >
              Go <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Quick actions row */}
        <div className="flex gap-3 mb-10">
          <button
            onClick={onNewProject}
            className="flex-1 flex items-center gap-3 px-4 py-3.5 bg-[#141414] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#2296FF]/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-[#2296FF]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-white">New Project</p>
              <p className="text-[10px] text-gray-500">Start from scratch</p>
            </div>
          </button>

          <button
            onClick={() => onEnterWorkspace()}
            className="flex-1 flex items-center gap-3 px-4 py-3.5 bg-[#141414] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-white">Continue Working</p>
              <p className="text-[10px] text-gray-500">{componentCount} component{componentCount !== 1 ? 's' : ''} on canvas</p>
            </div>
          </button>
        </div>

        {/* Design system card */}
        <div className="mb-8">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Design System</h3>
          <div className="p-4 bg-[#141414] border border-white/[0.06] rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Bivvy Default System</p>
                  <p className="text-[10px] text-gray-500">{tokenCount} tokens loaded</p>
                </div>
              </div>
              <button
                onClick={() => onEnterWorkspace()}
                className="text-[10px] text-[#2296FF] hover:text-[#2296FF]/80 transition-colors"
              >
                View tokens →
              </button>
            </div>
            {/* Token type mini-preview */}
            <div className="flex gap-2">
              {[
                { label: 'Colors', count: designSystem?.namedTokens?.filter(t => t.type === 'color').length || 0 },
                { label: 'Typography', count: designSystem?.namedTokens?.filter(t => t.type === 'typography').length || 0 },
                { label: 'Spacing', count: designSystem?.namedTokens?.filter(t => t.type === 'spacing').length || 0 },
                { label: 'Components', count: designSystem?.componentDefs?.length || 0 },
              ].map(t => (
                <div key={t.label} className="flex-1 px-2 py-1.5 bg-white/[0.03] rounded-md text-center">
                  <p className="text-[10px] font-medium text-white">{t.count}</p>
                  <p className="text-[9px] text-gray-500">{t.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column: Favorites + Recent */}
        <div className="grid grid-cols-2 gap-6 pb-12">
          {/* Favorites */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-3 h-3" /> Favorites
            </h3>
            <div className="space-y-1.5">
              {favorites.map((fav, i) => (
                <button
                  key={i}
                  onClick={() => onEnterWorkspace()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-white/[0.05] flex items-center justify-center">
                    <Layout className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{fav.name}</p>
                    <p className="text-[10px] text-gray-500">{fav.type} · {fav.updatedAt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Recent Searches
            </h3>
            <div className="space-y-1.5">
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => { setSearchQuery(search); onSearch(search); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                >
                  <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <p className="text-xs text-gray-300 truncate">{search}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
