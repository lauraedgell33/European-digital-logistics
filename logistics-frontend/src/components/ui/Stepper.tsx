'use client';

import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function Stepper({ steps, currentStep, onStepClick, orientation = 'horizontal', className }: StepperProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={cn(
        isHorizontal ? 'flex items-start' : 'flex flex-col',
        className,
      )}
      role="list"
      aria-label="Progress steps"
    >
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isFuture = idx > currentStep;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <div
            key={idx}
            className={cn(
              isHorizontal ? 'flex flex-1 items-start' : 'flex items-start',
              !isHorizontal && idx !== steps.length - 1 && 'pb-8',
            )}
            role="listitem"
            aria-current={isCurrent ? 'step' : undefined}
          >
            {/* Step circle + connector */}
            <div className={cn('flex shrink-0', isHorizontal ? 'flex-col items-center flex-1' : 'flex-col items-center mr-4')}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(idx)}
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-all duration-200',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default',
                )}
                style={{
                  background: isCompleted
                    ? 'var(--ds-blue-700)'
                    : isCurrent
                      ? 'var(--ds-background-100)'
                      : 'var(--ds-gray-200)',
                  color: isCompleted
                    ? '#fff'
                    : isCurrent
                      ? 'var(--ds-blue-700)'
                      : 'var(--ds-gray-700)',
                  boxShadow: isCurrent
                    ? '0 0 0 2px var(--ds-blue-700)'
                    : 'none',
                }}
                aria-label={`Step ${idx + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
              >
                {isCompleted ? <CheckIcon /> : step.icon || idx + 1}
              </button>

              {/* Connector line */}
              {idx < steps.length - 1 && !isHorizontal && (
                <div
                  className="mt-1 w-0.5 flex-1 min-h-[24px]"
                  style={{
                    background: isCompleted ? 'var(--ds-blue-700)' : 'var(--ds-gray-400)',
                  }}
                />
              )}

              {idx < steps.length - 1 && isHorizontal && (
                <div className="w-full mt-4 flex items-center px-2">
                  <div
                    className="h-0.5 w-full"
                    style={{
                      background: isCompleted ? 'var(--ds-blue-700)' : 'var(--ds-gray-400)',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Labels */}
            <div className={cn(isHorizontal ? 'mt-2 text-center px-1' : 'pt-1')}>
              <p
                className="text-[13px] font-medium"
                style={{
                  color: isFuture ? 'var(--ds-gray-700)' : 'var(--ds-gray-1000)',
                }}
              >
                {step.label}
              </p>
              {step.description && (
                <p
                  className="mt-0.5 text-[12px]"
                  style={{ color: 'var(--ds-gray-700)' }}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
