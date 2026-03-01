'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNetworks, useCreateNetwork } from '@/hooks/useApi';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Loading';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  PlusIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

import type { PartnerNetwork } from '@/types';

export default function NetworksPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    description: '',
    type: 'open',
  });

  const { data, isLoading } = useNetworks();
  const createNetwork = useCreateNetwork();
  const allNetworks = data ?? [];
  const networks = search
    ? allNetworks.filter((n: PartnerNetwork) =>
        n.name?.toLowerCase().includes(search.toLowerCase())
      )
    : allNetworks;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            {t('networks.partnerNetworks')}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            {t('networks.networksDesc')}
          </p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          {t('networks.createNetwork')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('networks.myNetworks')}
          value={networks.length || '—'}
          icon={<UserGroupIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Total Partners"
          value="—"
          icon={<BuildingOfficeIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Countries Covered"
          value="—"
          icon={<GlobeAltIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Verified Partners"
          value="—"
          icon={<ShieldCheckIcon className="h-5 w-5" />}
        />
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search networks by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<MagnifyingGlassIcon className="h-4 w-4" />}
        />
      </Card>

      {/* Networks Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : networks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <UserGroupIcon
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: 'var(--ds-gray-600)' }}
            />
            <h3
              className="text-lg font-semibold"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              {t('networks.noNetworks')}
            </h3>
            <p
              className="text-[14px] mt-2 max-w-md mx-auto"
              style={{ color: 'var(--ds-gray-800)' }}
            >
              {t('networks.noNetworksDesc')}
            </p>
            <Button className="mt-6" onClick={() => setCreateModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Network
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {networks.map((network: PartnerNetwork & { type?: string; members_count?: number; countries_count?: number; is_member?: boolean }) => (
            <Card
              key={network.id}
              className="cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'var(--ds-blue-200)',
                      border: '1px solid var(--ds-blue-400)',
                    }}
                  >
                    <UserGroupIcon
                      className="h-5 w-5"
                      style={{ color: 'var(--ds-blue-900)' }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-[14px]"
                      style={{ color: 'var(--ds-gray-1000)' }}
                    >
                      {network.name}
                    </h3>
                    <p className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
                      {network.owner?.name ?? 'Unknown owner'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={network.type === 'verified' ? 'green' : network.type === 'private' ? 'amber' : 'blue'}
                >
                  {network.type}
                </Badge>
              </div>

              <p
                className="text-[13px] mt-3 line-clamp-2"
                style={{ color: 'var(--ds-gray-900)' }}
              >
                {network.description || 'No description provided'}
              </p>

              <div
                className="mt-4 pt-4 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--ds-gray-300)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <BuildingOfficeIcon
                      className="h-4 w-4"
                      style={{ color: 'var(--ds-gray-700)' }}
                    />
                    <span className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
                      {network.members_count ?? 0} members
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GlobeAltIcon
                      className="h-4 w-4"
                      style={{ color: 'var(--ds-gray-700)' }}
                    />
                    <span className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
                      {network.countries_count ?? 0} countries
                    </span>
                  </div>
                </div>

                {network.is_member ? (
                  <Badge variant="green">
                    <CheckBadgeIcon className="h-3 w-3 mr-1" />
                    Member
                  </Badge>
                ) : (
                  <Button variant="secondary" size="sm">
                    {t('networks.join')}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Network Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title={t('networks.createNetwork')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t('networks.networkName')}
            value={newNetwork.name}
            onChange={(e) =>
              setNewNetwork((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="e.g. Central Europe Logistics Alliance"
            required
          />

          <Textarea
            label={t('networks.description')}
            value={newNetwork.description}
            onChange={(e) =>
              setNewNetwork((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Describe the purpose and focus of your network..."
          />

          <Select
            label="Network Type"
            options={[
              { value: 'open', label: 'Open — Anyone can join' },
              { value: 'private', label: 'Private — Invitation only' },
              { value: 'verified', label: 'Verified — Requires approval' },
            ]}
            value={newNetwork.type}
            onChange={(e) =>
              setNewNetwork((p) => ({ ...p, type: e.target.value }))
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={createNetwork.isPending}
              onClick={() => {
                if (!newNetwork.name.trim()) return;
                createNetwork.mutate(
                  { name: newNetwork.name, description: newNetwork.description },
                  {
                    onSuccess: () => {
                      setCreateModal(false);
                      setNewNetwork({ name: '', description: '', type: 'open' });
                    },
                  }
                );
              }}
            >
              {t('networks.createNetwork')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
