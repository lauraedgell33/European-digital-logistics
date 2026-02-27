'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string;
  direction: SortDirection;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: { label: string; onClick: () => void };
  onRowClick?: (item: T) => void;
  className?: string;
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
  stickyHeader?: boolean;
  striped?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  loading,
  emptyMessage = 'No data found',
  emptyIcon,
  emptyAction,
  onRowClick,
  className,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  stickyHeader = true,
  striped = false,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });

  const handleSort = useCallback((key: string, sortable?: boolean) => {
    if (!sortable) return;
    setSort(prev => ({
      key,
      direction: prev.key === key
        ? prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        : 'asc',
    }));
  }, []);

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sort.direction === 'desc' ? -cmp : cmp;
    });
  }, [data, sort]);

  const toggleSelect = useCallback((key: string | number) => {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  }, [selectedKeys, onSelectionChange]);

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (selectedKeys?.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(item => item[keyField])));
    }
  }, [data, keyField, selectedKeys, onSelectionChange]);

  if (loading) {
    return (
      <div className={cn('overflow-hidden rounded-lg', className)} style={{ border: '1px solid var(--ds-gray-400)' }}>
        <table className="table-geist">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                {columns.map((col) => (
                  <td key={col.key}>
                    <div className="skeleton-geist h-4 w-3/4 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={cn('rounded-lg text-center', className)}
        style={{
          border: '1px solid var(--ds-gray-400)',
          background: 'var(--ds-background-100)',
        }}
      >
        <div className="empty-state py-12">
          {emptyIcon && <div className="empty-state-icon">{emptyIcon}</div>}
          <p className="empty-state-title">{emptyMessage}</p>
          {emptyAction && (
            <button
              onClick={emptyAction.onClick}
              className="btn-geist btn-geist-primary btn-geist-sm mt-4"
            >
              {emptyAction.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-hidden overflow-x-auto rounded-lg custom-scrollbar', className)}
      style={{ border: '1px solid var(--ds-gray-400)' }}
      role="region"
      aria-label="Data table"
      tabIndex={0}
    >
      <table className="table-geist" aria-rowcount={data.length}>
        <thead>
          <tr>
            {selectable && (
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={selectedKeys?.size === data.length && data.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                  style={{ accentColor: 'var(--ds-blue-700)' }}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(col.className)}
                style={{ width: col.width }}
                data-sortable={col.sortable || undefined}
                onClick={() => handleSort(col.key, col.sortable)}
                aria-sort={
                  sort.key === col.key && sort.direction
                    ? sort.direction === 'asc' ? 'ascending' : 'descending'
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.header}
                  {col.sortable && (
                    <span className="inline-flex flex-col" aria-hidden="true">
                      <svg width="8" height="5" viewBox="0 0 8 5" className={cn('transition-opacity', sort.key === col.key && sort.direction === 'asc' ? 'opacity-100' : 'opacity-30')}>
                        <path d="M4 0L7.5 4.5H0.5L4 0Z" fill="currentColor" />
                      </svg>
                      <svg width="8" height="5" viewBox="0 0 8 5" className={cn('transition-opacity', sort.key === col.key && sort.direction === 'desc' ? 'opacity-100' : 'opacity-30')}>
                        <path d="M4 5L0.5 0.5H7.5L4 5Z" fill="currentColor" />
                      </svg>
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, rowIndex) => {
            const isSelected = selectedKeys?.has(item[keyField]);
            return (
              <tr
                key={item[keyField]}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  striped && rowIndex % 2 === 1 && 'bg-opacity-50',
                )}
                data-selected={isSelected || undefined}
                aria-selected={isSelected || undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => {
                  if (e.key === 'Enter') onRowClick(item);
                } : undefined}
              >
                {selectable && (
                  <td className="w-12">
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(item[keyField]);
                      }}
                      className="rounded"
                      style={{ accentColor: 'var(--ds-blue-700)' }}
                      aria-label={`Select row ${item[keyField]}`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (i === 0) return 1;
    if (i === 6) return totalPages;
    if (currentPage <= 4) return i + 1;
    if (currentPage >= totalPages - 3) return totalPages - 6 + i;
    return currentPage - 3 + i;
  });

  return (
    <div className="flex items-center justify-between pt-4" role="navigation" aria-label="Pagination">
      <p className="text-[13px] tabular-nums" style={{ color: 'var(--ds-gray-900)' }}>
        {totalItems != null && itemsPerPage != null ? (
          <>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</>
        ) : (
          <>Page {currentPage} of {totalPages}</>
        )}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn-geist btn-geist-secondary btn-geist-sm disabled:opacity-40"
          aria-label="Previous page"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous
        </button>
        {pages.map((page, i) => {
          // Show ellipsis at boundaries
          const prevPage = i > 0 ? pages[i - 1] : 0;
          const showEllipsis = page - prevPage > 1;
          
          return (
            <span key={page} className="contents">
              {showEllipsis && (
                <span className="px-1" style={{ color: 'var(--ds-gray-700)' }}>…</span>
              )}
              <button
                onClick={() => onPageChange(page)}
                className={cn(
                  'btn-geist btn-geist-sm min-w-[36px]',
                  page === currentPage ? 'btn-geist-primary' : 'btn-geist-ghost'
                )}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </span>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn-geist btn-geist-secondary btn-geist-sm disabled:opacity-40"
          aria-label="Next page"
        >
          Next
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
