import { useAppStore } from '@/stores/appStore';

describe('appStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      notifications: [],
      unreadCount: 0,
      locale: 'en',
    });
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('has initial locale of "en"', () => {
    expect(useAppStore.getState().locale).toBe('en');
  });

  it('has initial unreadCount of 0', () => {
    expect(useAppStore.getState().unreadCount).toBe(0);
  });

  it('has initial empty notifications', () => {
    expect(useAppStore.getState().notifications).toEqual([]);
  });

  describe('setLocale', () => {
    it('changes locale', () => {
      useAppStore.getState().setLocale('de');
      expect(useAppStore.getState().locale).toBe('de');
    });

    it('supports all available locales', () => {
      const locales = ['en', 'de', 'fr', 'es', 'it', 'pl', 'ro'];
      for (const loc of locales) {
        useAppStore.getState().setLocale(loc);
        expect(useAppStore.getState().locale).toBe(loc);
      }
    });
  });

  describe('setUnreadCount', () => {
    it('updates unread count', () => {
      useAppStore.getState().setUnreadCount(5);
      expect(useAppStore.getState().unreadCount).toBe(5);
    });

    it('can set count to zero', () => {
      useAppStore.getState().setUnreadCount(10);
      useAppStore.getState().setUnreadCount(0);
      expect(useAppStore.getState().unreadCount).toBe(0);
    });
  });

  describe('addNotification', () => {
    it('adds a notification to the list', () => {
      useAppStore.getState().addNotification({
        type: 'success',
        title: 'Done',
        message: 'Order created',
      });

      const notifications = useAppStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].title).toBe('Done');
      expect(notifications[0].message).toBe('Order created');
      expect(notifications[0].id).toBeDefined();
    });

    it('adds multiple notifications', () => {
      useAppStore.getState().addNotification({ type: 'info', message: 'First' });
      useAppStore.getState().addNotification({ type: 'warning', message: 'Second' });

      expect(useAppStore.getState().notifications).toHaveLength(2);
    });

    it('auto-removes notification after default duration', () => {
      useAppStore.getState().addNotification({ type: 'success', message: 'Temporary' });
      expect(useAppStore.getState().notifications).toHaveLength(1);

      // Default duration is 4000ms
      jest.advanceTimersByTime(4000);

      expect(useAppStore.getState().notifications).toHaveLength(0);
    });

    it('auto-removes notification after custom duration', () => {
      useAppStore.getState().addNotification({
        type: 'error',
        message: 'Long error',
        duration: 8000,
      });
      expect(useAppStore.getState().notifications).toHaveLength(1);

      jest.advanceTimersByTime(4000);
      expect(useAppStore.getState().notifications).toHaveLength(1);

      jest.advanceTimersByTime(4000);
      expect(useAppStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('removeNotification', () => {
    it('removes a specific notification by id', () => {
      useAppStore.getState().addNotification({ type: 'info', message: 'Keep' });
      useAppStore.getState().addNotification({ type: 'error', message: 'Remove' });

      const notifications = useAppStore.getState().notifications;
      const toRemove = notifications.find((n) => n.message === 'Remove')!;

      useAppStore.getState().removeNotification(toRemove.id);

      const remaining = useAppStore.getState().notifications;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].message).toBe('Keep');
    });
  });
});
