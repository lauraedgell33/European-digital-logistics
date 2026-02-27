'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVehicleOffer, useUpdateVehicle } from '@/hooks/useApi';
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
import { vehicleOfferSchema, type VehicleOfferFormData } from '@/lib/validations';
import { VEHICLE_TYPES, COUNTRIES } from '@/lib/utils';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/Loading';
import Link from 'next/link';
import { useEffect } from 'react';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: vehicle, isLoading: loadingVehicle } = useVehicleOffer(id);
  const updateMutation = useUpdateVehicle();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<VehicleOfferFormData>({
    resolver: zodResolver(vehicleOfferSchema),
  });

  // Populate form when data loads
  useEffect(() => {
    if (vehicle) {
      reset({
        vehicle_type: vehicle.vehicle_type ?? '',
        vehicle_registration: vehicle.vehicle_registration ?? '',
        capacity_kg: vehicle.capacity_kg ?? undefined,
        capacity_m3: vehicle.capacity_m3 ?? undefined,
        loading_meters: vehicle.loading_meters ?? undefined,
        pallet_spaces: vehicle.pallet_spaces ?? undefined,
        current_country: vehicle.current_country ?? 'DE',
        current_city: vehicle.current_city ?? '',
        current_postal_code: vehicle.current_postal_code ?? '',
        destination_country: vehicle.destination_country ?? '',
        destination_city: vehicle.destination_city ?? '',
        available_from: vehicle.available_from ?? '',
        available_to: vehicle.available_to ?? '',
        price_per_km: vehicle.price_per_km ?? undefined,
        flat_price: vehicle.flat_price ?? undefined,
        currency: vehicle.currency ?? 'EUR',
        has_adr: vehicle.has_adr ?? false,
        has_temperature_control: vehicle.has_temperature_control ?? false,
        has_gps: vehicle.has_gps ?? false,
        has_tail_lift: vehicle.has_tail_lift ?? false,
        min_temperature: vehicle.min_temperature ?? undefined,
        max_temperature: vehicle.max_temperature ?? undefined,
        driver_name: vehicle.driver_name ?? '',
        driver_phone: vehicle.driver_phone ?? '',
        notes: vehicle.notes ?? '',
        is_public: vehicle.is_public ?? true,
      });
    }
  }, [vehicle, reset]);

  const onSubmit = (data: VehicleOfferFormData) => {
    updateMutation.mutate(
      { id, data },
      { onSuccess: () => router.push('/vehicles') }
    );
  };

  const hasTemp = watch('has_temperature_control');

  if (loadingVehicle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
          Vehicle not found
        </h2>
        <Link href="/vehicles" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/vehicles"
          className="p-2 rounded-lg transition-colors focus-ring"
          style={{ color: 'var(--ds-gray-900)', border: '1px solid var(--ds-gray-400)' }}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
            Edit Vehicle
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--ds-gray-900)' }}>
            Update vehicle capacity details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormErrorSummary errors={errors} />

        {/* Vehicle Details */}
        <Card>
          <CardHeader title="Vehicle Details" description="Type and capacity information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <SelectInput
              label="Vehicle Type"
              options={VEHICLE_TYPES}
              error={errors.vehicle_type?.message}
              {...register('vehicle_type')}
              required
            />
            <TextInput
              label="Registration Number"
              placeholder="e.g. B-LO 1234"
              error={errors.vehicle_registration?.message}
              {...register('vehicle_registration')}
            />
            <TextInput
              label="Capacity (kg)"
              type="number"
              placeholder="24000"
              error={errors.capacity_kg?.message}
              {...register('capacity_kg', { valueAsNumber: true })}
              required
            />
            <TextInput
              label="Capacity (m³)"
              type="number"
              placeholder="86"
              error={errors.capacity_m3?.message}
              {...register('capacity_m3', { valueAsNumber: true })}
            />
            <TextInput
              label="Loading Meters"
              type="number"
              placeholder="13.6"
              error={errors.loading_meters?.message}
              {...register('loading_meters', { valueAsNumber: true })}
            />
            <TextInput
              label="Pallet Spaces"
              type="number"
              placeholder="33"
              error={errors.pallet_spaces?.message}
              {...register('pallet_spaces', { valueAsNumber: true })}
            />
          </div>
        </Card>

        {/* Current Location */}
        <Card>
          <CardHeader title="Current Location" description="Where the vehicle is currently available" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <SelectInput
              label="Country"
              options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              error={errors.current_country?.message}
              {...register('current_country')}
              required
            />
            <TextInput
              label="City"
              placeholder="e.g. Hamburg"
              error={errors.current_city?.message}
              {...register('current_city')}
              required
            />
            <TextInput
              label="Postal Code"
              placeholder="20457"
              error={errors.current_postal_code?.message}
              {...register('current_postal_code')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <TextInput
              label="Preferred Destination Country"
              placeholder="Optional"
              error={errors.destination_country?.message}
              {...register('destination_country')}
            />
            <TextInput
              label="Preferred Destination City"
              placeholder="Optional"
              error={errors.destination_city?.message}
              {...register('destination_city')}
            />
          </div>
        </Card>

        {/* Availability & Pricing */}
        <Card>
          <CardHeader title="Availability & Pricing" description="When and at what price" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <TextInput
              label="Available From"
              type="date"
              error={errors.available_from?.message}
              {...register('available_from')}
              required
            />
            <TextInput
              label="Available To"
              type="date"
              error={errors.available_to?.message}
              {...register('available_to')}
            />
            <TextInput
              label="Price per km"
              type="number"
              step="0.01"
              placeholder="1.25"
              error={errors.price_per_km?.message}
              {...register('price_per_km', { valueAsNumber: true })}
            />
            <TextInput
              label="Flat Price"
              type="number"
              step="0.01"
              placeholder="Optional flat rate"
              error={errors.flat_price?.message}
              {...register('flat_price', { valueAsNumber: true })}
            />
            <SelectInput
              label="Currency"
              options={[
                { value: 'EUR', label: '€ EUR' },
                { value: 'USD', label: '$ USD' },
                { value: 'GBP', label: '£ GBP' },
                { value: 'PLN', label: 'zł PLN' },
                { value: 'CZK', label: 'Kč CZK' },
                { value: 'RON', label: 'lei RON' },
              ]}
              error={errors.currency?.message}
              {...register('currency')}
            />
          </div>
        </Card>

        {/* Special Features */}
        <Card>
          <CardHeader title="Special Features" description="ADR, temperature control, and equipment" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Checkbox label="ADR (Hazardous Goods)" {...register('has_adr')} />
            <Checkbox label="Temperature Controlled" {...register('has_temperature_control')} />
            <Checkbox label="GPS Tracked" {...register('has_gps')} />
            <Checkbox label="Tail Lift" {...register('has_tail_lift')} />
          </div>
          {hasTemp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <TextInput
                label="Min Temperature (°C)"
                type="number"
                placeholder="-20"
                error={errors.min_temperature?.message}
                {...register('min_temperature', { valueAsNumber: true })}
              />
              <TextInput
                label="Max Temperature (°C)"
                type="number"
                placeholder="8"
                error={errors.max_temperature?.message}
                {...register('max_temperature', { valueAsNumber: true })}
              />
            </div>
          )}
        </Card>

        {/* Driver & Notes */}
        <Card>
          <CardHeader title="Driver & Additional Info" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <TextInput
              label="Driver Name"
              placeholder="Optional"
              error={errors.driver_name?.message}
              {...register('driver_name')}
            />
            <TextInput
              label="Driver Phone"
              placeholder="+49 xxx xxx xxxx"
              error={errors.driver_phone?.message}
              {...register('driver_phone')}
            />
          </div>
          <div className="mt-4">
            <TextArea
              label="Notes"
              placeholder="Additional information about the vehicle..."
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>
          <div className="mt-4">
            <Checkbox label="Publish publicly on the marketplace" {...register('is_public')} />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => router.push('/vehicles')}>
            Cancel
          </Button>
          <SubmitButton isLoading={updateMutation.isPending} disabled={!isDirty}>
            Save Changes
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
