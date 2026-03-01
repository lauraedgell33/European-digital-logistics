'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { whiteLabelApi, apiKeysApi, erpApi, ediApi } from '@/lib/api';
import {
  BuildingOffice2Icon,
  KeyIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  ServerStackIcon,
} from '@heroicons/react/24/outline';
import type { WhiteLabel, ApiKeyItem, ApiUsageStats, ErpIntegration, EdiMessage, EdiStats } from '@/types';

export default function EnterprisePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'whitelabel' | 'apikeys' | 'erp' | 'edi'>('whitelabel');

  // ── White Label ──
  const { data: whiteLabel } = useQuery({
    queryKey: ['white-label'],
    queryFn: () => whiteLabelApi.get().then(r => r.data?.data),
    enabled: tab === 'whitelabel',
  });
  const [wlForm, setWlForm] = useState({ subdomain: '', brand_name: '', support_email: '', logo_url: '' });
  const saveWlMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => whiteLabelApi.save(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['white-label'] }),
  });

  // ── API Keys ──
  const { data: apiKeys, isLoading: loadingKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysApi.list().then(r => r.data?.data || []),
    enabled: tab === 'apikeys',
  });
  const { data: apiUsage } = useQuery({
    queryKey: ['api-usage'],
    queryFn: () => apiKeysApi.usage().then(r => r.data?.data),
    enabled: tab === 'apikeys',
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState('');
  const createKeyMutation = useMutation({
    mutationFn: (name: string) => apiKeysApi.create({ name, permissions: ['read', 'write'] }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setCreatedKey(res.data?.data?.key || '');
      setNewKeyName('');
    },
  });
  const revokeKeyMutation = useMutation({
    mutationFn: (id: number) => apiKeysApi.revoke(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  // ── ERP ──
  const { data: integrations, isLoading: loadingErp } = useQuery({
    queryKey: ['erp-integrations'],
    queryFn: () => erpApi.list().then(r => r.data?.data || []),
    enabled: tab === 'erp',
  });
  const toggleErpMutation = useMutation({
    mutationFn: (id: number) => erpApi.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['erp-integrations'] }),
  });
  const syncErpMutation = useMutation({
    mutationFn: (id: number) => erpApi.sync(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['erp-integrations'] }),
  });

  // ── EDI ──
  const { data: ediMessages, isLoading: loadingEdi } = useQuery({
    queryKey: ['edi-messages'],
    queryFn: () => ediApi.list().then(r => r.data?.data || []),
    enabled: tab === 'edi',
  });
  const { data: ediStats } = useQuery({
    queryKey: ['edi-stats'],
    queryFn: () => ediApi.stats().then(r => r.data?.data),
    enabled: tab === 'edi',
  });

  const tabs = [
    { key: 'whitelabel' as const, label: t('enterprise.whiteLabel'), icon: BuildingOffice2Icon },
    { key: 'apikeys' as const, label: t('enterprise.apiKeys'), icon: KeyIcon },
    { key: 'erp' as const, label: t('enterprise.erpIntegration'), icon: ServerStackIcon },
    { key: 'edi' as const, label: t('enterprise.edi'), icon: DocumentTextIcon },
  ];

  const usageData = apiUsage as ApiUsageStats | undefined;
  const ediStatsData = ediStats as EdiStats | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BuildingOffice2Icon className="h-7 w-7" style={{ color: 'var(--ds-indigo-500)' }} />
          {t('enterprise.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('enterprise.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === tb.key ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tb.icon className="h-4 w-4" />{tb.label}
          </button>
        ))}
      </div>

      {/* White Label */}
      {tab === 'whitelabel' && (
        <Card>
          <CardHeader title={t('enterprise.whiteLabelConfig')} subtitle={t('enterprise.subtitle')} />
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subdomain</label>
              <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={wlForm.subdomain || (whiteLabel as WhiteLabel | undefined)?.subdomain || ''}
                onChange={e => setWlForm({ ...wlForm, subdomain: e.target.value })} placeholder="your-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('enterprise.brandName')}</label>
              <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={wlForm.brand_name || (whiteLabel as WhiteLabel | undefined)?.brand_name || ''}
                onChange={e => setWlForm({ ...wlForm, brand_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Support Email</label>
              <input type="email" className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={wlForm.support_email || (whiteLabel as WhiteLabel | undefined)?.support_email || ''}
                onChange={e => setWlForm({ ...wlForm, support_email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Logo URL</label>
              <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={wlForm.logo_url || (whiteLabel as WhiteLabel | undefined)?.logo_url || ''}
                onChange={e => setWlForm({ ...wlForm, logo_url: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={() => saveWlMutation.mutate(wlForm)} disabled={saveWlMutation.isPending}>
                {saveWlMutation.isPending ? <Spinner size="sm" /> : t('enterprise.saveConfig')}
              </Button>
              {(whiteLabel as WhiteLabel | undefined)?.is_active && (
                <Badge variant="green" className="ml-3">Active</Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* API Keys */}
      {tab === 'apikeys' && (
        <div className="space-y-4">
          {/* Usage Stats */}
          {usageData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{usageData.total_requests.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Requests</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{usageData.today_requests.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Today</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{usageData.avg_response_time_ms}ms</p>
                <p className="text-xs text-gray-500">Avg Response</p>
              </Card>
            </div>
          )}

          {/* Create Key */}
          <Card>
            <CardHeader title={t('enterprise.createApiKey')} />
            <div className="p-4 flex gap-4">
              <input className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                placeholder="Key name..." value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
              <Button onClick={() => newKeyName && createKeyMutation.mutate(newKeyName)} disabled={!newKeyName || createKeyMutation.isPending}>
                <PlusIcon className="h-4 w-4 mr-2" />{t('enterprise.generateKey')}
              </Button>
            </div>
            {createdKey && (
              <div className="mx-4 mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Save this key — it won&apos;t be shown again!</p>
                <code className="text-xs break-all">{createdKey}</code>
              </div>
            )}
          </Card>

          {/* Keys List */}
          <Card>
            <CardHeader title={t('enterprise.apiKeys')} />
            {loadingKeys ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(apiKeys as ApiKeyItem[] || []).map(key => (
                  <div key={key.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{key.name}</span>
                        <Badge variant={key.is_active ? 'green' : 'red'}>{key.is_active ? 'Active' : 'Revoked'}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">{key.key_prefix}</p>
                      <p className="text-xs text-gray-400">{key.requests_total.toLocaleString()} requests • Last: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</p>
                    </div>
                    {key.is_active && (
                      <Button size="sm" variant="secondary" onClick={() => revokeKeyMutation.mutate(key.id)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ERP Integration */}
      {tab === 'erp' && (
        <Card>
          <CardHeader title={t('enterprise.erpIntegration')} subtitle={t('enterprise.subtitle')} />
          {loadingErp ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : (integrations || []).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ServerStackIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>{t('enterprise.noErp')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(integrations as ErpIntegration[]).map(int => (
                <div key={int.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{int.name}</span>
                      <Badge variant={int.is_active ? 'green' : 'gray'}>{int.is_active ? 'Active' : 'Inactive'}</Badge>
                      <Badge variant="blue">{int.integration_type}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {int.sync_direction} • {int.sync_success_count} syncs • Last: {int.last_sync_at ? new Date(int.last_sync_at).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toggleErpMutation.mutate(int.id)}>
                      <CogIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => syncErpMutation.mutate(int.id)}>
                      <ArrowPathIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* EDI */}
      {tab === 'edi' && (
        <div className="space-y-4">
          {ediStatsData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{ediStatsData.total_messages}</p>
                <p className="text-xs text-gray-500">Total Messages</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{ediStatsData.inbound}</p>
                <p className="text-xs text-gray-500">Inbound</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{ediStatsData.outbound}</p>
                <p className="text-xs text-gray-500">Outbound</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: ediStatsData.failed > 0 ? 'var(--ds-red-600)' : undefined }}>{ediStatsData.failed}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader title={t('enterprise.edi')} subtitle={t('enterprise.ediStats')} />
            {loadingEdi ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (ediMessages || []).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>{t('enterprise.noApiKeys')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(ediMessages as EdiMessage[]).map(msg => (
                  <div key={msg.id} className="p-4 flex items-center justify-between text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={msg.direction === 'inbound' ? 'blue' : 'green'}>{msg.direction}</Badge>
                        <Badge variant="gray">{msg.message_type}</Badge>
                        <span className="font-mono text-xs">{msg.message_reference}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{msg.format} • {msg.status}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
