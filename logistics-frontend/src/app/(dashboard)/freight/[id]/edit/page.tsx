'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFreightOffer, useUpdateFreight } from '@/hooks/useApi';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FormField,
  TextInput,
  TextArea,
  SelectInput,
  Checkbox,
  FormErrorSummary,
  SubmitButton,
} from '@/components/ui/FormField';
import { freightOfferSchema, type FreightOfferFormData } from '@/lib/validations';
import { VEHICLE_TYPES, COUNTRIES } from '@/lib/utils';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/Loading';
import Link from 'next/link';
import { useEffect } from 'react';

export default function EditFreightPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: freight, isLoading: loadingFreight } = useFreightOffer(id);
  const updateMutation = useUpdateFreight();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FreightOfferFormData>({
    resolver: zodResolver(freightOfferSchema),
  });

  // Populate form when data loads
  useEffect(() => {
    if (freight) {
      reset({
        origin_country: freight.origin_country,
        origin_city: freight.origin_city,
        origin_postal_code: freight.origin_postal_code,
        destination_country: freight.destination_country,
        destination_city: freight.destination_city,
        destination_postal_code: freight.destination_postal_code,
        loading_date: freight.loading_date,
        unloading_date: freight.unloading_date,
        cargo_description: freight.cargo_description || '',
        weight: freight.weight,
        volume: freight.volume || undefined,
        loading_meters: freight.loading_meters || undefined,
        vehicle_type: freight.vehicle_type,
        is_hazardous: freight.is_hazardous || false,
        is_temperature_controlled: freight.requires_temperature_control || false,
        price: freight.price || undefined,
        currency: freight.currency || 'EUR',
        notes: freight.notes || '',
      });
    }
  }, [freight, reset]);

  const onSubmit = async (data: FreightOfferFormData) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      router.push(`/freight/${id}`);
    } catch {
      // handled by hook
    }
  };

  if (loadingFreight) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!freight) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
          Freight offer not found
        </h2>
        <Link href="/freight" className="btn-geist btn-geist-secondary mt-4 no-underline">
          Back to Freight Exchange
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/freight/${id}`}
          className="btn-geist btn-geist-ghost btn-geist-sm no-underline"
          aria-label="Back to freight offer"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
            Edit Freight Offer
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            Update the details of your freight offer
          </p>
        </div>
      </div>

      {Object.keys(errors).length > 0 && <FormErrorSummary errors={errors} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Origin */}
        <Card>
          <CardHeader title="Origin" description="Where the cargo needs to be picked up" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <FormField label="Country" name="origin_country" error={errors.origin_country?.message} required>
              <SelectInput
                {...register('origin_country')}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
                error={errors.origin_country?.message}
              />
            </FormField>
            <FormField label="City" name="origin_city" error={errors.origin_city?.message} required>
              <TextInput
                {...register('origin_city')}
                placeholder="e.g. Hamburg"
                error={errors.origin_city?.message}
              />
            </FormField>
            <FormField label="Postal Code" name="origin_postal_code" error={errors.origin_postal_code?.message} required>
              <TextInput
                {...register('origin_postal_code')}
                placeholder="e.g. 20095"
                error={errors.origin_postal_code?.message}
              />
            </FormField>
          </div>
        </Card>

        {/* Destination */}
        <Card>
          <CardHeader title="Destination" description="Where the cargo needs to be delivered" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <FormField label="Country" name="destination_country" error={errors.destination_country?.message} required>
              <SelectInput
                {...register('destination_country')}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
                error={errors.destination_country?.message}
              />
            </FormField>
            <FormField label="City" name="destination_city" error={errors.destination_city?.message} required>
              <TextInput
                {...register('destination_city')}
                placeholder="e.g. Paris"
                error={errors.destination_city?.message}
              />
            </FormField>
            <FormField label="Postal Code" name="destination_postal_code" error={errors.destination_postal_code?.message} required>
              <TextInput
                {...register('destination_postal_code')}
                placeholder="e.g. 75001"
                error={errors.destination_postal_code?.message}
              />
            </FormField>
          </div>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader title="Schedule" description="Loading and unloading dates" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <FormField label="Loading Date" name="loading_date" error={errors.loading_date?.message} required>
              <TextInput type="date" {...register('loading_date')} error={errors.loading_date?.message} />
            </FormField>
            <FormField label="Unloading Date" name="unloading_date" error={errors.unloading_date?.message} required>
              <TextInput type="date" {...register('unloading_date')} error={errors.unloading_date?.message} />
            </FormField>
          </div>
        </Card>

        {/* Cargo Details */}
        <Card>
          <CardHeader title="Cargo Details" description="Describe the goods to be transported" />
          <div className="space-y-4 mt-4">
            <FormField label="Cargo Description" name="cargo_description" error={errors.cargo_description?.message} required>
              <TextArea
                {...register('cargo_description')}
                placeholder="Describe the type of cargo, packaging, special requirements..."
                error={errors.cargo_description?.message}
                maxLength={500}
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Weight (kg)" name="weight" error={errors.weight?.message} required>
                <TextInput type="number" {...register('weight', { valueAsNumber: true })} placeholder="e.g. 15000" error={errors.weight?.message} />
              </FormField>
              <FormField label="Volume (m³)" name="volume" error={errors.volume?.message}>
                <TextInput type="number" {...register('volume', { valueAsNumber: true })} placeholder="e.g. 80" error={errors.volume?.message} />
              </FormField>
              <FormField label="Loading Meters" name="loading_meters" error={errors.loading_meters?.message}>
                <TextInput type="number" {...register('loading_meters', { valueAsNumber: true })} placeholder="e.g. 13.6" error={errors.loading_meters?.message} />
              </FormField>
            </div>
            <FormField label="Vehicle Type Required" name="vehicle_type" error={errors.vehicle_type?.message} required>
              <SelectInput
                {...register('vehicle_type')}
                options={VEHICLE_TYPES.map((v) => ({ value: v.value, label: v.label }))}
                error={errors.vehicle_type?.message}
              />
            </FormField>
            <div className="flex gap-6">
              <Checkbox {...register('is_hazardous')} label="Hazardous (ADR)" />
              <Checkbox {...register('is_temperature_controlled')} label="Temperature Controlled" />
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader title="Pricing" description="Set your price or leave open for negotiation" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <FormField label="Price" name="price" error={errors.price?.message} hint="Optional — carriers will see 'Price on request' if empty">
              <TextInput type="number" {...register('price', { valueAsNumber: true })} placeholder="Leave empty for 'On request'" error={errors.price?.message} />
            </FormField>
            <FormField label="Currency" name="currency" error={errors.currency?.message}>
              <SelectInput
                {...register('currency')}
                options={[
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CHF', label: 'CHF (Fr.)' },
                  { value: 'PLN', label: 'PLN (zł)' },
                  { value: 'CZK', label: 'CZK (Kč)' },
                ]}
                error={errors.currency?.message}
              />
            </FormField>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader title="Additional Notes" description="Any extra information for carriers" />
          <div className="mt-4">
            <TextArea {...register('notes')} placeholder="Additional requirements, contact details, special instructions..." maxLength={1000} />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href={`/freight/${id}`} className="btn-geist btn-geist-secondary no-underline">
            Cancel
          </Link>
          <SubmitButton isLoading={isSubmitting || updateMutation.isPending} disabled={!isDirty}>
            Save Changes
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
