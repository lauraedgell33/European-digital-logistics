'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { insuranceApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShieldCheckIcon,
  CalculatorIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { InsuranceQuote, CoverageType } from '@/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'var(--ds-gray-200)', text: 'var(--ds-gray-900)' },
  quoted: { bg: 'var(--ds-blue-200)', text: 'var(--ds-blue-900)' },
  accepted: { bg: 'var(--ds-green-200)', text: 'var(--ds-green-900)' },
  active: { bg: 'var(--ds-green-200)', text: 'var(--ds-green-900)' },
  expired: { bg: 'var(--ds-gray-200)', text: 'var(--ds-gray-700)' },
  claimed: { bg: 'var(--ds-amber-200)', text: 'var(--ds-amber-900)' },
  rejected: { bg: 'var(--ds-red-200)', text: 'var(--ds-red-900)' },
};

export default function InsurancePage() {
  const [tab, setTab] = useState<'quote' | 'policies' | 'coverage'>('quote');
  const [coverageTypes, setCoverageTypes] = useState<CoverageType[]>([]);
  const [myQuotes, setMyQuotes] = useState<InsuranceQuote[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote form
  const [cargoValue, setCargoValue] = useState('');
  const [cargoType, setCargoType] = useState('general');
  const [coverageType, setCoverageType] = useState('all_risk');
  const [originCountry, setOriginCountry] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [quoteResult, setQuoteResult] = useState<InsuranceQuote | null>(null);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [coverageRes, quotesRes] = await Promise.all([
        insuranceApi.coverageTypes(),
        insuranceApi.myQuotes().catch(() => ({ data: { data: [] } })),
      ]);
      setCoverageTypes(coverageRes.data.data || []);
      setMyQuotes(quotesRes.data.data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleQuote() {
    setQuoting(true);
    try {
      const res = await insuranceApi.quote({
        cargo_value: Number(cargoValue),
        cargo_type: cargoType,
        coverage_type: coverageType,
        origin_country: originCountry,
        destination_country: destCountry,
      });
      setQuoteResult(res.data.data);
    } catch {
      // fallback
    } finally {
      setQuoting(false);
    }
  }

  async function acceptQuote(quoteId: number) {
    try {
      await insuranceApi.accept(quoteId);
      loadData();
    } catch {
      // fallback
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="h-64 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            <ShieldCheckIcon className="inline h-7 w-7 mr-2" />
            Freight Insurance
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
            Instant cargo insurance quotes and policy management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === 'quote' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('quote')}>
            <CalculatorIcon className="h-4 w-4 mr-1" /> Get Quote
          </Button>
          <Button variant={tab === 'policies' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('policies')}>
            <DocumentCheckIcon className="h-4 w-4 mr-1" /> My Policies
          </Button>
          <Button variant={tab === 'coverage' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('coverage')}>
            <ShieldCheckIcon className="h-4 w-4 mr-1" /> Coverage Info
          </Button>
        </div>
      </div>

      {/* Get Quote */}
      {tab === 'quote' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Insurance Quote Calculator</h2>
            </CardHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Cargo Value (EUR)</label>
                  <Input type="number" value={cargoValue} onChange={(e) => setCargoValue(e.target.value)} placeholder="e.g. 50000" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Cargo Type</label>
                  <Select value={cargoType} onChange={(e) => setCargoType(e.target.value)}>
                    <option value="general">General Goods</option>
                    <option value="electronics">Electronics</option>
                    <option value="machinery">Machinery</option>
                    <option value="food">Food & Perishables</option>
                    <option value="chemicals">Chemicals</option>
                    <option value="automotive">Automotive Parts</option>
                    <option value="textiles">Textiles</option>
                    <option value="pharmaceuticals">Pharmaceuticals</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Coverage Type</label>
                  <Select value={coverageType} onChange={(e) => setCoverageType(e.target.value)}>
                    <option value="basic">Basic</option>
                    <option value="all_risk">All Risk</option>
                    <option value="extended">Extended</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Origin Country</label>
                  <Input value={originCountry} onChange={(e) => setOriginCountry(e.target.value.toUpperCase())} placeholder="DE" maxLength={2} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Destination Country</label>
                  <Input value={destCountry} onChange={(e) => setDestCountry(e.target.value.toUpperCase())} placeholder="FR" maxLength={2} />
                </div>
              </div>
              <Button onClick={handleQuote} disabled={quoting || !cargoValue}>
                {quoting ? 'Calculating...' : 'Get Instant Quote'}
              </Button>
            </div>
          </Card>

          {quoteResult && (
            <Card>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <CheckCircleIcon className="h-10 w-10 mx-auto" style={{ color: 'var(--ds-green-700)' }} />
                  <h3 className="text-lg font-bold mt-2" style={{ color: 'var(--ds-gray-1000)' }}>Insurance Quote Ready</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg" style={{ background: 'var(--ds-blue-100)' }}>
                    <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>Premium</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--ds-blue-900)' }}>
                      {formatCurrency(quoteResult.premium_amount || 0, 'EUR')}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
                    <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>Coverage</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                      {formatCurrency(quoteResult.coverage_amount || 0, 'EUR')}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
                    <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>Rate</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                      {(((quoteResult.premium_amount || quoteResult.premium || 0) / (quoteResult.coverage_amount || quoteResult.cargo_value || 1)) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
                {quoteResult.deductible && (
                  <p className="text-xs text-center" style={{ color: 'var(--ds-gray-700)' }}>
                    Deductible: {formatCurrency(quoteResult.deductible, 'EUR')}
                  </p>
                )}
                <div className="flex justify-center gap-3">
                  <Button onClick={() => quoteResult.id && acceptQuote(quoteResult.id)}>
                    Accept & Purchase
                  </Button>
                  <Button variant="secondary" onClick={() => setQuoteResult(null)}>
                    New Quote
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* My Policies */}
      {tab === 'policies' && (
        <div className="space-y-4">
          {myQuotes.length > 0 ? (
            myQuotes.map(quote => {
              const statusColor = STATUS_COLORS[quote.status] || STATUS_COLORS.draft;
              return (
                <Card key={quote.id}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: statusColor.bg, color: statusColor.text }}
                          >
                            {quote.status}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                            #{quote.id} • {quote.coverage_type}
                          </span>
                        </div>
                        <p className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                          Coverage: {formatCurrency(quote.coverage_amount || 0, 'EUR')}
                        </p>
                        <div className="flex gap-4 text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                          <span>Cargo: {quote.cargo_type}</span>
                          {quote.valid_until && <span><ClockIcon className="inline h-3 w-3" /> Valid until {formatDate(quote.valid_until)}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: 'var(--ds-blue-700)' }}>
                          {formatCurrency(quote.premium_amount || 0, 'EUR')}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--ds-gray-700)' }}>premium</p>
                        {quote.status === 'quoted' && (
                          <Button size="sm" className="mt-2" onClick={() => acceptQuote(quote.id)}>
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
              <ShieldCheckIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No insurance policies yet. Get a quote to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Coverage Info */}
      {tab === 'coverage' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coverageTypes.map((ct, i) => (
            <Card key={i}>
              <div className="p-5 space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold capitalize" style={{ color: 'var(--ds-gray-1000)' }}>
                    {ct.name || ct.type}
                  </h3>
                  {ct.base_rate && (
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ds-blue-700)' }}>
                      {(ct.base_rate * 100).toFixed(2)}%
                    </p>
                  )}
                  <p className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>base rate</p>
                </div>

                {ct.description && (
                  <p className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>{ct.description}</p>
                )}

                {ct.inclusions && ct.inclusions.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-medium mb-1" style={{ color: 'var(--ds-green-700)' }}>Included</p>
                    <ul className="space-y-1">
                      {ct.inclusions.map((inc: string, j: number) => (
                        <li key={j} className="text-xs flex items-start gap-1" style={{ color: 'var(--ds-gray-900)' }}>
                          <span style={{ color: 'var(--ds-green-700)' }}>✓</span> {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ct.exclusions && ct.exclusions.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-medium mb-1" style={{ color: 'var(--ds-red-700)' }}>Excluded</p>
                    <ul className="space-y-1">
                      {ct.exclusions.map((exc: string, j: number) => (
                        <li key={j} className="text-xs flex items-start gap-1" style={{ color: 'var(--ds-gray-700)' }}>
                          <span style={{ color: 'var(--ds-red-700)' }}>✕</span> {exc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full" onClick={() => { setCoverageType(ct.type || 'all_risk'); setTab('quote'); }}>
                  Get Quote
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
