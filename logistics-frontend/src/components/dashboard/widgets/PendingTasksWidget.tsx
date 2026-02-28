'use client';

import { useState } from 'react';
import { useDashboard } from '@/hooks/useApi';
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import EmptyState from '@/components/ui/EmptyState';

interface Task {
  id: string;
  label: string;
  description: string;
  icon: typeof CheckCircleIcon;
  bgVar: string;
  colorVar: string;
  completed: boolean;
}

export function PendingTasksWidget() {
  const { data: dashboard } = useDashboard();

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const pendingOrders = dashboard?.recent_orders?.filter(
    (o: { status: string }) => o.status === 'pending'
  )?.length ?? 2;

  const tasks: Task[] = [
    {
      id: 't1',
      label: `Confirm ${pendingOrders} pending order${pendingOrders !== 1 ? 's' : ''}`,
      description: 'Review and accept or reject',
      icon: ClipboardDocumentCheckIcon,
      bgVar: '--ds-amber-200',
      colorVar: '--ds-amber-900',
      completed: false,
    },
    {
      id: 't2',
      label: 'Send 3 invoices',
      description: 'Completed orders awaiting invoices',
      icon: CurrencyEuroIcon,
      bgVar: '--ds-blue-200',
      colorVar: '--ds-blue-900',
      completed: false,
    },
    {
      id: 't3',
      label: 'Upload POD documents',
      description: '2 deliveries need proof of delivery',
      icon: DocumentTextIcon,
      bgVar: '--ds-purple-200',
      colorVar: '--ds-purple-900',
      completed: false,
    },
    {
      id: 't4',
      label: 'Update vehicle availability',
      description: '5 vehicles have outdated schedules',
      icon: TruckIcon,
      bgVar: '--ds-green-200',
      colorVar: '--ds-green-900',
      completed: false,
    },
    {
      id: 't5',
      label: 'Review rate confirmations',
      description: '1 carrier rate pending approval',
      icon: CheckCircleIcon,
      bgVar: '--ds-red-200',
      colorVar: '--ds-red-900',
      completed: false,
    },
  ];

  const toggleTask = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const completedCount = completedIds.size;
  const totalCount = tasks.length;

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="All caught up!"
        description="No pending tasks at the moment"
      />
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--ds-gray-200)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(completedCount / totalCount) * 100}%`,
              background: 'var(--ds-green-700)',
            }}
          />
        </div>
        <span className="text-[11px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Task list */}
      <div className="space-y-1">
        {tasks.map((task) => {
          const Icon = task.icon;
          const isCompleted = completedIds.has(task.id);
          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-3 rounded-md p-2 -mx-2 transition-colors text-left"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ds-gray-100)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Checkbox */}
              <div
                className="flex h-5 w-5 items-center justify-center rounded border-2 flex-shrink-0 transition-all"
                style={{
                  borderColor: isCompleted ? 'var(--ds-green-700)' : 'var(--ds-gray-400)',
                  background: isCompleted ? 'var(--ds-green-700)' : 'transparent',
                }}
              >
                {isCompleted && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div
                className="flex h-7 w-7 items-center justify-center rounded flex-shrink-0"
                style={{
                  background: `var(${task.bgVar})`,
                  color: `var(${task.colorVar})`,
                  opacity: isCompleted ? 0.5 : 1,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1" style={{ opacity: isCompleted ? 0.5 : 1 }}>
                <p
                  className="text-[12px] font-medium truncate"
                  style={{
                    color: 'var(--ds-gray-1000)',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {task.label}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--ds-gray-900)' }}>
                  {task.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
