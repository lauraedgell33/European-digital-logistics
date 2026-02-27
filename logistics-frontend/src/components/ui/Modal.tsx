'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  footer?: React.ReactNode;
  preventClose?: boolean;
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-64px)]',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  footer,
  preventClose = false,
}: ModalProps) {
  const handleClose = () => {
    if (!preventClose) onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 translate-y-2"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-2"
            >
              <Dialog.Panel
                className={cn(
                  'w-full rounded-xl p-0 overflow-hidden',
                  sizes[size],
                  className
                )}
                style={{
                  background: 'var(--ds-background-100)',
                  boxShadow: 'var(--shadow-large)',
                  border: '1px solid var(--ds-gray-400)',
                }}
              >
                {/* Header */}
                {(title || description) && (
                  <div className="flex items-start justify-between p-6 pb-0">
                    <div>
                      {title && (
                        <Dialog.Title
                          className="text-lg font-semibold"
                          style={{ color: 'var(--ds-gray-1000)' }}
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description
                          className="mt-1 text-[13px]"
                          style={{ color: 'var(--ds-gray-900)' }}
                        >
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    {!preventClose && (
                      <button
                        onClick={onClose}
                        className="rounded-md p-1.5 transition-colors hover:opacity-70 focus-ring -mr-1 -mt-1"
                        style={{ color: 'var(--ds-gray-900)' }}
                        aria-label="Close dialog"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && (
                  <div 
                    className="flex items-center justify-end gap-3 px-6 py-4"
                    style={{ borderTop: '1px solid var(--ds-gray-400)' }}
                  >
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ─── Confirm Dialog ─────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'error' | 'warning' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const variantClass = {
    primary: 'btn-geist-primary',
    error: 'btn-geist-error',
    warning: 'btn-geist-warning',
  }[variant];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-geist btn-geist-secondary btn-geist-sm" disabled={loading}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={cn('btn-geist btn-geist-sm', variantClass)} disabled={loading}>
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Processing...
              </>
            ) : confirmLabel}
          </button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
