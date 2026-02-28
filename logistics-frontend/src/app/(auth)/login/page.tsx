'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import { useAuthStore } from '@/stores/authStore';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { TruckIcon } from '@heroicons/react/24/outline';

type LoginForm = { email: string; password: string; remember?: boolean };

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { execute: executeRecaptcha } = useRecaptcha();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const recaptchaToken = await executeRecaptcha('login');
      await login(data.email, data.password, recaptchaToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials';
      setServerError(message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--ds-background-200)' }}
    >
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4"
            style={{ background: 'var(--geist-foreground)' }}
          >
            <TruckIcon className="h-6 w-6" style={{ color: 'var(--geist-background)' }} />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            Sign in to LogiMarket
          </p>
        </div>

        {/* Form Card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: 'var(--ds-background-100)',
            boxShadow: 'var(--ds-shadow-border-small)',
          }}
        >
          <form id="auth-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Sign in form">
            {serverError && (
              <div
                className="rounded-lg p-3 text-[13px]"
                style={{
                  background: 'var(--ds-red-200)',
                  color: 'var(--ds-red-900)',
                  border: '1px solid var(--ds-red-400)',
                }}
              >
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[13px] font-medium"
                style={{ color: 'var(--ds-gray-1000)' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="input-geist"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[12px] mt-1" style={{ color: 'var(--ds-red-900)' }}>{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium"
                  style={{ color: 'var(--ds-gray-1000)' }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] no-underline hover:underline"
                  style={{ color: 'var(--ds-blue-900)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input-geist"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[12px] mt-1" style={{ color: 'var(--ds-red-900)' }}>{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-geist btn-geist-primary w-full disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="divider-geist my-6" />

          <p className="text-center text-[13px]" style={{ color: 'var(--ds-gray-900)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium no-underline hover:underline"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--ds-gray-700)' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
