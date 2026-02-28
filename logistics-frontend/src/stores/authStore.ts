import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/lib/api';
import { setAuthCookie, removeAuthCookie } from '@/lib/cookies';
import { tokenStorage } from '@/lib/tokenStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, recaptchaToken?: string | null) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
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
  country: string;
  accept_terms: true;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, recaptchaToken?: string | null) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password, recaptcha_token: recaptchaToken });
          const { user, token } = response.data;
          set({ user, token, isAuthenticated: true, isLoading: false });
          tokenStorage.setToken(token);
          setAuthCookie(token);
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
          set({ user, token, isAuthenticated: true, isLoading: false });
          tokenStorage.setToken(token);
          setAuthCookie(token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (e) {
          // ignore errors on logout
        }
        tokenStorage.removeToken();
        removeAuthCookie();
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchProfile: async () => {
        try {
          const response = await authApi.profile();
          set({ user: response.data.user || response.data.data || response.data, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          tokenStorage.removeToken();
          removeAuthCookie();
        }
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
