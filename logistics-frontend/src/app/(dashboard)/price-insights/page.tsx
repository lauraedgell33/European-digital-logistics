'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { priceInsightApi } from '@/lib/api';
import { formatCurrency, getCountryFlag } from '@/lib/utils';
import {
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MapIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import type { PriceInsight, PriceEstimate } from '@/types';

export default function PriceInsightsPage() {
  const [topRoutes, setTopRoutes] = useState<PriceInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'top' | 'estimate' | 'compare'>('top');

  // Estimate form
  const [estOrigin, setEstOrigin] = useState('');
  const [estDestination, setEstDestination] = useState('');
  const [estVehicle, setEstVehicle] = useState('truck_40t');
  const [estWeight, setEstWeight] = useState('');
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);

  // Compare
  const [compareRoutes, setCompareRoutes] = useState([
    { origin_country: 'DE', destination_country: 'FR' },
    { origin_country: 'DE', destination_country: 'PL' },
  ]);
  const [compareResults, setCompareResults] = useState<PriceInsight[]>([]);
  const [comparing, setComparing] = useState(false);

  // Route detail
  const [selectedRoute, setSelectedRoute] = useState<PriceInsight | null>(null);
  const [routeHistory, setRouteHistory] = useState<PriceInsight[]>([]);

  useEffect(() => {
    loadTopRoutes();
  }, []);

  async function loadTopRoutes() {
    try {
      const res = await priceInsightApi.topRoutes();
      setTopRoutes(res.data.data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleEstimate() {
    setEstimating(true);
    try {
      const res = await priceInsightApi.estimate({
        origin_country: estOrigin,
        destination_country: estDestination,
        vehicle_type: estVehicle,
        weight_tons: Number(estWeight) || undefined,
      });
      setEstimate(res.data.data);
    } catch {
      // fallback
    } finally {
      setEstimating(false);
    }
  }

  async function handleCompare() {
    setComparing(true);
    try {
      const res = await priceInsightApi.compare(compareRoutes);
      setCompareResults(res.data.data || []);
    } catch {
      // fallback
    } finally {
      setComparing(false);
    }
  }

  async function viewRouteDetail(insight: PriceInsight) {
    setSelectedRoute(insight);
    try {
      const res = await priceInsightApi.route({
        origin_country: insight.origin_country,
        destination_country: insight.destination_country,
        vehicle_type: insight.vehicle_type,
      });
      setRouteHistory(res.data.data?.history || []);
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
            <CurrencyEuroIcon className="inline h-7 w-7 mr-2" />
            Price Insights
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
            Freight price analytics, route comparison & estimation
          </p>
        </div>
        <div className="flex gap-2">
          {(['top', 'estimate', 'compare'] as const).map(t => (
            <Button key={t} variant={tab === t ? 'primary' : 'secondary'} size="sm" onClick={() => setTab(t)}>
              {t === 'top' && <><ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> Top Routes</>}
              {t === 'estimate' && <><CalculatorIcon className="h-4 w-4 mr-1" /> Estimate</>}
              {t === 'compare' && <><MapIcon className="h-4 w-4 mr-1" /> Compare</>}
            </Button>
          ))}
        </div>
      </div>

      {/* Top Routes */}
      {tab === 'top' && (
        <>
          {selectedRoute ? (
            <div className="space-y-4">
              <Button variant="secondary" size="sm" onClick={() => { setSelectedRoute(null); setRouteHistory([]); }}>
                ← Back
              </Button>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                    {getCountryFlag(selectedRoute.origin_country)} {selectedRoute.origin_country} → {getCountryFlag(selectedRoute.destination_country)} {selectedRoute.destination_country}
                    <span className="text-sm font-normal ml-2" style={{ color: 'var(--ds-gray-700)' }}>
                      {selectedRoute.vehicle_type}
                    </span>
                  </h2>
                </CardHeader>
                <div className="p-4 grid grid-cols-4 gap-4">
                  <StatBox label="Avg Price/km" value={formatCurrency(selectedRoute.avg_price_per_km || 0, 'EUR')} />
                  <StatBox label="Min" value={formatCurrency(selectedRoute.min_price_per_km || 0, 'EUR')} />
                  <StatBox label="Max" value={formatCurrency(selectedRoute.max_price_per_km || 0, 'EUR')} />
                  <StatBox label="Median" value={formatCurrency(selectedRoute.median_price_per_km || 0, 'EUR')} />
                </div>
              </Card>

              {routeHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Price History</h3>
                  </CardHeader>
                  <div className="p-4">
                    <div className="flex items-end gap-1 h-40">
                      {routeHistory.map((h, i) => {
                        const maxPrice = Math.max(...routeHistory.map(r => r.avg_price_per_km || 0));
                        const pct = maxPrice > 0 ? ((h.avg_price_per_km || 0) / maxPrice) * 100 : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px]" style={{ color: 'var(--ds-gray-700)' }}>
                              {(h.avg_price_per_km || 0).toFixed(2)}€
                            </span>
                            <div
                              className="w-full rounded-t"
                              style={{ height: `${Math.max(pct, 2)}%`, background: 'var(--ds-blue-600)' }}
                            />
                            <span className="text-[9px]" style={{ color: 'var(--ds-gray-700)' }}>
                              {h.period?.slice(5) || ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Top Routes by Volume</h2>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--ds-gray-300)' }}>
                      <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Route</th>
                      <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Vehicle</th>
                      <th className="text-right p-3 text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Avg €/km</th>
                      <th className="text-right p-3 text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Min</th>
                      <th className="text-right p-3 text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Max</th>
                      <th className="text-right p-3 text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Samples</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRoutes.map((route, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--ds-gray-200)' }}>
                        <td className="p-3 font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                          {getCountryFlag(route.origin_country)} {route.origin_country} → {getCountryFlag(route.destination_country)} {route.destination_country}
                        </td>
                        <td className="p-3 capitalize" style={{ color: 'var(--ds-gray-700)' }}>
                          {route.vehicle_type?.replace('_', ' ')}
                        </td>
                        <td className="p-3 text-right font-semibold" style={{ color: 'var(--ds-blue-700)' }}>
                          {formatCurrency(route.avg_price_per_km || 0, 'EUR')}
                        </td>
                        <td className="p-3 text-right" style={{ color: 'var(--ds-gray-700)' }}>
                          {formatCurrency(route.min_price_per_km || 0, 'EUR')}
                        </td>
                        <td className="p-3 text-right" style={{ color: 'var(--ds-gray-700)' }}>
                          {formatCurrency(route.max_price_per_km || 0, 'EUR')}
                        </td>
                        <td className="p-3 text-right" style={{ color: 'var(--ds-gray-700)' }}>
                          {route.sample_count}
                        </td>
                        <td className="p-3">
                          <Button variant="secondary" size="sm" onClick={() => viewRouteDetail(route)}>Detail</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Estimate */}
      {tab === 'estimate' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Price Estimator</h2>
            </CardHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Origin Country</label>
                  <Input value={estOrigin} onChange={(e) => setEstOrigin(e.target.value.toUpperCase())} placeholder="DE" maxLength={2} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Destination Country</label>
                  <Input value={estDestination} onChange={(e) => setEstDestination(e.target.value.toUpperCase())} placeholder="FR" maxLength={2} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Vehicle Type</label>
                  <Select value={estVehicle} onChange={(e) => setEstVehicle(e.target.value)}>
                    <option value="truck_40t">Truck 40t</option>
                    <option value="truck_24t">Truck 24t</option>
                    <option value="truck_12t">Truck 12t</option>
                    <option value="van_3.5t">Van 3.5t</option>
                    <option value="mega_trailer">Mega Trailer</option>
                    <option value="refrigerated">Refrigerated</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Weight (tons)</label>
                  <Input type="number" value={estWeight} onChange={(e) => setEstWeight(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <Button onClick={handleEstimate} disabled={estimating || !estOrigin || !estDestination}>
                {estimating ? 'Estimating...' : 'Get Estimate'}
              </Button>
            </div>
          </Card>

          {estimate && (
            <Card>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <StatBox label="Estimated Price" value={formatCurrency(estimate.estimated_price || estimate.estimated_price_eur || 0, 'EUR')} highlight />
                  <StatBox label="Price/km" value={formatCurrency(estimate.price_per_km || 0, 'EUR')} />
                  <StatBox label="Confidence" value={String(estimate.confidence || '—').replace('_', ' ')} />
                </div>
                {estimate.price_range && (
                  <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--ds-gray-700)' }}>
                    <span>Range: {formatCurrency(estimate.price_range.min, 'EUR')} – {formatCurrency(estimate.price_range.max, 'EUR')}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Compare */}
      {tab === 'compare' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Route Comparison</h2>
            </CardHeader>
            <div className="p-4 space-y-3">
              {compareRoutes.map((r, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <span className="text-xs font-medium w-16" style={{ color: 'var(--ds-gray-700)' }}>Route {i + 1}</span>
                  <Input
                    className="w-20"
                    value={r.origin_country}
                    onChange={(e) => {
                      const updated = [...compareRoutes];
                      updated[i] = { ...updated[i], origin_country: e.target.value.toUpperCase() };
                      setCompareRoutes(updated);
                    }}
                    placeholder="DE"
                    maxLength={2}
                  />
                  <span style={{ color: 'var(--ds-gray-700)' }}>→</span>
                  <Input
                    className="w-20"
                    value={r.destination_country}
                    onChange={(e) => {
                      const updated = [...compareRoutes];
                      updated[i] = { ...updated[i], destination_country: e.target.value.toUpperCase() };
                      setCompareRoutes(updated);
                    }}
                    placeholder="FR"
                    maxLength={2}
                  />
                  {compareRoutes.length > 2 && (
                    <Button variant="secondary" size="sm" onClick={() => setCompareRoutes(compareRoutes.filter((_, j) => j !== i))}>✕</Button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setCompareRoutes([...compareRoutes, { origin_country: '', destination_country: '' }])}>
                  + Add Route
                </Button>
                <Button onClick={handleCompare} disabled={comparing}>
                  {comparing ? 'Comparing...' : 'Compare'}
                </Button>
              </div>
            </div>
          </Card>

          {compareResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareResults.map((result, i) => (
                <Card key={i}>
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                      {getCountryFlag(result.origin_country)} {result.origin_country} → {getCountryFlag(result.destination_country)} {result.destination_country}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--ds-gray-700)' }}>Avg €/km</span>
                        <span className="font-semibold" style={{ color: 'var(--ds-blue-700)' }}>{formatCurrency(result.avg_price_per_km || 0, 'EUR')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--ds-gray-700)' }}>Min – Max</span>
                        <span style={{ color: 'var(--ds-gray-900)' }}>
                          {formatCurrency(result.min_price_per_km || 0, 'EUR')} – {formatCurrency(result.max_price_per_km || 0, 'EUR')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--ds-gray-700)' }}>Samples</span>
                        <span style={{ color: 'var(--ds-gray-900)' }}>{result.sample_count}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: highlight ? 'var(--ds-blue-100)' : 'var(--ds-gray-100)' }}>
      <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>{label}</p>
      <p className="text-lg font-bold mt-1" style={{ color: highlight ? 'var(--ds-blue-900)' : 'var(--ds-gray-1000)' }}>{value}</p>
    </div>
  );
}
