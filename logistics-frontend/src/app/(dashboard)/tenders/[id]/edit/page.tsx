'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTender, useUpdateTender } from '@/hooks/useApi';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Loading';
import { useAppStore } from '@/stores/appStore';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect } from 'react';

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

const tenderSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Please provide a detailed description'),
  route_origin_city: z.string().min(1, 'Required'),
  route_origin_country: z.string().min(1, 'Required'),
  route_destination_city: z.string().min(1, 'Required'),
  route_destination_country: z.string().min(1, 'Required'),
  cargo_type: z.string().optional(),
  vehicle_type: z.string().optional(),
  estimated_weight: z.string().optional(),
  estimated_volume: z.string().optional(),
  frequency: z.string().optional(),
  shipments_per_period: z.string().optional(),
  budget: z.string().optional(),
  budget_type: z.string().default('per_shipment'),
  currency: z.string().default('EUR'),
  start_date: z.string().min(1, 'Required'),
  end_date: z.string().min(1, 'Required'),
  submission_deadline: z.string().min(1, 'Required'),
  requirements: z.string().optional(),
});

type TenderForm = z.infer<typeof tenderSchema>;

export default function EditTenderPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: tender, isLoading: loadingTender } = useTender(id);
  const updateMutation = useUpdateTender();
  const { addNotification } = useAppStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TenderForm>({
    resolver: zodResolver(tenderSchema),
  });

  // Populate form when data loads
  useEffect(() => {
    if (tender) {
      reset({
        title: tender.title ?? '',
        description: tender.description ?? '',
        route_origin_city: tender.route_origin_city ?? '',
        route_origin_country: tender.route_origin_country ?? '',
        route_destination_city: tender.route_destination_city ?? '',
        route_destination_country: tender.route_destination_country ?? '',
        cargo_type: tender.cargo_type ?? '',
        vehicle_type: tender.vehicle_type ?? '',
        estimated_weight: tender.estimated_weight?.toString() ?? '',
        estimated_volume: tender.estimated_volume?.toString() ?? '',
        frequency: tender.frequency ?? 'weekly',
        shipments_per_period: tender.shipments_per_period?.toString() ?? '',
        budget: tender.budget?.toString() ?? '',
        budget_type: tender.budget_type ?? 'per_shipment',
        currency: tender.currency ?? 'EUR',
        start_date: tender.start_date ?? '',
        end_date: tender.end_date ?? '',
        submission_deadline: tender.submission_deadline ?? '',
        requirements: tender.requirements ?? '',
      });
    }
  }, [tender, reset]);

  const onSubmit = (data: TenderForm) => {
    updateMutation.mutate(
      {
        id,
        data: {
          ...data,
          estimated_weight: data.estimated_weight ? parseFloat(data.estimated_weight) : undefined,
          estimated_volume: data.estimated_volume ? parseFloat(data.estimated_volume) : undefined,
          budget: data.budget ? parseFloat(data.budget) : undefined,
          shipments_per_period: data.shipments_per_period ? parseInt(data.shipments_per_period) : undefined,
        } as Partial<import('@/lib/validations').TenderFormData>,
      },
      {
        onSuccess: () => router.push('/tenders'),
        onError: (err: unknown) => {
          addNotification({
            type: 'error',
            title: 'Error',
            message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update tender',
          });
        },
      }
    );
  };

  if (loadingTender) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
          Tender not found
        </h2>
        <Link href="/tenders" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to tenders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/tenders"
          className="p-2 rounded-lg transition-colors focus-ring"
          style={{ color: 'var(--ds-gray-900)', border: '1px solid var(--ds-gray-400)' }}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
            Edit Tender
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--ds-gray-900)' }}>
            Update tender details and requirements
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General */}
        <Card>
          <CardHeader title="Tender Details" />
          <div className="mt-4 space-y-4">
            <Input label="Title *" error={errors.title?.message} {...register('title')} placeholder="e.g. Weekly FTL Munich → Paris" />
            <Textarea
              label="Description *"
              error={errors.description?.message}
              {...register('description')}
              placeholder="Detailed description of the transport requirements..."
              rows={4}
            />
          </div>
        </Card>

        {/* Route */}
        <Card>
          <CardHeader title="Route" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-700)' }}>Origin</p>
              <Select label="Country *" options={EU_COUNTRIES} error={errors.route_origin_country?.message} {...register('route_origin_country')} />
              <Input label="City *" error={errors.route_origin_city?.message} {...register('route_origin_city')} placeholder="e.g. Munich" />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-700)' }}>Destination</p>
              <Select label="Country *" options={EU_COUNTRIES} error={errors.route_destination_country?.message} {...register('route_destination_country')} />
              <Input label="City *" error={errors.route_destination_city?.message} {...register('route_destination_city')} placeholder="e.g. Paris" />
            </div>
          </div>
        </Card>

        {/* Cargo */}
        <Card>
          <CardHeader title="Cargo & Capacity" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Cargo Type" {...register('cargo_type')} placeholder="e.g. Palletized, FMCG" />
            <Select label="Vehicle Type" options={VEHICLE_TYPES} {...register('vehicle_type')} />
            <Input label="Est. Weight (kg)" type="number" step="0.1" {...register('estimated_weight')} placeholder="e.g. 18000" />
            <Input label="Est. Volume (m³)" type="number" step="0.1" {...register('estimated_volume')} placeholder="e.g. 33" />
          </div>
        </Card>

        {/* Frequency */}
        <Card>
          <CardHeader title="Frequency & Volume" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Frequency"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'bi_weekly', label: 'Bi-weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'one_time', label: 'One-time' },
              ]}
              {...register('frequency')}
            />
            <Input label="Shipments per Period" type="number" {...register('shipments_per_period')} placeholder="e.g. 5" />
          </div>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader title="Budget" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Budget" type="number" step="0.01" {...register('budget')} placeholder="e.g. 2500.00" />
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
              label="Budget Type"
              options={[
                { value: 'per_shipment', label: 'Per Shipment' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'total', label: 'Total Contract' },
              ]}
              {...register('budget_type')}
            />
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader title="Timeline" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Contract Start *" type="date" error={errors.start_date?.message} {...register('start_date')} />
            <Input label="Contract End *" type="date" error={errors.end_date?.message} {...register('end_date')} />
            <Input label="Submission Deadline *" type="date" error={errors.submission_deadline?.message} {...register('submission_deadline')} />
          </div>
        </Card>

        {/* Additional */}
        <Card>
          <CardHeader title="Additional Requirements" />
          <div className="mt-4">
            <Textarea
              {...register('requirements')}
              placeholder="Any additional requirements: certifications, insurance, equipment, experience..."
              rows={4}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button variant="secondary" type="button" onClick={() => router.push('/tenders')}>
            Cancel
          </Button>
          <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
