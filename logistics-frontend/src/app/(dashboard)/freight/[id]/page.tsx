'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFreightOffer } from '@/hooks/useApi';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Loading';
import { formatDate, formatCurrency, formatWeight, formatDistance, getCountryFlag, VEHICLE_TYPES } from '@/lib/utils';
import {
  TruckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CubeIcon,
  BanknotesIcon,
  ArrowLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

export default function FreightDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: freight, isLoading, error } = useFreightOffer(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !freight) {
    return (
      <div className="text-center py-24">
        <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--ds-gray-600)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Freight offer not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/freight')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Freight Exchange
        </Button>
      </div>
    );
  }

  const vehicleLabel = VEHICLE_TYPES.find((v: { value: string; label: string }) => v.value === freight.vehicle_type)?.label || freight.vehicle_type;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/freight')}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
              Freight Offer #{freight.id}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ds-gray-900)' }}>
              Posted {formatDate(freight.created_at)}
            </p>
          </div>
        </div>
        <StatusBadge status={freight.status} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={() => router.push(`/freight/${freight.id}/edit`)}>
          Edit Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route */}
          <Card>
            <CardHeader title="Route Details" description="Loading and unloading locations" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: 'var(--ds-green-700)' }} />
                  <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-800)' }}>Origin</span>
                </div>
                <div className="pl-5 space-y-1">
                  <p className="font-semibold text-[15px]" style={{ color: 'var(--ds-gray-1000)' }}>
                    {getCountryFlag(freight.origin_country)} {freight.origin_city}
                  </p>
                  {freight.origin_address && (
                    <p className="text-[13px]" style={{ color: 'var(--ds-gray-900)' }}>{freight.origin_address}</p>
                  )}
                  <p className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
                    {freight.origin_postal_code}, {freight.origin_country}
                  </p>
                </div>
                <div className="pl-5 pt-2 flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                  <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
                    {formatDate(freight.loading_date)}
                    {freight.loading_time_from && ` ${freight.loading_time_from}`}
                    {freight.loading_time_to && ` – ${freight.loading_time_to}`}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: 'var(--ds-red-700)' }} />
                  <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-800)' }}>Destination</span>
                </div>
                <div className="pl-5 space-y-1">
                  <p className="font-semibold text-[15px]" style={{ color: 'var(--ds-gray-1000)' }}>
                    {getCountryFlag(freight.destination_country)} {freight.destination_city}
                  </p>
                  {freight.destination_address && (
                    <p className="text-[13px]" style={{ color: 'var(--ds-gray-900)' }}>{freight.destination_address}</p>
                  )}
                  <p className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
                    {freight.destination_postal_code}, {freight.destination_country}
                  </p>
                </div>
                <div className="pl-5 pt-2 flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                  <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
                    {formatDate(freight.unloading_date)}
                    {freight.unloading_time_from && ` ${freight.unloading_time_from}`}
                    {freight.unloading_time_to && ` – ${freight.unloading_time_to}`}
                  </span>
                </div>
              </div>
            </div>

            {(freight.distance_km || freight.estimated_duration_hours) && (
              <div className="mt-4 pt-4 flex items-center gap-6" style={{ borderTop: '1px solid var(--ds-gray-300)' }}>
                {freight.distance_km && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                    <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{formatDistance(freight.distance_km)}</span>
                  </div>
                )}
                {freight.estimated_duration_hours && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                    <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{freight.estimated_duration_hours}h estimated</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Cargo Details */}
          <Card>
            <CardHeader title="Cargo Details" description="Cargo specifications and requirements" />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem label="Cargo Type" value={freight.cargo_type} />
              <InfoItem label="Weight" value={formatWeight(freight.weight)} />
              {freight.volume && <InfoItem label="Volume" value={`${freight.volume} m³`} />}
              {freight.pallet_count && <InfoItem label="Pallets" value={`${freight.pallet_count} pcs`} />}
              {freight.loading_meters && <InfoItem label="Loading Meters" value={`${freight.loading_meters} ldm`} />}
              {freight.length && <InfoItem label="Dimensions" value={`${freight.length}×${freight.width}×${freight.height} cm`} />}
            </div>

            {(freight.is_hazardous || freight.requires_temperature_control) && (
              <div className="mt-4 flex items-center gap-3">
                {freight.is_hazardous && (
                  <Badge variant="red">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" /> ADR {freight.adr_class}
                  </Badge>
                )}
                {freight.requires_temperature_control && (
                  <Badge variant="blue">
                    🌡️ {freight.min_temperature}°C – {freight.max_temperature}°C
                  </Badge>
                )}
              </div>
            )}

            {freight.cargo_description && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--ds-gray-300)' }}>
                <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--ds-gray-800)' }}>Description</p>
                <p className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{freight.cargo_description}</p>
              </div>
            )}

            {freight.notes && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--ds-gray-300)' }}>
                <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--ds-gray-800)' }}>Additional Notes</p>
                <p className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{freight.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader title="Pricing" />
            <div className="mt-3">
              {freight.price ? (
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                    {formatCurrency(freight.price, freight.currency)}
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--ds-gray-800)' }}>
                    {freight.price_type === 'fixed' ? 'Fixed price' : freight.price_type === 'per_km' ? 'Per kilometer' : 'Negotiable'}
                  </p>
                  {freight.distance_km && freight.price_type === 'fixed' && (
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>
                      ≈ {formatCurrency(freight.price / freight.distance_km, freight.currency)}/km
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[14px] font-medium" style={{ color: 'var(--ds-amber-900)' }}>Price on request</p>
              )}
            </div>
          </Card>

          {/* Vehicle Requirements */}
          <Card>
            <CardHeader title="Vehicle Requirements" />
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <TruckIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{vehicleLabel}</span>
              </div>
              {freight.required_equipment && freight.required_equipment.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {freight.required_equipment.map((eq: string) => (
                    <Badge key={eq} variant="gray">{eq}</Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Company Info */}
          {freight.company && (
            <Card>
              <CardHeader title="Posted by" />
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                  <span className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    {getCountryFlag(freight.company.country_code)} {freight.company.name}
                  </span>
                </div>
                {freight.company.verification_status === 'verified' && (
                  <div className="flex items-center gap-1">
                    <CheckBadgeIcon className="h-4 w-4" style={{ color: 'var(--ds-green-700)' }} />
                    <span className="text-[12px]" style={{ color: 'var(--ds-green-900)' }}>Verified company</span>
                  </div>
                )}
                <p className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
                  {freight.company.city}, {freight.company.country_code}
                </p>
              </div>
            </Card>
          )}

          {/* Actions */}
          {freight.status === 'active' && (
            <Card>
              <div className="space-y-3">
                <Button className="w-full">Contact & Book</Button>
                <Button variant="secondary" className="w-full">Request Quote</Button>
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
