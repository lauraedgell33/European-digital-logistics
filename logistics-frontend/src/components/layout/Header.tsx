'use client';

import { Fragment, useMemo, useState, useEffect, useCallback } from 'react';
import { Menu, Transition, Popover } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  CheckIcon,
  TrashIcon,
  TruckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useTrackingStore } from '@/stores/trackingStore';
import { notificationApi } from '@/lib/api';
import { cn, getCountryFlag } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Avatar from '@/components/ui/Avatar';
import { useTranslation } from '@/hooks/useTranslation';

const pageNameKeys: Record<string, string> = {
  '/dashboard': 'dashboard.title',
  '/freight': 'freight.title',
  '/freight/new': 'freight.postNew',
  '/vehicles': 'vehicles.title',
  '/vehicles/new': 'vehicles.postNew',
  '/orders': 'orders.title',
  '/orders/new': 'orders.newOrder',
  '/tenders': 'tenders.title',
  '/tenders/new': 'tenders.createNew',
  '/messages': 'messages.title',
  '/tracking': 'tracking.title',
  '/analytics': 'analytics.title',
  '/networks': 'networks.title',
  '/settings': 'settings.title',
};

export function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useAppStore();
  const { isConnected } = useTrackingStore();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.list();
      const data = res.data;
      setNotifications(data.data || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // silent — user may not be authenticated yet
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((n) => n.map((item) => ({ ...item, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((n) =>
        n.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications((n) => n.filter((item) => item.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const getNotificationIcon = (type: string) => {
    if (type?.includes('Order')) return TruckIcon;
    if (type?.includes('Tender')) return DocumentTextIcon;
    if (type?.includes('Delay') || type?.includes('Shipment')) return ExclamationTriangleIcon;
    return BellIcon;
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string }[] = [{ label: t('dashboard.title'), href: '/dashboard' }];
    const segments = pathname.split('/').filter(Boolean);

    let currentPath = '';
    segments.forEach((segment: string, i: number) => {
      currentPath += `/${segment}`;
      const translationKey = pageNameKeys[currentPath];
      const name = translationKey ? t(translationKey) : segment.charAt(0).toUpperCase() + segment.slice(1);
      if (i < segments.length - 1) {
        items.push({ label: name, href: currentPath });
      } else {
        items.push({ label: name });
      }
    });

    return items;
  }, [pathname, t]);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 px-4 sm:px-6"
      style={{
        background: 'var(--ds-background-100)',
        borderBottom: '1px solid var(--ds-gray-400)',
      }}
      role="banner"
    >
      {/* Mobile menu button */}
      <button
        className="lg:hidden p-1 rounded transition-colors focus-ring"
        style={{ color: 'var(--ds-gray-900)' }}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex flex-1 items-center">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Command palette trigger */}
        <button
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
          }}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-colors focus-ring"
          style={{
            color: 'var(--ds-gray-700)',
            border: '1px solid var(--ds-gray-400)',
          }}
          aria-label="Open command palette"
        >
          <CommandLineIcon className="h-3.5 w-3.5" />
          <kbd className="text-[10px] font-mono">⌘K</kbd>
        </button>

        {/* WebSocket status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2" role="status" aria-label={isConnected ? 'Connected' : 'Disconnected'}>
          <div
            className={cn('h-2 w-2 rounded-full', isConnected && 'animate-pulse-dot')}
            style={{
              background: isConnected ? 'var(--ds-green-700)' : 'var(--ds-red-700)',
            }}
          />
          <span className="text-[11px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Notifications */}
        <Popover className="relative">
          <Popover.Button
            className="relative rounded-md p-2 transition-colors focus-ring"
            style={{ color: 'var(--ds-gray-900)' }}
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <BellIcon className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: 'var(--ds-red-700)', color: '#fff' }}
                aria-hidden="true"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className="absolute right-0 mt-2 w-96 origin-top-right rounded-xl overflow-hidden focus:outline-none z-50"
              style={{
                background: 'var(--ds-background-100)',
                border: '1px solid var(--ds-gray-400)',
                boxShadow: 'var(--shadow-large)',
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--ds-gray-300)' }}
              >
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                  {t('settings.notifications')}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--ds-blue-900)' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <BellIcon className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--ds-gray-600)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--ds-gray-800)' }}>
                      {t('common.noResults')}
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = getNotificationIcon(n.type);
                    const isUnread = !n.read_at;
                    return (
                      <div
                        key={n.id}
                        className="flex gap-3 px-4 py-3 transition-colors cursor-pointer group"
                        style={{
                          background: isUnread ? 'var(--ds-blue-100)' : 'transparent',
                          borderBottom: '1px solid var(--ds-gray-200)',
                        }}
                        onClick={() => isUnread && handleMarkRead(n.id)}
                      >
                        <div
                          className="flex-shrink-0 mt-0.5 h-8 w-8 rounded-full flex items-center justify-center"
                          style={{
                            background: isUnread ? 'var(--ds-blue-200)' : 'var(--ds-gray-200)',
                          }}
                        >
                          <Icon className="h-4 w-4" style={{ color: isUnread ? 'var(--ds-blue-900)' : 'var(--ds-gray-800)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn('text-[13px] leading-snug', isUnread ? 'font-semibold' : 'font-normal')}
                            style={{ color: 'var(--ds-gray-1000)' }}
                          >
                            {n.data?.title || n.data?.message || 'Notification'}
                          </p>
                          {n.data?.message && n.data?.title && (
                            <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--ds-gray-800)' }}>
                              {n.data.message}
                            </p>
                          )}
                          <p className="text-[11px] mt-1" style={{ color: 'var(--ds-gray-700)' }}>
                            {n.created_at ? timeAgo(n.created_at) : ''}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(n.id);
                          }}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                          style={{ color: 'var(--ds-gray-700)' }}
                          aria-label="Delete notification"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div
                  className="px-4 py-2 text-center"
                  style={{ borderTop: '1px solid var(--ds-gray-300)' }}
                >
                  <a
                    href="/settings"
                    className="text-[12px] font-medium no-underline transition-colors hover:opacity-80"
                    style={{ color: 'var(--ds-blue-900)' }}
                  >
                    Notification Settings
                  </a>
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </Popover>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px mx-1" style={{ background: 'var(--ds-gray-400)' }} aria-hidden="true" />

        {/* User menu */}
        <Menu as="div" className="relative">
          <Menu.Button
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors focus-ring"
            aria-label="User menu"
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--ds-gray-900)' }}>
                {user?.company?.name && (
                  <>
                    {user.company.country_code && getCountryFlag(user.company.country_code)}{' '}
                    {user.company.name}
                  </>
                )}
              </p>
            </div>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg overflow-hidden py-1 focus:outline-none"
              style={{
                background: 'var(--ds-background-100)',
                border: '1px solid var(--ds-gray-400)',
                boxShadow: 'var(--shadow-medium)',
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: '1px solid var(--ds-gray-300)' }}
              >
                <p className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                  {user?.name}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--ds-gray-900)' }}>
                  {user?.email}
                </p>
              </div>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-[13px] no-underline transition-colors"
                    style={{
                      color: 'var(--ds-gray-1000)',
                      background: active ? 'var(--ds-gray-100)' : 'transparent',
                    }}
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    {t('nav.settings')}
                  </a>
                )}
              </Menu.Item>
              <div style={{ borderTop: '1px solid var(--ds-gray-300)' }}>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-[13px] transition-colors"
                      style={{
                        color: 'var(--ds-red-900)',
                        background: active ? 'var(--ds-red-100)' : 'transparent',
                      }}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      {t('auth.logout')}
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
