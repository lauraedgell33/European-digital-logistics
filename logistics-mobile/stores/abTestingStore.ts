import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Experiment Definitions ─────────────────────────────────
export interface ExperimentVariant {
  id: string;
  weight: number; // 0-100, all variants must sum to 100
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  variants: ExperimentVariant[];
  /** ISO date string — experiment start */
  startDate?: string;
  /** ISO date string — experiment end (auto-disable) */
  endDate?: string;
  /** Target audience percentage (0-100) */
  audiencePercentage: number;
  enabled: boolean;
}

interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: string;
}

interface ABEvent {
  experimentId: string;
  variantId: string;
  event: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Default Experiments ────────────────────────────────────
const DEFAULT_EXPERIMENTS: ExperimentConfig[] = [
  {
    id: 'onboarding_flow_v2',
    name: 'Onboarding Flow V2',
    description: 'Test simplified onboarding vs current multi-step flow',
    variants: [
      { id: 'control', weight: 50 },
      { id: 'simplified', weight: 50 },
    ],
    audiencePercentage: 100,
    enabled: true,
  },
  {
    id: 'freight_card_layout',
    name: 'Freight Card Layout',
    description: 'Test compact freight card vs expanded with map preview',
    variants: [
      { id: 'compact', weight: 50 },
      { id: 'expanded', weight: 50 },
    ],
    audiencePercentage: 50,
    enabled: true,
  },
  {
    id: 'search_bar_position',
    name: 'Search Bar Position',
    description: 'Test top-fixed vs floating bottom search bar',
    variants: [
      { id: 'top', weight: 50 },
      { id: 'bottom', weight: 50 },
    ],
    audiencePercentage: 30,
    enabled: false,
  },
  {
    id: 'cta_color_test',
    name: 'CTA Button Color',
    description: 'Test primary blue vs green for main CTAs',
    variants: [
      { id: 'blue', weight: 50 },
      { id: 'green', weight: 50 },
    ],
    audiencePercentage: 100,
    enabled: true,
  },
  {
    id: 'dashboard_metrics_order',
    name: 'Dashboard Metrics Order',
    description: 'Test revenue-first vs shipments-first dashboard layout',
    variants: [
      { id: 'revenue_first', weight: 50 },
      { id: 'shipments_first', weight: 50 },
    ],
    audiencePercentage: 100,
    enabled: true,
  },
];

// ─── Store Interface ────────────────────────────────────────
interface ABTestingState {
  // State
  experiments: ExperimentConfig[];
  assignments: ExperimentAssignment[];
  events: ABEvent[];
  userId: string | null;

  // Actions
  setUserId: (userId: string) => void;
  getVariant: (experimentId: string) => string | null;
  assignVariant: (experimentId: string) => string | null;
  trackEvent: (experimentId: string, event: string, metadata?: Record<string, unknown>) => void;
  isInExperiment: (experimentId: string) => boolean;
  getExperimentConfig: (experimentId: string) => ExperimentConfig | undefined;
  updateExperiments: (configs: ExperimentConfig[]) => void;
  getEvents: (experimentId?: string) => ABEvent[];
  flushEvents: () => ABEvent[];
  resetAssignments: () => void;
}

// ─── Hashing function for deterministic assignment ──────────
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function selectVariant(experiment: ExperimentConfig, userId: string): string | null {
  // Deterministic audience check
  const audienceHash = hashString(`${userId}:${experiment.id}:audience`) % 100;
  if (audienceHash >= experiment.audiencePercentage) {
    return null; // User not in experiment audience
  }

  // Check date constraints
  const now = new Date();
  if (experiment.startDate && new Date(experiment.startDate) > now) return null;
  if (experiment.endDate && new Date(experiment.endDate) < now) return null;

  // Deterministic variant selection
  const variantHash = hashString(`${userId}:${experiment.id}:variant`) % 100;
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (variantHash < cumulative) {
      return variant.id;
    }
  }

  // Fallback to last variant
  return experiment.variants[experiment.variants.length - 1]?.id ?? null;
}

// ─── Store ──────────────────────────────────────────────────
export const useABTestingStore = create<ABTestingState>()(
  persist(
    (set, get) => ({
      experiments: DEFAULT_EXPERIMENTS,
      assignments: [],
      events: [],
      userId: null,

      setUserId: (userId: string) => {
        set({ userId });
      },

      getVariant: (experimentId: string): string | null => {
        const state = get();

        // Check if already assigned
        const existing = state.assignments.find(a => a.experimentId === experimentId);
        if (existing) return existing.variantId;

        // Assign if possible
        return state.assignVariant(experimentId);
      },

      assignVariant: (experimentId: string): string | null => {
        const state = get();
        const experiment = state.experiments.find(e => e.id === experimentId);

        if (!experiment || !experiment.enabled || !state.userId) return null;

        // Already assigned? Return existing
        const existing = state.assignments.find(a => a.experimentId === experimentId);
        if (existing) return existing.variantId;

        const variantId = selectVariant(experiment, state.userId);
        if (!variantId) return null;

        const assignment: ExperimentAssignment = {
          experimentId,
          variantId,
          assignedAt: new Date().toISOString(),
        };

        set(s => ({
          assignments: [...s.assignments, assignment],
        }));

        // Auto-track exposure
        get().trackEvent(experimentId, 'exposure');

        return variantId;
      },

      trackEvent: (experimentId: string, event: string, metadata?: Record<string, unknown>) => {
        const state = get();
        const assignment = state.assignments.find(a => a.experimentId === experimentId);
        if (!assignment) return;

        const abEvent: ABEvent = {
          experimentId,
          variantId: assignment.variantId,
          event,
          timestamp: new Date().toISOString(),
          metadata,
        };

        set(s => ({
          events: [...s.events, abEvent],
        }));
      },

      isInExperiment: (experimentId: string): boolean => {
        const state = get();
        return state.assignments.some(a => a.experimentId === experimentId);
      },

      getExperimentConfig: (experimentId: string): ExperimentConfig | undefined => {
        return get().experiments.find(e => e.id === experimentId);
      },

      updateExperiments: (configs: ExperimentConfig[]) => {
        set({ experiments: configs });
      },

      getEvents: (experimentId?: string): ABEvent[] => {
        const events = get().events;
        if (experimentId) {
          return events.filter(e => e.experimentId === experimentId);
        }
        return events;
      },

      flushEvents: (): ABEvent[] => {
        const events = get().events;
        set({ events: [] });
        return events;
      },

      resetAssignments: () => {
        set({ assignments: [], events: [] });
      },
    }),
    {
      name: 'ab-testing-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        assignments: state.assignments,
        events: state.events,
        userId: state.userId,
      }),
    }
  )
);
