'use client';

import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/stores/appStore';

interface ExportOption {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => Promise<void>;
}

interface ExportMenuProps {
  options: ExportOption[];
}

export function ExportMenu({ options }: ExportMenuProps) {
  const { t } = useTranslation();
  const { addNotification } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (option: ExportOption) => {
    setLoading(option.label);
    try {
      await option.onClick();
      addNotification({ type: 'success', message: t('export.downloadReady') });
    } catch (err: unknown) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Export failed' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Menu as="div" className="relative inline-block">
      <Menu.Button
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus-ring"
        style={{
          color: 'var(--ds-gray-1000)',
          background: 'var(--ds-background-100)',
          border: '1px solid var(--ds-gray-400)',
        }}
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        {t('common.export')}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg overflow-hidden py-1 focus:outline-none"
          style={{
            background: 'var(--ds-background-100)',
            border: '1px solid var(--ds-gray-400)',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          {options.map((option) => (
            <Menu.Item key={option.label}>
              {({ active }) => (
                <button
                  onClick={() => handleExport(option)}
                  disabled={loading !== null}
                  className="flex w-full items-center gap-2 px-4 py-2 text-[13px] transition-colors disabled:opacity-50"
                  style={{
                    color: 'var(--ds-gray-1000)',
                    background: active ? 'var(--ds-gray-100)' : 'transparent',
                  }}
                >
                  <option.icon className="h-4 w-4" />
                  {loading === option.label ? t('export.generating') : option.label}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// Predefined icon sets for convenience
export const ExportIcons = {
  pdf: DocumentTextIcon,
  csv: TableCellsIcon,
  excel: DocumentArrowDownIcon,
};
