'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFreightOffers, useDeleteFreight } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTable, Pagination } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  formatCurrency,
  formatWeight,
  formatDate,
  VEHICLE_TYPES,
  COUNTRIES,
  getCountryFlag,
} from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { ExportMenu, ExportIcons } from '@/components/ui/ExportMenu';
import { exportApi } from '@/lib/export';
import { useTranslation } from '@/hooks/useTranslation';
import type { FreightOffer } from '@/types';

export default function FreightPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState({
    origin_country: '',
    destination_country: '',
    vehicle_type: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

  const { data, isLoading } = useFreightOffers({
    page,
    search: debouncedSearch,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  });
  const deleteMutation = useDeleteFreight();

  const columns = [
    {
      key: 'route',
      header: 'Route',
      render: (item: FreightOffer) => (
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">{getCountryFlag(item.origin_country)}</span>
              <span
                className="text-[13px] font-medium truncate"
                style={{ color: 'var(--ds-gray-1000)' }}
              >
                {item.origin_city}
              </span>
              <ArrowRightIcon className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--ds-gray-700)' }} />
              <span className="text-[11px]">{getCountryFlag(item.destination_country)}</span>
              <span
                className="text-[13px] font-medium truncate"
                style={{ color: 'var(--ds-gray-1000)' }}
              >
                {item.destination_city}
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>
              {item.origin_postal_code} → {item.destination_postal_code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'cargo',
      header: 'Cargo',
      render: (item: FreightOffer) => (
        <div>
          <p className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
            {item.cargo_description || 'General cargo'}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>
            {formatWeight(item.weight)} · {item.vehicle_type?.replace(/_/g, ' ')}
          </p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Loading Date',
      render: (item: FreightOffer) => (
        <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
          {formatDate(item.loading_date)}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: FreightOffer) => (
        <span className="text-[13px] font-medium font-mono" style={{ color: 'var(--ds-gray-1000)' }}>
          {item.price ? formatCurrency(item.price) : 'On request'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: FreightOffer) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
            {t('freight.title')}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            {t('freight.allOffers')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            options={[
              { label: 'CSV', icon: ExportIcons.csv, onClick: () => exportApi.freightCsv() },
              { label: 'Excel', icon: ExportIcons.excel, onClick: () => exportApi.freightExcel() },
            ]}
          />
          <Link href="/freight/new" className="no-underline">
            <Button icon={<PlusIcon className="h-4 w-4" />}>
              {t('freight.postNew')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by city, postal code, cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-geist btn-geist-secondary"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4"
            style={{ borderTop: '1px solid var(--ds-gray-300)' }}
          >
            <Select
              label="Origin Country"
              placeholder="Any country"
              options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              value={filters.origin_country}
              onChange={(e) =>
                setFilters((f) => ({ ...f, origin_country: e.target.value }))
              }
            />
            <Select
              label="Destination Country"
              placeholder="Any country"
              options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              value={filters.destination_country}
              onChange={(e) =>
                setFilters((f) => ({ ...f, destination_country: e.target.value }))
              }
            />
            <Select
              label="Vehicle Type"
              placeholder="Any type"
              options={VEHICLE_TYPES.map((v) => ({ value: v.value, label: v.label }))}
              value={filters.vehicle_type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, vehicle_type: e.target.value }))
              }
            />
            <Select
              label="Status"
              placeholder="All statuses"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'expired', label: 'Expired' },
                { value: 'booked', label: 'Booked' },
              ]}
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
            />
          </div>
        )}
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage={t('freight.noOffers')}
        onRowClick={(item) => router.push(`/freight/${item.id}`)}
      />

      {/* Pagination */}
      {data?.meta && data.meta.last_page > 1 && (
        <Pagination
          currentPage={data.meta.current_page}
          totalPages={data.meta.last_page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
