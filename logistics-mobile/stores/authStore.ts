import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';
import { authApi } from '@/lib/api';
import { Sentry } from '@/lib/sentry';
import { isBiometricAvailable, authenticateWithBiometrics } from '@/lib/biometrics';
import { AppState, AppStateStatus } from 'react-native';

function handleError(error: unknown, context: string): void {
  if (__DEV__) {
    console.error(`[AuthStore] ${context}:`, error);
  }
  Sentry.captureException(error, { extra: { context } });
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  biometricEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
  hydrate: () => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  promptBiometricIfEnabled: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  company_type: string;
  vat_number: string;
  country_code: string;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  // Listen for app resume to prompt biometric if enabled
  let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

  function setupAppStateListener() {
    if (appStateSubscription) return;
    appStateSubscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      const state = get();
      if (nextState === 'active' && state.biometricEnabled && state.isAuthenticated) {
        await state.promptBiometricIfEnabled();
      }
    });
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isHydrated: false,
    biometricEnabled: false,

    hydrate: async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const biometricPref = await SecureStore.getItemAsync('biometric_enabled');

        if (biometricPref === 'true') {
          set({ biometricEnabled: true });
          setupAppStateListener();
        }

        if (token) {
          set({ token, isLoading: true });
          try {
            const response = await authApi.profile();
            const user = response.data.user || response.data.data || response.data;
            set({ user, isAuthenticated: true, isLoading: false, isHydrated: true });
          } catch (error) {
            handleError(error, 'hydrate: failed to fetch profile');
            await SecureStore.deleteItemAsync('auth_token');
            set({ token: null, user: null, isAuthenticated: false, isLoading: false, isHydrated: true });
          }
        } else {
          set({ isHydrated: true });
        }
      } catch (error) {
        handleError(error, 'hydrate: unexpected error');
        set({ isHydrated: true });
      }
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const response = await authApi.login({ email, password });
        const { user, token } = response.data;
        await SecureStore.setItemAsync('auth_token', token);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    register: async (data: RegisterData) => {
      set({ isLoading: true });
      try {
        const response = await authApi.register(data);
        const { user, token } = response.data;
        await SecureStore.setItemAsync('auth_token', token);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      try {
        await authApi.logout();
      } catch (error) {
        handleError(error, 'logout: API call failed');
      }
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch (error) {
        handleError(error, 'logout: failed to clear token');
      }
      set({ user: null, token: null, isAuthenticated: false });
    },

    fetchProfile: async () => {
      try {
        const response = await authApi.profile();
        const user = response.data.user || response.data.data || response.data;
        set({ user, isAuthenticated: true });
      } catch (error) {
        handleError(error, 'fetchProfile: failed');
        await SecureStore.deleteItemAsync('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    },

    setUser: (user: User) => set({ user }),

    enableBiometric: async () => {
      const available = await isBiometricAvailable();
      if (!available) return false;

      const success = await authenticateWithBiometrics();
      if (success) {
        await SecureStore.setItemAsync('biometric_enabled', 'true');
        set({ biometricEnabled: true });
        setupAppStateListener();
        return true;
      }
      return false;
    },

    disableBiometric: async () => {
      await SecureStore.deleteItemAsync('biometric_enabled');
      set({ biometricEnabled: false });
    },

    promptBiometricIfEnabled: async () => {
      const { biometricEnabled } = get();
      if (!biometricEnabled) return true;
      return authenticateWithBiometrics();
    },
  };
});
