'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenders, useSubmitBid } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, StatCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Pagination } from '@/components/ui/DataTable';
import {
  formatCurrency,
  formatDate,
  formatWeight,
} from '@/lib/utils';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import type { Tender } from '@/types';

const TENDER_STATUS_COLOR: Record<string, string> = {
  draft: 'gray',
  published: 'blue',
  evaluation: 'amber',
  awarded: 'green',
  cancelled: 'red',
  closed: 'gray',
};

export default function TendersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [bidModal, setBidModal] = useState<Tender | null>(null);
  const [bidForm, setBidForm] = useState({
    price: '',
    currency: 'EUR' as const,
    transit_time_hours: '',
    notes: '',
  });

  const { data, isLoading } = useTenders({
    page,
    search: debouncedSearch,
    status: statusFilter,
  });
  const submitBid = useSubmitBid();
  const { t } = useTranslation();

  const tenders = data?.data ?? [];
  const meta = data?.meta;

  const handleBidSubmit = async () => {
    if (!bidModal || !bidForm.price) return;
    try {
      await submitBid.mutateAsync({
        tenderId: bidModal.id,
        data: {
          ...bidForm,
          price: Number(bidForm.price),
          transit_time_hours: Number(bidForm.transit_time_hours),
        },
      });
      setBidModal(null);
      setBidForm({ price: '', currency: 'EUR' as const, transit_time_hours: '', notes: '' });
    } catch (err) {
      // handled by mutation
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Tender',
      render: (row: Tender) => (
        <div>
          <div className="font-medium text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
            {row.title}
          </div>
          <div className="text-[12px] mt-0.5 line-clamp-1" style={{ color: 'var(--ds-gray-800)' }}>
            {row.description}
          </div>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (row: Tender) => (
        <div className="text-[13px]">
          <span style={{ color: 'var(--ds-gray-1000)' }}>{row.route_origin_city}</span>
          <span style={{ color: 'var(--ds-gray-700)' }}> → </span>
          <span style={{ color: 'var(--ds-gray-1000)' }}>{row.route_destination_city}</span>
        </div>
      ),
    },
    {
      key: 'volume',
      header: 'Volume',
      render: (row: Tender) => (
        <div className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
          <div>{row.frequency || '—'}</div>
          <div className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
            {(row as Tender & { estimated_weight?: number }).estimated_weight ? formatWeight((row as Tender & { estimated_weight?: number }).estimated_weight!) : '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (row: Tender) => (
        <span className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
          {row.budget
            ? formatCurrency(row.budget, row.currency)
            : 'Open'}
        </span>
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (row: Tender) => {
        const deadline = new Date(row.submission_deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
              {formatDate(row.submission_deadline)}
            </div>
            {daysLeft > 0 && row.status === 'open' && (
              <div
                className="text-[12px]"
                style={{
                  color: daysLeft <= 3 ? 'var(--ds-red-700)' : 'var(--ds-gray-800)',
                }}
              >
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'bids',
      header: 'Bids',
      render: (row: Tender) => (
        <span
          className="text-[13px] font-mono"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          {row.bids_count ?? 0}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Tender) => (
        <Badge variant={(TENDER_STATUS_COLOR[row.status] ?? 'gray') as any}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Tender) =>
        row.status === 'open' ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setBidModal(row);
            }}
          >
            {t('tenders.submitBid')}
          </Button>
        ) : null,
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
            {t('tenders.title')}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            {t('tenders.allTenders')}
          </p>
        </div>
        <Link href="/tenders/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('tenders.createNew')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('common.total')}
          value={meta?.total ?? '—'}
          icon={<DocumentTextIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('common.active')}
          value="—"
          icon={<ClockIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('analytics.completed')}
          value="—"
          icon={<CheckCircleIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('tenders.budget')}
          value="—"
          icon={<CurrencyEuroIcon className="h-5 w-5" />}
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: 'All' },
          { value: 'open', label: 'Open' },
          { value: 'evaluation', label: 'In Evaluation' },
          { value: 'awarded', label: 'Awarded' },
          { value: 'closed', label: 'Closed' },
          { value: 'cancelled', label: 'Cancelled' },
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
          placeholder="Search by title, route, description..."
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
        <DataTable columns={columns} data={tenders} loading={isLoading} onRowClick={(item) => router.push(`/tenders/${item.id}`)} />
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

      {/* Bid Modal */}
      <Modal
        open={!!bidModal}
        onClose={() => setBidModal(null)}
        title={t('tenders.submitBid')}
        size="md"
      >
        <div className="space-y-4">
          <div
            className="p-3 rounded-lg"
            style={{ background: 'var(--ds-gray-200)', border: '1px solid var(--ds-gray-400)' }}
          >
            <h4 className="font-medium text-[14px]" style={{ color: 'var(--ds-gray-1000)' }}>
              {bidModal?.title}
            </h4>
            <p className="text-[12px] mt-1" style={{ color: 'var(--ds-gray-800)' }}>
              {bidModal?.route_origin_city} → {bidModal?.route_destination_city}
              {bidModal?.budget && (
                <> · Budget: {formatCurrency(bidModal.budget, bidModal.currency)}</>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('freight.price')}
              type="number"
              value={bidForm.price}
              onChange={(e) =>
                setBidForm((p) => ({ ...p, price: e.target.value }))
              }
              placeholder="e.g. 2500"
              required
            />
            <Select
              label="Currency"
              options={[
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'CHF', label: 'CHF (Fr.)' },
                { value: 'PLN', label: 'PLN (zł)' },
              ]}
              value={bidForm.currency}
              onChange={(e) =>
                setBidForm((p) => ({ ...p, currency: e.target.value as typeof p.currency }))
              }
            />
          </div>

          <Input
            label="Transit Time (hours)"
            type="number"
            value={bidForm.transit_time_hours}
            onChange={(e) =>
              setBidForm((p) => ({ ...p, transit_time_hours: e.target.value }))
            }
            placeholder="e.g. 48"
          />

          <Textarea
            label="Notes"
            value={bidForm.notes}
            onChange={(e) =>
              setBidForm((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Any additional information about your bid..."
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setBidModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleBidSubmit} loading={submitBid.isPending}>
              {t('tenders.submitBid')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
