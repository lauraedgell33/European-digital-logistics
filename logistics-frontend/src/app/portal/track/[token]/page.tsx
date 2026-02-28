'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { portalApi } from '@/lib/api';
import {
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  StarIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface TrackingEvent {
  type: string;
  description: string;
  location: string;
  timestamp: string;
}

interface ProgressStep {
  key: string;
  label: string;
  completed: boolean;
}

interface TrackingData {
  tracking_number: string;
  status: string;
  origin: { city: string | null; country: string | null };
  destination: { city: string | null; country: string | null };
  estimated_delivery: string | null;
  actual_delivery: string | null;
  last_position: { lat: number; lng: number; speed_kmh: number; recorded_at: string } | null;
  positions: { lat: number; lng: number; speed_kmh: number; recorded_at: string }[];
  events: TrackingEvent[];
  progress: {
    current_step: number;
    total_steps: number;
    steps: ProgressStep[];
  };
  permissions?: string[];
}

const STATUS_LABELS: Record<string, string> = {
  booked: 'Booked',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  booked: 'bg-[var(--ds-gray-200)] text-[var(--ds-gray-800)]',
  picked_up: 'bg-[var(--ds-blue-200)] text-[var(--ds-blue-800)]',
  in_transit: 'bg-[var(--ds-amber-200)] text-[var(--ds-amber-800)]',
  delivered: 'bg-[var(--ds-green-200)] text-[var(--ds-green-800)]',
  cancelled: 'bg-[var(--ds-red-200)] text-[var(--ds-red-800)]',
};

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TokenTrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Map ref
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    portalApi
      .trackByToken(token)
      .then((res) => setData(res.data.data))
      .catch((err) => {
        setError(
          err.response?.status === 404
            ? 'This tracking link is invalid or has expired.'
            : 'An error occurred. Please try again later.'
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || !data?.positions?.length) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      const map = L.map(mapRef.current!, {
        center: [data.positions[0].lat, data.positions[0].lng],
        zoom: 6,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Route polyline
      const latlngs = data.positions.map((p) => [p.lat, p.lng] as [number, number]).reverse();
      if (latlngs.length > 1) {
        L.polyline(latlngs, { color: '#0070f3', weight: 3, opacity: 0.7 }).addTo(map);
      }

      // Current position marker
      const current = data.positions[0];
      const truckIcon = L.divIcon({
        html: '<div style="background:#0070f3;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: '',
      });
      L.marker([current.lat, current.lng], { icon: truckIcon })
        .bindPopup(
          `<strong>Current Position</strong><br/>Speed: ${current.speed_kmh ?? '—'} km/h<br/>${formatDateTime(current.recorded_at)}`
        )
        .addTo(map);

      // Origin marker (oldest position)
      if (latlngs.length > 0) {
        const originIcon = L.divIcon({
          html: '<div style="background:#10b981;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
          className: '',
        });
        L.marker(latlngs[0], { icon: originIcon })
          .bindPopup(`<strong>Origin</strong><br/>${data.origin.city || ''}, ${data.origin.country || ''}`)
          .addTo(map);
      }

      if (latlngs.length > 1) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
      }

      leafletMap.current = map;
    };

    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [data]);

  const handleFeedback = async () => {
    if (!data || rating === 0) return;
    setFeedbackLoading(true);
    try {
      await portalApi.submitFeedback({
        tracking_number: data.tracking_number,
        rating,
        comment: comment || undefined,
      });
      setFeedbackSent(true);
    } catch {
      // silent fail
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--ds-blue-700)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--ds-gray-600)]">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-32 text-center px-4">
        <ExclamationTriangleIcon className="w-12 h-12 text-[var(--ds-amber-600)] mb-4" />
        <h2 className="text-lg font-semibold text-[var(--ds-gray-1000)] mb-2">Link Unavailable</h2>
        <p className="text-sm text-[var(--ds-gray-600)] max-w-md mb-6">{error}</p>
        <Link
          href="/portal"
          className="px-4 py-2 bg-[var(--ds-blue-700)] text-white text-sm font-medium rounded-lg hover:bg-[var(--ds-blue-800)] transition-colors"
        >
          Go to Tracking Portal
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/portal"
          className="p-2 rounded-lg border border-[var(--ds-gray-200)] hover:bg-[var(--ds-gray-100)] transition-colors text-[var(--ds-gray-700)]"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-[var(--ds-gray-500)]">
          <LinkIcon className="w-3.5 h-3.5" />
          Shared tracking link
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-[var(--ds-gray-1000)] font-mono">
              {data.tracking_number}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[data.status] || STATUS_COLORS.booked}`}
            >
              {STATUS_LABELS[data.status] || data.status}
            </span>
          </div>
          <p className="text-sm text-[var(--ds-gray-600)]">
            {data.origin.city}, {data.origin.country} → {data.destination.city},{' '}
            {data.destination.country}
          </p>
        </div>
        {data.estimated_delivery && (
          <div className="flex items-center gap-2 text-sm text-[var(--ds-gray-700)]">
            <ClockIcon className="w-4 h-4" />
            <span>ETA: {formatDateTime(data.estimated_delivery)}</span>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="p-6 rounded-xl border border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--ds-gray-200)]" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-[var(--ds-blue-700)] transition-all duration-500"
            style={{
              width: `${(data.progress.current_step / (data.progress.total_steps - 1)) * 100}%`,
            }}
          />
          {data.progress.steps.map((step, i) => (
            <div key={step.key} className="relative flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.completed
                    ? 'bg-[var(--ds-blue-700)] border-[var(--ds-blue-700)] text-white'
                    : 'bg-[var(--ds-background-100)] border-[var(--ds-gray-300)] text-[var(--ds-gray-500)]'
                }`}
              >
                {step.completed ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-medium">{i + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  step.completed ? 'text-[var(--ds-blue-700)]' : 'text-[var(--ds-gray-500)]'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map + Events */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--ds-gray-200)] overflow-hidden bg-[var(--ds-background-100)]">
          <div className="px-4 py-3 border-b border-[var(--ds-gray-200)] flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-[var(--ds-gray-600)]" />
            <span className="text-sm font-medium text-[var(--ds-gray-1000)]">Live Location</span>
            {data.last_position && (
              <span className="text-xs text-[var(--ds-gray-500)] ml-auto">
                Updated {formatDateTime(data.last_position.recorded_at)}
              </span>
            )}
          </div>
          <div ref={mapRef} className="h-[350px] w-full" />
        </div>

        {/* Event Timeline */}
        <div className="rounded-xl border border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] flex flex-col">
          <div className="px-4 py-3 border-b border-[var(--ds-gray-200)]">
            <span className="text-sm font-medium text-[var(--ds-gray-1000)]">Event Timeline</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[350px] p-4">
            {data.events.length === 0 ? (
              <p className="text-sm text-[var(--ds-gray-500)] text-center py-8">No events yet</p>
            ) : (
              <div className="space-y-4">
                {data.events.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                          i === 0 ? 'bg-[var(--ds-blue-700)]' : 'bg-[var(--ds-gray-300)]'
                        }`}
                      />
                      {i < data.events.length - 1 && (
                        <div className="w-px flex-1 bg-[var(--ds-gray-200)] mt-1" />
                      )}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-sm font-medium text-[var(--ds-gray-1000)] capitalize">
                        {event.type.replace(/_/g, ' ')}
                      </p>
                      {event.description && (
                        <p className="text-xs text-[var(--ds-gray-600)] mt-0.5">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--ds-gray-500)]">
                        {event.location && (
                          <>
                            <MapPinIcon className="w-3 h-3" />
                            <span>{event.location}</span>
                          </>
                        )}
                        <span>{formatDateTime(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback (if delivered) */}
      {data.status === 'delivered' && (
        <div className="rounded-xl border border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] p-6">
          <h2 className="text-base font-semibold text-[var(--ds-gray-1000)] mb-4">
            Rate Your Delivery
          </h2>
          {feedbackSent ? (
            <div className="flex items-center gap-2 text-[var(--ds-green-700)]">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Thank you for your feedback!</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    {star <= (hoverRating || rating) ? (
                      <StarSolidIcon className="w-7 h-7 text-[var(--ds-amber-500)]" />
                    ) : (
                      <StarIcon className="w-7 h-7 text-[var(--ds-gray-300)]" />
                    )}
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-[var(--ds-gray-600)]">{rating}/5</span>
                )}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)"
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 rounded-lg border border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-700)] focus:border-transparent text-sm resize-none"
              />
              <button
                onClick={handleFeedback}
                disabled={rating === 0 || feedbackLoading}
                className="px-5 py-2 bg-[var(--ds-blue-700)] text-white text-sm font-medium rounded-lg hover:bg-[var(--ds-blue-800)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
