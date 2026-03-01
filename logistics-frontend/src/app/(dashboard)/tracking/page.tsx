'use client';

import { useState, useEffect, useRef } from 'react';
import { useActiveShipments, useShipmentTracking } from '@/hooks/useApi';
import { useTrackingStore } from '@/stores/trackingStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Loading';
import { SHIPMENT_STATUS_COLORS, formatDate } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  TruckIcon,
  SignalIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { activeShipments, selectedShipment, selectShipment } = useTrackingStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const { t } = useTranslation();

  const { data: shipmentsData, isLoading: loadingShipments } = useActiveShipments();
  const { data: trackingData, isLoading: loadingTracking } = useShipmentTracking(
    selectedId ?? ''
  );

  const shipments = shipmentsData ?? [];
  const tracking = trackingData;

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (leafletMap.current) return;

      leafletMap.current = L.map(mapRef.current!, {
        center: [50.1109, 8.6821], // Frankfurt
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      ).addTo(leafletMap.current);
    };

    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update map markers when tracking data changes
  useEffect(() => {
    if (!leafletMap.current || !tracking?.positions?.length) return;

    const initLeaflet = async () => {
      const L = (await import('leaflet')).default;
      const map = leafletMap.current;

      // Clear existing layers
      map.eachLayer((layer: { _url?: string }) => {
        if (layer._url === undefined || layer._url?.includes('carto')) return;
        map.removeLayer(layer);
      });

      const positions = tracking.positions;
      const latLngs = positions.map((p: { latitude: number; longitude: number }) => [p.latitude, p.longitude]);

      // Draw route line
      L.polyline(latLngs, {
        color: '#0070f3',
        weight: 3,
        opacity: 0.8,
      }).addTo(map);

      // Add markers for first and last position
      if (positions.length > 0) {
        const last = positions[positions.length - 1];
        const first = positions[0];

        // Start marker
        const startIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #fff;"></div>`,
          iconSize: [12, 12],
        });

        // Current position marker
        const currentIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#0070f3;border:3px solid #fff;box-shadow:0 0 10px rgba(0,112,243,0.5);"></div>`,
          iconSize: [16, 16],
        });

        L.marker([first.latitude, first.longitude], { icon: startIcon }).addTo(map);
        L.marker([last.latitude, last.longitude], { icon: currentIcon }).addTo(map);

        // Fit map bounds
        map.fitBounds(latLngs, { padding: [40, 40] });
      }
    };

    initLeaflet();
  }, [tracking]);

  const handleSearch = () => {
    if (trackingCode.trim()) {
      setSelectedId(trackingCode.trim());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          {t('tracking.title')}
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
          {t('tracking.liveTracking')}
        </p>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter tracking code or shipment ID..."
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
          <Button onClick={handleSearch}>Track</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar — Shipment List */}
        <div className="space-y-3 lg:col-span-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
          <h3
            className="text-[13px] font-semibold uppercase tracking-wide"
            style={{ color: 'var(--ds-gray-800)' }}
          >
            {t('tracking.activeShipments')}
            {shipments.length > 0 && (
              <span className="ml-2 font-mono">({shipments.length})</span>
            )}
          </h3>

          {loadingShipments ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : shipments.length === 0 ? (
            <Card>
              <div className="text-center py-6">
                <TruckIcon
                  className="h-10 w-10 mx-auto mb-3"
                  style={{ color: 'var(--ds-gray-600)' }}
                />
                <p className="text-[13px]" style={{ color: 'var(--ds-gray-800)' }}>
                  {t('tracking.noActiveShipments')}
                </p>
              </div>
            </Card>
          ) : (
            shipments.map((s: { id?: number; tracking_code: string; status: string; origin_city?: string; origin_country?: string; destination_city?: string; destination_country?: string; current_location?: string }) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id?.toString() ?? null)}
                className="w-full text-left transition-all"
              >
                <Card
                  className={`cursor-pointer transition-all hover:scale-[1.01] ${
                    selectedId === s.id?.toString() ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono font-medium text-[13px]"
                          style={{ color: 'var(--ds-gray-1000)' }}
                        >
                          {s.tracking_code}
                        </span>
                        <Badge
                          variant={(SHIPMENT_STATUS_COLORS[s.status] ?? 'gray') as any}
                        >
                          {s.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-[12px]">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: 'var(--ds-green-700)' }}
                          />
                          <span style={{ color: 'var(--ds-gray-900)' }}>
                            {s.origin_city}, {s.origin_country}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px]">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: 'var(--ds-red-700)' }}
                          />
                          <span style={{ color: 'var(--ds-gray-900)' }}>
                            {s.destination_city}, {s.destination_country}
                          </span>
                        </div>
                      </div>

                      {s.current_location && (
                        <div
                          className="flex items-center gap-1 mt-2 text-[11px]"
                          style={{ color: 'var(--ds-gray-700)' }}
                        >
                          <MapPinIcon className="h-3 w-3" />
                          <span>Last: {s.current_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            ))
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="!p-0 overflow-hidden relative" style={{ height: 'calc(100vh - 320px)' }}>
            <div ref={mapRef} className="w-full h-full" />

            {/* Map overlay info */}
            {tracking && (
              <div
                className="absolute top-4 right-4 p-4 rounded-lg max-w-xs"
                style={{
                  background: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--ds-gray-400)',
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono font-medium text-[13px]"
                      style={{ color: 'var(--ds-gray-1000)' }}
                    >
                      {tracking.shipment?.tracking_code}
                    </span>
                    <Badge
                      variant={(SHIPMENT_STATUS_COLORS[tracking.shipment?.status] ?? 'gray') as any}
                    >
                      {tracking.shipment?.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="divider-geist" />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>{t('tracking.eta')}</p>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                        {tracking.shipment?.eta
                          ? formatDate(tracking.shipment.eta)
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>{t('tracking.speed')}</p>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                        {tracking.positions?.[tracking.positions.length - 1]?.speed_kmh
                          ? `${tracking.positions[tracking.positions.length - 1].speed_kmh} km/h`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {tracking.events?.length > 0 && (
                    <>
                      <div className="divider-geist" />
                      <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>
                        Latest Event
                      </p>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3.5 w-3.5" style={{ color: 'var(--ds-gray-700)' }} />
                        <p className="text-[12px]" style={{ color: 'var(--ds-gray-900)' }}>
                          {tracking.events[0]?.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {loadingTracking && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Spinner size="lg" />
              </div>
            )}

            {!selectedId && !loadingTracking && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <SignalIcon
                  className="h-12 w-12 mb-3"
                  style={{ color: 'var(--ds-gray-600)' }}
                />
                <p className="text-[14px]" style={{ color: 'var(--ds-gray-800)' }}>
                  {t('tracking.noActiveShipmentsDesc')}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
