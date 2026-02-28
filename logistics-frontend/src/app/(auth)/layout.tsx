import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in or create your LogiMarket account to manage freight, orders, and shipments across Europe.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div role="main" aria-label="Authentication">
      <a href="#auth-form" className="skip-nav-link">
        Skip to form
      </a>
      {children}
    </div>
  );
}
