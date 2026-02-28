'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { ThemeToggle } from '@/components/providers/ThemeProvider';
import { useTranslation } from '@/hooks/useTranslation';
import {
  HomeIcon,
  TruckIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  MapPinIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  PresentationChartLineIcon,
  ShieldExclamationIcon,
  GlobeEuropeAfricaIcon,
  BookOpenIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const navigationItems = [
  { key: 'nav.dashboard', href: '/dashboard', icon: HomeIcon },
  { key: 'nav.freight', href: '/freight', icon: CubeIcon },
  { key: 'nav.vehicles', href: '/vehicles', icon: TruckIcon },
  { key: 'nav.matching', href: '/matching', icon: SparklesIcon },
  { key: 'nav.orders', href: '/orders', icon: ClipboardDocumentListIcon },
  { key: 'nav.tenders', href: '/tenders', icon: DocumentTextIcon },
  { key: 'nav.warehouses', href: '/warehouses', icon: BuildingStorefrontIcon },
  { key: 'nav.barometer', href: '/barometer', icon: PresentationChartLineIcon },
  { key: 'nav.returnLoads', href: '/return-loads', icon: ArrowPathIcon },
  { key: 'nav.messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
  { key: 'nav.companies', href: '/companies', icon: BuildingOfficeIcon },
  { key: 'nav.tracking', href: '/tracking', icon: MapPinIcon },
  { key: 'nav.drivingBans', href: '/driving-bans', icon: ShieldExclamationIcon },
  { key: 'nav.carbon', href: '/carbon', icon: GlobeEuropeAfricaIcon },
  { key: 'nav.priceInsights', href: '/price-insights', icon: CurrencyEuroIcon },
  { key: 'nav.insurance', href: '/insurance', icon: ShieldCheckIcon },
  { key: 'nav.escrow', href: '/escrow', icon: BanknotesIcon },
  { key: 'nav.lexicon', href: '/lexicon', icon: BookOpenIcon },
  { key: 'nav.analytics', href: '/analytics', icon: ChartBarIcon },
  { key: 'nav.networks', href: '/networks', icon: UserGroupIcon },
  { key: 'nav.settings', href: '/settings', icon: Cog6ToothIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'var(--ds-background-100)',
          borderRight: '1px solid var(--ds-gray-400)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div
          className="flex h-16 items-center justify-between px-5"
          style={{ borderBottom: '1px solid var(--ds-gray-400)' }}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--geist-foreground)' }}
            >
              <TruckIcon className="h-4.5 w-4.5" style={{ color: 'var(--geist-background)' }} />
            </div>
            <span
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              LogiMarket
            </span>
          </Link>
          <button
            className="lg:hidden p-1 rounded transition-colors focus-ring"
            style={{ color: 'var(--ds-gray-900)' }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Search Shortcut */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              // Trigger Cmd+K
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors"
            style={{
              background: 'var(--ds-gray-100)',
              color: 'var(--ds-gray-700)',
              border: '1px solid var(--ds-gray-400)',
            }}
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span className="flex-1 text-left">{t('nav.search')}</span>
            <kbd className="cmdk-kbd text-[10px]">⌘K</kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 no-scrollbar" aria-label="Sidebar">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const name = t(item.key);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150 no-underline focus-ring',
                )}
                style={{
                  color: isActive ? 'var(--ds-gray-1000)' : 'var(--ds-gray-900)',
                  background: isActive ? 'var(--ds-gray-200)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--ds-gray-100)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                {name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          className="px-3 py-3 space-y-3"
          style={{ borderTop: '1px solid var(--ds-gray-400)' }}
        >
          {/* Theme toggle */}
          <div className="flex items-center justify-between px-3">
            <span className="text-[12px] font-medium" style={{ color: 'var(--ds-gray-700)' }}>
              {t('nav.theme')}
            </span>
            <ThemeToggle />
          </div>

          <div
            className="rounded-md p-3"
            style={{ background: 'var(--ds-gray-100)' }}
          >
            <p className="text-[11px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
              European Digital Logistics
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>
              Marketplace v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
