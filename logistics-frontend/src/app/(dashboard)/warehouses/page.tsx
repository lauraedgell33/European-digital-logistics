'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { warehouseApi } from '@/lib/api';
import { formatCurrency, getCountryFlag } from '@/lib/utils';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ArrowsPointingOutIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import type { Warehouse } from '@/types';

const WAREHOUSE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'standard', label: 'Standard' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'hazmat', label: 'Hazmat' },
  { value: 'bonded', label: 'Bonded' },
  { value: 'cross_dock', label: 'Cross-Dock' },
  { value: 'fulfillment', label: 'Fulfillment' },
];

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [warehouseType, setWarehouseType] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    loadWarehouses();
  }, [page, warehouseType]);

  async function loadWarehouses() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (warehouseType) params.warehouse_type = warehouseType;
      if (search) params.search = search;
      const res = await warehouseApi.search(params);
      setWarehouses(res.data.data || []);
      setLastPage(res.data.meta?.last_page || 1);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setPage(1);
    loadWarehouses();
  }

  if (loading && warehouses.length === 0) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
          <BuildingStorefrontIcon className="inline h-7 w-7 mr-2" />
          Warehouse Exchange
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
          Find and book warehouse space across Europe
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Search</label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="City, country, or keyword..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="w-48">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Type</label>
            <Select value={warehouseType} onChange={(e) => { setWarehouseType(e.target.value); setPage(1); }}>
              {WAREHOUSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>
          <Button onClick={handleSearch}>
            <MagnifyingGlassIcon className="h-4 w-4 mr-1" /> Search
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(wh => (
          <Card key={wh.id}>
            <div
              className="p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedWarehouse(wh)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{wh.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>
                    <MapPinIcon className="inline h-3 w-3" /> {wh.city}, {getCountryFlag(wh.country)} {wh.country}
                  </p>
                </div>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: wh.available_space_sqm > 0 ? 'var(--ds-green-200)' : 'var(--ds-red-200)',
                    color: wh.available_space_sqm > 0 ? 'var(--ds-green-900)' : 'var(--ds-red-900)',
                  }}
                >
                  {wh.available_space_sqm > 0 ? 'Available' : 'Full'}
                </span>
              </div>

              <div className="flex gap-4 text-xs" style={{ color: 'var(--ds-gray-900)' }}>
                <span><ArrowsPointingOutIcon className="inline h-3 w-3" /> {wh.total_space_sqm?.toLocaleString()} m²</span>
                {wh.warehouse_type && (
                  <span className="capitalize">{wh.warehouse_type.replace('_', ' ')}</span>
                )}
              </div>

              {wh.price_per_sqm_month && (
                <div className="text-sm font-semibold" style={{ color: 'var(--ds-blue-700)' }}>
                  {formatCurrency(wh.price_per_sqm_month, wh.currency || 'EUR')}/m²/month
                </div>
              )}

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {wh.has_loading_dock && <FeatureTag label="Loading Dock" />}
                {wh.has_forklift && <FeatureTag label="Forklift" />}
                {wh.is_temperature_controlled && <FeatureTag label="Temp Control" />}
                {wh.is_bonded && <FeatureTag label="Bonded" />}
                {wh.has_24h_access && <FeatureTag label="24/7" />}
              </div>

              {wh.available_from && (
                <p className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                  <CalendarDaysIcon className="inline h-3 w-3" /> Available from {wh.available_from}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {warehouses.length === 0 && !loading && (
        <div className="text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
          No warehouses found matching your criteria.
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm self-center" style={{ color: 'var(--ds-gray-700)' }}>
            Page {page} of {lastPage}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWarehouse && (
        <WarehouseDetailModal
          warehouse={selectedWarehouse}
          onClose={() => setSelectedWarehouse(null)}
        />
      )}
    </div>
  );
}

function FeatureTag({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
      style={{ background: 'var(--ds-gray-200)', color: 'var(--ds-gray-900)' }}
    >
      {label}
    </span>
  );
}

function WarehouseDetailModal({ warehouse: wh, onClose }: { warehouse: Warehouse; onClose: () => void }) {
  const [bookingFrom, setBookingFrom] = useState('');
  const [bookingTo, setBookingTo] = useState('');
  const [bookingSpace, setBookingSpace] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  async function handleBook() {
    setSubmitting(true);
    try {
      await warehouseApi.book(wh.id, {
        start_date: bookingFrom,
        end_date: bookingTo,
        space_sqm: Number(bookingSpace),
      });
      setBooked(true);
    } catch {
      // fallback
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl p-6 space-y-4"
        style={{ background: 'var(--ds-background-100)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{wh.name}</h2>
            <p className="text-sm" style={{ color: 'var(--ds-gray-700)' }}>
              {wh.address}, {wh.postal_code} {wh.city}, {getCountryFlag(wh.country)} {wh.country}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DetailStat label="Total Space" value={`${wh.total_space_sqm?.toLocaleString()} m²`} />
          <DetailStat label="Available" value={`${wh.available_space_sqm?.toLocaleString()} m²`} />
          <DetailStat label="Type" value={wh.warehouse_type?.replace('_', ' ') || '—'} />
          <DetailStat label="Price/m²/mo" value={wh.price_per_sqm_month ? formatCurrency(wh.price_per_sqm_month, wh.currency || 'EUR') : '—'} />
        </div>

        {wh.description && (
          <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>{wh.description}</p>
        )}

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--ds-gray-900)' }}>
          {wh.has_loading_dock && <span>✓ Loading Dock</span>}
          {wh.has_forklift && <span>✓ Forklift</span>}
          {wh.is_temperature_controlled && <span>✓ Temperature Controlled ({wh.min_temperature}°C – {wh.max_temperature}°C)</span>}
          {wh.is_bonded && <span>✓ Bonded Warehouse</span>}
          {wh.has_24h_access && <span>✓ 24/7 Access</span>}
          {wh.has_cctv && <span>✓ CCTV</span>}
          {wh.has_sprinklers && <span>✓ Sprinkler System</span>}
          {wh.has_alarm && <span>✓ Alarm System</span>}
          {wh.ceiling_height_m && <span>↕ Ceiling: {wh.ceiling_height_m}m</span>}
          {wh.loading_docks_count && <span>🚛 {wh.loading_docks_count} Loading Docks</span>}
        </div>

        {/* Booking Form */}
        {wh.available_space_sqm > 0 && !booked && (
          <div className="border-t pt-4 space-y-3" style={{ borderColor: 'var(--ds-gray-300)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>Book Space</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>From</label>
                <Input type="date" value={bookingFrom} onChange={(e) => setBookingFrom(e.target.value)} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>To</label>
                <Input type="date" value={bookingTo} onChange={(e) => setBookingTo(e.target.value)} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Space (m²)</label>
                <Input type="number" value={bookingSpace} onChange={(e) => setBookingSpace(e.target.value)} max={wh.available_space_sqm} />
              </div>
            </div>
            <Button onClick={handleBook} disabled={submitting || !bookingFrom || !bookingTo || !bookingSpace}>
              {submitting ? 'Booking...' : 'Request Booking'}
            </Button>
          </div>
        )}

        {booked && (
          <div className="p-4 rounded-lg text-center" style={{ background: 'var(--ds-green-200)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--ds-green-900)' }}>
              ✓ Booking request submitted! The warehouse will confirm shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
      <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{value}</p>
    </div>
  );
}
