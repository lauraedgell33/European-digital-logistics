'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: string | number;
  overlay?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
  width = '400px',
  overlay = true,
  className,
  footer,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, handleEscape]);

  // Focus trap - focus drawer when opened
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const widthValue = typeof width === 'number' ? `${width}px` : width;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title || 'Drawer'}>
      {/* Backdrop */}
      {overlay && (
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={cn(
          'absolute top-0 bottom-0 flex flex-col outline-none',
          side === 'right' ? 'right-0' : 'left-0',
          className,
        )}
        style={{
          width: widthValue,
          maxWidth: '100vw',
          background: 'var(--ds-background-100)',
          borderLeft: side === 'right' ? '1px solid var(--ds-gray-400)' : undefined,
          borderRight: side === 'left' ? '1px solid var(--ds-gray-400)' : undefined,
          boxShadow: 'var(--shadow-large)',
          animation: side === 'right' ? 'slideInRight 200ms ease-out' : 'slideInLeft 200ms ease-out',
        }}
      >
        {/* Header */}
        {title && (
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--ds-gray-400)' }}
          >
            <h2
              className="text-[16px] font-semibold"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 transition-colors hover:bg-[var(--ds-gray-200)]"
              style={{ color: 'var(--ds-gray-900)' }}
              aria-label="Close drawer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="shrink-0 px-6 py-4"
            style={{ borderTop: '1px solid var(--ds-gray-400)' }}
          >
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
