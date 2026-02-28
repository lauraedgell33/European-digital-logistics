'use client';

import { useDashboardStore } from '@/stores/dashboardStore';
import {
  Cog6ToothIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export function DashboardToolbar() {
  const { isEditMode, setEditMode, setPickerOpen, resetToDefault } = useDashboardStore();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
          {isEditMode
            ? 'Drag widgets to reorder, resize, or toggle visibility'
            : 'European Digital Logistics Marketplace overview'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isEditMode ? (
          <>
            <button
              onClick={() => setPickerOpen(true)}
              className="btn-geist btn-geist-secondary btn-geist-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Add Widget
            </button>
            <button
              onClick={resetToDefault}
              className="btn-geist btn-geist-secondary btn-geist-sm"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="btn-geist btn-geist-primary btn-geist-sm"
            >
              <CheckIcon className="h-4 w-4" />
              Done
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="btn-geist btn-geist-secondary btn-geist-sm"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            Customize
          </button>
        )}
      </div>
    </div>
  );
}
