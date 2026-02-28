'use client';

import { cn } from '@/lib/utils';

type TimelineColor = 'blue' | 'green' | 'red' | 'amber' | 'gray';

interface TimelineItem {
  title: string;
  description?: string;
  time: string;
  icon?: React.ReactNode;
  color?: TimelineColor;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const colorMap: Record<TimelineColor, { dot: string; ring: string }> = {
  blue: { dot: 'var(--ds-blue-700)', ring: 'var(--ds-blue-200)' },
  green: { dot: 'var(--ds-green-700)', ring: 'var(--ds-green-200)' },
  red: { dot: 'var(--ds-red-700)', ring: 'var(--ds-red-200)' },
  amber: { dot: 'var(--ds-amber-700)', ring: 'var(--ds-amber-200)' },
  gray: { dot: 'var(--ds-gray-700)', ring: 'var(--ds-gray-300)' },
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)} role="list" aria-label="Timeline">
      {items.map((item, idx) => {
        const color = item.color || 'blue';
        const colors = colorMap[color];
        const isLast = idx === items.length - 1;

        return (
          <div
            key={idx}
            className="relative flex gap-4 pb-8 last:pb-0"
            role="listitem"
          >
            {/* Vertical line */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-8 w-0.5 bottom-0"
                style={{ background: 'var(--ds-gray-400)' }}
                aria-hidden="true"
              />
            )}

            {/* Dot */}
            <div className="relative z-10 flex shrink-0">
              {item.icon ? (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: colors.ring, color: colors.dot }}
                >
                  {item.icon}
                </div>
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: colors.ring }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: colors.dot }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-[14px] font-medium"
                  style={{ color: 'var(--ds-gray-1000)' }}
                >
                  {item.title}
                </p>
                <time
                  className="shrink-0 text-[12px]"
                  style={{ color: 'var(--ds-gray-700)' }}
                >
                  {item.time}
                </time>
              </div>
              {item.description && (
                <p
                  className="mt-1 text-[13px]"
                  style={{ color: 'var(--ds-gray-900)' }}
                >
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
