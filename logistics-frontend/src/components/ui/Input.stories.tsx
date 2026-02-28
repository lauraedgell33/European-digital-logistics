import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'john@example.com',
    type: 'email',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    hint: 'Must be at least 8 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'john@example.com',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Required: Story = {
  args: {
    label: 'Company Name',
    placeholder: 'Enter company name',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Tracking Number',
    value: 'TRK-2024-001234',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search orders...',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
};

export const WithSuffix: Story = {
  args: {
    label: 'Weight',
    placeholder: '0.00',
    type: 'number',
    suffix: <span className="text-xs text-gray-500">kg</span>,
  },
};

export const NumberInput: Story = {
  args: {
    label: 'Quantity',
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 1000,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <Input label="Default" placeholder="Default input" />
      <Input label="With Value" value="Active shipment" readOnly />
      <Input label="With Hint" placeholder="Enter value" hint="This is a helpful hint" />
      <Input label="With Error" value="bad" error="This value is invalid" />
      <Input label="Required" placeholder="Required field" required />
      <Input label="Disabled" value="Cannot edit" disabled />
      <Input
        label="With Icon"
        placeholder="Search..."
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        }
      />
    </div>
  ),
};
