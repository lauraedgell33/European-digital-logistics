import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export const alt = 'LogiMarket — European Digital Logistics Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1e1e1e 50%, #1e3a5f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            marginBottom: 32,
            boxShadow: '0 0 60px rgba(59,130,246,0.3)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            display: 'flex',
          }}
        >
          LogiMarket
        </div>

        <div
          style={{
            fontSize: 24,
            color: '#94a3b8',
            marginTop: 12,
            display: 'flex',
          }}
        >
          European Digital Logistics Marketplace
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['Freight Exchange', 'Live Tracking', 'Smart Matching'].map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 24px',
                borderRadius: 24,
                border: '1px solid rgba(59,130,246,0.3)',
                background: 'rgba(59,130,246,0.1)',
                color: '#60a5fa',
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa, #3b82f6, #1e40af)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
