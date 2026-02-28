'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { TruckIcon, LockClosedIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token') ?? '';
  const emailParam = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailParam,
      password: '',
      password_confirmation: '',
      token,
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError('');
    try {
      await authApi.resetPassword(data);
      setSuccess(true);
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { errors?: { email?: string[]; password?: string[] }; message?: string } } })?.response?.data;
      const msg = errData?.errors?.email?.[0]
        || errData?.errors?.password?.[0]
        || errData?.message
        || 'An error occurred. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--ds-background-100)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--ds-blue-700)' }}>
            <TruckIcon className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            Set new password
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-700)' }}>
            Enter your new password below
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--ds-background-200)', border: '1px solid var(--ds-gray-400)' }}>
          {success ? (
            <div className="text-center py-4">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--ds-green-700)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                Password reset successfully
              </h2>
              <p className="mt-2 text-[14px]" style={{ color: 'var(--ds-gray-700)' }}>
                Your password has been updated. You can now log in with your new password.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="mt-6 rounded-lg px-6 py-2.5 text-[14px] font-medium text-white"
                style={{ background: 'var(--ds-blue-700)' }}
              >
                Go to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Reset password form">
              {serverError && (
                <div className="rounded-lg p-3 text-[13px]" style={{ background: 'var(--ds-red-200)', color: 'var(--ds-red-900)' }}>
                  {serverError}
                </div>
              )}

              <input type="hidden" {...register('token')} />

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--ds-gray-900)' }}>
                  Email address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--ds-gray-600)' }} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="w-full rounded-lg py-2.5 pl-10 pr-3 text-[14px] transition-colors focus:outline-none focus:ring-2"
                    style={{
                      border: errors.email ? '1px solid var(--ds-red-700)' : '1px solid var(--ds-gray-400)',
                      background: 'var(--ds-background-100)',
                      color: 'var(--ds-gray-1000)',
                    }}
                    placeholder="you@company.eu"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-[12px]" style={{ color: 'var(--ds-red-700)' }}>{errors.email.message}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--ds-gray-900)' }}>
                  New password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--ds-gray-600)' }} />
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password')}
                    className="w-full rounded-lg py-2.5 pl-10 pr-3 text-[14px] transition-colors focus:outline-none focus:ring-2"
                    style={{
                      border: errors.password ? '1px solid var(--ds-red-700)' : '1px solid var(--ds-gray-400)',
                      background: 'var(--ds-background-100)',
                      color: 'var(--ds-gray-1000)',
                    }}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-[12px]" style={{ color: 'var(--ds-red-700)' }}>{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="password_confirmation" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--ds-gray-900)' }}>
                  Confirm new password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--ds-gray-600)' }} />
                  <input
                    id="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    {...register('password_confirmation')}
                    className="w-full rounded-lg py-2.5 pl-10 pr-3 text-[14px] transition-colors focus:outline-none focus:ring-2"
                    style={{
                      border: errors.password_confirmation ? '1px solid var(--ds-red-700)' : '1px solid var(--ds-gray-400)',
                      background: 'var(--ds-background-100)',
                      color: 'var(--ds-gray-1000)',
                    }}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-[12px]" style={{ color: 'var(--ds-red-700)' }}>{errors.password_confirmation.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg py-2.5 text-[14px] font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: 'var(--ds-blue-700)' }}
              >
                {isSubmitting ? 'Resetting...' : 'Reset password'}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-[13px] font-medium" style={{ color: 'var(--ds-blue-700)' }}>
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
