'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { companyApi } from '@/lib/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { Pagination } from '@/components/ui/DataTable';
import { getCountryFlag } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  StarIcon,
  TruckIcon,
  CubeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const EU_COUNTRIES = [
  { value: '', label: 'All Countries' },
  { value: 'AT', label: 'Austria' }, { value: 'BE', label: 'Belgium' }, { value: 'BG', label: 'Bulgaria' },
  { value: 'HR', label: 'Croatia' }, { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' }, { value: 'DE', label: 'Germany' }, { value: 'EE', label: 'Estonia' },
  { value: 'FI', label: 'Finland' }, { value: 'FR', label: 'France' }, { value: 'GR', label: 'Greece' },
  { value: 'HU', label: 'Hungary' }, { value: 'IE', label: 'Ireland' }, { value: 'IT', label: 'Italy' },
  { value: 'LV', label: 'Latvia' }, { value: 'LT', label: 'Lithuania' }, { value: 'LU', label: 'Luxembourg' },
  { value: 'NL', label: 'Netherlands' }, { value: 'PL', label: 'Poland' }, { value: 'PT', label: 'Portugal' },
  { value: 'RO', label: 'Romania' }, { value: 'SK', label: 'Slovakia' }, { value: 'SI', label: 'Slovenia' },
  { value: 'ES', label: 'Spain' }, { value: 'SE', label: 'Sweden' }, { value: 'CH', label: 'Switzerland' },
  { value: 'GB', label: 'United Kingdom' },
];

const COMPANY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'shipper', label: 'Shipper' },
  { value: 'carrier', label: 'Carrier' },
  { value: 'forwarder', label: 'Forwarder' },
  { value: 'broker', label: 'Broker' },
];

interface Company {
  id: number;
  name: string;
  type: string;
  country_code: string;
  city: string;
  address: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  total_reviews: number;
  verification_status: string;
  freight_offers_count: number;
  vehicle_offers_count: number;
  users_count: number;
}

