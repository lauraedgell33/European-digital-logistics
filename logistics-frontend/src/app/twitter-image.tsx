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
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 20,
            background: '#1e40af',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 42,
              display: 'flex',
              color: 'white',
            }}
          >
            &#x1F69A;
          </div>
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#ffffff',
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
                border: '1px solid #1e40af',
                background: '#0f172a',
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
            background: 'linear-gradient(90deg, #1e40af, #3b82f6, #1e40af)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
