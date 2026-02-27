'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVehicleOffer } from '@/hooks/useApi';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Loading';
import { formatDate, formatCurrency, getCountryFlag, VEHICLE_TYPES } from '@/lib/utils';
import {
  TruckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: vehicle, isLoading, error } = useVehicleOffer(Number(id));

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (error || !vehicle) {
    return (
      <div className="text-center py-24">
        <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--ds-gray-600)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Vehicle not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/vehicles')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Vehicles
        </Button>
      </div>
    );
  }

  const vehicleLabel = VEHICLE_TYPES.find((v: { value: string; label: string }) => v.value === vehicle.vehicle_type)?.label || vehicle.vehicle_type;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/vehicles')}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
              {vehicleLabel}
              {vehicle.vehicle_registration && (
                <span className="text-[14px] font-normal ml-3" style={{ color: 'var(--ds-gray-800)' }}>
                  {vehicle.vehicle_registration}
                </span>
              )}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ds-gray-900)' }}>
              Posted {formatDate(vehicle.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={vehicle.status} />
          <Button variant="primary" size="sm" onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}>
            Edit Offer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Location & Availability */}
          <Card>
            <CardHeader title="Location & Availability" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-800)' }}>Current Location</p>
                <p className="font-semibold text-[15px]" style={{ color: 'var(--ds-gray-1000)' }}>
                  {getCountryFlag(vehicle.current_country)} {vehicle.current_city}
                </p>
                {vehicle.current_postal_code && (
                  <p className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>{vehicle.current_postal_code}, {vehicle.current_country}</p>
                )}
              </div>
              {vehicle.destination_city && (
                <div className="space-y-2">
                  <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-800)' }}>Preferred Destination</p>
                  <p className="font-semibold text-[15px]" style={{ color: 'var(--ds-gray-1000)' }}>
                    {vehicle.destination_country && getCountryFlag(vehicle.destination_country)} {vehicle.destination_city}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 flex items-center gap-6" style={{ borderTop: '1px solid var(--ds-gray-300)' }}>
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
                  From {formatDate(vehicle.available_from)}
                  {vehicle.available_to && ` to ${formatDate(vehicle.available_to)}`}
                </span>
              </div>
            </div>
          </Card>

          {/* Capacity */}
          <Card>
            <CardHeader title="Capacity & Specifications" />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem label="Vehicle Type" value={vehicleLabel} />
              <InfoItem label="Max Weight" value={`${(vehicle.capacity_kg / 1000).toFixed(1)} t`} />
              {vehicle.capacity_m3 && <InfoItem label="Volume" value={`${vehicle.capacity_m3} m³`} />}
              {vehicle.loading_meters && <InfoItem label="Loading Meters" value={`${vehicle.loading_meters} ldm`} />}
              {vehicle.pallet_spaces && <InfoItem label="Pallet Spaces" value={`${vehicle.pallet_spaces}`} />}
            </div>
            {(vehicle.has_adr || vehicle.has_temperature_control) && (
              <div className="mt-4 flex items-center gap-3">
                {vehicle.has_adr && <Badge variant="red"><ExclamationTriangleIcon className="h-3 w-3 mr-1" /> ADR Certified</Badge>}
                {vehicle.has_temperature_control && (
                  <Badge variant="blue">🌡️ {vehicle.min_temperature}°C – {vehicle.max_temperature}°C</Badge>
                )}
              </div>
            )}
            {vehicle.equipment && vehicle.equipment.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {vehicle.equipment.map((eq: string) => <Badge key={eq} variant="gray">{eq}</Badge>)}
              </div>
            )}
          </Card>

          {vehicle.notes && (
            <Card>
              <CardHeader title="Additional Notes" />
              <p className="mt-2 text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{vehicle.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Pricing" />
            <div className="mt-3 space-y-2">
              {vehicle.price_per_km && (
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                    {formatCurrency(vehicle.price_per_km, vehicle.currency)}/km
                  </p>
                </div>
              )}
              {vehicle.flat_price && (
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    Flat rate: {formatCurrency(vehicle.flat_price, vehicle.currency)}
                  </p>
                </div>
              )}
              {!vehicle.price_per_km && !vehicle.flat_price && (
                <p className="text-[14px]" style={{ color: 'var(--ds-amber-900)' }}>Price on request</p>
              )}
            </div>
          </Card>

          {(vehicle.driver_name || vehicle.driver_phone) && (
            <Card>
              <CardHeader title="Driver" />
              <div className="mt-3 space-y-2">
                {vehicle.driver_name && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                    <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{vehicle.driver_name}</span>
                  </div>
                )}
                {vehicle.driver_phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                    <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{vehicle.driver_phone}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {vehicle.company && (
            <Card>
              <CardHeader title="Company" />
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                  <span className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    {getCountryFlag(vehicle.company.country_code)} {vehicle.company.name}
                  </span>
                </div>
                {vehicle.company.verification_status === 'verified' && (
                  <div className="flex items-center gap-1">
                    <CheckBadgeIcon className="h-4 w-4" style={{ color: 'var(--ds-green-700)' }} />
                    <span className="text-[12px]" style={{ color: 'var(--ds-green-900)' }}>Verified</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {vehicle.status === 'available' && (
            <Card>
              <div className="space-y-3">
                <Button className="w-full">Book Vehicle</Button>
                <Button variant="secondary" className="w-full">Contact Carrier</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--ds-gray-700)' }}>{label}</p>
      <p className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>{value}</p>
    </div>
  );
}
