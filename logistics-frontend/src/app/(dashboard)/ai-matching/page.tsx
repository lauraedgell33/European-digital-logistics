'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { aiMatchingApi, freightApi } from '@/lib/api';
import { formatCurrency, getCountryFlag } from '@/lib/utils';
import {
  SparklesIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import type { AiMatchResult, FreightOffer } from '@/types';

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'var(--ds-green-500)' : pct >= 60 ? 'var(--ds-blue-500)' : pct >= 40 ? 'var(--ds-amber-500)' : 'var(--ds-red-500)';
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-500">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 text-right font-medium">{pct}%</span>
    </div>
  );
}

export default function AiMatchingPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedFreight, setSelectedFreight] = useState<number | null>(null);

  const { data: freightOffers, isLoading: loadingFreight } = useQuery({
    queryKey: ['freight-for-ai'],
    queryFn: () => freightApi.list({ per_page: 50 }).then(r => r.data?.data || []),
  });

  const { data: suggestions, isLoading: loadingSuggestions } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: () => aiMatchingApi.suggestions().then(r => r.data?.data || []),
  });

  const matchMutation = useMutation({
    mutationFn: (freightId: number) => aiMatchingApi.smartMatch({ freight_offer_id: freightId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] }),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'accept' | 'reject' }) =>
      aiMatchingApi.respond(id, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] }),
  });

  const handleMatch = useCallback(() => {
    if (selectedFreight) matchMutation.mutate(selectedFreight);
  }, [selectedFreight, matchMutation]);

  const matchResults: AiMatchResult[] = matchMutation.data?.data?.data || [];
  const activeSuggestions: AiMatchResult[] = suggestions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SparklesIcon className="h-7 w-7" style={{ color: 'var(--ds-purple-500)' }} />
            {t('aiMatching.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('aiMatching.mlPoweredDesc')}</p>
        </div>
      </div>

      {/* Match Controls */}
      <Card>
        <CardHeader title={t('aiMatching.runSmartMatch')} subtitle={t('aiMatching.selectFreightToMatch')} />
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <select
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
            value={selectedFreight || ''}
            onChange={(e) => setSelectedFreight(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('aiMatching.selectFreight')}</option>
            {(freightOffers || []).map((f: FreightOffer) => (
              <option key={f.id} value={f.id}>
                {getCountryFlag(f.origin_country)} {f.origin_city} → {getCountryFlag(f.destination_country)} {f.destination_city} ({f.weight}kg)
              </option>
            ))}
          </select>
          <Button onClick={handleMatch} disabled={!selectedFreight || matchMutation.isPending}>
            {matchMutation.isPending ? <Spinner size="sm" /> : <SparklesIcon className="h-4 w-4 mr-2" />}
            {t('aiMatching.findMatches')}
          </Button>
        </div>
      </Card>

      {/* Match Results */}
      {matchResults.length > 0 && (
        <Card>
          <CardHeader title={t('aiMatching.matchResults')} subtitle={t('aiMatching.foundMatches', { count: matchResults.length })} />
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {matchResults.map((match: AiMatchResult) => (
              <div key={match.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={match.overall_score >= 0.8 ? 'green' : match.overall_score >= 0.6 ? 'blue' : 'yellow'}>
                        {Math.round(match.overall_score * 100)}% match
                      </Badge>
                      <span className="text-sm font-medium">Vehicle #{match.vehicle_offer_id}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <ScoreBar label={t('aiMatching.distance')} score={match.distance_score} />
                      <ScoreBar label={t('aiMatching.capacity')} score={match.capacity_score} />
                      <ScoreBar label={t('aiMatching.timing')} score={match.timing_score} />
                      <ScoreBar label={t('aiMatching.reliability')} score={match.reliability_score} />
                      <ScoreBar label={t('aiMatching.price')} score={match.price_score} />
                      <ScoreBar label={t('aiMatching.carbon')} score={match.carbon_score} />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => respondMutation.mutate({ id: match.id, action: 'accept' })}
                      disabled={respondMutation.isPending}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => respondMutation.mutate({ id: match.id, action: 'reject' })}
                      disabled={respondMutation.isPending}
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Suggestions */}
      <Card>
        <CardHeader
          title={t('aiMatching.pendingSuggestions')}
          subtitle={t('aiMatching.aiRecommendedDesc')}
          action={
            <Button size="sm" variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] })}>
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
          }
        />
        {loadingSuggestions ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : activeSuggestions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <SparklesIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>{t('aiMatching.noPendingSuggestions')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activeSuggestions.map((s: AiMatchResult) => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.overall_score >= 0.8 ? 'green' : 'blue'}>
                      {Math.round(s.overall_score * 100)}%
                    </Badge>
                    <span className="text-sm">Freight #{s.freight_offer_id} ↔ Vehicle #{s.vehicle_offer_id}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('aiMatching.model')}: {s.model_version} • {new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => respondMutation.mutate({ id: s.id, action: 'accept' })}>
                    {t('aiMatching.accept')}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => respondMutation.mutate({ id: s.id, action: 'reject' })}>
                    {t('aiMatching.reject')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
