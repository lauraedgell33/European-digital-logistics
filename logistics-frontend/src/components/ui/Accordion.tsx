'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  className?: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('transition-transform duration-200', open && 'rotate-180')}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function Accordion({ items, multiple = false, className }: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    items.forEach((item, idx) => {
      if (item.defaultOpen) initial.add(idx);
    });
    return initial;
  });

  const toggle = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          if (!multiple) next.clear();
          next.add(index);
        }
        return next;
      });
    },
    [multiple],
  );

  return (
    <div
      className={cn('divide-y', className)}
      style={{ borderTop: '1px solid var(--ds-gray-400)', borderBottom: '1px solid var(--ds-gray-400)', divideColor: 'var(--ds-gray-400)' } as React.CSSProperties}
      role="region"
    >
      {items.map((item, idx) => {
        const isOpen = openIndices.has(idx);
        return (
          <div key={idx}>
            <button
              type="button"
              onClick={() => !item.disabled && toggle(idx)}
              disabled={item.disabled}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${idx}`}
              id={`accordion-header-${idx}`}
              className={cn(
                'flex w-full items-center justify-between gap-3 py-3.5 px-1 text-left transition-colors',
                item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-80',
              )}
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              <span className="text-[14px] font-medium">{item.title}</span>
              <ChevronIcon open={isOpen} />
            </button>
            <div
              id={`accordion-panel-${idx}`}
              role="region"
              aria-labelledby={`accordion-header-${idx}`}
              className={cn(
                'overflow-hidden transition-all duration-200 ease-in-out',
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div
                className="pb-4 px-1 text-[13px]"
                style={{ color: 'var(--ds-gray-900)' }}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
