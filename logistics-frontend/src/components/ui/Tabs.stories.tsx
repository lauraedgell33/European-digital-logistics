'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { GeistTabs } from './Tabs';
import { Badge } from './Badge';

const meta: Meta<typeof GeistTabs> = {
  title: 'UI/Tabs',
  component: GeistTabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GeistTabs>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Overview', content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Overview content with key metrics and summary data.</p></div> },
      { label: 'Shipments', content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Active shipments list and tracking information.</p></div> },
      { label: 'Analytics', content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Charts and detailed analytics data.</p></div> },
    ],
  },
};

export const WithCounts: Story = {
  args: {
    items: [
      { label: 'All Orders', count: 156, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>All orders displayed here.</p></div> },
      { label: 'Pending', count: 23, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Pending orders awaiting confirmation.</p></div> },
      { label: 'In Transit', count: 45, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Shipments currently in transit.</p></div> },
      { label: 'Delivered', count: 88, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Successfully delivered orders.</p></div> },
    ],
  },
};

export const ZeroCounts: Story = {
  args: {
    items: [
      { label: 'Active', count: 12, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Active items.</p></div> },
      { label: 'Archived', count: 0, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>No archived items.</p></div> },
      { label: 'Drafts', count: 0, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>No draft items.</p></div> },
    ],
  },
};

export const TwoTabs: Story = {
  args: {
    items: [
      { label: 'Freight Exchange', content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Available freight and cargo listings.</p></div> },
      { label: 'Vehicle Exchange', content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Available vehicles for booking.</p></div> },
    ],
  },
};

export const ManyTabs: Story = {
  args: {
    items: [
      { label: 'Dashboard', content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Dashboard overview.</p></div> },
      { label: 'Orders', count: 42, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Order management.</p></div> },
      { label: 'Shipments', count: 18, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Shipment tracking.</p></div> },
      { label: 'Fleet', count: 7, content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Fleet management.</p></div> },
      { label: 'Documents', content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Document storage and eCMR.</p></div> },
      { label: 'Reports', content: <div className="p-4"><p style={{ color: 'var(--ds-gray-900)' }}>Analytics and reports.</p></div> },
    ],
  },
};

export const WithRichContent: Story = {
  args: {
    items: [
      {
        label: 'Summary',
        content: (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="geist-card p-4">
                <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>Total Orders</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>1,234</p>
              </div>
              <div className="geist-card p-4">
                <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>Revenue</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>€89,450</p>
              </div>
              <div className="geist-card p-4">
                <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>Avg. Delivery</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>2.4 days</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        label: 'Details',
        count: 5,
        content: (
          <div className="p-4">
            <p style={{ color: 'var(--ds-gray-900)' }}>Detailed breakdown of recent activity.</p>
          </div>
        ),
      },
    ],
  },
};
