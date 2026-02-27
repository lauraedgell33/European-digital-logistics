import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LogiMarket — European Digital Logistics Marketplace',
    template: '%s | LogiMarket',
  },
  description:
    'Connect shippers with carriers across Europe. Find freight, manage transport orders, track shipments in real-time.',
  keywords: [
    'logistics', 'freight exchange', 'transport', 'shipping', 'Europe',
    'TIMOCOM', 'carrier', 'shipper', 'freight marketplace', 'load board',
    'truck exchange', 'supply chain', 'fleet management', 'GPS tracking',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
  },
  authors: [{ name: 'LogiMarket' }],
  creator: 'LogiMarket',
  publisher: 'LogiMarket',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'LogiMarket — European Digital Logistics Marketplace',
    description: 'Connect shippers with carriers across Europe. Post freight, find trucks, manage orders, and track shipments in real-time.',
    type: 'website',
    locale: 'en_US',
    siteName: 'LogiMarket',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogiMarket — European Digital Logistics',
    description: 'Connect shippers with carriers across Europe.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LogiMarket',
              description: 'European Digital Logistics Marketplace',
              url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@logimarket.eu',
                contactType: 'customer service',
                availableLanguage: ['English', 'German', 'French', 'Polish', 'Romanian', 'Spanish', 'Italian'],
              },
            }),
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-nav-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
