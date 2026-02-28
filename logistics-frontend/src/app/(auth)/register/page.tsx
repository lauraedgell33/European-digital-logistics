'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { COUNTRIES } from '@/lib/utils';
import { TruckIcon } from '@heroicons/react/24/outline';

const registerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm password'),
  company_name: z.string().min(1, 'Company name is required'),
  company_type: z.enum(['shipper', 'carrier', 'forwarder']),
  vat_number: z.string().min(1, 'VAT number is required'),
  country_code: z.string().length(2, 'Select a country'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

type RegisterForm = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister, isLoading } = useAuthStore();
  const { execute: executeRecaptcha } = useRecaptcha();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      company_type: 'shipper',
      country_code: 'DE',
    },
  });

  const countryOptions = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      const recaptchaToken = await executeRecaptcha('register');
      await authRegister({ ...data, recaptcha_token: recaptchaToken } as any);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
      const msg = errData?.errors
        ? Object.values(errData.errors).flat().join(', ')
        : errData?.message || 'Registration failed';
      setServerError(msg);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder, required = false }: { name: keyof RegisterForm; label: string; type?: string; placeholder?: string; required?: boolean }) => (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
        {label}{required && ' *'}
      </label>
      {type === 'select' ? null : (
        <input
          type={type}
          placeholder={placeholder}
          className="input-geist"
          autoComplete={name === 'password' ? 'new-password' : name === 'password_confirmation' ? 'new-password' : name === 'email' ? 'email' : 'off'}
          {...register(name)}
        />
      )}
      {errors[name] && (
        <p className="text-[12px]" style={{ color: 'var(--ds-red-900)' }}>{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--ds-background-200)' }}
    >
      <div className="w-full max-w-[480px]" id="auth-form">
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
            Create your account
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            Join the European logistics marketplace
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Registration form">
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

            {/* Personal info */}
            <Field name="name" label="Full Name" placeholder="John Doe" required />
            <Field name="email" label="Email Address" type="email" placeholder="you@company.com" required />

            <div className="grid grid-cols-2 gap-3">
              <Field name="password" label="Password" type="password" placeholder="Min 8 characters" required />
              <Field name="password_confirmation" label="Confirm Password" type="password" placeholder="Re-enter password" required />
            </div>

            <div className="divider-geist my-2" />

            {/* Company info */}
            <p className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
              Company Information
            </p>

            <Field name="company_name" label="Company Name" placeholder="Acme Logistics GmbH" required />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                  Company Type *
                </label>
                <select className="input-geist appearance-none" {...register('company_type')}>
                  <option value="shipper">Shipper</option>
                  <option value="carrier">Carrier</option>
                  <option value="forwarder">Freight Forwarder</option>
                </select>
                {errors.company_type && (
                  <p className="text-[12px]" style={{ color: 'var(--ds-red-900)' }}>{errors.company_type.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                  Country *
                </label>
                <select className="input-geist appearance-none" {...register('country_code')}>
                  {countryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {errors.country_code && (
                  <p className="text-[12px]" style={{ color: 'var(--ds-red-900)' }}>{errors.country_code.message}</p>
                )}
              </div>
            </div>

            <Field name="vat_number" label="VAT Number" placeholder="DE123456789" required />

            <div className="grid grid-cols-2 gap-3">
              <Field name="city" label="City" placeholder="Berlin" required />
              <Field name="postal_code" label="Postal Code" placeholder="10115" required />
            </div>

            <Field name="address" label="Address" placeholder="Musterstraße 1" required />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-geist btn-geist-primary w-full disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="divider-geist my-6" />

          <p className="text-center text-[13px]" style={{ color: 'var(--ds-gray-900)' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium no-underline hover:underline"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
