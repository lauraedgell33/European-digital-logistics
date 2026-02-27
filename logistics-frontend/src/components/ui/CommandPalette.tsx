'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEscapeKey } from '@/hooks/useAccessibility';

interface CommandItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  section?: string;
  action: () => void;
}

interface CommandPaletteProps {
  items?: CommandItem[];
}

const defaultNavigationItems: CommandItem[] = [
  {
    id: 'dashboard',
    label: 'Go to Dashboard',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    shortcut: 'G D',
    action: () => {},
  },
  {
    id: 'freight',
    label: 'Freight Exchange',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    shortcut: 'G F',
    action: () => {},
  },
  {
    id: 'freight-new',
    label: 'Post New Freight',
    section: 'Actions',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
    shortcut: 'N F',
    action: () => {},
  },
  {
    id: 'vehicles',
    label: 'Vehicle Exchange',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    action: () => {},
  },
  {
    id: 'orders',
    label: 'Transport Orders',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
    action: () => {},
  },
  {
    id: 'tenders',
    label: 'Tenders',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
    action: () => {},
  },
  {
    id: 'tracking',
    label: 'Live Tracking',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/></svg>,
    action: () => {},
  },
  {
    id: 'analytics',
    label: 'Analytics',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
    action: () => {},
  },
  {
    id: 'networks',
    label: 'Partner Networks',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    action: () => {},
  },
  {
    id: 'settings',
    label: 'Settings',
    section: 'Navigation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    shortcut: 'G S',
    action: () => {},
  },
];

const routeMap: Record<string, string> = {
  dashboard: '/dashboard',
  freight: '/freight',
  'freight-new': '/freight/new',
  vehicles: '/vehicles',
  orders: '/orders',
  tenders: '/tenders',
  tracking: '/tracking',
  analytics: '/analytics',
  networks: '/networks',
  settings: '/settings',
};

export default function CommandPalette({ items: customItems }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const items = useMemo(() => {
    const navItems = defaultNavigationItems.map(item => ({
      ...item,
      action: () => {
        const route = routeMap[item.id];
        if (route) router.push(route);
        setIsOpen(false);
      },
    }));
    return [...navItems, ...(customItems || [])];
  }, [customItems, router]);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter(item =>
      item.label.toLowerCase().includes(lower) ||
      item.section?.toLowerCase().includes(lower)
    );
  }, [items, search]);

  const sections = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filteredItems.forEach(item => {
      const section = item.section || 'General';
      if (!map.has(section)) map.set(section, []);
      map.get(section)!.push(item);
    });
    return map;
  }, [filteredItems]);

  // Cmd/Ctrl + K to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch('');
        setActiveIndex(0);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEscapeKey(() => setIsOpen(false), isOpen);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        filteredItems[activeIndex].action();
      }
    }
  }, [filteredItems, activeIndex]);

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <>
      <div className="cmdk-overlay" onClick={() => setIsOpen(false)} />
      <div 
        className="cmdk-dialog" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Command palette"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-gray-700)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className="cmdk-input !pl-0 !border-0"
            placeholder="Type a command or search..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setActiveIndex(0);
            }}
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
          />
          <kbd className="cmdk-kbd flex-shrink-0">ESC</kbd>
        </div>

        <div className="cmdk-list custom-scrollbar" ref={listRef} id="cmdk-list" role="listbox">
          {filteredItems.length === 0 ? (
            <div className="empty-state py-8">
              <p className="empty-state-description">No results found for &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            Array.from(sections.entries()).map(([section, sectionItems]) => (
              <div key={section}>
                <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--ds-gray-700)' }}>
                  {section}
                </div>
                {sectionItems.map(item => {
                  flatIndex++;
                  const idx = flatIndex;
                  return (
                    <div
                      key={item.id}
                      className="cmdk-item"
                      data-active={idx === activeIndex}
                      role="option"
                      aria-selected={idx === activeIndex}
                      onClick={() => item.action()}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      {item.icon && <span className="cmdk-item-icon">{item.icon}</span>}
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <span className="flex gap-1">
                          {item.shortcut.split(' ').map((k, i) => (
                            <kbd key={i} className="cmdk-kbd">{k}</kbd>
                          ))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] border-t" style={{ borderColor: 'var(--ds-gray-400)', color: 'var(--ds-gray-700)' }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="cmdk-kbd">↵</kbd> Open</span>
            <span className="flex items-center gap-1"><kbd className="cmdk-kbd">↑↓</kbd> Navigate</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="cmdk-kbd">ESC</kbd> Close</span>
        </div>
      </div>
    </>
  );
}
