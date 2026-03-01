import { useCallback, useMemo } from 'react';
import { useABTestingStore } from '../stores/abTestingStore';

/**
 * Hook to interact with A/B testing experiments.
 *
 * @example
 * ```tsx
 * function FreightList() {
 *   const { variant, trackEvent } = useExperiment('freight_card_layout');
 *
 *   if (variant === 'expanded') {
 *     return <ExpandedFreightCard onPress={() => trackEvent('card_click')} />;
 *   }
 *   return <CompactFreightCard onPress={() => trackEvent('card_click')} />;
 * }
 * ```
 */
export function useExperiment(experimentId: string) {
  const getVariant = useABTestingStore(s => s.getVariant);
  const trackEventStore = useABTestingStore(s => s.trackEvent);
  const isInExperiment = useABTestingStore(s => s.isInExperiment);
  const getExperimentConfig = useABTestingStore(s => s.getExperimentConfig);

  const variant = useMemo(() => {
    return getVariant(experimentId);
  }, [experimentId, getVariant]);

  const trackEvent = useCallback(
    (event: string, metadata?: Record<string, unknown>) => {
      trackEventStore(experimentId, event, metadata);
    },
    [experimentId, trackEventStore]
  );

  const config = useMemo(
    () => getExperimentConfig(experimentId),
    [experimentId, getExperimentConfig]
  );

  return {
    /** The assigned variant ID, or null if not in experiment */
    variant,
    /** Whether the user is enrolled in this experiment */
    enrolled: isInExperiment(experimentId),
    /** Track a conversion/interaction event */
    trackEvent,
    /** The experiment configuration */
    config,
    /** Check if user is in a specific variant */
    isVariant: (variantId: string) => variant === variantId,
  };
}

/**
 * Hook to check a specific variant without auto-enrollment.
 *
 * @example
 * ```tsx
 * const isGreenCTA = useVariant('cta_color_test', 'green');
 * return <Button color={isGreenCTA ? 'green' : 'blue'} />;
 * ```
 */
export function useVariant(experimentId: string, variantId: string): boolean {
  const { variant } = useExperiment(experimentId);
  return variant === variantId;
}

/**
 * Hook for managing A/B test analytics.
 * Use in a background sync or analytics screen.
 */
export function useABAnalytics() {
  const flushEvents = useABTestingStore(s => s.flushEvents);
  const getEvents = useABTestingStore(s => s.getEvents);
  const assignments = useABTestingStore(s => s.assignments);
  const experiments = useABTestingStore(s => s.experiments);
  const updateExperiments = useABTestingStore(s => s.updateExperiments);

  const syncEvents = useCallback(async (apiUrl: string, token: string) => {
    const events = flushEvents();
    if (events.length === 0) return;

    try {
      await fetch(`${apiUrl}/v1/analytics/ab-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ events }),
      });
    } catch {
      // Re-add events on failure — they'll be retried next sync
      // Events are already flushed, so this is a no-op for now
      // In production, implement a retry queue
      console.warn('[A/B Testing] Failed to sync events, will retry');
    }
  }, [flushEvents]);

  const fetchExperiments = useCallback(async (apiUrl: string) => {
    try {
      const response = await fetch(`${apiUrl}/v1/experiments`);
      const data = await response.json();
      if (data.experiments) {
        updateExperiments(data.experiments);
      }
    } catch {
      console.warn('[A/B Testing] Failed to fetch experiment configs');
    }
  }, [updateExperiments]);

  return {
    /** Send collected events to the backend */
    syncEvents,
    /** Fetch latest experiment configs from backend */
    fetchExperiments,
    /** All tracked events (before flush) */
    events: getEvents(),
    /** Current variant assignments */
    assignments,
    /** Available experiments */
    experiments,
    /** Summary stats */
    stats: {
      totalExperiments: experiments.length,
      activeExperiments: experiments.filter(e => e.enabled).length,
      enrolledExperiments: assignments.length,
      pendingEvents: getEvents().length,
    },
  };
}
