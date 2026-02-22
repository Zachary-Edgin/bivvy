'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const shortcutGroups = [
  {
    title: 'Tools',
    shortcuts: [
      { keys: ['V'], desc: 'Select tool' },
      { keys: ['R'], desc: 'Rectangle tool' },
      { keys: ['O'], desc: 'Circle tool' },
      { keys: ['L'], desc: 'Line tool' },
      { keys: ['A'], desc: 'Arrow tool' },
      { keys: ['T'], desc: 'Text tool' },
      { keys: ['Space'], desc: 'Pan canvas (hold)' },
    ],
  },
  {
    title: 'Edit',
    shortcuts: [
      { keys: ['⌘', 'C'], desc: 'Copy' },
      { keys: ['⌘', 'X'], desc: 'Cut' },
      { keys: ['⌘', 'V'], desc: 'Paste' },
      { keys: ['⌘', 'D'], desc: 'Duplicate' },
      { keys: ['⌘', 'A'], desc: 'Select all' },
      { keys: ['⌫'], desc: 'Delete selected' },
      { keys: ['⌘', 'Z'], desc: 'Undo' },
      { keys: ['⇧', '⌘', 'Z'], desc: 'Redo' },
    ],
  },
  {
    title: 'Canvas',
    shortcuts: [
      { keys: ['↑', '↓', '←', '→'], desc: 'Nudge 1px' },
      { keys: ['⇧', '↑↓←→'], desc: 'Nudge 10px' },
      { keys: ['Scroll'], desc: 'Zoom in/out' },
      { keys: ['Esc'], desc: 'Deselect / exit editing' },
      { keys: ['Double-click'], desc: 'Edit children' },
    ],
  },
  {
    title: 'Components',
    shortcuts: [
      { keys: ['Right-click'], desc: 'Context menu' },
      { keys: ['⌘', 'G'], desc: 'Group selected' },
      { keys: ['⇧', '⌘', 'G'], desc: 'Ungroup' },
      { keys: ['⌘', '↑'], desc: 'Bring forward' },
      { keys: ['⌘', '↓'], desc: 'Send backward' },
      { keys: ['⇧', '⌘', '↑'], desc: 'Bring to front' },
      { keys: ['⇧', '⌘', '↓'], desc: 'Send to back' },
      { keys: ['⇧', 'A'], desc: 'Toggle auto layout' },
      { keys: ['⌘', 'K'], desc: 'Command palette' },
    ],
  },
];

export function KeyboardShortcuts({ onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 w-[640px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-white text-lg font-semibold">Keyboard Shortcuts</h2>
            <p className="text-gray-500 text-xs mt-0.5">Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-[10px] font-mono">?</kbd> to toggle</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-2 gap-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[#2296FF] text-xs font-semibold uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-gray-400 text-sm">{shortcut.desc}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {shortcut.keys.map((key, j) => (
                          <span key={j}>
                            {j > 0 && <span className="text-gray-600 text-xs mx-0.5"></span>}
                            <kbd className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300 text-[11px] font-mono">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
