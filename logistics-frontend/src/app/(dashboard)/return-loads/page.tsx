'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { returnLoadApi } from '@/lib/api';
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/utils';
import {
  ArrowPathIcon,
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import type { ReturnLoadSuggestion, EmptyLeg } from '@/types';

export default function ReturnLoadsPage() {
  const [tab, setTab] = useState<'search' | 'emptyLegs'>('search');
  const [suggestions, setSuggestions] = useState<ReturnLoadSuggestion[]>([]);
  const [emptyLegs, setEmptyLegs] = useState<EmptyLeg[]>([]);
  const [loading, setLoading] = useState(false);

  // Search form
  const [originLat, setOriginLat] = useState('');
  const [originLng, setOriginLng] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');
  const [radius, setRadius] = useState('100');
  const [vehicleType, setVehicleType] = useState('');

  useEffect(() => {
    if (tab === 'emptyLegs' && emptyLegs.length === 0) loadEmptyLegs();
  }, [tab]);

  async function handleSearch() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        current_latitude: Number(originLat),
        current_longitude: Number(originLng),
        radius_km: Number(radius),
      };
      if (destLat && destLng) {
        params.destination_latitude = Number(destLat);
        params.destination_longitude = Number(destLng);
      }
      if (vehicleType) params.vehicle_type = vehicleType;
      const res = await returnLoadApi.suggest(params);
      setSuggestions(res.data.data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function loadEmptyLegs() {
    setLoading(true);
    try {
      const res = await returnLoadApi.emptyLegs();
      setEmptyLegs(res.data.data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            <ArrowPathIcon className="inline h-7 w-7 mr-2" />
            Return Loads
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
            Reduce empty runs — find return loads and available freight near your destination
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === 'search' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('search')}>
            <TruckIcon className="h-4 w-4 mr-1" /> Find Loads
          </Button>
          <Button variant={tab === 'emptyLegs' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('emptyLegs')}>
            <MapPinIcon className="h-4 w-4 mr-1" /> Empty Legs
          </Button>
        </div>
      </div>

      {tab === 'search' && (
        <>
          {/* Search Form */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                Search for Return Loads
              </h2>
            </CardHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Current Latitude</label>
                  <Input type="number" step="0.001" value={originLat} onChange={(e) => setOriginLat(e.target.value)} placeholder="e.g. 48.856" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Current Longitude</label>
                  <Input type="number" step="0.001" value={originLng} onChange={(e) => setOriginLng(e.target.value)} placeholder="e.g. 2.352" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Search Radius (km)</label>
                  <Input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Home Base Latitude</label>
                  <Input type="number" step="0.001" value={destLat} onChange={(e) => setDestLat(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Home Base Longitude</label>
                  <Input type="number" step="0.001" value={destLng} onChange={(e) => setDestLng(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ds-gray-700)' }}>Vehicle Type</label>
                  <Input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} placeholder="e.g. truck_40t" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={loading || !originLat || !originLng}>
                  {loading ? 'Searching...' : 'Find Return Loads'}
                </Button>
                <Button variant="secondary" onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setOriginLat(pos.coords.latitude.toFixed(4));
                      setOriginLng(pos.coords.longitude.toFixed(4));
                    });
                  }
                }}>
                  📍 Use My Location
                </Button>
              </div>
            </div>
          </Card>

          {/* Results */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                {suggestions.length} Return Load{suggestions.length > 1 ? 's' : ''} Found
              </h3>
              {suggestions.map((s, i) => (
                <Card key={i}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                            {getCountryFlag(s.offer?.origin_country || '')} {s.offer?.origin_city || s.offer?.origin_country}
                          </span>
                          <ArrowRightIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-500)' }} />
                          <span className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                            {getCountryFlag(s.offer?.destination_country || '')} {s.offer?.destination_city || s.offer?.destination_country}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                          <span><MapPinIcon className="inline h-3 w-3" /> {s.distance_km?.toFixed(0)} km from you</span>
                          {s.offer?.cargo_weight && <span>⚖️ {s.offer.cargo_weight} t</span>}
                          {s.offer?.loading_date && <span><CalendarIcon className="inline h-3 w-3" /> {formatDate(s.offer.loading_date)}</span>}
                          {s.offer?.vehicle_type && <span className="capitalize">🚛 {s.offer.vehicle_type.replace('_', ' ')}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: 'var(--ds-blue-700)' }}>
                          {s.offer?.price ? formatCurrency(s.offer.price, s.offer?.currency || 'EUR') : 'On request'}
                        </div>
                        <div
                          className="text-[11px] font-medium mt-1 px-2 py-0.5 rounded-full inline-block"
                          style={{
                            background: s.relevance_score >= 80 ? 'var(--ds-green-200)' : s.relevance_score >= 50 ? 'var(--ds-amber-200)' : 'var(--ds-gray-200)',
                            color: s.relevance_score >= 80 ? 'var(--ds-green-900)' : s.relevance_score >= 50 ? 'var(--ds-amber-900)' : 'var(--ds-gray-900)',
                          }}
                        >
                          {s.relevance_score}% match
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {suggestions.length === 0 && !loading && originLat && (
            <div className="text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
              No return loads found in this area. Try increasing the search radius.
            </div>
          )}
        </>
      )}

      {tab === 'emptyLegs' && (
        <>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
              ))}
            </div>
          ) : emptyLegs.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                Empty Legs — Market Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emptyLegs.map((leg, i) => (
                  <Card key={i}>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                          {getCountryFlag(leg.origin_country)} {leg.origin_country}
                        </span>
                        <ArrowRightIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-500)' }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                          {getCountryFlag(leg.destination_country)} {leg.destination_country}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs" style={{ color: 'var(--ds-gray-700)' }}>
                        <span>🚛 {leg.available_vehicles} available vehicles</span>
                        <span>📦 {leg.freight_demand} freight offers</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ds-gray-200)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((leg.supply_demand_ratio || 0) * 50, 100)}%`,
                            background: leg.supply_demand_ratio > 1.5 ? 'var(--ds-green-600)' : leg.supply_demand_ratio > 0.8 ? 'var(--ds-amber-500)' : 'var(--ds-red-500)',
                          }}
                        />
                      </div>
                      <p className="text-[10px]" style={{ color: 'var(--ds-gray-700)' }}>
                        Supply/Demand: {leg.supply_demand_ratio?.toFixed(2)}
                        {leg.supply_demand_ratio > 1.5 ? ' — Oversupply' : leg.supply_demand_ratio > 0.8 ? ' — Balanced' : ' — High Demand'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
              No empty leg data available yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}
