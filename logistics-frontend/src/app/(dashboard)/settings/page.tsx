'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { GeistTabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import Switch from '@/components/ui/Switch';
import { useTheme } from '@/hooks/useTheme';
import { COUNTRIES } from '@/lib/utils';
import { authApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import {
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const { addNotification, setLocale } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    position: user?.position ?? '',
    language: user?.language ?? 'en',
  });

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Personal Information" description="Update your profile details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+49 xxx xxx xxxx"
          />
          <Input
            label="Position"
            value={form.position}
            onChange={(e) => update('position', e.target.value)}
            placeholder="e.g. Logistics Manager"
          />
          <Select
            label="Language"
            options={[
              { value: 'en', label: 'English' },
              { value: 'de', label: 'Deutsch' },
              { value: 'fr', label: 'Français' },
              { value: 'pl', label: 'Polski' },
              { value: 'ro', label: 'Română' },
              { value: 'es', label: 'Español' },
              { value: 'it', label: 'Italiano' },
            ]}
            value={form.language}
            onChange={(e) => {
              update('language', e.target.value);
              setLocale(e.target.value);
            }}
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const res = await authApi.updateProfile(form as Parameters<typeof authApi.updateProfile>[0]);
                setUser(res.data.user || res.data.data || res.data);
                addNotification({ type: 'success', message: 'Profile updated successfully' });
              } catch (e: unknown) {
                addNotification({ type: 'error', message: (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update profile' });
              } finally {
                setSaving(false);
              }
            }}
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

function CompanySettings() {
  const { user, fetchProfile } = useAuthStore();
  const { addNotification } = useAppStore();
  const [saving, setSaving] = useState(false);
  const company = user?.company;

  const [form, setForm] = useState({
    name: company?.name ?? '',
    vat_number: company?.vat_number ?? '',
    country: company?.country ?? 'DE',
    city: company?.city ?? '',
    address: company?.address ?? '',
    postal_code: company?.postal_code ?? '',
    website: company?.website ?? '',
    description: company?.description ?? '',
  });

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Company Information" description="Manage your company profile" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            label="Company Name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Input
            label="VAT Number"
            value={form.vat_number}
            onChange={(e) => update('vat_number', e.target.value)}
            placeholder="e.g. DE123456789"
          />
          <Select
            label="Country"
            options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
          />
          <Input
            label="City"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
          <Input
            label="Postal Code"
            value={form.postal_code}
            onChange={(e) => update('postal_code', e.target.value)}
          />
          <Input
            label="Website"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
            placeholder="https://"
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Company Description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Tell others about your company..."
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await authApi.updateProfile({ company: form } as unknown as Parameters<typeof authApi.updateProfile>[0]);
                await fetchProfile();
                addNotification({ type: 'success', message: 'Company info updated' });
              } catch (e: unknown) {
                addNotification({ type: 'error', message: (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update company' });
              } finally {
                setSaving(false);
              }
            }}
          >
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader title="Verification" description="Your company verification status" />
        <div className="mt-4 space-y-3">
          {[
            { label: 'Business Registration', verified: true },
            { label: 'VAT Verification', verified: true },
            { label: 'Insurance Certificate', verified: false },
            { label: 'Operating License', verified: false },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: 'var(--ds-gray-200)',
                border: '1px solid var(--ds-gray-400)',
              }}
            >
              <span className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
                {item.label}
              </span>
              {item.verified ? (
                <Badge variant="green">Verified</Badge>
              ) : (
                <Button variant="secondary" size="sm">Upload</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const { addNotification } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      addNotification({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (passwords.new.length < 8) {
      addNotification({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({
        current_password: passwords.current,
        new_password: passwords.new,
        new_password_confirmation: passwords.confirm,
      });
      setPasswords({ current: '', new: '', confirm: '' });
      addNotification({ type: 'success', message: 'Password updated successfully' });
    } catch (e: unknown) {
      addNotification({ type: 'error', message: (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Change Password" description="Update your account password" />
        <div className="space-y-4 mt-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
          />
          <Input
            label="New Password"
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
            hint="Minimum 8 characters with uppercase, lowercase, and number"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button loading={saving} onClick={handleChangePassword}>Update Password</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Two-Factor Authentication" description="Add an extra security layer" />
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
              Two-factor authentication is not enabled
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--ds-gray-800)' }}>
              Protect your account with an authenticator app
            </p>
          </div>
          <Button variant="secondary">Enable 2FA</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Active Sessions" description="Manage your logged in devices" />
        <div className="mt-4 space-y-3">
          {[
            { device: 'Chrome on Windows', ip: '192.168.1.1', last: 'Now', current: true },
            { device: 'Firefox on macOS', ip: '10.0.0.5', last: '2 hours ago', current: false },
            { device: 'Mobile App (iOS)', ip: '172.16.0.1', last: '1 day ago', current: false },
          ].map((session, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: 'var(--ds-gray-200)',
                border: '1px solid var(--ds-gray-400)',
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                    {session.device}
                  </p>
                  {session.current && <Badge variant="green">Current</Badge>}
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--ds-gray-800)' }}>
                  {session.ip} · {session.last}
                </p>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    email_orders: true,
    email_tracking: true,
    email_tenders: false,
    email_marketing: false,
    push_orders: true,
    push_tracking: true,
    push_messages: true,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Email Notifications" description="Configure email alert preferences" />
        <div className="mt-4 space-y-4">
          {[
            { key: 'email_orders', label: 'Order Updates', desc: 'Status changes on your transport orders' },
            { key: 'email_tracking', label: 'Tracking Alerts', desc: 'Shipment location and ETA updates' },
            { key: 'email_tenders', label: 'Tender Notifications', desc: 'New tenders matching your profile' },
            { key: 'email_marketing', label: 'Marketing', desc: 'Product updates and newsletters' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--ds-gray-300)' }}
            >
              <Switch
                checked={(prefs as any)[item.key]}
                onChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))}
                label={item.label}
                description={item.desc}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Push Notifications" description="Configure browser push alerts" />
        <div className="mt-4 space-y-4">
          {[
            { key: 'push_orders', label: 'Order Alerts', desc: 'Instant push for order changes' },
            { key: 'push_tracking', label: 'Tracking Updates', desc: 'Real-time shipment alerts' },
            { key: 'push_messages', label: 'Messages', desc: 'New messages from partners' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--ds-gray-300)' }}
            >
              <Switch
                checked={(prefs as any)[item.key]}
                onChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))}
                label={item.label}
                description={item.desc}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader title="Theme" description="Choose your interface theme" />
      <div className="mt-4 grid grid-cols-3 gap-4">
        {[
          { value: 'light' as const, label: 'Light', bg: '#ffffff', fg: '#000000' },
          { value: 'dark' as const, label: 'Dark', bg: '#0a0a0a', fg: '#ededed' },
          { value: 'system' as const, label: 'System', bg: 'linear-gradient(135deg, #fff 50%, #0a0a0a 50%)', fg: '#888' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className="p-4 rounded-lg text-center transition-all focus-ring"
            style={{
              border: `2px solid ${theme === t.value ? 'var(--ds-blue-700)' : 'var(--ds-gray-400)'}`,
              background: 'var(--ds-gray-200)',
            }}
            aria-pressed={theme === t.value}
            aria-label={`${t.label} theme`}
          >
            <div
              className="h-16 w-full rounded-md mb-3 mx-auto"
              style={{
                background: t.bg,
                border: '1px solid var(--ds-gray-400)',
              }}
            />
            <span
              className="text-[13px] font-medium"
              style={{
                color: theme === t.value ? 'var(--ds-blue-900)' : 'var(--ds-gray-1000)',
              }}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const tabs = [
    {
      label: 'Profile',
      icon: <UserIcon className="h-4 w-4" />,
      content: <ProfileSettings />,
    },
    {
      label: 'Company',
      icon: <BuildingOfficeIcon className="h-4 w-4" />,
      content: <CompanySettings />,
    },
    {
      label: 'Security',
      icon: <ShieldCheckIcon className="h-4 w-4" />,
      content: <SecuritySettings />,
    },
    {
      label: 'Notifications',
      icon: <BellIcon className="h-4 w-4" />,
      content: <NotificationSettings />,
    },
    {
      label: 'Appearance',
      icon: <PaintBrushIcon className="h-4 w-4" />,
      content: <AppearanceSettings />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          Settings
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
          Manage your account, company, and preferences
        </p>
      </div>

      <GeistTabs
        items={tabs.map((t) => ({
          label: t.label,
          content: t.content,
        }))}
      />
    </div>
  );
}
