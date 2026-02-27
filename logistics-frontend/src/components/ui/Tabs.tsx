'use client';

import { Tab } from '@headlessui/react';
import { cn } from '@/lib/utils';

interface TabItem {
  label: string;
  count?: number;
  content: React.ReactNode;
}

interface GeistTabsProps {
  items: TabItem[];
  className?: string;
}

export function GeistTabs({ items, className }: GeistTabsProps) {
  return (
    <Tab.Group>
      <Tab.List
        className={cn('flex gap-0 border-b', className)}
        style={{ borderColor: 'var(--ds-gray-400)' }}
      >
        {items.map((item) => (
          <Tab
            key={item.label}
            className={({ selected }) =>
              cn(
                'px-4 py-2.5 text-[13px] font-medium transition-colors outline-none relative',
                selected
                  ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]'
                  : 'hover:opacity-80'
              )
            }
            style={(({ selected }: { selected: boolean }) => ({
              color: selected ? 'var(--ds-gray-1000)' : 'var(--ds-gray-900)',
              ...(selected && { '--tw-content': '""' } as any),
            })) as any}
          >
            {({ selected }) => (
              <span className="flex items-center gap-2">
                {item.label}
                {item.count !== undefined && (
                  <span
                    className="badge-geist badge-geist-gray text-2xs"
                    style={
                      selected
                        ? { background: 'var(--ds-gray-1000)', color: 'var(--ds-background-100)' }
                        : undefined
                    }
                  >
                    {item.count}
                  </span>
                )}
                {selected && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: 'var(--ds-gray-1000)' }}
                  />
                )}
              </span>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {items.map((item) => (
          <Tab.Panel key={item.label} className="animate-fade-in">
            {item.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
