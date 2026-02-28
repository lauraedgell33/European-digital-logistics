'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import CopilotWidget from '@/components/copilot/CopilotWidget';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen" style={{ background: 'var(--ds-background-200)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar" id="main-content" tabIndex={-1}>
          <div className="geist-container py-6 page-enter">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <OnboardingWizard />
      <CopilotWidget />
    </div>
  );
}
