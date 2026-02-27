'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrder, useUpdateOrderStatus, useOrderDocuments, useUploadOrderDocument, useDeleteOrderDocument } from '@/hooks/useApi';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Loading';
import { formatDate, formatCurrency, getCountryFlag } from '@/lib/utils';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperClipIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const STATUS_FLOW: Record<string, { next: string; label: string; variant: 'primary' | 'success' | 'warning' }[]> = {
  pending: [
    { next: 'accepted', label: 'Accept Order', variant: 'success' },
    { next: 'rejected', label: 'Reject Order', variant: 'warning' },
  ],
  accepted: [{ next: 'pickup_scheduled', label: 'Schedule Pickup', variant: 'primary' }],
  pickup_scheduled: [{ next: 'picked_up', label: 'Mark Picked Up', variant: 'primary' }],
  picked_up: [{ next: 'in_transit', label: 'Mark In Transit', variant: 'primary' }],
  in_transit: [{ next: 'delivered', label: 'Mark Delivered', variant: 'success' }],
  delivered: [{ next: 'completed', label: 'Complete Order', variant: 'success' }],
};

const TIMELINE_FIELDS: { key: string; label: string; icon: typeof CheckCircleIcon }[] = [
  { key: 'created_at', label: 'Order Created', icon: DocumentTextIcon },
  { key: 'accepted_at', label: 'Accepted', icon: CheckCircleIcon },
  { key: 'picked_up_at', label: 'Picked Up', icon: TruckIcon },
  { key: 'delivered_at', label: 'Delivered', icon: MapPinIcon },
  { key: 'completed_at', label: 'Completed', icon: CheckCircleIcon },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const orderId = Number(id);
  const { data: order, isLoading, error } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const { data: documents = [], isLoading: loadingDocs } = useOrderDocuments(orderId);
  const uploadDoc = useUploadOrderDocument();
  const deleteDoc = useDeleteOrderDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCollection, setUploadCollection] = useState('documents');

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (error || !order) {
    return (
      <div className="text-center py-24">
        <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--ds-gray-600)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Order not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/orders')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const actions = STATUS_FLOW[order.status] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/orders')}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
              {order.order_number}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ds-gray-900)' }}>
              Created {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {actions.map((action) => (
            <Button
              key={action.next}
              variant={action.variant === 'success' ? 'primary' : 'secondary'}
              size="sm"
              loading={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: order.id, status: action.next })}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Route */}
          <Card>
            <CardHeader title="Route" description="Pickup and delivery locations" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: 'var(--ds-green-700)' }} />
                  <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-800)' }}>Pickup</span>
                </div>
                <p className="font-semibold text-[15px] pl-5" style={{ color: 'var(--ds-gray-1000)' }}>
                  {getCountryFlag(order.pickup_country)} {order.pickup_city}
                </p>
                <p className="text-[13px] pl-5" style={{ color: 'var(--ds-gray-900)' }}>{order.pickup_address}</p>
                <p className="text-[12px] pl-5" style={{ color: 'var(--ds-gray-800)' }}>{order.pickup_postal_code}</p>
                <div className="pl-5 pt-1 flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                  <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{formatDate(order.pickup_date)}</span>
                </div>
                {order.pickup_contact_name && (
                  <p className="text-[12px] pl-5" style={{ color: 'var(--ds-gray-800)' }}>
                    Contact: {order.pickup_contact_name} {order.pickup_contact_phone && `· ${order.pickup_contact_phone}`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: 'var(--ds-red-700)' }} />
                  <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-800)' }}>Delivery</span>
                </div>
                <p className="font-semibold text-[15px] pl-5" style={{ color: 'var(--ds-gray-1000)' }}>
                  {getCountryFlag(order.delivery_country)} {order.delivery_city}
                </p>
                <p className="text-[13px] pl-5" style={{ color: 'var(--ds-gray-900)' }}>{order.delivery_address}</p>
                <p className="text-[12px] pl-5" style={{ color: 'var(--ds-gray-800)' }}>{order.delivery_postal_code}</p>
                <div className="pl-5 pt-1 flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                  <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>{formatDate(order.delivery_date)}</span>
                </div>
                {order.delivery_contact_name && (
                  <p className="text-[12px] pl-5" style={{ color: 'var(--ds-gray-800)' }}>
                    Contact: {order.delivery_contact_name} {order.delivery_contact_phone && `· ${order.delivery_contact_phone}`}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Cargo */}
          <Card>
            <CardHeader title="Cargo Details" />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoItem label="Cargo Type" value={order.cargo_type} />
              <InfoItem label="Weight" value={`${(order.weight / 1000).toFixed(1)} t`} />
              {order.volume && <InfoItem label="Volume" value={`${order.volume} m³`} />}
              {order.pallet_count && <InfoItem label="Pallets" value={`${order.pallet_count}`} />}
            </div>
            {order.cargo_description && (
              <p className="mt-3 text-[13px]" style={{ color: 'var(--ds-gray-900)' }}>{order.cargo_description}</p>
            )}
            {order.special_instructions && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--ds-amber-100)', border: '1px solid var(--ds-amber-400)' }}>
                <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--ds-amber-900)' }}>Special Instructions</p>
                <p className="text-[13px]" style={{ color: 'var(--ds-amber-900)' }}>{order.special_instructions}</p>
              </div>
            )}
          </Card>

          {/* Tracking */}
          {order.shipment && (
            <Card>
              <CardHeader title="Shipment Tracking" />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TruckIcon className="h-5 w-5" style={{ color: 'var(--ds-blue-700)' }} />
                  <div>
                    <p className="font-mono text-[14px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                      {order.shipment.tracking_code}
                    </p>
                    <StatusBadge status={order.shipment.status} />
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => router.push('/tracking')}>
                  Live Tracking
                </Button>
              </div>
              {order.shipment.current_location_name && (
                <p className="mt-2 text-[13px]" style={{ color: 'var(--ds-gray-900)' }}>
                  📍 {order.shipment.current_location_name}
                </p>
              )}
            </Card>
          )}

          {/* Cancellation */}
          {order.status === 'cancelled' && order.cancellation_reason && (
            <Card>
              <div className="flex items-start gap-3">
                <XCircleIcon className="h-5 w-5 mt-0.5" style={{ color: 'var(--ds-red-700)' }} />
                <div>
                  <p className="font-semibold text-[14px]" style={{ color: 'var(--ds-red-900)' }}>Order Cancelled</p>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--ds-gray-900)' }}>{order.cancellation_reason}</p>
                  {order.cancelled_at && (
                    <p className="text-[12px] mt-1" style={{ color: 'var(--ds-gray-800)' }}>Cancelled on {formatDate(order.cancelled_at)}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader
              title="Documents"
              description="CMR, POD, invoices, and other files"
              action={
                <div className="flex items-center gap-2">
                  <select
                    value={uploadCollection}
                    onChange={(e) => setUploadCollection(e.target.value)}
                    className="text-[12px] px-2 py-1 rounded-md"
                    style={{ border: '1px solid var(--ds-gray-400)', background: 'var(--ds-background-100)', color: 'var(--ds-gray-1000)' }}
                  >
                    <option value="cmr">CMR</option>
                    <option value="pod">POD</option>
                    <option value="invoices">Invoice</option>
                    <option value="documents">Other</option>
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploadDoc.isPending}
                  >
                    <PaperClipIcon className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadDoc.mutate({ orderId, file, collection: uploadCollection });
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              }
            />
            <div className="mt-4">
              {loadingDocs ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : documents.length === 0 ? (
                <p className="text-[13px] text-center py-6" style={{ color: 'var(--ds-gray-600)' }}>
                  No documents attached yet
                </p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--ds-gray-200)' }}>
                  {documents.map((doc: { id: number; file_name: string; collection: string; size: number; url: string; created_at: string }) => (
                    <div key={doc.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <DocumentTextIcon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--ds-gray-700)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--ds-gray-1000)' }}>
                          {doc.file_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="blue">{doc.collection.toUpperCase()}</Badge>
                          <span className="text-[11px]" style={{ color: 'var(--ds-gray-600)' }}>
                            {(doc.size / 1024).toFixed(0)} KB • {formatDate(doc.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                        </a>
                        <button
                          onClick={() => deleteDoc.mutate({ orderId, mediaId: doc.id })}
                          className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" style={{ color: 'var(--ds-red-700)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial */}
          <Card>
            <CardHeader title="Financial" />
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                  {formatCurrency(order.total_price, order.currency)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={order.payment_status === 'paid' ? 'green' : order.payment_status === 'overdue' ? 'red' : 'amber'}>
                    {order.payment_status}
                  </Badge>
                  <span className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>{order.payment_terms}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader title="Parties" />
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-700)' }}>Shipper</p>
                <div className="flex items-center gap-2 mt-1">
                  <BuildingOfficeIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                  <span className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    {order.shipper?.name || `Company #${order.shipper_id}`}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-gray-700)' }}>Carrier</p>
                <div className="flex items-center gap-2 mt-1">
                  <TruckIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                  <span className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    {order.carrier?.name || `Company #${order.carrier_id}`}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader title="Timeline" />
            <div className="mt-3 space-y-0">
              {TIMELINE_FIELDS.map((field, i) => {
                const value = (order as any)[field.key];
                const isActive = !!value;
                const Icon = field.icon;
                return (
                  <div key={field.key} className="flex items-start gap-3 relative">
                    {i < TIMELINE_FIELDS.length - 1 && (
                      <div
                        className="absolute left-[9px] top-6 w-0.5 h-full"
                        style={{ background: isActive ? 'var(--ds-green-400)' : 'var(--ds-gray-300)' }}
                      />
                    )}
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 z-10"
                      style={{ background: isActive ? 'var(--ds-green-200)' : 'var(--ds-gray-200)' }}
                    >
                      <Icon className="h-3 w-3" style={{ color: isActive ? 'var(--ds-green-900)' : 'var(--ds-gray-600)' }} />
                    </div>
                    <div className="pb-4">
                      <p className="text-[13px] font-medium" style={{ color: isActive ? 'var(--ds-gray-1000)' : 'var(--ds-gray-600)' }}>
                        {field.label}
                      </p>
                      {value && (
                        <p className="text-[11px]" style={{ color: 'var(--ds-gray-800)' }}>{formatDate(value)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
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
