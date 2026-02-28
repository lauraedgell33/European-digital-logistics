import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const countryOptions = [
  { value: 'de', label: 'Germany' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgium' },
  { value: 'at', label: 'Austria' },
  { value: 'pl', label: 'Poland' },
];

export const Default: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Select a country',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Select a country',
  },
};

export const WithError: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Select a country',
    error: 'Country is required',
  },
};

export const Required: Story = {
  args: {
    label: 'Destination',
    options: countryOptions,
    placeholder: 'Select destination',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    value: 'de',
    disabled: true,
  },
};

export const WithPreselectedValue: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    value: 'nl',
  },
};

export const ShipmentStatus: Story = {
  args: {
    label: 'Status Filter',
    placeholder: 'All statuses',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_transit', label: 'In Transit' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
};

export const VehicleType: Story = {
  args: {
    label: 'Vehicle Type',
    placeholder: 'Select vehicle',
    options: [
      { value: 'truck', label: 'Truck' },
      { value: 'van', label: 'Van' },
      { value: 'trailer', label: 'Trailer' },
      { value: 'refrigerated', label: 'Refrigerated Truck' },
      { value: 'flatbed', label: 'Flatbed' },
    ],
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <Select label="Default" options={countryOptions} placeholder="Select..." />
      <Select label="With Value" options={countryOptions} value="de" />
      <Select label="Required" options={countryOptions} placeholder="Required" required />
      <Select label="With Error" options={countryOptions} placeholder="Select..." error="This field is required" />
      <Select label="Disabled" options={countryOptions} value="fr" disabled />
    </div>
  ),
};