export default function CompanyDirectoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, [search, country, type, page]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (search) params.search = search;
      if (country) params.country = country;
      if (type) params.type = type;
      const res = await companyApi.list(params);
      setCompanies(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < Math.round(rating) ? (
          <StarSolidIcon className="h-3.5 w-3.5 inline" style={{ color: 'var(--ds-amber-700)' }} />
        ) : (
          <StarIcon className="h-3.5 w-3.5 inline" style={{ color: 'var(--ds-gray-500)' }} />
        )}
      </span>
    ));
  };

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'carrier': return { bg: 'var(--ds-blue-200)', color: 'var(--ds-blue-900)' };
      case 'shipper': return { bg: 'var(--ds-green-200)', color: 'var(--ds-green-900)' };
      case 'forwarder': return { bg: 'var(--ds-purple-200)', color: 'var(--ds-purple-900)' };
      default: return { bg: 'var(--ds-gray-200)', color: 'var(--ds-gray-900)' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
          {t('companies.directory')}
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--ds-gray-900)' }}>
          {t('companies.directoryDesc')}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t('nav.search')}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none"
                style={{
                  background: 'var(--ds-gray-100)',
                  border: '1px solid var(--ds-gray-400)',
                  color: 'var(--ds-gray-1000)',
                }}
              />
            </div>
          </div>
          <div className="w-44">
            <Select
              options={EU_COUNTRIES}
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-36">
            <Select
              options={COMPANY_TYPES}
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : companies.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--ds-gray-500)' }} />
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--ds-gray-900)' }}>
              {t('companies.noCompanies')}
            </h3>
            <p className="text-[13px] mt-1" style={{ color: 'var(--ds-gray-700)' }}>
              {t('companies.noCompaniesDesc')}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {companies.map((company) => {
              const typeStyle = getTypeColor(company.type);
              return (
                <Card
                  key={company.id}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => router.push(`/companies/${company.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold"
                        style={{ background: 'var(--ds-gray-200)', color: 'var(--ds-gray-900)' }}
                      >
                        {company.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                            {company.name}
                          </h3>
                          {company.verification_status === 'verified' && (
                            <CheckBadgeIcon className="h-4 w-4" style={{ color: 'var(--ds-blue-700)' }} />
                          )}
                        </div>
                        <p className="text-[12px] flex items-center gap-1" style={{ color: 'var(--ds-gray-800)' }}>
                          <MapPinIcon className="h-3 w-3 inline" />
                          {company.country_code && getCountryFlag(company.country_code)} {company.city}, {company.country_code}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize"
                      style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                      {company.type}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1">
                    {renderStars(company.rating || 0)}
                    <span className="text-[11px] ml-1" style={{ color: 'var(--ds-gray-700)' }}>
                      ({company.total_reviews || 0})
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="text-center py-1.5 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
                      <CubeIcon className="h-3.5 w-3.5 mx-auto mb-0.5" style={{ color: 'var(--ds-gray-700)' }} />
                      <p className="text-[11px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                        {company.freight_offers_count || 0}
                      </p>
                      <p className="text-[9px]" style={{ color: 'var(--ds-gray-700)' }}>Freight</p>
                    </div>
                    <div className="text-center py-1.5 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
                      <TruckIcon className="h-3.5 w-3.5 mx-auto mb-0.5" style={{ color: 'var(--ds-gray-700)' }} />
                      <p className="text-[11px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                        {company.vehicle_offers_count || 0}
                      </p>
                      <p className="text-[9px]" style={{ color: 'var(--ds-gray-700)' }}>Vehicles</p>
                    </div>
                    <div className="text-center py-1.5 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
                      <UserGroupIcon className="h-3.5 w-3.5 mx-auto mb-0.5" style={{ color: 'var(--ds-gray-700)' }} />
                      <p className="text-[11px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                        {company.users_count || 0}
                      </p>
                      <p className="text-[9px]" style={{ color: 'var(--ds-gray-700)' }}>Team</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {meta && (meta.last_page > 1 || meta.total > 24) && (
            <div className="flex justify-center">
              <Pagination
                currentPage={meta.current_page || page}
                totalPages={meta.last_page || 1}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Company Detail Modal */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}

function CompanyDetailModal({ company, onClose }: { company: Company; onClose: () => void }) {
  const { t } = useTranslation();
  const typeStyle = (() => {
    switch (company.type) {
      case 'carrier': return { bg: 'var(--ds-blue-200)', color: 'var(--ds-blue-900)' };
      case 'shipper': return { bg: 'var(--ds-green-200)', color: 'var(--ds-green-900)' };
      case 'forwarder': return { bg: 'var(--ds-purple-200)', color: 'var(--ds-purple-900)' };
      default: return { bg: 'var(--ds-gray-200)', color: 'var(--ds-gray-900)' };
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 animate-fade-in"
        style={{
          background: 'var(--ds-background-100)',
          border: '1px solid var(--ds-gray-400)',
          boxShadow: 'var(--shadow-large)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: 'var(--ds-gray-200)', color: 'var(--ds-gray-900)' }}
          >
            {company.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
                {company.name}
              </h2>
              {company.verification_status === 'verified' && (
                <CheckBadgeIcon className="h-5 w-5" style={{ color: 'var(--ds-blue-700)' }} />
              )}
            </div>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize inline-block mt-1"
              style={{ background: typeStyle.bg, color: typeStyle.color }}
            >
              {company.type}
            </span>
          </div>
          <button onClick={onClose} className="text-lg" style={{ color: 'var(--ds-gray-700)' }}>✕</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={MapPinIcon} label="Location" value={`${company.city}, ${getCountryFlag(company.country_code)} ${company.country_code}`} />
            {company.address && <InfoRow icon={BuildingOfficeIcon} label="Address" value={`${company.address}${company.postal_code ? `, ${company.postal_code}` : ''}`} />}
            {company.phone && <InfoRow icon={BuildingOfficeIcon} label="Phone" value={company.phone} />}
            {company.email && <InfoRow icon={BuildingOfficeIcon} label="Email" value={company.email} />}
            {company.website && <InfoRow icon={GlobeAltIcon} label="Website" value={company.website} />}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2" style={{ borderTop: '1px solid var(--ds-gray-300)' }}>
            <div className="text-center py-2.5 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{company.freight_offers_count || 0}</p>
              <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>Freight Offers</p>
            </div>
            <div className="text-center py-2.5 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{company.vehicle_offers_count || 0}</p>
              <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>Vehicle Offers</p>
            </div>
            <div className="text-center py-2.5 rounded-lg" style={{ background: 'var(--ds-gray-100)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{company.users_count || 0}</p>
              <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>Team Size</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>{t('common.close')}</Button>
            <Button className="flex-1">{t('companies.contactCompany')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--ds-gray-700)' }} />
      <div>
        <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>{label}</p>
        <p className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>{value}</p>
      </div>
    </div>
  );
}
