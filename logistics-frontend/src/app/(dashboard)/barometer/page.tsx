'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { barometerApi } from '@/lib/api';
import { getCountryFlag, COUNTRIES } from '@/lib/utils';
import {
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TruckIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import type { BarometerOverview } from '@/types';

export default function BarometerPage() {
  const [data, setData] = useState<BarometerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<{ origin: string; dest: string } | null>(null);
  const [routeData, setRouteData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    try {
      const res = await barometerApi.overview();
      setData(res.data.data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function loadRouteAnalysis(origin: string, dest: string) {
    setSelectedRoute({ origin, dest });
    try {
      const res = await barometerApi.route({ origin_country: origin, destination_country: dest });
      setRouteData(res.data.data);
    } catch {
      // fallback
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            <PresentationChartLineIcon className="inline h-7 w-7 mr-2" />
            Transport Barometer
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
            Real-time market intelligence — supply, demand & pricing across European routes
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--ds-blue-200)' }}>
                <CubeIcon className="h-5 w-5" style={{ color: 'var(--ds-blue-900)' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Active Freight</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                  {data?.total_freight_offers?.toLocaleString() ?? '—'}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--ds-green-200)' }}>
                <TruckIcon className="h-5 w-5" style={{ color: 'var(--ds-green-900)' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Available Vehicles</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                  {data?.total_vehicle_offers?.toLocaleString() ?? '—'}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: data?.supply_demand_ratio && data.supply_demand_ratio > 1 ? 'var(--ds-red-200)' : 'var(--ds-green-200)' }}>
                {data?.supply_demand_ratio && data.supply_demand_ratio > 1
                  ? <ArrowTrendingUpIcon className="h-5 w-5" style={{ color: 'var(--ds-red-900)' }} />
                  : <ArrowTrendingDownIcon className="h-5 w-5" style={{ color: 'var(--ds-green-900)' }} />
                }
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Supply/Demand Ratio</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                  {data?.supply_demand_ratio?.toFixed(2) ?? '—'}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--ds-amber-200)' }}>
                <PresentationChartLineIcon className="h-5 w-5" style={{ color: 'var(--ds-amber-900)' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Avg Price/km</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                  €{data?.avg_price_per_km?.toFixed(2) ?? '—'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Routes */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Top Routes</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ds-gray-400)' }}>
                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--ds-gray-700)' }}>Route</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--ds-gray-700)' }}>Load Count</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--ds-gray-700)' }}>Avg €/km</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--ds-gray-700)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.top_routes?.map((route, i) => (
                <tr
                  key={i}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--ds-gray-200)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--ds-gray-100)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    {getCountryFlag(route.origin)} {route.origin} → {getCountryFlag(route.destination)} {route.destination}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--ds-gray-900)' }}>
                    {route.count}
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    €{route.avg_price_per_km?.toFixed(2) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => loadRouteAnalysis(route.origin, route.destination)}
                    >
                      Analyze
                    </Button>
                  </td>
                </tr>
              ))}
              {(!data?.top_routes || data.top_routes.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--ds-gray-700)' }}>
                    No route data available yet. Market data populates as offers are created.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Vehicle Type Distribution + Price Heatmap side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Vehicle Type Distribution</h2>
          </CardHeader>
          <div className="p-4 space-y-3">
            {data?.vehicle_type_distribution && Object.entries(data.vehicle_type_distribution).length > 0 ? (
              Object.entries(data.vehicle_type_distribution)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const total = Object.values(data.vehicle_type_distribution!).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: 'var(--ds-gray-900)' }}>{type.replace(/_/g, ' ')}</span>
                        <span style={{ color: 'var(--ds-gray-700)' }}>{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'var(--ds-gray-200)' }}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: 'var(--ds-blue-700)' }}
                        />
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--ds-gray-700)' }}>
                No data available
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
              Origin Heatmap
            </h2>
          </CardHeader>
          <div className="p-4 space-y-2">
            {data?.origin_heatmap && Object.entries(data.origin_heatmap).length > 0 ? (
              Object.entries(data.origin_heatmap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([country, count]) => {
                  const max = Math.max(...Object.values(data.origin_heatmap!));
                  const pct = max > 0 ? (count / max) * 100 : 0;
                  return (
                    <div key={country} className="flex items-center gap-3">
                      <span className="w-8 text-center">{getCountryFlag(country)}</span>
                      <span className="w-8 text-xs font-medium" style={{ color: 'var(--ds-gray-900)' }}>{country}</span>
                      <div className="flex-1 h-4 rounded" style={{ background: 'var(--ds-gray-200)' }}>
                        <div
                          className="h-4 rounded transition-all"
                          style={{ width: `${pct}%`, background: 'var(--ds-blue-700)', opacity: 0.3 + (pct / 100) * 0.7 }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs font-medium" style={{ color: 'var(--ds-gray-900)' }}>{count}</span>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--ds-gray-700)' }}>
                No data available
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Route Analysis Detail */}
      {selectedRoute && routeData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                Route Analysis: {getCountryFlag(selectedRoute.origin)} {selectedRoute.origin} → {getCountryFlag(selectedRoute.dest)} {selectedRoute.dest}
              </h2>
              <Button variant="secondary" size="sm" onClick={() => { setSelectedRoute(null); setRouteData(null); }}>
                Close
              </Button>
            </div>
          </CardHeader>
          <div className="p-4">
            <pre className="text-xs overflow-auto p-4 rounded" style={{ background: 'var(--ds-gray-100)', color: 'var(--ds-gray-900)' }}>
              {JSON.stringify(routeData, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}
