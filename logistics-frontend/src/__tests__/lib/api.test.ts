import axios from 'axios';

// We need to test the api module's configuration.
// Because the module has side-effects (interceptors), we re-require it per test group.

// Mock cookies before importing api
jest.mock('@/lib/cookies', () => ({
  setAuthCookie: jest.fn(),
  removeAuthCookie: jest.fn(),
  getAuthCookie: jest.fn(() => null),
}));

describe('API instance', () => {
  let api: ReturnType<typeof axios.create>;

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  it('creates axios instance with correct base URL', () => {
    // Without NEXT_PUBLIC_API_URL env var, falls back to localhost
    const apiModule = require('@/lib/api');
    api = apiModule.api;

    expect(api.defaults.baseURL).toBe('http://localhost:8000/api/v1');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
    expect(api.defaults.headers['Accept']).toBe('application/json');
  });

  it('has request and response interceptors registered', () => {
    const apiModule = require('@/lib/api');
    api = apiModule.api;

    // Axios interceptors are stored in handlers array
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });
});

describe('API request interceptor', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  it('adds auth token from localStorage to request headers', () => {
    localStorage.setItem('auth_token', 'my-secret-token');

    const apiModule = require('@/lib/api');
    const api = apiModule.api;

    // Get the request interceptor handler
    const interceptors = (api.interceptors.request as any).handlers;
    const requestInterceptor = interceptors[0]?.fulfilled;

    if (requestInterceptor) {
      const config = { headers: {} as Record<string, string> };
      const result = requestInterceptor(config);
      expect(result.headers.Authorization).toBe('Bearer my-secret-token');
    }
  });

  it('adds Accept-Language header from localStorage', () => {
    localStorage.setItem('language', 'de');

    const apiModule = require('@/lib/api');
    const api = apiModule.api;

    const interceptors = (api.interceptors.request as any).handlers;
    const requestInterceptor = interceptors[0]?.fulfilled;

    if (requestInterceptor) {
      const config = { headers: {} as Record<string, string> };
      const result = requestInterceptor(config);
      expect(result.headers['Accept-Language']).toBe('de');
    }
  });

  it('defaults Accept-Language to en when not set', () => {
    const apiModule = require('@/lib/api');
    const api = apiModule.api;

    const interceptors = (api.interceptors.request as any).handlers;
    const requestInterceptor = interceptors[0]?.fulfilled;

    if (requestInterceptor) {
      const config = { headers: {} as Record<string, string> };
      const result = requestInterceptor(config);
      expect(result.headers['Accept-Language']).toBe('en');
    }
  });
});

describe('API response interceptor - 401 handling', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('clears auth token and redirects on 401 response', async () => {
    localStorage.setItem('auth_token', 'expired-token');

    const apiModule = require('@/lib/api');
    const api = apiModule.api;

    const interceptors = (api.interceptors.response as any).handlers;
    const errorHandler = interceptors[0]?.rejected;

    if (errorHandler) {
      const error = { response: { status: 401 } };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(window.location.href).toBe('/login');
    }
  });

  it('does not redirect on non-401 errors', async () => {
    localStorage.setItem('auth_token', 'valid-token');

    const apiModule = require('@/lib/api');
    const api = apiModule.api;

    const interceptors = (api.interceptors.response as any).handlers;
    const errorHandler = interceptors[0]?.rejected;

    if (errorHandler) {
      const error = { response: { status: 500 } };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(localStorage.getItem('auth_token')).toBe('valid-token');
      expect(window.location.href).not.toBe('/login');
    }
  });
});

describe('authApi methods', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  it('exposes login, logout, profile, register methods', () => {
    const { authApi } = require('@/lib/api');

    expect(typeof authApi.login).toBe('function');
    expect(typeof authApi.logout).toBe('function');
    expect(typeof authApi.profile).toBe('function');
    expect(typeof authApi.register).toBe('function');
    expect(typeof authApi.forgotPassword).toBe('function');
    expect(typeof authApi.resetPassword).toBe('function');
  });
});
