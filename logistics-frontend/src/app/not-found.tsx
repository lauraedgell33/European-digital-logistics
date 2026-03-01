'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--geist-background)' }}>
      <div className="text-center max-w-md animate-fade-in-up">
        {/* 404 Visual */}
        <div className="relative mb-8">
          <div 
            className="text-[120px] font-bold leading-none tracking-tighter"
            style={{ color: 'var(--ds-gray-300)' }}
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ color: 'var(--ds-gray-700)' }}>
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
              <path d="M24 24l16 16M40 24L24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <h1 
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          {t('errors.pageNotFound')}
        </h1>
        <p 
          className="text-[14px] mb-8"
          style={{ color: 'var(--ds-gray-800)' }}
        >
          {t('errors.pageNotFoundDesc')}
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-geist btn-geist-primary">
            {t('errors.backToDashboard')}
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn-geist btn-geist-secondary"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
