'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { routeOptimizationApi } from '@/lib/api';
import {
  MapIcon,
  ArrowPathIcon,
  ClockIcon,
  TruckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { RouteOptimization } from '@/types';

export default function RouteOptimizerPage() {
  const [origin, setOrigin] = useState({ lat: 52.52, lng: 13.405, name: 'Berlin' });
  const [destination, setDestination] = useState({ lat: 48.8566, lng: 2.3522, name: 'Paris' });
  const [waypoints, setWaypoints] = useState([
    { lat: 50.9375, lng: 6.9603, name: 'Cologne' },
    { lat: 50.1109, lng: 8.6821, name: 'Frankfurt' },
  ]);
  const [newWp, setNewWp] = useState('');

  const optimizeMutation = useMutation({
    mutationFn: () => routeOptimizationApi.optimize({ origin, destination, waypoints }),
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['route-optimization-history'],
    queryFn: () => routeOptimizationApi.history().then(r => r.data?.data || []),
  });

  const result = optimizeMutation.data?.data?.data;

  const addWaypoint = () => {
    if (newWp.trim()) {
      setWaypoints([...waypoints, { lat: 50 + Math.random() * 5, lng: 5 + Math.random() * 10, name: newWp.trim() }]);
      setNewWp('');
    }
  };

  const removeWaypoint = (idx: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapIcon className="h-7 w-7" style={{ color: 'var(--ds-green-500)' }} />
          Route Optimizer
        </h1>
        <p className="text-sm text-gray-500 mt-1">TSP-optimized multi-stop routes with CO₂ & cost savings</p>
      </div>

      {/* Route Input */}
      <Card>
        <CardHeader title="Plan Your Route" subtitle="Add stops and optimize the delivery order" />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Origin</label>
              <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={origin.name} onChange={e => setOrigin({ ...origin, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
              <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={destination.name} onChange={e => setDestination({ ...destination, name: e.target.value })} />
            </div>
          </div>

          {/* Waypoints */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Stops ({waypoints.length})</label>
            <div className="space-y-2">
              {waypoints.map((wp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--ds-blue-500)' }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm">{wp.name}</span>
                  <button onClick={() => removeWaypoint(i)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                placeholder="Add stop..."
                value={newWp}
                onChange={e => setNewWp(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWaypoint()}
              />
              <Button size="sm" variant="secondary" onClick={addWaypoint}>Add</Button>
            </div>
          </div>

          <Button onClick={() => optimizeMutation.mutate()} disabled={optimizeMutation.isPending} className="w-full sm:w-auto">
            {optimizeMutation.isPending ? <Spinner size="sm" /> : <ArrowPathIcon className="h-4 w-4 mr-2" />}
            Optimize Route
          </Button>
        </div>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader title="Optimized Route" subtitle="Reordered stops for minimum distance" />
          <div className="p-4 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <GlobeAltIcon className="h-5 w-5 mx-auto mb-1" style={{ color: 'var(--ds-blue-500)' }} />
                <p className="text-lg font-bold">{Number(result.total_distance_km || 0).toFixed(0)} km</p>
                <p className="text-xs text-gray-500">Total Distance</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <ClockIcon className="h-5 w-5 mx-auto mb-1" style={{ color: 'var(--ds-amber-500)' }} />
                <p className="text-lg font-bold">{Number(result.estimated_duration_hours || 0).toFixed(1)}h</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--ds-green-50)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--ds-green-700)' }}>-{Number(result.co2_savings_kg || 0).toFixed(0)} kg</p>
                <p className="text-xs text-gray-500">CO₂ Savings</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--ds-green-50)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--ds-green-700)' }}>-€{Number(result.cost_savings_eur || 0).toFixed(0)}</p>
                <p className="text-xs text-gray-500">Cost Savings</p>
              </div>
            </div>

            {/* Optimized Order */}
            <div>
              <h3 className="text-sm font-medium mb-2">Optimized Stop Order</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="green">{result.origin || origin.name}</Badge>
                {(result.optimized_waypoints || []).map((wp: Record<string, unknown>, i: number) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="text-gray-400">→</span>
                    <Badge variant="blue">{String(wp.name || `Stop ${i + 1}`)}</Badge>
                  </span>
                ))}
                <span className="text-gray-400">→</span>
                <Badge variant="red">{result.destination || destination.name}</Badge>
              </div>
            </div>

            {/* Alternatives */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Alternative Routes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(result.alternatives as Array<Record<string, unknown>>).map((alt, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                      <Badge variant="gray" className="mb-2">{String(alt.type || 'Alternative')}</Badge>
                      <p>{Number(alt.distance_km || 0).toFixed(0)} km • {Number(alt.duration_hours || 0).toFixed(1)}h • {Number(alt.co2_kg || 0).toFixed(0)} kg CO₂</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader title="Optimization History" subtitle="Previous route optimizations" />
        {loadingHistory ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : (historyData || []).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No previous optimizations.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(historyData as RouteOptimization[]).slice(0, 10).map(opt => (
              <div key={opt.id} className="p-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{opt.origin} → {opt.destination}</p>
                  <p className="text-gray-500">{opt.waypoints?.length || 0} stops • {opt.total_distance_km?.toFixed(0)} km</p>
                </div>
                <div className="text-right">
                  <Badge variant="green">-{opt.co2_savings_kg?.toFixed(0)} kg CO₂</Badge>
                  <p className="text-xs text-gray-500 mt-1">{new Date(opt.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
