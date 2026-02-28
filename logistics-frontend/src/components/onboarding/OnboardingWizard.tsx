'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileStep } from './steps/ProfileStep';
import { ExploreStep } from './steps/ExploreStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { CompletionStep } from './steps/CompletionStep';

const TOTAL_STEPS = 5;

const STEP_LABELS = ['Welcome', 'Profile', 'Explore', 'Preferences', 'Complete'];

export function OnboardingWizard() {
  const {
    isCompleted,
    currentStep,
    completedSteps,
    setStep,
    completeStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboardingStore();

  // Hydration guard — zustand persist loads async from localStorage
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === TOTAL_STEPS - 1) {
      completeOnboarding();
    } else {
      completeStep(currentStep);
    }
  }, [currentStep, completeStep, completeOnboarding]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
    }
  }, [currentStep, setStep]);

  const handleSkip = useCallback(() => {
    skipOnboarding();
  }, [skipOnboarding]);

  // Don't render until store hydrated / if completed
  if (!hydrated || isCompleted) return null;

  const progressPercent = ((currentStep) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(6px)' }}
    >
      {/* Card container */}
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--ds-background, #ffffff)' }}
      >
        {/* Skip button — top right */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
          style={{
            color: 'var(--ds-gray-500, #9ca3af)',
            background: 'var(--ds-background-100, #f9fafb)',
          }}
          aria-label="Skip onboarding"
        >
          Skip
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>

        {/* Progress bar */}
        <div
          className="h-1 w-full"
          style={{ background: 'var(--ds-gray-200, #e5e7eb)' }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: 'var(--ds-blue-600, #2563eb)',
            }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 px-6 pt-5 pb-2">
          {STEP_LABELS.map((label, idx) => {
            const isActive = idx === currentStep;
            const isDone = completedSteps.includes(idx);
            return (
              <button
                key={label}
                onClick={() => {
                  if (isDone || idx <= currentStep) setStep(idx);
                }}
                className="flex flex-col items-center gap-1 group"
                disabled={idx > currentStep && !isDone}
              >
                {/* Circle */}
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    background: isDone
                      ? 'var(--ds-green-500, #10b981)'
                      : isActive
                      ? 'var(--ds-blue-600, #2563eb)'
                      : 'var(--ds-gray-200, #e5e7eb)',
                    color: isDone || isActive ? '#fff' : 'var(--ds-gray-500, #9ca3af)',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: isActive ? '0 0 0 3px var(--ds-blue-200, #bfdbfe)' : 'none',
                  }}
                >
                  {isDone ? <CheckIcon className="h-4 w-4" /> : idx + 1}
                </span>
                {/* Label — hidden on small screens */}
                <span
                  className="hidden sm:block text-[10px] font-medium"
                  style={{
                    color: isActive
                      ? 'var(--ds-blue-600, #2563eb)'
                      : 'var(--ds-gray-400, #d1d5db)',
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="min-h-[400px] max-h-[70vh] overflow-y-auto custom-scrollbar">
          {currentStep === 0 && <WelcomeStep onNext={handleNext} onSkip={handleSkip} />}
          {currentStep === 1 && (
            <ProfileStep onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />
          )}
          {currentStep === 2 && (
            <ExploreStep onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />
          )}
          {currentStep === 3 && (
            <PreferencesStep onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />
          )}
          {currentStep === 4 && (
            <CompletionStep onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />
          )}
        </div>
      </div>
    </div>
  );
}
