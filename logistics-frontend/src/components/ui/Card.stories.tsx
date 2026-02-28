import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    hover: { control: 'boolean' },
    flat: { control: 'boolean' },
    interactive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Default Card</h3>
        <p className="text-gray-600">This is a default card component.</p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Interactive Card</h3>
        <p className="text-gray-600">Click me for interaction!</p>
      </div>
    ),
  },
};

export const Flat: Story = {
  args: {
    flat: true,
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Flat Card</h3>
        <p className="text-gray-600">A flat, borderless card.</p>
      </div>
    ),
  },
};

export const FreightOfferCard: Story = {
  name: 'Freight Offer Card',
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">Berlin → Munich</h3>
            <p className="text-sm text-gray-500">10t General Cargo</p>
          </div>
          <Badge variant="green">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Loading</span>
            <p className="font-medium">15 Jul 2025</p>
          </div>
          <div>
            <span className="text-gray-500">Unloading</span>
            <p className="font-medium">16 Jul 2025</p>
          </div>
          <div>
            <span className="text-gray-500">Price</span>
            <p className="font-bold text-blue-600">€1,250.00</p>
          </div>
          <div>
            <span className="text-gray-500">Distance</span>
            <p className="font-medium">584 km</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button size="sm" variant="primary">View Details</Button>
          <Button size="sm" variant="ghost">Contact</Button>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const StatsCard: Story = {
  name: 'Stats Card',
  render: () => (
    <div className="grid grid-cols-3 gap-4 w-[600px]">
      <Card>
        <p className="text-sm text-gray-500 mb-1">Active Offers</p>
        <p className="text-3xl font-bold">127</p>
        <p className="text-xs text-green-600 mt-1">+12% vs last week</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-500 mb-1">In Transit</p>
        <p className="text-3xl font-bold">43</p>
        <p className="text-xs text-blue-600 mt-1">8 arriving today</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-500 mb-1">Revenue</p>
        <p className="text-3xl font-bold">€52.4K</p>
        <p className="text-xs text-green-600 mt-1">+8.5% vs last month</p>
      </Card>
    </div>
  ),
};
