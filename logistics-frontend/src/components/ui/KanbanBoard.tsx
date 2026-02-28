'use client';

import { useState, useCallback, DragEvent } from 'react';
import { cn } from '@/lib/utils';

interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onMoveItem: (itemId: string, fromColumnId: string, toColumnId: string) => void;
  className?: string;
}

export function KanbanBoard({ columns, onMoveItem, className }: KanbanBoardProps) {
  const [dragState, setDragState] = useState<{
    itemId: string;
    fromColumnId: string;
  } | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, itemId: string, columnId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', itemId);
      setDragState({ itemId, fromColumnId: columnId });
    },
    [],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumnId(columnId);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverColumnId(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, toColumnId: string) => {
      e.preventDefault();
      setDragOverColumnId(null);
      if (dragState && dragState.fromColumnId !== toColumnId) {
        onMoveItem(dragState.itemId, dragState.fromColumnId, toColumnId);
      }
      setDragState(null);
    },
    [dragState, onMoveItem],
  );

  const handleDragEnd = useCallback(() => {
    setDragState(null);
    setDragOverColumnId(null);
  }, []);

  return (
    <div
      className={cn('flex gap-4 overflow-x-auto pb-4', className)}
      role="region"
      aria-label="Kanban board"
    >
      {columns.map((column) => {
        const isDragOver = dragOverColumnId === column.id;
        return (
          <div
            key={column.id}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-lg transition-colors duration-150',
            )}
            style={{
              background: isDragOver ? 'var(--ds-blue-100)' : 'var(--ds-gray-100)',
              border: isDragOver
                ? '2px dashed var(--ds-blue-700)'
                : '2px solid transparent',
            }}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                {column.color && (
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: column.color }}
                    aria-hidden="true"
                  />
                )}
                <h3
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--ds-gray-1000)' }}
                >
                  {column.title}
                </h3>
              </div>
              <span
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium"
                style={{
                  background: 'var(--ds-gray-300)',
                  color: 'var(--ds-gray-900)',
                }}
              >
                {column.items.length}
              </span>
            </div>

            {/* Column items */}
            <div className="flex flex-1 flex-col gap-2 px-2 pb-2 min-h-[60px]">
              {column.items.map((item) => {
                const isDragging = dragState?.itemId === item.id;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id, column.id)}
                    onDragEnd={handleDragEnd}
                    onClick={item.onClick}
                    role={item.onClick ? 'button' : undefined}
                    tabIndex={item.onClick ? 0 : undefined}
                    onKeyDown={
                      item.onClick
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              item.onClick?.();
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      'rounded-md p-3 transition-all duration-150 cursor-grab active:cursor-grabbing',
                      isDragging && 'opacity-40',
                      item.onClick && 'hover:shadow-md',
                    )}
                    style={{
                      background: 'var(--ds-background-100)',
                      boxShadow: 'var(--ds-shadow-border)',
                    }}
                    aria-label={`${item.title}. Drag to move between columns.`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[13px] font-medium truncate"
                          style={{ color: 'var(--ds-gray-1000)' }}
                        >
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p
                            className="mt-0.5 text-[12px] truncate"
                            style={{ color: 'var(--ds-gray-700)' }}
                          >
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      {item.badge && <div className="shrink-0">{item.badge}</div>}
                    </div>
                  </div>
                );
              })}

              {column.items.length === 0 && (
                <div
                  className="flex items-center justify-center rounded-md border-2 border-dashed py-6 text-[12px]"
                  style={{
                    borderColor: 'var(--ds-gray-400)',
                    color: 'var(--ds-gray-700)',
                  }}
                >
                  No items
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
