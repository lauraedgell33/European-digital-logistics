import type { Meta, StoryObj } from '@storybook/react';
import { Badge, StatusBadge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['gray', 'blue', 'green', 'red', 'amber', 'yellow', 'purple'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'gray',
  },
};

export const Blue: Story = {
  args: {
    children: 'In Transit',
    variant: 'blue',
  },
};

export const Green: Story = {
  args: {
    children: 'Delivered',
    variant: 'green',
  },
};

export const Red: Story = {
  args: {
    children: 'Cancelled',
    variant: 'red',
  },
};

export const Amber: Story = {
  args: {
    children: 'Pending',
    variant: 'amber',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="gray">Gray</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="green">Green</Badge>
      <Badge variant="red">Red</Badge>
      <Badge variant="amber">Amber</Badge>
      <Badge variant="yellow">Yellow</Badge>
      <Badge variant="purple">Purple</Badge>
    </div>
  ),
};

export const OrderStatuses: Story = {
  name: 'Status Badges',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="draft" />
      <StatusBadge status="pending" />
      <StatusBadge status="accepted" />
      <StatusBadge status="in_transit" />
      <StatusBadge status="delivered" />
      <StatusBadge status="completed" />
      <StatusBadge status="cancelled" />
      <StatusBadge status="delayed" />
      <StatusBadge status="disputed" />
    </div>
  ),
};

export const TenderStatuses: Story = {
  name: 'Tender Statuses',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="open" />
      <StatusBadge status="submitted" />
      <StatusBadge status="awarded" />
      <StatusBadge status="closed" />
      <StatusBadge status="withdrawn" />
    </div>
  ),
};
