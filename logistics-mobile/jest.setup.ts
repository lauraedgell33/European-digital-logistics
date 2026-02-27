// ── expo-secure-store mock ────────────────────────────
const secureStorage: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => secureStorage[key] ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    secureStorage[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete secureStorage[key];
  }),
}));

// ── expo-notifications mock ──────────────────────────
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[mock-token]' })),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 },
  setNotificationChannelAsync: jest.fn(),
}));

// ── expo-router mock ─────────────────────────────────
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  Link: 'Link',
  Stack: { Screen: 'Screen' },
  Tabs: { Screen: 'Screen' },
  Redirect: 'Redirect',
}));

// ── expo-location mock ───────────────────────────────
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 48.8566, longitude: 2.3522, altitude: null, accuracy: 10, heading: null, speed: null },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(async (_opts: any, callback: any) => {
    callback({
      coords: { latitude: 48.8566, longitude: 2.3522 },
      timestamp: Date.now(),
    });
    return { remove: jest.fn() };
  }),
  Accuracy: { Balanced: 3, High: 4, Highest: 5, Low: 2, Lowest: 1 },
}));

// ── @react-native-community/netinfo mock ─────────────
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((callback: any) => {
    callback({ isConnected: true, type: 'wifi' });
    return jest.fn(); // unsubscribe
  }),
  fetch: jest.fn(async () => ({ isConnected: true, type: 'wifi' })),
}));

// ── react-native partial mocks ──────────────────────
// jest-expo preset already provides core RN mocks.
// We only need to mock specific modules that test files use.
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// ── socket.io-client mock ────────────────────────────
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };
  return {
    io: jest.fn(() => mockSocket),
  };
});

// ── Global __DEV__ ───────────────────────────────────
(global as any).__DEV__ = true;

// ── Pre-define Expo winter globals ───────────────────
// Expo 55 uses lazy-loaded globals (via Object.defineProperty getters in
// expo/src/winter/runtime.native.ts) that try to require() modules inside
// Jest's sandbox, causing "import outside of test scope" errors.
// Pre-defining them as concrete values prevents the lazy load from firing.
const winterGlobals: Record<string, any> = {
  __ExpoImportMetaRegistry: {},
  structuredClone: globalThis.structuredClone ?? ((obj: any) => JSON.parse(JSON.stringify(obj))),
  TextDecoder: globalThis.TextDecoder,
  TextDecoderStream: globalThis.TextDecoderStream ?? class {},
  TextEncoderStream: globalThis.TextEncoderStream ?? class {},
  URL: globalThis.URL,
  URLSearchParams: globalThis.URLSearchParams,
};

for (const [name, value] of Object.entries(winterGlobals)) {
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
    enumerable: false,
  });
}
