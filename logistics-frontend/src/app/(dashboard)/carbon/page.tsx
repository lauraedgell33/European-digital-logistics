'use client';

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { carbonApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  GlobeEuropeAfricaIcon,
  CalculatorIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { CarbonCalculationResult, CarbonDashboard } from '@/types';

const VEHICLE_TYPES = [
  { value: 'truck_40t', label: 'Truck 40t' },
  { value: 'truck_24t', label: 'Truck 24t' },
  { value: 'truck_12t', label: 'Truck 12t' },
  { value: 'van_3.5t', label: 'Van 3.5t' },
  { value: 'mega_trailer', label: 'Mega Trailer' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'container', label: 'Container' },
];

const FUEL_TYPES = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'biodiesel', label: 'Biodiesel B100' },
  { value: 'lng', label: 'LNG' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
  { value: 'hydrogen', label: 'Hydrogen' },
  { value: 'hvo', label: 'HVO' },
];

const EURO_CLASSES = [
  { value: 'euro3', label: 'Euro III' },
  { value: 'euro4', label: 'Euro IV' },
  { value: 'euro5', label: 'Euro V' },
  { value: 'euro6', label: 'Euro VI' },
  { value: 'euro6d', label: 'Euro VI-D' },
];

export default function CarbonPage() {
  const [distance, setDistance] = useState('');
  const [weight, setWeight] = useState('');
  const [vehicleType, setVehicleType] = useState('truck_40t');
  const [fuelType, setFuelType] = useState('diesel');
  const [euroClass, setEuroClass] = useState('euro6');
  const [loadFactor, setLoadFactor] = useState('85');
  const [emptyReturn, setEmptyReturn] = useState(false);
  const [result, setResult] = useState<CarbonCalculationResult | null>(null);
  const [dashboard, setDashboard] = useState<CarbonDashboard | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [tab, setTab] = useState<'calculator' | 'dashboard'>('calculator');

  async function handleCalculate() {
    setCalculating(true);
    try {
      const res = await carbonApi.calculate({
        distance_km: Number(distance),
        weight_tons: Number(weight),
        vehicle_type: vehicleType,
        fuel_type: fuelType,
        euro_class: euroClass,
        load_factor: Number(loadFactor),
        empty_return: emptyReturn,
      });
      setResult(res.data.data);
    } catch {
      // fallback
    } finally {
      setCalculating(false);
    }
  }

  async function loadDashboard() {
    setLoadingDashboard(true);
    try {
      const res = await carbonApi.dashboard();
      setDashboard(res.data.data);
    } catch {
      // fallback
    } finally {
      setLoadingDashboard(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            <GlobeEuropeAfricaIcon className="inline h-7 w-7 mr-2" />
            Carbon Footprint
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
            Calculate and track CO₂ emissions — EN 16258 / GLEC Framework compliant
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === 'calculator' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab('calculator')}
          >
            <CalculatorIcon className="h-4 w-4 mr-1" /> Calculator
          </Button>
          <Button
            variant={tab === 'dashboard' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { setTab('dashboard'); if (!dashboard) loadDashboard(); }}
          >
            <ChartBarIcon className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        </div>
      </div>

      {tab === 'calculator' && (
        <>
          {/* Calculator Form */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                CO₂ Emission Calculator
              </h2>
            </CardHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Distance (km)</label>
                  <Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g. 750" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Cargo Weight (tons)</label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 18" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Load Factor (%)</label>
                  <Input type="number" value={loadFactor} onChange={(e) => setLoadFactor(e.target.value)} min="0" max="100" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Vehicle Type</label>
                  <Select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                    {VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Fuel Type</label>
                  <Select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                    {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Euro Class</label>
                  <Select value={euroClass} onChange={(e) => setEuroClass(e.target.value)}>
                    {EURO_CLASSES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </Select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--ds-gray-900)' }}>
                <input type="checkbox" checked={emptyReturn} onChange={(e) => setEmptyReturn(e.target.checked)} />
                Include empty return trip
              </label>

              <Button onClick={handleCalculate} disabled={calculating || !distance || !weight}>
                {calculating ? 'Calculating...' : 'Calculate Emissions'}
              </Button>
            </div>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Total CO₂"
                  value={`${result.total_co2_kg?.toFixed(1)} kg`}
                  sub="Well-to-Wheel"
                  color="var(--ds-red-700)"
                />
                <MetricCard
                  label="CO₂ per tkm"
                  value={`${result.co2_per_tkm?.toFixed(2)} g`}
                  sub="grams per ton-kilometer"
                  color="var(--ds-amber-700)"
                />
                <MetricCard
                  label="CO₂ per km"
                  value={`${result.co2_per_km?.toFixed(1)} g`}
                  sub="grams per kilometer"
                  color="var(--ds-orange-700)"
                />
                <MetricCard
                  label="Offset Cost"
                  value={result.offset_cost_eur ? formatCurrency(result.offset_cost_eur, 'EUR') : '—'}
                  sub="via certified projects"
                  color="var(--ds-green-700)"
                />
              </div>

              {/* Comparison */}
              {result.comparison && (
                <Card>
                  <CardHeader>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                      <ArrowTrendingDownIcon className="inline h-4 w-4 mr-1" /> Alternative Comparison
                    </h3>
                  </CardHeader>
                  <div className="p-4">
                    <div className="space-y-2">
                      {Object.entries(result.comparison).map(([mode, co2]) => {
                        const pct = ((co2 as number) / result.total_co2_kg * 100).toFixed(0);
                        const savings = result.total_co2_kg - (co2 as number);
                        return (
                          <div key={mode} className="flex items-center gap-3">
                            <span className="text-xs w-24 capitalize" style={{ color: 'var(--ds-gray-900)' }}>
                              {mode.replace('_', ' ')}
                            </span>
                            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'var(--ds-gray-200)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(Number(pct), 100)}%`,
                                  background: savings > 0 ? 'var(--ds-green-600)' : 'var(--ds-red-400)',
                                }}
                              />
                            </div>
                            <span className="text-xs w-20 text-right" style={{ color: 'var(--ds-gray-900)' }}>
                              {(co2 as number).toFixed(1)} kg
                            </span>
                            {savings > 0 && (
                              <span className="text-[10px] font-medium" style={{ color: 'var(--ds-green-700)' }}>
                                −{savings.toFixed(0)} kg
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'dashboard' && (
        <>
          {loadingDashboard ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
                ))}
              </div>
            </div>
          ) : dashboard ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Total CO₂ (Year)"
                  value={`${(dashboard.total_co2_year / 1000)?.toFixed(1)} t`}
                  sub={`${dashboard.shipments_count} shipments`}
                  color="var(--ds-gray-1000)"
                />
                <MetricCard
                  label="Avg per Shipment"
                  value={`${dashboard.avg_co2_per_shipment?.toFixed(1)} kg`}
                  sub="CO₂"
                  color="var(--ds-blue-700)"
                />
                <MetricCard
                  label="Sustainability Score"
                  value={`${dashboard.sustainability_score}/100`}
                  sub={dashboard.sustainability_score >= 80 ? 'Excellent' : dashboard.sustainability_score >= 60 ? 'Good' : 'Needs Improvement'}
                  color={dashboard.sustainability_score >= 80 ? 'var(--ds-green-700)' : 'var(--ds-amber-700)'}
                />
                <MetricCard
                  label="Offset"
                  value={`${dashboard.total_offset_kg?.toFixed(0)} kg`}
                  sub="offset purchased"
                  color="var(--ds-green-700)"
                />
              </div>

              {/* Monthly Trends */}
              {dashboard.monthly_trends && dashboard.monthly_trends.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>Monthly Emissions</h3>
                  </CardHeader>
                  <div className="p-4">
                    <div className="flex items-end gap-1 h-40">
                      {dashboard.monthly_trends.map((m: { month: string; co2_kg: number }, i: number) => {
                        const maxCo2 = Math.max(...dashboard.monthly_trends.map((t: { co2_kg: number }) => t.co2_kg));
                        const pct = maxCo2 > 0 ? (m.co2_kg / maxCo2) * 100 : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px]" style={{ color: 'var(--ds-gray-700)' }}>
                              {(m.co2_kg / 1000).toFixed(1)}t
                            </span>
                            <div
                              className="w-full rounded-t"
                              style={{
                                height: `${Math.max(pct, 2)}%`,
                                background: 'var(--ds-green-600)',
                              }}
                            />
                            <span className="text-[9px]" style={{ color: 'var(--ds-gray-700)' }}>
                              {m.month.slice(5)}
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
            <div className="text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
              No emission data available yet. Calculate emissions for your shipments to see dashboard data.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <Card>
      <div className="p-4">
        <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--ds-gray-700)' }}>{label}</p>
        <p className="text-xl font-bold mt-1" style={{ color }}>{value}</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>{sub}</p>
      </div>
    </Card>
  );
}
