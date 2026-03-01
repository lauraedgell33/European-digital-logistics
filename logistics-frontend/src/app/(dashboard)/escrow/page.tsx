'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { escrowApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BanknotesIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import type { EscrowPayment } from '@/types';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'var(--ds-gray-200)', text: 'var(--ds-gray-900)', icon: '⏳' },
  funded: { bg: 'var(--ds-blue-200)', text: 'var(--ds-blue-900)', icon: '💰' },
  released: { bg: 'var(--ds-green-200)', text: 'var(--ds-green-900)', icon: '✅' },
  disputed: { bg: 'var(--ds-red-200)', text: 'var(--ds-red-900)', icon: '⚠️' },
  refunded: { bg: 'var(--ds-amber-200)', text: 'var(--ds-amber-900)', icon: '↩️' },
  cancelled: { bg: 'var(--ds-gray-200)', text: 'var(--ds-gray-700)', icon: '✕' },
};

export default function EscrowPage() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<EscrowPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      const res = await escrowApi.list();
      setPayments(res.data.data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      await escrowApi.create({
        order_id: Number(orderId),
        amount: Number(amount),
        description,
      });
      setShowCreate(false);
      setOrderId('');
      setAmount('');
      setDescription('');
      loadPayments();
    } catch {
      // fallback
    } finally {
      setCreating(false);
    }
  }

  async function handleAction(id: number, action: 'fund' | 'release' | 'dispute' | 'refund' | 'cancel') {
    setActionLoading(id);
    try {
      switch (action) {
        case 'fund': await escrowApi.fund(id); break;
        case 'release': await escrowApi.release(id); break;
        case 'dispute': await escrowApi.dispute(id, { reason: 'Service not delivered as agreed' }); break;
        case 'refund': await escrowApi.refund(id); break;
        case 'cancel': await escrowApi.cancel(id); break;
      }
      loadPayments();
    } catch {
      // fallback
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
          ))}
        </div>
      </div>
    );
  }

  // Summary stats
  const totalFunded = payments.filter(p => p.status === 'funded').reduce((s, p) => s + (p.amount || 0), 0);
  const totalReleased = payments.filter(p => p.status === 'released').reduce((s, p) => s + (p.amount || 0), 0);
  const totalDisputed = payments.filter(p => p.status === 'disputed').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            <BanknotesIcon className="inline h-7 w-7 mr-2" />
            {t('escrow.title')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
            {t('escrow.securePaymentProtection')}
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <PlusIcon className="h-4 w-4 mr-1" /> {t('escrow.newEscrow')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label={t('escrow.inEscrow')} value={formatCurrency(totalFunded, 'EUR')} icon={<LockClosedIcon className="h-5 w-5" />} color="var(--ds-blue-700)" />
        <SummaryCard label={t('escrow.released')} value={formatCurrency(totalReleased, 'EUR')} icon={<CheckCircleIcon className="h-5 w-5" />} color="var(--ds-green-700)" />
        <SummaryCard label={t('escrow.disputed')} value={formatCurrency(totalDisputed, 'EUR')} icon={<ExclamationTriangleIcon className="h-5 w-5" />} color="var(--ds-red-700)" />
        <SummaryCard label={t('common.total')} value={`${payments.length}`} icon={<ArrowPathIcon className="h-5 w-5" />} color="var(--ds-gray-900)" />
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>{t('escrow.createEscrow')}</h2>
          </CardHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>{t('escrow.orderId')}</label>
                <Input type="number" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Transport order #" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>{t('escrow.amountEur')}</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 2500" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>{t('common.description')}</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Payment for transport..." />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !orderId || !amount}>
                {creating ? t('escrow.creating') : t('escrow.createEscrow')}
              </Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ds-gray-1000)' }}>{t('escrow.howItWorks')}</h3>
          <div className="flex items-center justify-between text-center">
            {[
              { step: '1', label: t('escrow.step1Label'), desc: t('escrow.step1Desc') },
              { step: '2', label: t('escrow.step2Label'), desc: t('escrow.step2Desc') },
              { step: '3', label: t('escrow.step3Label'), desc: t('escrow.step3Desc') },
              { step: '4', label: t('escrow.step4Label'), desc: t('escrow.step4Desc') },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                    style={{ background: 'var(--ds-blue-600)', color: 'white' }}
                  >
                    {s.step}
                  </div>
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--ds-gray-1000)' }}>{s.label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--ds-gray-700)' }}>{s.desc}</p>
                </div>
                {i < 3 && <span className="text-lg" style={{ color: 'var(--ds-gray-400)' }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Payments List */}
      <div className="space-y-3">
        {payments.map(payment => {
          const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
          const isLoading = actionLoading === payment.id;
          return (
            <Card key={payment.id}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: statusCfg.bg, color: statusCfg.text }}
                      >
                        {statusCfg.icon} {payment.status}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                        Escrow #{payment.id}
                      </span>
                      {payment.order_id && (
                        <span className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                          • Order #{payment.order_id}
                        </span>
                      )}
                    </div>
                    {payment.description && (
                      <p className="text-sm" style={{ color: 'var(--ds-gray-900)' }}>{payment.description}</p>
                    )}
                    <div className="flex gap-4 text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                      {payment.created_at && <span><ClockIcon className="inline h-3 w-3" /> Created {formatDate(payment.created_at)}</span>}
                      {payment.funded_at && <span>Funded {formatDate(payment.funded_at)}</span>}
                      {payment.released_at && <span>Released {formatDate(payment.released_at)}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                      {formatCurrency(payment.amount || 0, payment.currency || 'EUR')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--ds-gray-200)' }}>
                  {payment.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleAction(payment.id, 'fund')} disabled={isLoading}>
                        {isLoading ? '...' : '💰 Fund'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleAction(payment.id, 'cancel')} disabled={isLoading}>
                        {t('common.cancel')}
                      </Button>
                    </>
                  )}
                  {payment.status === 'funded' && (
                    <>
                      <Button size="sm" onClick={() => handleAction(payment.id, 'release')} disabled={isLoading}>
                        {isLoading ? '...' : '✅ Release'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleAction(payment.id, 'dispute')} disabled={isLoading}>
                        ⚠️ Dispute
                      </Button>
                    </>
                  )}
                  {payment.status === 'disputed' && (
                    <Button size="sm" onClick={() => handleAction(payment.id, 'refund')} disabled={isLoading}>
                      {isLoading ? '...' : '↩️ Refund'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {payments.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
            <BanknotesIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t('escrow.noEscrowYet')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div style={{ color }}>{icon}</div>
        <div>
          <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>{label}</p>
          <p className="text-lg font-bold" style={{ color }}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
