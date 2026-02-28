'use client';

import React, { useRef, useCallback } from 'react';
import type { DashboardWidget } from '@/stores/dashboardStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { cn } from '@/lib/utils';

interface WidgetWrapperProps {
  widget: DashboardWidget;
  index: number;
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<DashboardWidget['size'], string> = {
  small: 'col-span-1',
  medium: 'col-span-1',
  large: 'col-span-1 md:col-span-2',
  full: 'col-span-1 md:col-span-2 lg:col-span-3',
};

const SIZE_LABELS: { size: DashboardWidget['size']; label: string }[] = [
  { size: 'small', label: 'S' },
  { size: 'medium', label: 'M' },
  { size: 'large', label: 'L' },
  { size: 'full', label: 'Full' },
];

export function WidgetWrapper({ widget, index, children }: WidgetWrapperProps) {
  const { isEditMode, moveWidget, toggleWidget, resizeWidget } = useDashboardStore();
  const dragRef = useRef<HTMLDivElement>(null);
  const dragIndexRef = useRef<number>(index);
  dragIndexRef.current = index;

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
      if (dragRef.current) {
        dragRef.current.style.opacity = '0.4';
      }
    },
    [index]
  );

  const handleDragEnd = useCallback(() => {
    if (dragRef.current) {
      dragRef.current.style.opacity = '1';
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!isNaN(dragIndex) && dragIndex !== dragIndexRef.current) {
        moveWidget(dragIndex, dragIndexRef.current);
      }
    },
    [moveWidget]
  );

  return (
    <div
      ref={dragRef}
      className={cn(
        SIZE_CLASSES[widget.size],
        'transition-all duration-200',
        isEditMode && 'ring-1 ring-transparent hover:ring-[var(--ds-blue-400)] rounded-xl'
      )}
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="geist-card p-0 h-full overflow-hidden"
        style={{
          border: isEditMode ? '1px dashed var(--ds-gray-400)' : undefined,
        }}
      >
        {/* Edit mode toolbar */}
        {isEditMode && (
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{
              background: 'var(--ds-gray-100)',
              borderBottom: '1px solid var(--ds-gray-200)',
            }}
          >
            {/* Drag handle */}
            <div
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                <circle cx="3" cy="3" r="1.5" fill="var(--ds-gray-700)" />
                <circle cx="9" cy="3" r="1.5" fill="var(--ds-gray-700)" />
                <circle cx="3" cy="9" r="1.5" fill="var(--ds-gray-700)" />
                <circle cx="9" cy="9" r="1.5" fill="var(--ds-gray-700)" />
                <circle cx="3" cy="15" r="1.5" fill="var(--ds-gray-700)" />
                <circle cx="9" cy="15" r="1.5" fill="var(--ds-gray-700)" />
              </svg>
              <span
                className="text-[11px] font-medium truncate max-w-[120px]"
                style={{ color: 'var(--ds-gray-900)' }}
              >
                {widget.title}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Size buttons */}
              {SIZE_LABELS.map(({ size, label }) => (
                <button
                  key={size}
                  onClick={() => resizeWidget(widget.id, size)}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
                    widget.size === size
                      ? 'text-white'
                      : ''
                  )}
                  style={{
                    background: widget.size === size ? 'var(--ds-blue-700)' : 'var(--ds-gray-200)',
                    color: widget.size === size ? '#fff' : 'var(--ds-gray-900)',
                  }}
                  title={`Resize to ${label}`}
                >
                  {label}
                </button>
              ))}

              {/* Divider */}
              <div
                className="w-px h-4 mx-1"
                style={{ background: 'var(--ds-gray-300)' }}
              />

              {/* Hide button */}
              <button
                onClick={() => toggleWidget(widget.id)}
                className="p-0.5 rounded transition-colors"
                style={{ color: 'var(--ds-gray-700)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-red-900)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-gray-700)')}
                title="Hide widget"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Widget title bar (non-edit mode) */}
        {!isEditMode && (
          <div className="px-6 pt-5 pb-0">
            <h3
              className="text-[15px] font-semibold"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              {widget.title}
            </h3>
          </div>
        )}

        {/* Widget content */}
        <div className="p-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
