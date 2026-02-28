'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { invoiceApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  DocumentTextIcon,
  PlusIcon,
  PaperAirplaneIcon,
  BanknotesIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { Invoice, InvoiceStats } from '@/types';

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    client_company_id: 0,
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: 'EUR',
    notes: '',
    line_items: [{ description: 'Transport service', quantity: 1, unit_price: 1500 }],
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => invoiceApi.list({ status: statusFilter || undefined }).then(r => r.data?.data || []),
  });

  const { data: stats } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: () => invoiceApi.stats().then(r => r.data?.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => invoiceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      setShowCreate(false);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: number) => invoiceApi.send(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: number) => invoiceApi.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
    },
  });

  const factoringMutation = useMutation({
    mutationFn: (id: number) => invoiceApi.requestFactoring(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const statCards = stats as InvoiceStats | undefined;
  const statusColor = (s: string) => {
    const map: Record<string, string> = { draft: 'gray', sent: 'blue', viewed: 'blue', paid: 'green', partially_paid: 'yellow', overdue: 'red', cancelled: 'gray' };
    return (map[s] || 'gray') as 'gray' | 'blue' | 'green' | 'yellow' | 'red';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DocumentTextIcon className="h-7 w-7" style={{ color: 'var(--ds-blue-500)' }} />
            Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create, send, and manage invoices with factoring support</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Stats */}
      {statCards && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{statCards.total_invoices}</p>
            <p className="text-xs text-gray-500">Total Invoices</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(statCards.total_amount || 0, 'EUR')}</p>
            <p className="text-xs text-gray-500">Total Amount</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--ds-green-600)' }}>{formatCurrency(statCards.paid_amount || 0, 'EUR')}</p>
            <p className="text-xs text-gray-500">Collected</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--ds-red-600)' }}>{formatCurrency(statCards.overdue_amount || 0, 'EUR')}</p>
            <p className="text-xs text-gray-500">Overdue ({statCards.overdue_count})</p>
          </Card>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader title="Create Invoice" />
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Client Company ID</label>
                <input type="number" className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={form.client_company_id} onChange={e => setForm({ ...form, client_company_id: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                <input type="date" className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
                <select className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                  <option>EUR</option><option>USD</option><option>GBP</option><option>PLN</option><option>CZK</option><option>RON</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Line Items</label>
              {form.line_items.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    placeholder="Description" value={item.description}
                    onChange={e => { const items = [...form.line_items]; items[i] = { ...items[i], description: e.target.value }; setForm({ ...form, line_items: items }); }} />
                  <input type="number" className="w-20 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    placeholder="Qty" value={item.quantity}
                    onChange={e => { const items = [...form.line_items]; items[i] = { ...items[i], quantity: Number(e.target.value) }; setForm({ ...form, line_items: items }); }} />
                  <input type="number" className="w-28 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    placeholder="Price" value={item.unit_price}
                    onChange={e => { const items = [...form.line_items]; items[i] = { ...items[i], unit_price: Number(e.target.value) }; setForm({ ...form, line_items: items }); }} />
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={() => setForm({ ...form, line_items: [...form.line_items, { description: '', quantity: 1, unit_price: 0 }] })}>
                + Add Line
              </Button>
            </div>
            <Button onClick={() => createMutation.mutate(form as Record<string, unknown>)} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Spinner size="sm" /> : 'Create Invoice'}
            </Button>
          </div>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm ${statusFilter === s ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : (invoices || []).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No invoices found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(invoices as Invoice[]).map(inv => (
              <div key={inv.id} className="p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{inv.invoice_number}</span>
                    <Badge variant={statusColor(inv.status)}>{inv.status}</Badge>
                    {inv.is_overdue && <Badge variant="red"><ExclamationTriangleIcon className="h-3 w-3 mr-1" />Overdue</Badge>}
                  </div>
                  <p className="text-sm mt-1">
                    Client #{inv.client_company_id} • Due: {new Date(inv.due_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {inv.line_items?.length || 0} items • Tax: {inv.tax_rate}% ({formatCurrency(inv.tax_amount, inv.currency)})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(inv.total_amount, inv.currency)}</p>
                  {inv.balance_due !== undefined && inv.balance_due > 0 && (
                    <p className="text-xs text-red-600">Due: {formatCurrency(inv.balance_due, inv.currency)}</p>
                  )}
                  <div className="flex gap-1 mt-2 justify-end">
                    {inv.status === 'draft' && (
                      <Button size="sm" variant="primary" onClick={() => sendMutation.mutate(inv.id)}>
                        <PaperAirplaneIcon className="h-3 w-3 mr-1" /> Send
                      </Button>
                    )}
                    {['sent', 'overdue', 'partially_paid'].includes(inv.status) && (
                      <>
                        <Button size="sm" variant="primary" onClick={() => markPaidMutation.mutate(inv.id)}>
                          <BanknotesIcon className="h-3 w-3 mr-1" /> Mark Paid
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => factoringMutation.mutate(inv.id)}>
                          Factoring
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
