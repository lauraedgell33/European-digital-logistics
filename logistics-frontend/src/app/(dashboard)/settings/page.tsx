'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
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
        <CardHeader title={t('settings.personalInfo')} description={t('settings.personalInfoDesc')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            label={t('settings.fullName')}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Input
            label={t('settings.email')}
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <Input
            label={t('settings.phone')}
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+49 xxx xxx xxxx"
          />
          <Input
            label={t('settings.position')}
            value={form.position}
            onChange={(e) => update('position', e.target.value)}
            placeholder="e.g. Logistics Manager"
          />
          <Select
            label={t('settings.language')}
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
            {t('settings.saveChanges')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function CompanySettings() {
  const { t } = useTranslation();
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
        <CardHeader title={t('settings.companyInfo')} description={t('settings.companyInfoDesc')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            label={t('settings.companyName')}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Input
            label={t('settings.vatNumber')}
            value={form.vat_number}
            onChange={(e) => update('vat_number', e.target.value)}
            placeholder="e.g. DE123456789"
          />
          <Select
            label={t('settings.country')}
            options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
          />
          <Input
            label={t('settings.city')}
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
          <Input
            label={t('settings.address')}
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
          <Input
            label={t('settings.postalCode')}
            value={form.postal_code}
            onChange={(e) => update('postal_code', e.target.value)}
          />
          <Input
            label={t('settings.website')}
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
            placeholder="https://"
          />
        </div>
        <div className="mt-4">
          <Textarea
            label={t('settings.companyDescription')}
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
            {t('settings.saveChanges')}
          </Button>
        </div>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader title={t('settings.verification')} description={t('settings.verificationDesc')} />
        <div className="mt-4 space-y-3">
          {[
            { label: t('settings.businessRegistration'), verified: true },
            { label: t('settings.vatVerification'), verified: true },
            { label: t('settings.insuranceCertificate'), verified: false },
            { label: t('settings.operatingLicense'), verified: false },
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
                <Badge variant="green">{t('settings.verified')}</Badge>
              ) : (
                <Button variant="secondary" size="sm">{t('settings.upload')}</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const { t } = useTranslation();
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
        <CardHeader title={t('settings.changePassword')} description={t('settings.changePasswordDesc')} />
        <div className="space-y-4 mt-4 max-w-md">
          <Input
            label={t('settings.currentPassword')}
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
          />
          <Input
            label={t('settings.newPassword')}
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
            hint="Minimum 8 characters with uppercase, lowercase, and number"
          />
          <Input
            label={t('settings.confirmPassword')}
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button loading={saving} onClick={handleChangePassword}>{t('settings.updatePassword')}</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title={t('settings.twoFactor')} description={t('settings.twoFactorDesc')} />
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[13px]" style={{ color: 'var(--ds-gray-1000)' }}>
              {t('settings.twoFactorNotEnabled')}
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--ds-gray-800)' }}>
              {t('settings.twoFactorProtect')}
            </p>
          </div>
          <Button variant="secondary">{t('settings.enable2fa')}</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title={t('settings.activeSessions')} description={t('settings.activeSessionsDesc')} />
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
                  {session.current && <Badge variant="green">{t('settings.current')}</Badge>}
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--ds-gray-800)' }}>
                  {session.ip} · {session.last}
                </p>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm">
                  {t('settings.revoke')}
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
  const { t } = useTranslation();
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
        <CardHeader title={t('settings.emailNotifications')} description={t('settings.emailNotificationsDesc')} />
        <div className="mt-4 space-y-4">
          {[
            { key: 'email_orders', label: t('settings.orderUpdates'), desc: t('settings.orderUpdatesDesc') },
            { key: 'email_tracking', label: t('settings.trackingAlerts'), desc: t('settings.trackingAlertsDesc') },
            { key: 'email_tenders', label: t('settings.tenderNotifications'), desc: t('settings.tenderNotificationsDesc') },
            { key: 'email_marketing', label: t('settings.marketing'), desc: t('settings.marketingDesc') },
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
        <CardHeader title={t('settings.pushNotifications')} description={t('settings.pushNotificationsDesc')} />
        <div className="mt-4 space-y-4">
          {[
            { key: 'push_orders', label: t('settings.orderAlerts'), desc: t('settings.orderAlertsDesc') },
            { key: 'push_tracking', label: t('settings.trackingUpdates'), desc: t('settings.trackingUpdatesDesc') },
            { key: 'push_messages', label: t('settings.messagesNotif'), desc: t('settings.messagesNotifDesc') },
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
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader title={t('settings.theme')} description={t('settings.themeDesc')} />
      <div className="mt-4 grid grid-cols-3 gap-4">
        {[
          { value: 'light' as const, label: t('settings.light'), bg: '#ffffff', fg: '#000000' },
          { value: 'dark' as const, label: t('settings.dark'), bg: '#0a0a0a', fg: '#ededed' },
          { value: 'system' as const, label: t('settings.system'), bg: 'linear-gradient(135deg, #fff 50%, #0a0a0a 50%)', fg: '#888' },
        ].map((thm) => (
          <button
            key={thm.value}
            onClick={() => setTheme(thm.value)}
            className="p-4 rounded-lg text-center transition-all focus-ring"
            style={{
              border: `2px solid ${theme === thm.value ? 'var(--ds-blue-700)' : 'var(--ds-gray-400)'}`,
              background: 'var(--ds-gray-200)',
            }}
            aria-pressed={theme === thm.value}
            aria-label={`${thm.label} theme`}
          >
            <div
              className="h-16 w-full rounded-md mb-3 mx-auto"
              style={{
                background: thm.bg,
                border: '1px solid var(--ds-gray-400)',
              }}
            />
            <span
              className="text-[13px] font-medium"
              style={{
                color: theme === thm.value ? 'var(--ds-blue-900)' : 'var(--ds-gray-1000)',
              }}
            >
              {thm.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const tabs = [
    {
      label: t('settings.profile'),
      icon: <UserIcon className="h-4 w-4" />,
      content: <ProfileSettings />,
    },
    {
      label: t('settings.company'),
      icon: <BuildingOfficeIcon className="h-4 w-4" />,
      content: <CompanySettings />,
    },
    {
      label: t('settings.security'),
      icon: <ShieldCheckIcon className="h-4 w-4" />,
      content: <SecuritySettings />,
    },
    {
      label: t('settings.notifications'),
      icon: <BellIcon className="h-4 w-4" />,
      content: <NotificationSettings />,
    },
    {
      label: t('settings.appearance'),
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
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
          {t('settings.subtitle')}
        </p>
      </div>

      <GeistTabs
        items={tabs.map((tb) => ({
          label: tb.label,
          content: tb.content,
        }))}
      />
    </div>
  );
}
