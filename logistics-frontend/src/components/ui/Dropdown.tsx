'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: string | number;
  className?: string;
}

export function Dropdown({ trigger, items, align = 'left', width, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const actionableItems = items.filter((item) => !item.separator);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, close]);

  useEffect(() => {
    function handleEscape(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape' && open) close();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, close]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev + 1 >= actionableItems.length ? 0 : prev + 1;
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev - 1 < 0 ? actionableItems.length - 1 : prev - 1;
          return next;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < actionableItems.length) {
          const item = actionableItems[activeIndex];
          if (!item.disabled && item.onClick) {
            item.onClick();
            close();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  };

  let actionIdx = -1;

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
      >
        {trigger}
      </div>

      {open && (
        <div
          role="menu"
          className="absolute z-50 mt-1 overflow-hidden rounded-lg py-1"
          style={{
            background: 'var(--ds-background-100)',
            boxShadow: 'var(--shadow-large)',
            border: '1px solid var(--ds-gray-400)',
            width: width || '200px',
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            animation: 'scaleIn 150ms ease-out',
          }}
        >
          {items.map((item, idx) => {
            if (item.separator) {
              return (
                <div
                  key={`sep-${idx}`}
                  className="my-1 h-px"
                  style={{ background: 'var(--ds-gray-400)' }}
                  role="separator"
                />
              );
            }

            actionIdx++;
            const currentActionIdx = actionIdx;

            return (
              <button
                key={`${item.label}-${idx}`}
                ref={(el) => { itemRefs.current[currentActionIdx] = el; }}
                role="menuitem"
                disabled={item.disabled}
                tabIndex={-1}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors outline-none',
                  item.disabled && 'opacity-40 cursor-not-allowed',
                  currentActionIdx === activeIndex && 'bg-[var(--ds-gray-200)]',
                )}
                style={{
                  color: item.destructive ? 'var(--ds-red-900)' : 'var(--ds-gray-1000)',
                }}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    close();
                  }
                }}
                onMouseEnter={() => setActiveIndex(currentActionIdx)}
              >
                {item.icon && (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
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
