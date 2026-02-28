'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { debtCollectionApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ScaleIcon,
  PlusIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { DebtCollection, DebtCollectionStats } from '@/types';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'var(--ds-gray-200)', text: 'var(--ds-gray-900)', label: 'Pending' },
  reminder_sent: { bg: 'var(--ds-amber-200)', text: 'var(--ds-amber-900)', label: 'Reminder Sent' },
  second_reminder: { bg: 'var(--ds-orange-200)', text: 'var(--ds-orange-900)', label: '2nd Reminder' },
  final_notice: { bg: 'var(--ds-red-200)', text: 'var(--ds-red-900)', label: 'Final Notice' },
  legal_action: { bg: 'var(--ds-red-200)', text: 'var(--ds-red-900)', label: 'Legal Action' },
  collection_agency: { bg: 'var(--ds-purple-200)', text: 'var(--ds-purple-900)', label: 'Agency' },
  paid: { bg: 'var(--ds-green-200)', text: 'var(--ds-green-900)', label: 'Paid' },
  written_off: { bg: 'var(--ds-gray-200)', text: 'var(--ds-gray-700)', label: 'Written Off' },
  cancelled: { bg: 'var(--ds-gray-200)', text: 'var(--ds-gray-700)', label: 'Cancelled' },
};

export default function DebtCollectionPage() {
  const [cases, setCases] = useState<DebtCollection[]>([]);
  const [stats, setStats] = useState<DebtCollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Create form
  const [formOrderId, setFormOrderId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDebtorName, setFormDebtorName] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formInvoice, setFormInvoice] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [casesRes, statsRes] = await Promise.all([
        debtCollectionApi.list(),
        debtCollectionApi.stats(),
      ]);
      setCases(casesRes.data.data || []);
      setStats(statsRes.data.data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      await debtCollectionApi.create({
        order_id: Number(formOrderId),
        original_amount: Number(formAmount),
        debtor_name: formDebtorName,
        due_date: formDueDate,
        invoice_number: formInvoice,
      });
      setShowCreate(false);
      setFormOrderId(''); setFormAmount(''); setFormDebtorName(''); setFormDueDate(''); setFormInvoice('');
      loadData();
    } catch {
      // fallback
    } finally {
      setCreating(false);
    }
  }

  async function handleAction(id: number, action: 'remind' | 'escalate' | 'paid' | 'cancel') {
    setActionLoading(id);
    try {
      switch (action) {
        case 'remind': await debtCollectionApi.sendReminder(id); break;
        case 'escalate': await debtCollectionApi.escalate(id); break;
        case 'paid': await debtCollectionApi.markPaid(id); break;
        case 'cancel': await debtCollectionApi.cancel(id); break;
      }
      loadData();
    } catch {
      // fallback
    } finally {
      setActionLoading(null);
    }
  }

  const filteredCases = statusFilter
    ? cases.filter(c => c.status === statusFilter)
    : cases;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            <ScaleIcon className="inline h-7 w-7 mr-2" />
            Debt Collection
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
            Manage overdue payments with automated reminders and escalation
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <PlusIcon className="h-4 w-4 mr-1" /> New Case
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>Total Outstanding</p>
              <p className="text-xl font-bold" style={{ color: 'var(--ds-red-700)' }}>
                {formatCurrency(stats.total_outstanding || 0, 'EUR')}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--ds-gray-700)' }}>{stats.active_cases} active cases</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>Collected (YTD)</p>
              <p className="text-xl font-bold" style={{ color: 'var(--ds-green-700)' }}>
                {formatCurrency(stats.total_collected || 0, 'EUR')}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--ds-gray-700)' }}>{stats.paid_cases} resolved</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>Recovery Rate</p>
              <p className="text-xl font-bold" style={{ color: 'var(--ds-blue-700)' }}>
                {stats.recovery_rate?.toFixed(1)}%
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>Avg Days Overdue</p>
              <p className="text-xl font-bold" style={{ color: 'var(--ds-amber-700)' }}>
                {stats.avg_days_overdue?.toFixed(0)} days
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Create Collection Case</h2>
          </CardHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Order ID</label>
                <Input type="number" value={formOrderId} onChange={(e) => setFormOrderId(e.target.value)} placeholder="#" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Amount (EUR)</label>
                <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="e.g. 3500" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Debtor Name</label>
                <Input value={formDebtorName} onChange={(e) => setFormDebtorName(e.target.value)} placeholder="Company name" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Due Date</label>
                <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Invoice Number</label>
                <Input value={formInvoice} onChange={(e) => setFormInvoice(e.target.value)} placeholder="INV-2026-..." />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !formOrderId || !formAmount || !formDebtorName}>
                {creating ? 'Creating...' : 'Create Case'}
              </Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
        <span className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>
          {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.map(dc => {
          const statusCfg = STATUS_CONFIG[dc.status] || STATUS_CONFIG.pending;
          const isLoading = actionLoading === dc.id;
          const daysOverdue = dc.days_overdue || 0;
          const urgencyColor = daysOverdue > 90 ? 'var(--ds-red-700)' : daysOverdue > 30 ? 'var(--ds-amber-700)' : 'var(--ds-gray-700)';

          return (
            <Card key={dc.id}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: statusCfg.bg, color: statusCfg.text }}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                        Case #{dc.id}
                      </span>
                      {dc.invoice_number && (
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ds-gray-700)' }}>
                          <DocumentTextIcon className="h-3 w-3" /> {dc.invoice_number}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                      {dc.debtor_name || `Order #${dc.order_id}`}
                    </p>
                    <div className="flex gap-4 text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                      {dc.due_date && (
                        <span><ClockIcon className="inline h-3 w-3" /> Due {formatDate(dc.due_date)}</span>
                      )}
                      <span style={{ color: urgencyColor, fontWeight: daysOverdue > 30 ? 600 : 400 }}>
                        <ExclamationTriangleIcon className="inline h-3 w-3" /> {daysOverdue} days overdue
                      </span>
                      {(dc.reminders_sent || 0) > 0 && (
                        <span><BellAlertIcon className="inline h-3 w-3" /> {dc.reminders_sent} reminder{(dc.reminders_sent || 0) > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                      {formatCurrency(dc.original_amount || 0, dc.currency || 'EUR')}
                    </p>
                    {dc.total_with_fees && dc.total_with_fees > (dc.original_amount || 0) && (
                      <p className="text-xs" style={{ color: 'var(--ds-red-700)' }}>
                        + {formatCurrency(dc.total_with_fees - (dc.original_amount || 0), dc.currency || 'EUR')} fees
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!['paid', 'written_off', 'cancelled'].includes(dc.status) && (
                  <div className="flex gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--ds-gray-200)' }}>
                    <Button size="sm" variant="secondary" onClick={() => handleAction(dc.id, 'remind')} disabled={isLoading}>
                      <BellAlertIcon className="h-3 w-3 mr-1" /> Send Reminder
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAction(dc.id, 'escalate')} disabled={isLoading}>
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> Escalate
                    </Button>
                    <Button size="sm" onClick={() => handleAction(dc.id, 'paid')} disabled={isLoading}>
                      <CheckCircleIcon className="h-3 w-3 mr-1" /> Mark Paid
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAction(dc.id, 'cancel')} disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
            <ScaleIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No collection cases found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
