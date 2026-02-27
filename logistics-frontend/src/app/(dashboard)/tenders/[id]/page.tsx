'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTender, useSubmitBid } from '@/hooks/useApi';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Loading';
import { formatDate, formatCurrency, getCountryFlag } from '@/lib/utils';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import type { TenderBid } from '@/types';

export default function TenderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: tender, isLoading, error } = useTender(Number(id));
  const submitBid = useSubmitBid();
  const [bidModal, setBidModal] = useState(false);
  const [bid, setBid] = useState({ proposed_price: '', transit_time_hours: '', proposal: '' });

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (error || !tender) {
    return (
      <div className="text-center py-24">
        <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--ds-gray-600)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Tender not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/tenders')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Tenders
        </Button>
      </div>
    );
  }

  const canBid = tender.status === 'open' && new Date(tender.submission_deadline) > new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/tenders')}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
              {tender.title}
            </h1>
            <p className="text-[13px] mt-0.5 font-mono" style={{ color: 'var(--ds-gray-800)' }}>
              {tender.reference_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={tender.status} />
          <Button variant="secondary" size="sm" onClick={() => router.push(`/tenders/${tender.id}/edit`)}>
            Edit
          </Button>
          {canBid && (
            <Button onClick={() => setBidModal(true)}>Submit Bid</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader title="Description" />
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--ds-gray-1000)' }}>
              {tender.description}
            </p>
          </Card>

          {/* Route */}
          <Card>
            <CardHeader title="Route" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: 'var(--ds-green-700)' }} />
                  <span className="text-[12px] font-semibold uppercase" style={{ color: 'var(--ds-gray-800)' }}>Origin</span>
                </div>
                <p className="font-semibold text-[15px] pl-5" style={{ color: 'var(--ds-gray-1000)' }}>
                  {tender.route_origin_country && getCountryFlag(tender.route_origin_country)} {tender.route_origin_city}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: 'var(--ds-red-700)' }} />
                  <span className="text-[12px] font-semibold uppercase" style={{ color: 'var(--ds-gray-800)' }}>Destination</span>
                </div>
                <p className="font-semibold text-[15px] pl-5" style={{ color: 'var(--ds-gray-1000)' }}>
                  {tender.route_destination_country && getCountryFlag(tender.route_destination_country)} {tender.route_destination_city}
                </p>
              </div>
            </div>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader title="Requirements" />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tender.cargo_type && <InfoItem label="Cargo Type" value={tender.cargo_type} />}
              {tender.vehicle_type && <InfoItem label="Vehicle Type" value={tender.vehicle_type} />}
              {tender.estimated_weight && <InfoItem label="Est. Weight" value={`${(tender.estimated_weight / 1000).toFixed(1)} t`} />}
              {tender.estimated_volume && <InfoItem label="Est. Volume" value={`${tender.estimated_volume} m³`} />}
              {tender.frequency && <InfoItem label="Frequency" value={tender.frequency} />}
              {tender.shipments_per_period && <InfoItem label="Shipments/Period" value={`${tender.shipments_per_period}`} />}
            </div>
          </Card>

          {/* Bids (if owner) */}
          {tender.bids && tender.bids.length > 0 && (
            <Card>
              <CardHeader title={`Bids (${tender.bids.length})`} />
              <div className="mt-4 space-y-3">
                {tender.bids.map((b: TenderBid) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--ds-gray-200)', border: '1px solid var(--ds-gray-400)' }}
                  >
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                        {b.company?.name || `Company #${b.company_id}`}
                      </p>
                      <p className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
                        {formatCurrency(b.proposed_price, b.currency)} · {b.transit_time_hours}h transit
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Budget" />
            <div className="mt-3">
              {tender.budget ? (
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                    {formatCurrency(tender.budget, tender.currency)}
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--ds-gray-800)' }}>
                    {tender.budget_type === 'per_shipment' ? 'Per shipment' : tender.budget_type === 'monthly' ? 'Monthly' : 'Total'}
                  </p>
                </div>
              ) : (
                <p className="text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>No budget specified</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Timeline" />
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                <div>
                  <p className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>Contract Period</p>
                  <p className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
                    {formatDate(tender.start_date)} — {formatDate(tender.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" style={{ color: canBid ? 'var(--ds-amber-700)' : 'var(--ds-gray-700)' }} />
                <div>
                  <p className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>Submission Deadline</p>
                  <p className="text-[13px] font-medium" style={{ color: canBid ? 'var(--ds-amber-900)' : 'var(--ds-gray-1000)' }}>
                    {formatDate(tender.submission_deadline)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {tender.company && (
            <Card>
              <CardHeader title="Published By" />
              <div className="mt-3 flex items-center gap-2">
                <BuildingOfficeIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                <span className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                  {tender.company.name}
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      <Modal open={bidModal} onClose={() => setBidModal(false)} title="Submit Bid" size="md">
        <div className="space-y-4">
          <Input
            label="Proposed Price"
            type="number"
            step="0.01"
            value={bid.proposed_price}
            onChange={(e) => setBid((p) => ({ ...p, proposed_price: e.target.value }))}
            placeholder="e.g. 2500.00"
            required
          />
          <Input
            label="Transit Time (hours)"
            type="number"
            value={bid.transit_time_hours}
            onChange={(e) => setBid((p) => ({ ...p, transit_time_hours: e.target.value }))}
            placeholder="e.g. 24"
          />
          <Textarea
            label="Proposal"
            value={bid.proposal}
            onChange={(e) => setBid((p) => ({ ...p, proposal: e.target.value }))}
            placeholder="Describe your offering, capacity, and qualifications..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setBidModal(false)}>Cancel</Button>
            <Button
              loading={submitBid.isPending}
              onClick={() => {
                submitBid.mutate(
                  {
                    tenderId: Number(id),
                    data: {
                      price: parseFloat(bid.proposed_price),
                      transit_time_hours: bid.transit_time_hours ? parseInt(bid.transit_time_hours) : 0,
                      notes: bid.proposal,
                      currency: (tender.currency || 'EUR') as 'EUR' | 'USD' | 'GBP' | 'PLN' | 'CZK' | 'RON',
                    },
                  },
                  {
                    onSuccess: () => {
                      setBidModal(false);
                      setBid({ proposed_price: '', transit_time_hours: '', proposal: '' });
                    },
                  }
                );
              }}
            >
              Submit Bid
            </Button>
          </div>
        </div>
      </Modal>
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
