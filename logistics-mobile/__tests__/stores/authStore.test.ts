import * as SecureStore from 'expo-secure-store';

// We need to mock the API *before* importing the store
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
    profile: jest.fn(),
    register: jest.fn(),
  },
  api: {
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
    });
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.isHydrated).toBe(false);
  });

  describe('login', () => {
    it('stores token and user on successful login', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@example.com', role: 'admin' };
      const mockToken = 'test-token-123';

      mockedAuthApi.login.mockResolvedValueOnce({
        data: { user: mockUser, token: mockToken },
      } as any);

      await useAuthStore.getState().login('john@example.com', 'password');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockToken);
    });

    it('sets isLoading back to false on login failure', async () => {
      mockedAuthApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login('bad@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears state and deletes token', async () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: { id: 1, name: 'John', email: 'john@example.com' } as any,
        token: 'token',
        isAuthenticated: true,
      });

      mockedAuthApi.logout.mockResolvedValueOnce({} as any);

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('clears state even when API logout fails', async () => {
      useAuthStore.setState({
        user: { id: 1, name: 'John', email: 'john@example.com' } as any,
        token: 'token',
        isAuthenticated: true,
      });

      mockedAuthApi.logout.mockRejectedValueOnce(new Error('Network error'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('hydrate', () => {
    it('restores authenticated state from SecureStore when token exists', async () => {
      const mockUser = { id: 1, name: 'Jane', email: 'jane@example.com' };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-token');
      mockedAuthApi.profile.mockResolvedValueOnce({
        data: { user: mockUser },
      } as any);

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('stored-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isHydrated).toBe(true);
    });

    it('sets isHydrated when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
    });

    it('clears token and sets isHydrated when profile fetch fails', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('expired-token');
      mockedAuthApi.profile.mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });
  });
});
