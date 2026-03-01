'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { drivingBanApi } from '@/lib/api';
import { getCountryFlag, COUNTRIES } from '@/lib/utils';
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { DrivingBan } from '@/types';

const BAN_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  weekend: { label: 'Weekend', color: 'var(--ds-blue-700)' },
  holiday: { label: 'Holiday', color: 'var(--ds-purple-700)' },
  night: { label: 'Night', color: 'var(--ds-gray-900)' },
  seasonal: { label: 'Seasonal', color: 'var(--ds-amber-700)' },
  environmental: { label: 'Environmental', color: 'var(--ds-green-700)' },
  weight_restriction: { label: 'Weight', color: 'var(--ds-red-700)' },
  height_restriction: { label: 'Height', color: 'var(--ds-orange-700)' },
};

export default function DrivingBansPage() {
  const { t } = useTranslation();
  const [bans, setBans] = useState<DrivingBan[]>([]);
  const [activeBans, setActiveBans] = useState<DrivingBan[]>([]);
  const [countries, setCountries] = useState<{ country: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [routeCountries, setRouteCountries] = useState<string[]>(['DE', 'AT']);
  const [routeResult, setRouteResult] = useState<{ bans: DrivingBan[]; warnings: DrivingBan[] } | null>(null);
  const [checkingRoute, setCheckingRoute] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bansRes, activeRes, countriesRes] = await Promise.all([
        drivingBanApi.list(),
        drivingBanApi.active(),
        drivingBanApi.countries(),
      ]);
      setBans(bansRes.data.data || []);
      setActiveBans(activeRes.data.data || []);
      setCountries(countriesRes.data.data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function checkRoute() {
    setCheckingRoute(true);
    try {
      const res = await drivingBanApi.checkRoute({ countries: routeCountries });
      setRouteResult({
        bans: res.data.data?.bans || [],
        warnings: res.data.data?.warnings || [],
      });
    } catch {
      // fallback
    } finally {
      setCheckingRoute(false);
    }
  }

  const filteredBans = bans.filter(ban => {
    if (selectedCountry && ban.country !== selectedCountry) return false;
    if (selectedType && ban.ban_type !== selectedType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-lg" style={{ background: 'var(--ds-gray-200)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
          <ShieldExclamationIcon className="inline h-7 w-7 mr-2" />
          {t('drivingBans.title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ds-gray-700)' }}>
          {t('drivingBans.subtitle')}
        </p>
      </div>

      {/* Currently Active Bans Alert */}
      {activeBans.length > 0 && (
        <div
          className="rounded-lg p-4 flex items-start gap-3"
          style={{ background: 'var(--ds-red-200)', border: '1px solid var(--ds-red-400)' }}
        >
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--ds-red-900)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--ds-red-900)' }}>
              {activeBans.length} ban{activeBans.length > 1 ? 's' : ''} {t('drivingBans.currentlyActive')}
            </p>
            <div className="mt-2 space-y-1">
              {activeBans.slice(0, 5).map((ban, i) => (
                <p key={i} className="text-xs" style={{ color: 'var(--ds-red-800)' }}>
                  {getCountryFlag(ban.country)} {ban.country} — {ban.title}
                </p>
              ))}
              {activeBans.length > 5 && (
                <p className="text-xs" style={{ color: 'var(--ds-red-800)' }}>
                  ... and {activeBans.length - 5} more
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Route Checker */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
            <MapPinIcon className="inline h-5 w-5 mr-1" /> {t('drivingBans.routeCheck')}
          </h2>
        </CardHeader>
        <div className="p-4 space-y-4">
          <p className="text-sm" style={{ color: 'var(--ds-gray-700)' }}>
            Enter the countries your route passes through to check for active driving bans.
          </p>
          <div className="flex flex-wrap gap-2">
            {routeCountries.map((country, i) => (
              <div key={i} className="flex items-center gap-1">
                <Select
                  value={country}
                  onChange={(e) => {
                    const newCountries = [...routeCountries];
                    newCountries[i] = e.target.value;
                    setRouteCountries(newCountries);
                  }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Select>
                {i < routeCountries.length - 1 && (
                  <span className="text-sm" style={{ color: 'var(--ds-gray-700)' }}>→</span>
                )}
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setRouteCountries([...routeCountries, 'FR'])}>
              + {t('drivingBans.addCountry')}
            </Button>
          </div>
          <Button onClick={checkRoute} disabled={checkingRoute}>
            {checkingRoute ? t('common.loading') : t('drivingBans.checkRoute')}
          </Button>

          {routeResult && (
            <div className="mt-4 space-y-3">
              {routeResult.bans.length === 0 && routeResult.warnings.length === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--ds-green-200)' }}>
                  <CheckCircleIcon className="h-5 w-5" style={{ color: 'var(--ds-green-900)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--ds-green-900)' }}>{t('drivingBans.routeClear')} — {t('drivingBans.routeClearDesc')}</span>
                </div>
              ) : (
                <>
                  {routeResult.bans.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ds-red-900)' }}>
                        ⛔ {t('drivingBans.activeBans')} ({routeResult.bans.length})
                      </p>
                      {routeResult.bans.map((ban, i) => (
                        <BanCard key={i} ban={ban} highlight />
                      ))}
                    </div>
                  )}
                  {routeResult.warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ds-amber-900)' }}>
                        ⚠️ {t('drivingBans.upcomingBans')} ({routeResult.warnings.length})
                      </p>
                      {routeResult.warnings.map((ban, i) => (
                        <BanCard key={i} ban={ban} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
          <option value="">All Countries</option>
          {countries.map(c => (
            <option key={c.country} value={c.country}>
              {getCountryFlag(c.country)} {c.country} ({c.count})
            </option>
          ))}
        </Select>
        <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(BAN_TYPE_LABELS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {/* Ban Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBans.map(ban => (
          <BanCard key={ban.id} ban={ban} />
        ))}
        {filteredBans.length === 0 && (
          <div className="col-span-2 text-center py-12" style={{ color: 'var(--ds-gray-700)' }}>
            {t('drivingBans.noBans')}
          </div>
        )}
      </div>
    </div>
  );
}

function BanCard({ ban, highlight }: { ban: DrivingBan; highlight?: boolean }) {
  const typeInfo = BAN_TYPE_LABELS[ban.ban_type] || { label: ban.ban_type, color: 'var(--ds-gray-700)' };

  return (
    <Card>
      <div className="p-4 space-y-3" style={highlight ? { borderLeft: '3px solid var(--ds-red-700)' } : {}}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getCountryFlag(ban.country)}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{ban.country}</span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: typeInfo.color, color: 'white' }}
            >
              {typeInfo.label}
            </span>
          </div>
          {ban.fine_amount && (
            <span className="text-xs font-medium" style={{ color: 'var(--ds-red-700)' }}>
              Fine: {ban.fine_currency} {ban.fine_amount?.toLocaleString()}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>{ban.title}</h3>
        {ban.description && (
          <p className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>{ban.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--ds-gray-900)' }}>
          {ban.start_time && ban.end_time && <span>🕐 {ban.start_time} – {ban.end_time}</span>}
          {ban.min_weight_tons && <span>⚖️ &gt;{ban.min_weight_tons}t</span>}
          {ban.days_of_week && ban.days_of_week.length > 0 && (
            <span>📅 {ban.days_of_week.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</span>
          )}
          {ban.start_date && ban.end_date && <span>📆 {ban.start_date} – {ban.end_date}</span>}
        </div>

        {ban.affected_roads && ban.affected_roads.length > 0 && (
          <div>
            <span className="text-xs font-medium" style={{ color: 'var(--ds-gray-700)' }}>Affected roads: </span>
            <span className="text-xs" style={{ color: 'var(--ds-gray-900)' }}>{ban.affected_roads.join(', ')}</span>
          </div>
        )}

        {ban.exemptions && ban.exemptions.length > 0 && (
          <div>
            <span className="text-xs font-medium" style={{ color: 'var(--ds-green-700)' }}>✓ Exemptions: </span>
            <span className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>{ban.exemptions.join(' • ')}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
