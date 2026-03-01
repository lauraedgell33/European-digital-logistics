'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { useFreightOffers, useMatching } from '@/hooks/useApi';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { Select } from '@/components/ui/Select';
import { getCountryFlag, formatCurrency } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CubeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

import type { FreightOffer, VehicleOffer } from '@/types';

function MatchScoreBadge({ score }: { score: number }) {
  const rounded = Math.round(score);
  const variant = rounded >= 80 ? 'green' : rounded >= 60 ? 'blue' : rounded >= 40 ? 'yellow' : 'gray';
  return (
    <Badge variant={variant as any}>
      {rounded}% match
    </Badge>
  );
}

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= Math.round(rating)
          ? <StarSolidIcon key={star} className="h-3 w-3" style={{ color: 'var(--ds-amber-700)' }} />
          : <StarIcon key={star} className="h-3 w-3" style={{ color: 'var(--ds-gray-400)' }} />
      )}
    </div>
  );
}

export default function MatchingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedFreightId, setSelectedFreightId] = useState<number | null>(null);
  const { data: freightData, isLoading: loadingFreight } = useFreightOffers({ status: 'active', per_page: 50 });
  const { data: matches, isLoading: loadingMatches } = useMatching(selectedFreightId ?? 0);

  const freightOffers = freightData?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
          {t('matching.title')}
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
          {t('matching.subtitle')}
        </p>
      </div>

      {/* Freight Selection */}
      <Card>
        <CardHeader title={t('matching.selectFreight')} description={t('matching.selectFreightDesc')} />
        <div className="mt-4">
          {loadingFreight ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : freightOffers.length === 0 ? (
            <div className="text-center py-8">
              <CubeIcon className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--ds-gray-500)' }} />
              <p className="text-[14px]" style={{ color: 'var(--ds-gray-700)' }}>No active freight offers</p>
              <Button variant="primary" size="sm" className="mt-3" onClick={() => router.push('/freight/new')}>
                Create Freight Offer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {freightOffers.map((freight: FreightOffer) => (
                <button
                  key={freight.id}
                  onClick={() => setSelectedFreightId(freight.id)}
                  className="text-left p-4 rounded-lg transition-all"
                  style={{
                    border: selectedFreightId === freight.id
                      ? '2px solid var(--ds-blue-700)'
                      : '1px solid var(--ds-gray-400)',
                    background: selectedFreightId === freight.id
                      ? 'var(--ds-blue-100)'
                      : 'var(--ds-background-100)',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    {getCountryFlag(freight.origin_country)} {freight.origin_city}
                    <ArrowRightIcon className="h-3 w-3" style={{ color: 'var(--ds-gray-600)' }} />
                    {getCountryFlag(freight.destination_country)} {freight.destination_city}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>
                    <span>{freight.weight?.toLocaleString()} kg</span>
                    <span>•</span>
                    <span>{freight.vehicle_type}</span>
                    {freight.loading_date && (
                      <>
                        <span>•</span>
                        <span>{new Date(freight.loading_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </>
                    )}
                  </div>
                  {selectedFreightId === freight.id && (
                    <CheckCircleIcon className="h-4 w-4 absolute top-2 right-2" style={{ color: 'var(--ds-blue-700)' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Matching Results */}
      {selectedFreightId && (
        <Card>
          <CardHeader
            title={t('matching.matchingVehicles')}
            description={t('matching.rankedBy')}
            action={
              loadingMatches ? <Spinner /> : (
                <Badge variant="blue">{matches?.length ?? 0} {t('matching.matchesFound')}</Badge>
              )
            }
          />
          <div className="mt-4">
            {loadingMatches ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="text-[13px] mt-3" style={{ color: 'var(--ds-gray-700)' }}>
                    {t('matching.findingMatches')}
                  </p>
                </div>
              </div>
            ) : !matches || matches.length === 0 ? (
              <div className="text-center py-12">
                <TruckIcon className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--ds-gray-500)' }} />
                <p className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
                  {t('matching.noMatches')}
                </p>
                <p className="text-[13px] mt-1" style={{ color: 'var(--ds-gray-600)' }}>
                  {t('matching.tryDifferent')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((vehicle: VehicleOffer & { match_score: number; company?: { name: string; rating?: number | null } }, index: number) => (
                  <div
                    key={vehicle.id}
                    className="rounded-lg p-4 transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid var(--ds-gray-300)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-[12px] font-bold"
                          style={{
                            background: index === 0 ? 'var(--ds-green-200)' : index < 3 ? 'var(--ds-blue-200)' : 'var(--ds-gray-200)',
                            color: index === 0 ? 'var(--ds-green-900)' : index < 3 ? 'var(--ds-blue-900)' : 'var(--ds-gray-800)',
                          }}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                              {vehicle.vehicle_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                            <MatchScoreBadge score={vehicle.match_score} />
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>
                              <MapPinIcon className="h-3 w-3 inline mr-1" />
                              {getCountryFlag(vehicle.current_country)} {vehicle.current_city}
                            </span>
                            <span className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>
                              {vehicle.capacity_kg?.toLocaleString()} kg
                            </span>
                            {vehicle.capacity_m3 && (
                              <span className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>
                                {vehicle.capacity_m3} m³
                              </span>
                            )}
                            {vehicle.available_from && (
                              <span className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>
                                <CalendarDaysIcon className="h-3 w-3 inline mr-1" />
                                from {new Date(vehicle.available_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {(vehicle.price_per_km || vehicle.flat_price) && (
                          <p className="text-[14px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                            {vehicle.flat_price
                              ? formatCurrency(vehicle.flat_price, vehicle.currency || 'EUR')
                              : `${vehicle.price_per_km} ${vehicle.currency || 'EUR'}/km`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Company info */}
                    {vehicle.company && (
                      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--ds-gray-200)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
                            {vehicle.company.name}
                          </span>
                          <RatingStars rating={vehicle.company.rating} />
                        </div>

                        <div className="flex items-center gap-2">
                          {vehicle.has_adr && <Badge variant="purple">ADR</Badge>}
                          {vehicle.has_temperature_control && <Badge variant="blue">Temp</Badge>}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => router.push(`/orders/new?vehicle_offer_id=${vehicle.id}`)}
                          >
                            {t('matching.createOrder')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
