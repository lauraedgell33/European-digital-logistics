'use client';

import Link from 'next/link';
import {
  CubeIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const ACTIONS = [
  {
    label: 'Post Freight',
    description: 'Create a new freight offer',
    href: '/freight/new',
    icon: CubeIcon,
    bgVar: '--ds-blue-200',
    colorVar: '--ds-blue-900',
  },
  {
    label: 'Add Vehicle',
    description: 'Register available capacity',
    href: '/vehicles/new',
    icon: TruckIcon,
    bgVar: '--ds-green-200',
    colorVar: '--ds-green-900',
  },
  {
    label: 'Create Order',
    description: 'New transport order',
    href: '/orders/new',
    icon: ClipboardDocumentListIcon,
    bgVar: '--ds-amber-200',
    colorVar: '--ds-amber-900',
  },
  {
    label: 'New Tender',
    description: 'Launch a tender process',
    href: '/tenders/new',
    icon: DocumentTextIcon,
    bgVar: '--ds-purple-200',
    colorVar: '--ds-purple-900',
  },
  {
    label: 'Send Message',
    description: 'Contact a partner',
    href: '/messages',
    icon: ChatBubbleLeftRightIcon,
    bgVar: '--ds-red-200',
    colorVar: '--ds-red-900',
  },
  {
    label: 'Import Data',
    description: 'Bulk import from CSV',
    href: '/freight?import=true',
    icon: ArrowDownTrayIcon,
    bgVar: '--ds-gray-200',
    colorVar: '--ds-gray-900',
  },
];

export function QuickActionsWidget() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-2.5 rounded-lg p-2.5 transition-colors no-underline"
            style={{ color: 'var(--ds-gray-1000)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ds-gray-100)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md flex-shrink-0"
              style={{ background: `var(${action.bgVar})`, color: `var(${action.colorVar})` }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium truncate">{action.label}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--ds-gray-900)' }}>
                {action.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
