'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCompany } from '@/hooks/useApi';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { getCountryFlag } from '@/lib/utils';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  TruckIcon,
  CubeIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--ds-gray-100)' }}>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `var(--ds-${color}-200)` }}>
        <Icon className="h-5 w-5" style={{ color: `var(--ds-${color}-900)` }} />
      </div>
      <div>
        <p className="text-xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>{value}</p>
        <p className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>{label}</p>
      </div>
    </div>
  );
}

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-[13px]" style={{ color: 'var(--ds-gray-600)' }}>No ratings yet</span>;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= Math.round(rating)
          ? <StarSolidIcon key={star} className="h-4 w-4" style={{ color: 'var(--ds-amber-700)' }} />
          : <StarIcon key={star} className="h-4 w-4" style={{ color: 'var(--ds-gray-400)' }} />
      ))}
      <span className="text-[13px] ml-1 font-medium" style={{ color: 'var(--ds-gray-900)' }}>
        {Number(rating).toFixed(1)}
      </span>
    </div>
  );
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: company, isLoading, error } = useCompany(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
          Company not found
        </h2>
        <Link href="/companies" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to companies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/companies"
            className="p-2 rounded-lg transition-colors focus-ring"
            style={{ color: 'var(--ds-gray-900)', border: '1px solid var(--ds-gray-400)' }}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--ds-blue-200)' }}
              >
                <BuildingOffice2Icon className="h-6 w-6" style={{ color: 'var(--ds-blue-900)' }} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ds-gray-1000)' }}>
                  {company.name}
                </h1>
                {company.verification_status === 'verified' && (
                  <CheckBadgeIcon className="h-5 w-5" style={{ color: 'var(--ds-blue-700)' }} />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {company.type && (
                  <Badge variant="blue">{company.type}</Badge>
                )}
                <Badge variant={company.verification_status === 'verified' ? 'green' : 'yellow'}>
                  {company.verification_status || 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={CubeIcon}
          label="Freight Offers"
          value={company.freight_offers_count ?? 0}
          color="blue"
        />
        <StatCard
          icon={TruckIcon}
          label="Vehicle Offers"
          value={company.vehicle_offers_count ?? 0}
          color="green"
        />
        <StatCard
          icon={UserGroupIcon}
          label="Team Members"
          value={company.users_count ?? 0}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card>
          <CardHeader title="Company Information" />
          <div className="space-y-4 mt-2">
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-4 w-4 mt-0.5" style={{ color: 'var(--ds-gray-700)' }} />
              <div>
                <p className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                  {getCountryFlag(company.country_code)} {company.city || 'N/A'}
                  {company.postal_code ? `, ${company.postal_code}` : ''}
                </p>
                {company.address && (
                  <p className="text-[13px]" style={{ color: 'var(--ds-gray-800)' }}>{company.address}</p>
                )}
              </div>
            </div>

            {company.vat_number && (
              <div className="flex items-start gap-3">
                <BuildingOffice2Icon className="h-4 w-4 mt-0.5" style={{ color: 'var(--ds-gray-700)' }} />
                <div>
                  <p className="text-[12px] uppercase tracking-wider" style={{ color: 'var(--ds-gray-600)' }}>VAT Number</p>
                  <p className="text-[14px] font-mono" style={{ color: 'var(--ds-gray-1000)' }}>{company.vat_number}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <StarIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
              <RatingStars rating={company.rating} />
            </div>

            {company.created_at && (
              <div className="flex items-start gap-3">
                <CalendarDaysIcon className="h-4 w-4 mt-0.5" style={{ color: 'var(--ds-gray-700)' }} />
                <div>
                  <p className="text-[12px] uppercase tracking-wider" style={{ color: 'var(--ds-gray-600)' }}>Member since</p>
                  <p className="text-[14px]" style={{ color: 'var(--ds-gray-1000)' }}>
                    {new Date(company.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader title="Contact" />
          <div className="space-y-4 mt-2">
            {company.email && (
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                <a href={`mailto:${company.email}`} className="text-[14px] text-blue-600 hover:underline">
                  {company.email}
                </a>
              </div>
            )}

            {company.phone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                <a href={`tel:${company.phone}`} className="text-[14px]" style={{ color: 'var(--ds-gray-1000)' }}>
                  {company.phone}
                </a>
              </div>
            )}

            {company.website && (
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-blue-600 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}

            {!company.email && !company.phone && !company.website && (
              <p className="text-[13px]" style={{ color: 'var(--ds-gray-600)' }}>
                No contact information available
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Team Members */}
      {company.users && company.users.length > 0 && (
        <Card>
          <CardHeader title="Team Members" description={`${company.users.length} member${company.users.length > 1 ? 's' : ''}`} />
          <div className="mt-4 divide-y" style={{ borderColor: 'var(--ds-gray-200)' }}>
            {company.users.map((user: { id: number; name: string }) => (
              <div key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-semibold"
                  style={{ backgroundColor: 'var(--ds-blue-200)', color: 'var(--ds-blue-900)' }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    {user.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
