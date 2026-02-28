'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, Pagination } from './DataTable';
import { Badge, StatusBadge } from './Badge';

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    striped: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    selectable: { control: 'boolean' },
    emptyMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

interface Order {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  status: string;
  weight: string;
  date: string;
}

const sampleOrders: Order[] = [
  { id: '1', reference: 'ORD-2026-001', origin: 'Berlin, DE', destination: 'Amsterdam, NL', status: 'in_transit', weight: '12,500 kg', date: '2026-02-28' },
  { id: '2', reference: 'ORD-2026-002', origin: 'Munich, DE', destination: 'Paris, FR', status: 'pending', weight: '8,200 kg', date: '2026-02-27' },
  { id: '3', reference: 'ORD-2026-003', origin: 'Hamburg, DE', destination: 'Brussels, BE', status: 'delivered', weight: '15,800 kg', date: '2026-02-26' },
  { id: '4', reference: 'ORD-2026-004', origin: 'Vienna, AT', destination: 'Zurich, CH', status: 'cancelled', weight: '5,400 kg', date: '2026-02-25' },
  { id: '5', reference: 'ORD-2026-005', origin: 'Warsaw, PL', destination: 'Prague, CZ', status: 'completed', weight: '9,100 kg', date: '2026-02-24' },
];

const columns = [
  { key: 'reference', header: 'Reference', sortable: true },
  { key: 'origin', header: 'Origin', sortable: true },
  { key: 'destination', header: 'Destination', sortable: true },
  { key: 'status', header: 'Status', render: (item: Order) => <StatusBadge status={item.status} /> },
  { key: 'weight', header: 'Weight', sortable: true },
  { key: 'date', header: 'Date', sortable: true },
];

export const Default: Story = {
  args: {
    columns,
    data: sampleOrders,
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'No orders found',
    emptyAction: {
      label: 'Create Order',
      onClick: () => alert('Create order clicked'),
    },
  },
};

export const Striped: Story = {
  args: {
    columns,
    data: sampleOrders,
    striped: true,
  },
};

export const Clickable: Story = {
  args: {
    columns,
    data: sampleOrders,
    onRowClick: (item: Order) => alert(`Clicked: ${item.reference}`),
  },
};

export const Selectable: Story = {
  render: () => {
    const { useState } = require('react');
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    return (
      <div className="space-y-4">
        <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>
          Selected: {selectedKeys.size} items
        </p>
        <DataTable
          columns={columns}
          data={sampleOrders}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        />
      </div>
    );
  },
};

export const WithCustomRender: Story = {
  args: {
    columns: [
      ...columns,
      {
        key: 'actions',
        header: 'Actions',
        render: (item: Order) => (
          <button
            className="btn-geist btn-geist-ghost btn-geist-sm"
            onClick={(e) => {
              e.stopPropagation();
              alert(`View ${item.reference}`);
            }}
          >
            View
          </button>
        ),
      },
    ],
    data: sampleOrders,
  },
};

export const WithPagination: Story = {
  render: () => {
    const { useState } = require('react');
    const [page, setPage] = useState(1);
    return (
      <div>
        <DataTable columns={columns} data={sampleOrders.slice(0, 3)} />
        <Pagination
          currentPage={page}
          totalPages={5}
          totalItems={25}
          itemsPerPage={5}
          onPageChange={setPage}
        />
      </div>
    );
  },
};
