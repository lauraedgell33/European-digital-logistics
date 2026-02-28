'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { multimodalApi, intermodalApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ArrowPathRoundedSquareIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import type { MultimodalBooking, IntermodalPlan, MultimodalSearchResult, MultimodalStats } from '@/types';

const modeIcons: Record<string, string> = { rail: '🚂', sea: '🚢', air: '✈️', barge: '⛴️', road: '🚛' };

export default function MultimodalPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'search' | 'bookings' | 'plans'>('search');
  const [searchForm, setSearchForm] = useState({
    origin: 'Rotterdam, NL',
    destination: 'Milan, IT',
    cargo_weight_kg: 20000,
    cargo_volume_m3: 60,
    departure_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const searchMutation = useMutation({
    mutationFn: () => multimodalApi.search(searchForm),
  });

  const bookMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => multimodalApi.book(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multimodal-bookings'] });
      setTab('bookings');
    },
  });

  const planMutation = useMutation({
    mutationFn: () => intermodalApi.createPlan({
      origin: searchForm.origin,
      destination: searchForm.destination,
      cargo_weight_kg: searchForm.cargo_weight_kg,
      cargo_volume_m3: searchForm.cargo_volume_m3,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intermodal-plans'] });
      setTab('plans');
    },
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['multimodal-bookings'],
    queryFn: () => multimodalApi.bookings().then(r => r.data?.data || []),
    enabled: tab === 'bookings',
  });

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ['intermodal-plans'],
    queryFn: () => intermodalApi.plans().then(r => r.data?.data || []),
    enabled: tab === 'plans',
  });

  const { data: stats } = useQuery({
    queryKey: ['multimodal-stats'],
    queryFn: () => multimodalApi.statistics().then(r => r.data?.data),
  });

  const searchResults: MultimodalSearchResult[] = searchMutation.data?.data?.data || [];
  const statsData = stats as MultimodalStats | undefined;

  const tabs = [
    { key: 'search' as const, label: 'Search & Book', icon: MagnifyingGlassIcon },
    { key: 'bookings' as const, label: 'Bookings', icon: TruckIcon },
    { key: 'plans' as const, label: 'Intermodal Plans', icon: ArrowPathRoundedSquareIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GlobeAltIcon className="h-7 w-7" style={{ color: 'var(--ds-teal-500)' }} />
          Multimodal Transport
        </h1>
        <p className="text-sm text-gray-500 mt-1">Rail, sea, air & barge options with CO₂ comparison</p>
      </div>

      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{statsData.total_bookings}</p>
            <p className="text-xs text-gray-500">Bookings</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--ds-green-600)' }}>{(statsData.total_co2_saved_kg / 1000).toFixed(1)}t</p>
            <p className="text-xs text-gray-500">CO₂ Saved</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{statsData.intermodal_plans}</p>
            <p className="text-xs text-gray-500">Intermodal Plans</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{statsData.avg_cost_saving_pct?.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Avg Cost Saving</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {tab === 'search' && (
        <>
          <Card>
            <CardHeader title="Search Multimodal Options" />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Origin</label>
                <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={searchForm.origin} onChange={e => setSearchForm({ ...searchForm, origin: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
                <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={searchForm.destination} onChange={e => setSearchForm({ ...searchForm, destination: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                <input type="number" className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={searchForm.cargo_weight_kg} onChange={e => setSearchForm({ ...searchForm, cargo_weight_kg: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Departure</label>
                <input type="date" className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={searchForm.departure_date} onChange={e => setSearchForm({ ...searchForm, departure_date: e.target.value })} />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={() => searchMutation.mutate()} disabled={searchMutation.isPending} className="flex-1">
                  {searchMutation.isPending ? <Spinner size="sm" /> : <MagnifyingGlassIcon className="h-4 w-4 mr-1" />}
                  Search
                </Button>
                <Button variant="secondary" onClick={() => planMutation.mutate()} disabled={planMutation.isPending}>
                  Plan
                </Button>
              </div>
            </div>
          </Card>

          {searchResults.length > 0 && (
            <Card>
              <CardHeader title="Available Options" subtitle={`${searchResults.length} options found`} />
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((result, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{modeIcons[result.mode] || '📦'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{result.mode}</span>
                          <Badge variant="gray">{result.operator}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{result.origin_terminal} → {result.destination_terminal}</p>
                        <p className="text-xs text-gray-500">{result.transit_days} days • {new Date(result.departure_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(result.price_eur, 'EUR')}</p>
                      <p className="text-xs" style={{ color: 'var(--ds-green-600)' }}>{result.co2_kg.toFixed(0)} kg CO₂</p>
                      <Button size="sm" variant="primary" className="mt-2"
                        onClick={() => bookMutation.mutate({
                          mode: result.mode, origin: searchForm.origin, destination: searchForm.destination,
                          origin_terminal: result.origin_terminal, destination_terminal: result.destination_terminal,
                          departure_date: result.departure_date, cargo_type: 'general',
                          weight_kg: searchForm.cargo_weight_kg, price: result.price_eur, currency: 'EUR',
                          co2_kg: result.co2_kg, operator_name: result.operator,
                        })}>
                        Book
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <Card>
          <CardHeader title="Multimodal Bookings" />
          {loadingBookings ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : (bookings || []).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <GlobeAltIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No bookings yet. Search and book above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(bookings as MultimodalBooking[]).map(b => (
                <div key={b.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{modeIcons[b.mode]}</span>
                      <span className="font-mono text-sm font-bold">{b.booking_reference}</span>
                      <Badge variant={b.status === 'delivered' ? 'green' : b.status === 'in_transit' ? 'blue' : 'yellow'}>{b.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{b.origin} → {b.destination}</p>
                    <p className="text-xs text-gray-500">{b.operator_name} • {b.weight_kg} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(b.price, b.currency)}</p>
                    <p className="text-xs" style={{ color: 'var(--ds-green-600)' }}>{b.co2_kg.toFixed(0)} kg CO₂</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Plans Tab */}
      {tab === 'plans' && (
        <Card>
          <CardHeader title="Intermodal Plans" subtitle="Combined multi-mode transport plans vs road-only" />
          {loadingPlans ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : (plans || []).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ArrowPathRoundedSquareIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No intermodal plans yet.</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {(plans as IntermodalPlan[]).map(plan => (
                <div key={plan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{plan.origin} → {plan.destination}</p>
                      <p className="text-xs text-gray-500">Modes: {(plan.modes_used || []).map(m => modeIcons[m] || m).join(' ')}</p>
                    </div>
                    <Badge variant={plan.status === 'completed' ? 'green' : 'blue'}>{plan.status}</Badge>
                  </div>
                  {/* Legs */}
                  <div className="space-y-2 mb-3">
                    {(plan.legs || []).map((leg, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span>{modeIcons[leg.mode] || '📦'}</span>
                        <span className="text-gray-500">{leg.origin} → {leg.destination}</span>
                        <span className="text-xs text-gray-400">{leg.distance_km}km • {leg.duration_hours}h • €{leg.cost_eur}</span>
                      </div>
                    ))}
                  </div>
                  {/* Comparison */}
                  <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center text-sm">
                    <div>
                      <p className="font-semibold">{formatCurrency(plan.total_cost_eur, 'EUR')}</p>
                      <p className="text-xs text-gray-500">Intermodal Cost</p>
                      <p className="text-xs" style={{ color: 'var(--ds-green-600)' }}>-{plan.cost_savings_pct?.toFixed(0)}% vs road</p>
                    </div>
                    <div>
                      <p className="font-semibold">{plan.total_co2_kg?.toFixed(0)} kg</p>
                      <p className="text-xs text-gray-500">CO₂</p>
                      <p className="text-xs" style={{ color: 'var(--ds-green-600)' }}>-{plan.co2_savings_pct?.toFixed(0)}% vs road</p>
                    </div>
                    <div>
                      <p className="font-semibold">{plan.total_duration_hours?.toFixed(1)}h</p>
                      <p className="text-xs text-gray-500">Duration</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
