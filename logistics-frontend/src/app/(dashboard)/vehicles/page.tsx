'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicleOffers } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, StatCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Pagination } from '@/components/ui/DataTable';
import { VEHICLE_TYPES, COUNTRIES, formatWeight, formatDate } from '@/lib/utils';
import {
  TruckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import type { VehicleOffer } from '@/types';

export default function VehiclesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState({
    country: '',
    vehicle_type: '',
    status: '',
  });
  const { t } = useTranslation();

  const { data, isLoading } = useVehicleOffers({
    page,
    search: debouncedSearch,
    ...filters,
  });

  const vehicles = data?.data ?? [];
  const meta = data?.meta;

  const columns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (row: VehicleOffer) => (
        <div>
          <div className="font-medium text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
            {VEHICLE_TYPES.find((v) => v.value === row.vehicle_type)?.label ?? row.vehicle_type}
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: 'var(--ds-gray-900)' }}>
            {row.company?.name ?? '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Current Location',
      render: (row: VehicleOffer) => (
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--ds-gray-800)' }} />
          <div>
            <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
              {row.current_city}
            </span>
            <span className="text-[12px] ml-1" style={{ color: 'var(--ds-gray-900)' }}>
              {row.current_country}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Preferred Destination',
      render: (row: VehicleOffer) => (
        <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
          {row.destination_city
            ? `${row.destination_city}, ${row.destination_country}`
            : 'Any'}
        </span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (row: VehicleOffer) => (
        <div className="text-[13px]">
          <div style={{ color: 'var(--ds-gray-1000)' }}>{formatWeight(row.capacity_kg)}</div>
          {row.loading_meters && (
            <div className="text-[12px]" style={{ color: 'var(--ds-gray-900)' }}>
              {row.loading_meters} LDM
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'availability',
      header: 'Available',
      render: (row: VehicleOffer) => (
        <div className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
          {formatDate(row.available_from)}
          {row.available_to && (
            <span style={{ color: 'var(--ds-gray-800)' }}>
              {' → '}{formatDate(row.available_to)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'features',
      header: 'Features',
      render: (row: VehicleOffer) => (
        <div className="flex gap-1 flex-wrap">
          {row.has_adr && <Badge variant="amber">ADR</Badge>}
          {row.has_temperature_control && <Badge variant="blue">Temp</Badge>}
          {row.equipment?.includes('tail_lift') && <Badge variant="gray">Tail Lift</Badge>}
          {row.equipment?.includes('gps') && <Badge variant="green">GPS</Badge>}
          {!row.has_adr && !row.has_temperature_control && !row.equipment?.length && (
            <span className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>Standard</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: VehicleOffer) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            {t('vehicles.title')}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            {t('vehicles.allOffers')}
          </p>
        </div>
        <Link href="/vehicles/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('vehicles.postNew')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('common.total')}
          value={meta?.total ?? '—'}
          icon={<TruckIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('vehicles.gps')}
          value="—"
          icon={<MapPinIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('vehicles.adrCertified')}
          value="—"
          icon={<CheckBadgeIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('vehicles.availableFrom')}
          value="—"
          icon={<ClockIcon className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by city, company, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Select
              options={[
                { value: '', label: 'All Countries' },
                ...COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
              ]}
              value={filters.country}
              onChange={(e) => {
                setFilters((p) => ({ ...p, country: e.target.value }));
                setPage(1);
              }}
            />
            <Select
              options={[
                { value: '', label: 'All Vehicles' },
                ...VEHICLE_TYPES.map((v) => ({ value: v.value, label: v.label })),
              ]}
              value={filters.vehicle_type}
              onChange={(e) => {
                setFilters((p) => ({ ...p, vehicle_type: e.target.value }));
                setPage(1);
              }}
            />
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'in_transit', label: 'In Transit' },
                { value: 'booked', label: 'Booked' },
              ]}
              value={filters.status}
              onChange={(e) => {
                setFilters((p) => ({ ...p, status: e.target.value }));
                setPage(1);
              }}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <DataTable columns={columns} data={vehicles} loading={isLoading} onRowClick={(item) => router.push(`/vehicles/${item.id}`)} />
        {meta && (
          <div
            className="px-4 py-3"
            style={{ borderTop: '1px solid var(--ds-gray-400)' }}
          >
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
