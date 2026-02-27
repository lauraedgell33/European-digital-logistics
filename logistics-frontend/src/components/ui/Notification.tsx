'use client';

import { useAppStore } from '@/stores/appStore';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const colorVars = {
  success: { bg: '--ds-green-200', border: '--ds-green-400', icon: '--ds-green-900', text: '--ds-green-1000', bar: '--ds-green-700' },
  error: { bg: '--ds-red-200', border: '--ds-red-400', icon: '--ds-red-900', text: '--ds-red-1000', bar: '--ds-red-700' },
  warning: { bg: '--ds-amber-200', border: '--ds-amber-400', icon: '--ds-amber-900', text: '--ds-amber-1000', bar: '--ds-amber-700' },
  info: { bg: '--ds-blue-200', border: '--ds-blue-400', icon: '--ds-blue-900', text: '--ds-blue-1000', bar: '--ds-blue-700' },
};

interface NotificationItemProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

function NotificationItem({ id, type, title, message, duration = 5000, onDismiss }: NotificationItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const Icon = icons[type];
  const colors = colorVars[type];

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 250);
  };

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      if (!isPaused) handleDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, isPaused]);

  return (
    <div
      className={cn(
        'toast-geist',
        isExiting && 'toast-geist-exit'
      )}
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-4 flex items-start gap-3">
        <Icon
          className="h-5 w-5 flex-shrink-0 mt-0.5"
          style={{ color: `var(${colors.icon})` }}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-medium"
            style={{ color: `var(${colors.text})` }}
          >
            {title || message}
          </p>
          {title && message && (
            <p
              className="mt-1 text-xs"
              style={{ color: `var(${colors.icon})` }}
            >
              {message}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded-md"
          style={{ color: `var(${colors.icon})` }}
          aria-label="Dismiss notification"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && !isPaused && (
        <div
          className="toast-progress"
          style={{
            background: `var(${colors.bar})`,
            animationDuration: `${duration}ms`,
          }}
        />
      )}
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useAppStore();

  return (
    <div 
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[380px]"
      aria-label="Notifications"
      role="region"
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
}
