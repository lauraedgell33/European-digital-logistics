'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { ecmrApi, smartContractApi, digitalIdentityApi } from '@/lib/api';
import {
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  FingerPrintIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import type { EcmrDocument, SmartContract, DigitalIdentity } from '@/types';

export default function BlockchainPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'ecmr' | 'contracts' | 'identity'>('ecmr');
  const [showCreateEcmr, setShowCreateEcmr] = useState(false);
  const [ecmrForm, setEcmrForm] = useState({
    sender_name: '', sender_address: '',
    carrier_name: '', carrier_address: '',
    consignee_name: '', consignee_address: '',
    goods_description: '', weight_kg: 0, number_of_packages: 1,
    pickup_location: '', delivery_location: '',
    pickup_date: new Date().toISOString().split('T')[0],
  });

  const { data: ecmrList, isLoading: loadingEcmr } = useQuery({
    queryKey: ['ecmr-list'],
    queryFn: () => ecmrApi.list().then(r => r.data?.data || []),
    enabled: tab === 'ecmr',
  });

  const { data: contracts, isLoading: loadingContracts } = useQuery({
    queryKey: ['smart-contracts'],
    queryFn: () => smartContractApi.list().then(r => r.data?.data || []),
    enabled: tab === 'contracts',
  });

  const { data: identity, isLoading: loadingIdentity } = useQuery({
    queryKey: ['digital-identity'],
    queryFn: () => digitalIdentityApi.get().then(r => r.data?.data),
    enabled: tab === 'identity',
  });

  const createEcmrMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => ecmrApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecmr-list'] });
      setShowCreateEcmr(false);
    },
  });

  const signMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'sender' | 'carrier' | 'consignee' }) =>
      ecmrApi.sign(id, { role, signature: `digital-sig-${Date.now()}` }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ecmr-list'] }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: number) => ecmrApi.verify(id),
  });

  const verifyIdentityMutation = useMutation({
    mutationFn: () => digitalIdentityApi.verify(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['digital-identity'] }),
  });

  const statusColor = (s: string) => {
    const map: Record<string, string> = { draft: 'gray', issued: 'blue', in_transit: 'yellow', delivered: 'green', completed: 'green', disputed: 'red', active: 'green', executed: 'blue', expired: 'gray', terminated: 'red' };
    return (map[s] || 'gray') as 'gray' | 'blue' | 'yellow' | 'green' | 'red';
  };

  const tabs = [
    { key: 'ecmr' as const, label: t('blockchain.ecmrDocuments'), icon: DocumentDuplicateIcon },
    { key: 'contracts' as const, label: t('blockchain.smartContracts'), icon: LinkIcon },
    { key: 'identity' as const, label: t('blockchain.digitalIdentity'), icon: FingerPrintIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheckIcon className="h-7 w-7" style={{ color: 'var(--ds-purple-500)' }} />
          {t('blockchain.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('blockchain.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === tb.key ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tb.icon className="h-4 w-4" />
            {tb.label}
          </button>
        ))}
      </div>

      {/* eCMR Tab */}
      {tab === 'ecmr' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateEcmr(!showCreateEcmr)}>
              <PencilSquareIcon className="h-4 w-4 mr-2" />
              New eCMR
            </Button>
          </div>

          {showCreateEcmr && (
            <Card>
              <CardHeader title={t('blockchain.createEcmr')} subtitle={t('blockchain.subtitle')} />
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(ecmrForm).map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{key.replace(/_/g, ' ')}</label>
                    <input
                      type={key.includes('date') ? 'date' : key.includes('kg') || key.includes('packages') ? 'number' : 'text'}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                      value={val}
                      onChange={e => setEcmrForm({ ...ecmrForm, [key]: key.includes('kg') || key.includes('packages') ? Number(e.target.value) : e.target.value })}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <Button onClick={() => createEcmrMutation.mutate(ecmrForm)} disabled={createEcmrMutation.isPending}>
                    {createEcmrMutation.isPending ? <Spinner size="sm" /> : t('blockchain.createEcmr')}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title={t('blockchain.ecmrDocuments')} />
            {loadingEcmr ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (ecmrList || []).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <DocumentDuplicateIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>{t('blockchain.noDocuments')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(ecmrList as EcmrDocument[]).map(doc => (
                  <div key={doc.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">{doc.ecmr_number}</span>
                          <Badge variant={statusColor(doc.status)}>{doc.status}</Badge>
                          {doc.blockchain_tx_hash && <Badge variant="purple">On Blockchain</Badge>}
                        </div>
                        <p className="text-sm mt-1">{doc.pickup_location} → {doc.delivery_location}</p>
                        <p className="text-xs text-gray-500">{doc.goods_description} • {doc.weight_kg} kg • {doc.number_of_packages} packages</p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className={doc.sender_signature ? 'text-green-600' : 'text-gray-400'}>
                            {doc.sender_signature ? '✓' : '○'} {t('blockchain.sender')}
                          </span>
                          <span className={doc.carrier_signature ? 'text-green-600' : 'text-gray-400'}>
                            {doc.carrier_signature ? '✓' : '○'} {t('blockchain.carrier')}
                          </span>
                          <span className={doc.consignee_signature ? 'text-green-600' : 'text-gray-400'}>
                            {doc.consignee_signature ? '✓' : '○'} {t('blockchain.consignee')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!doc.sender_signature && (
                          <Button size="sm" variant="primary" onClick={() => signMutation.mutate({ id: doc.id, role: 'sender' })}>Sign as Sender</Button>
                        )}
                        {!doc.carrier_signature && (
                          <Button size="sm" variant="secondary" onClick={() => signMutation.mutate({ id: doc.id, role: 'carrier' })}>Sign as Carrier</Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => verifyMutation.mutate(doc.id)}>
                          <CheckBadgeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Smart Contracts Tab */}
      {tab === 'contracts' && (
        <Card>
          <CardHeader title={t('blockchain.smartContracts')} subtitle={t('blockchain.subtitle')} />
          {loadingContracts ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : (contracts || []).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <LinkIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>{t('blockchain.noDocuments')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(contracts as SmartContract[]).map(c => (
                <div key={c.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant={statusColor(c.status)}>{c.status}</Badge>
                    <Badge variant="gray">{c.contract_type}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{c.contract_hash?.substring(0, 20)}...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.conditions?.length || 0} conditions • {c.actions?.length || 0} actions • Valid: {new Date(c.valid_from).toLocaleDateString()} — {new Date(c.valid_until).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Digital Identity Tab */}
      {tab === 'identity' && (
        <Card>
          <CardHeader title={t('blockchain.digitalIdentity')} subtitle={t('blockchain.subtitle')} />
          {loadingIdentity ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : !identity ? (
            <div className="p-8 text-center text-gray-500">
              <FingerPrintIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>{t('blockchain.noDocuments')}</p>
              <Button className="mt-4" onClick={() => verifyIdentityMutation.mutate()}>Create Identity</Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={identity.verification_status === 'verified' ? 'green' : 'yellow'}>
                  {(identity as DigitalIdentity).verification_status}
                </Badge>
                <span className="font-mono text-sm">{(identity as DigitalIdentity).did_identifier}</span>
              </div>
              {(identity as DigitalIdentity).credentials && (identity as DigitalIdentity).credentials.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Credentials</h4>
                  <div className="space-y-2">
                    {(identity as DigitalIdentity).credentials.map((cred, i) => (
                      <div key={i} className="p-2 rounded bg-gray-50 dark:bg-gray-800 text-xs">
                        <span className="font-medium">{cred.type}</span> — Issued by {cred.issuer}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(identity as DigitalIdentity).verification_status !== 'verified' && (
                <Button onClick={() => verifyIdentityMutation.mutate()} disabled={verifyIdentityMutation.isPending}>
                  {verifyIdentityMutation.isPending ? <Spinner size="sm" /> : 'Verify Identity'}
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
