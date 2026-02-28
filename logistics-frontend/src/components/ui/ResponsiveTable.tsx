'use client';

import { cn } from '@/lib/utils';
import { useMediaQuery, breakpoints } from '@/hooks/useMediaQuery';

// Re-use the Column type from DataTable
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  mobileCardRenderer?: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  striped?: boolean;
}

function DefaultMobileCard<T extends Record<string, any>>({
  item,
  columns,
  onClick,
}: {
  item: T;
  columns: Column<T>[];
  onClick?: (item: T) => void;
}) {
  return (
    <div
      className={cn(
        'rounded-lg p-4 space-y-2',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
      )}
      style={{
        background: 'var(--ds-background-100)',
        boxShadow: 'var(--ds-shadow-border)',
      }}
      onClick={() => onClick?.(item)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(item); } } : undefined}
    >
      {columns.map((col) => (
        <div key={col.key} className="flex items-start justify-between gap-2">
          <span
            className="text-[12px] font-medium shrink-0"
            style={{ color: 'var(--ds-gray-700)' }}
          >
            {col.header}
          </span>
          <span
            className="text-[13px] text-right"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            {col.render ? col.render(item) : (item as any)[col.key]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  mobileCardRenderer,
  loading,
  emptyMessage = 'No data found',
  emptyIcon,
  onRowClick,
  className,
  striped = false,
}: ResponsiveTableProps<T>) {
  const isDesktop = useMediaQuery(breakpoints.md);

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-geist h-20 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        {emptyIcon && <div className="mb-3" style={{ color: 'var(--ds-gray-600)' }}>{emptyIcon}</div>}
        <p className="text-[14px]" style={{ color: 'var(--ds-gray-700)' }}>{emptyMessage}</p>
      </div>
    );
  }

  // Mobile: card layout
  if (!isDesktop) {
    return (
      <div className={cn('space-y-3', className)} role="list" aria-label="Data list">
        {data.map((item, idx) => (
          <div key={(item as any)[keyField] || idx} role="listitem">
            {mobileCardRenderer ? (
              mobileCardRenderer(item, idx)
            ) : (
              <DefaultMobileCard item={item} columns={columns} onClick={onRowClick} />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: table layout
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ds-gray-400)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-3 text-[12px] font-medium uppercase tracking-wider', col.className)}
                style={{ color: 'var(--ds-gray-700)', width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr
              key={(item as any)[keyField] || rowIdx}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-[var(--ds-gray-100)]',
                striped && rowIdx % 2 === 1 && 'bg-[var(--ds-gray-50)]',
              )}
              style={{ borderBottom: '1px solid var(--ds-gray-200)' }}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3 text-[13px]', col.className)}
                  style={{ color: 'var(--ds-gray-1000)' }}
                >
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
