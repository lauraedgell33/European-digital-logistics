'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrder } from '@/hooks/useApi';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useAppStore } from '@/stores/appStore';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const EU_COUNTRIES = [
  { value: 'AT', label: 'Austria' }, { value: 'BE', label: 'Belgium' }, { value: 'BG', label: 'Bulgaria' },
  { value: 'HR', label: 'Croatia' }, { value: 'CY', label: 'Cyprus' }, { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' }, { value: 'EE', label: 'Estonia' }, { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' }, { value: 'DE', label: 'Germany' }, { value: 'GR', label: 'Greece' },
  { value: 'HU', label: 'Hungary' }, { value: 'IE', label: 'Ireland' }, { value: 'IT', label: 'Italy' },
  { value: 'LV', label: 'Latvia' }, { value: 'LT', label: 'Lithuania' }, { value: 'LU', label: 'Luxembourg' },
  { value: 'MT', label: 'Malta' }, { value: 'NL', label: 'Netherlands' }, { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' }, { value: 'RO', label: 'Romania' }, { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' }, { value: 'ES', label: 'Spain' }, { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' }, { value: 'GB', label: 'United Kingdom' },
];

const VEHICLE_TYPES = [
  { value: 'tautliner', label: 'Tautliner' }, { value: 'box', label: 'Box Truck' },
  { value: 'refrigerated', label: 'Refrigerated' }, { value: 'flatbed', label: 'Flatbed' },
  { value: 'tanker', label: 'Tanker' }, { value: 'container', label: 'Container' },
  { value: 'mega', label: 'Mega Trailer' }, { value: 'lowbed', label: 'Low-bed' },
];

const orderSchema = z.object({
  freight_id: z.string().optional(),
  vehicle_offer_id: z.string().optional(),
  pickup_city: z.string().min(1, 'Pickup city is required'),
  pickup_country: z.string().min(1, 'Required'),
  pickup_address: z.string().optional(),
  pickup_postal: z.string().optional(),
  pickup_date: z.string().min(1, 'Required'),
  delivery_city: z.string().min(1, 'Delivery city is required'),
  delivery_country: z.string().min(1, 'Required'),
  delivery_address: z.string().optional(),
  delivery_postal: z.string().optional(),
  delivery_date: z.string().min(1, 'Required'),
  cargo_type: z.string().optional(),
  weight: z.string().optional(),
  volume: z.string().optional(),
  vehicle_type: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  currency: z.string().default('EUR'),
  payment_terms: z.string().optional(),
  special_instructions: z.string().optional(),
  carrier_company_id: z.string().optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const createOrder = useCreateOrder();
  const { addNotification } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      pickup_country: 'DE',
      delivery_country: 'DE',
      currency: 'EUR',
      payment_terms: 'net_30',
    },
  });

  const onSubmit = (data: OrderForm) => {
    createOrder.mutate(
      {
        ...data,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        volume: data.volume ? parseFloat(data.volume) : undefined,
        price: parseFloat(data.price),
      } as any,
      {
        onSuccess: () => {
          addNotification({ type: 'success', title: 'Order Created', message: 'Your transport order has been placed successfully.' });
          router.push('/orders');
        },
        onError: (err: unknown) => {
          addNotification({ type: 'error', title: 'Error', message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create order' });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/orders')}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
            New Transport Order
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--ds-gray-900)' }}>
            Create a direct transport order with a carrier
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Pickup */}
        <Card>
          <CardHeader title="Pickup Location" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Country *" options={EU_COUNTRIES} error={errors.pickup_country?.message} {...register('pickup_country')} />
            <Input label="City *" error={errors.pickup_city?.message} {...register('pickup_city')} placeholder="e.g. Munich" />
            <Input label="Address" {...register('pickup_address')} placeholder="Street address" />
            <Input label="Postal Code" {...register('pickup_postal')} placeholder="e.g. 80331" />
            <Input label="Pickup Date *" type="date" error={errors.pickup_date?.message} {...register('pickup_date')} />
          </div>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader title="Delivery Location" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Country *" options={EU_COUNTRIES} error={errors.delivery_country?.message} {...register('delivery_country')} />
            <Input label="City *" error={errors.delivery_city?.message} {...register('delivery_city')} placeholder="e.g. Paris" />
            <Input label="Address" {...register('delivery_address')} placeholder="Street address" />
            <Input label="Postal Code" {...register('delivery_postal')} placeholder="e.g. 75001" />
            <Input label="Delivery Date *" type="date" error={errors.delivery_date?.message} {...register('delivery_date')} />
          </div>
        </Card>

        {/* Cargo */}
        <Card>
          <CardHeader title="Cargo & Vehicle" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Cargo Type" {...register('cargo_type')} placeholder="e.g. Electronics, Palletized" />
            <Select label="Vehicle Type" options={VEHICLE_TYPES} {...register('vehicle_type')} />
            <Input label="Weight (kg)" type="number" step="0.1" {...register('weight')} placeholder="e.g. 18000" />
            <Input label="Volume (m³)" type="number" step="0.1" {...register('volume')} placeholder="e.g. 33" />
          </div>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader title="Pricing & Payment" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Price *" type="number" step="0.01" error={errors.price?.message} {...register('price')} placeholder="e.g. 2500.00" />
            <Select
              label="Currency"
              options={[
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'CHF', label: 'CHF' },
                { value: 'PLN', label: 'PLN (zł)' },
                { value: 'CZK', label: 'CZK (Kč)' },
                { value: 'RON', label: 'RON' },
              ]}
              {...register('currency')}
            />
            <Select
              label="Payment Terms"
              options={[
                { value: 'net_7', label: 'Net 7 days' },
                { value: 'net_14', label: 'Net 14 days' },
                { value: 'net_30', label: 'Net 30 days' },
                { value: 'net_60', label: 'Net 60 days' },
                { value: 'prepaid', label: 'Prepaid' },
                { value: 'on_delivery', label: 'On Delivery' },
              ]}
              {...register('payment_terms')}
            />
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader title="Special Instructions" />
          <div className="mt-4">
            <Textarea
              {...register('special_instructions')}
              placeholder="Any special handling, loading instructions, or requirements..."
              rows={4}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button variant="secondary" type="button" onClick={() => router.push('/orders')}>
            Cancel
          </Button>
          <Button type="submit" loading={createOrder.isPending}>
            Create Order
          </Button>
        </div>
      </form>
    </div>
  );
}
