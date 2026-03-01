'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, StatCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Pagination } from '@/components/ui/DataTable';
import {
  formatCurrency,
  formatDate,
  formatWeight,
  ORDER_STATUS_COLORS,
} from '@/lib/utils';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ExportMenu, ExportIcons } from '@/components/ui/ExportMenu';
import { exportApi } from '@/lib/export';
import { useTranslation } from '@/hooks/useTranslation';
import type { TransportOrder } from '@/types';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disputed', label: 'Disputed' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<TransportOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const { t } = useTranslation();

  const { data, isLoading } = useOrders({ page, search: debouncedSearch, status: statusFilter });
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedOrder.id,
        status: newStatus,
      });
      setSelectedOrder(null);
      setNewStatus('');
    } catch (err) {
      // handled by mutation
    }
  };

  const getStatusColor = (status: string) =>
    ORDER_STATUS_COLORS[status] ?? 'gray';

  const columns = [
    {
      key: 'order_number',
      header: 'Order',
      render: (row: TransportOrder) => (
        <div>
          <div className="font-mono font-medium text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
            {row.order_number}
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: 'var(--ds-gray-800)' }}>
            {formatDate(row.created_at)}
          </div>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (row: TransportOrder) => (
        <div className="text-[13px]">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: 'var(--ds-green-700)' }}
            />
            <span style={{ color: 'var(--ds-gray-1000)' }}>
              {row.pickup_city}, {row.pickup_country}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: 'var(--ds-red-700)' }}
            />
            <span style={{ color: 'var(--ds-gray-1000)' }}>
              {row.delivery_city}, {row.delivery_country}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'shipper',
      header: 'Shipper',
      render: (row: TransportOrder) => (
        <div className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
          {row.shipper?.name ?? '—'}
        </div>
      ),
    },
    {
      key: 'carrier',
      header: 'Carrier',
      render: (row: TransportOrder) => (
        <div className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
          {row.carrier?.name ?? 'Not assigned'}
        </div>
      ),
    },
    {
      key: 'cargo',
      header: 'Cargo',
      render: (row: TransportOrder) => (
        <div className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
          <div>{formatWeight(row.weight)}</div>
          <div className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
            {row.cargo_type}
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row: TransportOrder) => (
        <span className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
          {row.total_price ? formatCurrency(row.total_price, row.currency) : '—'}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Loading',
      render: (row: TransportOrder) => (
        <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
          {formatDate(row.pickup_date)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: TransportOrder) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: TransportOrder) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(row);
            setNewStatus(row.status);
          }}
        >
          <ArrowPathIcon className="h-4 w-4" />
        </Button>
      ),
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
            {t('orders.title')}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            {t('orders.allOrders')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            options={[
              { label: 'PDF', icon: ExportIcons.pdf, onClick: () => exportApi.ordersPdf() },
              { label: 'CSV', icon: ExportIcons.csv, onClick: () => exportApi.ordersCsv() },
              { label: 'Excel', icon: ExportIcons.excel, onClick: () => exportApi.ordersExcel() },
            ]}
          />
          <Link href="/orders/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('orders.newOrder')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('common.total')}
          value={meta?.total ?? '—'}
          icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('tracking.statusInTransit')}
          value="—"
          icon={<TruckIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('analytics.completed')}
          value="—"
          icon={<CheckCircleIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('common.warning')}
          value="—"
          icon={<ExclamationTriangleIcon className="h-5 w-5" />}
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: 'All' },
          ...STATUS_OPTIONS,
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setStatusFilter(s.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors"
            style={{
              background:
                statusFilter === s.value
                  ? 'var(--ds-gray-1000)'
                  : 'transparent',
              color:
                statusFilter === s.value
                  ? 'var(--ds-gray-100)'
                  : 'var(--ds-gray-900)',
              border: `1px solid ${
                statusFilter === s.value ? 'var(--ds-gray-1000)' : 'var(--ds-gray-400)'
              }`,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search by order number, company, city..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          icon={<MagnifyingGlassIcon className="h-4 w-4" />}
        />
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <DataTable columns={columns} data={orders} loading={isLoading} onRowClick={(item) => router.push(`/orders/${item.id}`)} />
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

      {/* Status Update Modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={t('orders.updateStatus')}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[13px]" style={{ color: 'var(--ds-gray-900)' }}>
              Order:{' '}
              <span className="font-mono font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                {selectedOrder?.order_number}
              </span>
            </p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--ds-gray-900)' }}>
              Current Status:{' '}
              <StatusBadge status={selectedOrder?.status ?? ''} />
            </p>
          </div>
          <Select
            label="New Status"
            options={STATUS_OPTIONS}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleStatusUpdate} loading={updateStatus.isPending}>
              {t('orders.updateStatus')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
