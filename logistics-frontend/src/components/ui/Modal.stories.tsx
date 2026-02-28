'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    preventClose: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Create Shipment',
    description: 'Fill in the details below to create a new shipment.',
    children: (
      <div className="space-y-4">
        <p style={{ color: 'var(--ds-gray-900)' }}>
          Enter the shipment information including origin, destination, and cargo details.
        </p>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    open: true,
    title: 'Confirm Delivery',
    description: 'Are you sure you want to mark this shipment as delivered?',
    children: (
      <p style={{ color: 'var(--ds-gray-900)' }}>
        This action will update the shipment status and notify the customer.
      </p>
    ),
    footer: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    open: true,
    title: 'Delete Order',
    size: 'sm',
    children: <p style={{ color: 'var(--ds-gray-900)' }}>Are you sure you want to delete this order? This action cannot be undone.</p>,
    footer: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button variant="error">Delete</Button>
      </>
    ),
  },
};

export const Large: Story = {
  args: {
    open: true,
    title: 'Shipment Details',
    size: 'lg',
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium" style={{ color: 'var(--ds-gray-1000)' }}>Origin</h4>
            <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>Berlin, Germany</p>
          </div>
          <div>
            <h4 className="text-sm font-medium" style={{ color: 'var(--ds-gray-1000)' }}>Destination</h4>
            <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>Amsterdam, Netherlands</p>
          </div>
          <div>
            <h4 className="text-sm font-medium" style={{ color: 'var(--ds-gray-1000)' }}>Weight</h4>
            <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>12,500 kg</p>
          </div>
          <div>
            <h4 className="text-sm font-medium" style={{ color: 'var(--ds-gray-1000)' }}>ETA</h4>
            <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>Feb 28, 2026</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const PreventClose: Story = {
  args: {
    open: true,
    title: 'Processing Payment',
    preventClose: true,
    children: (
      <div className="flex items-center gap-3">
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p style={{ color: 'var(--ds-gray-900)' }}>Please wait while we process your payment...</p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Interactive Modal"
          description="This modal can be opened and closed interactively."
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
            </>
          }
        >
          <p style={{ color: 'var(--ds-gray-900)' }}>
            Click the buttons below or press Escape to close this modal.
          </p>
        </Modal>
      </>
    );
  },
};
