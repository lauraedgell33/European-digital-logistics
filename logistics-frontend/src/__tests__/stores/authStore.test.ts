import { act } from '@testing-library/react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
    profile: jest.fn(),
    register: jest.fn(),
  },
  api: {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock('@/lib/cookies', () => ({
  setAuthCookie: jest.fn(),
  removeAuthCookie: jest.fn(),
}));

const mockUser = {
  id: 1,
  company_id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin' as const,
  language: 'en',
  is_active: true,
};

describe('authStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state
    const { setState } = useAuthStore;
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('has initial state with null user and token', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('login sets user, token, and isAuthenticated', async () => {
    (authApi.login as jest.Mock).mockResolvedValue({
      data: { user: mockUser, token: 'test-token-123' },
    });

    await act(async () => {
      await useAuthStore.getState().login('test@example.com', 'password123');
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('test-token-123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(localStorage.getItem('auth_token')).toBe('test-token-123');
  });

  it('login sets isLoading during request', async () => {
    let resolveLogin: (value: unknown) => void;
    (authApi.login as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    const loginPromise = act(async () => {
      const promise = useAuthStore.getState().login('test@example.com', 'pass');
      // isLoading should be true while request is pending
      expect(useAuthStore.getState().isLoading).toBe(true);
      resolveLogin!({ data: { user: mockUser, token: 'tok' } });
      await promise;
    });

    await loginPromise;
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('login throws and resets isLoading on failure', async () => {
    const error = { response: { data: { message: 'Invalid credentials' } } };
    (authApi.login as jest.Mock).mockRejectedValue(error);

    await expect(
      act(async () => {
        await useAuthStore.getState().login('bad@email.com', 'wrong');
      }),
    ).rejects.toEqual(error);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('logout clears user, token, and isAuthenticated', async () => {
    // First set up authenticated state
    useAuthStore.setState({
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
    });
    localStorage.setItem('auth_token', 'test-token');

    (authApi.logout as jest.Mock).mockResolvedValue({});

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('logout clears state even if API call fails', async () => {
    useAuthStore.setState({
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
    });

    (authApi.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('fetchProfile updates user data on success', async () => {
    (authApi.profile as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    await act(async () => {
      await useAuthStore.getState().fetchProfile();
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('fetchProfile clears state on failure', async () => {
    useAuthStore.setState({
      user: mockUser,
      token: 'old-token',
      isAuthenticated: true,
    });

    (authApi.profile as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

    await act(async () => {
      await useAuthStore.getState().fetchProfile();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setUser updates user', () => {
    act(() => {
      useAuthStore.getState().setUser(mockUser);
    });

    expect(useAuthStore.getState().user).toEqual(mockUser);
  });
});
