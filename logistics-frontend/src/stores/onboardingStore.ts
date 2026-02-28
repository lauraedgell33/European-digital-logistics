import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  completedSteps: number[];
  skippedAt: string | null;
  setStep: (step: number) => void;
  completeStep: (step: number) => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isCompleted: false,
      currentStep: 0,
      completedSteps: [],
      skippedAt: null,
      setStep: (step) => set({ currentStep: step }),
      completeStep: (step) => {
        const prev = get().completedSteps;
        const completed = prev.includes(step) ? prev : [...prev, step];
        set({ completedSteps: completed, currentStep: step + 1 });
      },
      skipOnboarding: () => set({ isCompleted: true, skippedAt: new Date().toISOString() }),
      completeOnboarding: () => set({ isCompleted: true }),
      resetOnboarding: () => set({ isCompleted: false, currentStep: 0, completedSteps: [], skippedAt: null }),
    }),
    { name: 'logimarket-onboarding' }
  )
);
