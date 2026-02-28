'use client';

import { useState, useEffect, useRef, useMemo, useCallback, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface Command {
  category: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

interface CommandMenuProps {
  commands: Command[];
  open: boolean;
  onClose: () => void;
  placeholder?: string;
  className?: string;
}

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandMenu({
  commands,
  open,
  onClose,
  placeholder = 'Type a command or search...',
  className,
}: CommandMenuProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset state on open/close
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  // Filter & group commands
  const filtered = useMemo(() => {
    if (!query) return commands;
    return commands.filter(
      (cmd) => fuzzyMatch(cmd.label, query) || fuzzyMatch(cmd.category, query),
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    const items: Command[] = [];
    Object.values(grouped).forEach((cmds) => items.push(...cmds));
    return items;
  }, [grouped]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (cmd: Command) => {
      cmd.onSelect();
      onClose();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1 >= flatItems.length ? 0 : prev + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 < 0 ? flatItems.length - 1 : prev - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[activeIndex]) handleSelect(flatItems[activeIndex]);
          break;
      }
    },
    [flatItems, activeIndex, handleSelect],
  );

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" role="dialog" aria-modal="true" aria-label="Command menu">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Command palette */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg overflow-hidden rounded-xl',
          className,
        )}
        style={{
          background: 'var(--ds-background-100)',
          boxShadow: 'var(--shadow-large)',
          border: '1px solid var(--ds-gray-400)',
          animation: 'cmdIn 150ms ease-out',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-2.5 px-4"
          style={{ borderBottom: '1px solid var(--ds-gray-400)' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--ds-gray-700)', flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-3.5 text-[14px] outline-none"
            style={{ color: 'var(--ds-gray-1000)' }}
            aria-label="Search commands"
            autoComplete="off"
          />
          <kbd
            className="rounded px-1.5 py-0.5 text-[11px]"
            style={{
              background: 'var(--ds-gray-200)',
              color: 'var(--ds-gray-700)',
              border: '1px solid var(--ds-gray-400)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[300px] overflow-y-auto py-2" role="listbox">
          {flatItems.length === 0 ? (
            <div
              className="px-4 py-8 text-center text-[13px]"
              style={{ color: 'var(--ds-gray-700)' }}
            >
              No results found
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div
                  className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--ds-gray-700)' }}
                >
                  {category}
                </div>
                {cmds.map((cmd) => {
                  flatIdx++;
                  const isActive = flatIdx === activeIndex;
                  const currentIdx = flatIdx;
                  return (
                    <button
                      key={`${cmd.category}-${cmd.label}`}
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] transition-colors outline-none',
                      )}
                      style={{
                        background: isActive ? 'var(--ds-gray-200)' : 'transparent',
                        color: 'var(--ds-gray-1000)',
                      }}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setActiveIndex(currentIdx)}
                    >
                      {cmd.icon && (
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center"
                          style={{ color: 'var(--ds-gray-700)' }}
                        >
                          {cmd.icon}
                        </span>
                      )}
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd
                          className="rounded px-1.5 py-0.5 text-[11px] shrink-0"
                          style={{
                            background: 'var(--ds-gray-200)',
                            color: 'var(--ds-gray-700)',
                            border: '1px solid var(--ds-gray-400)',
                          }}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes cmdIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
