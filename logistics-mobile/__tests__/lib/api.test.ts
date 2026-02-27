import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// We need to test the actual interceptors, so we import the real module
// but the mocks from jest.setup.ts are already in place for SecureStore

describe('api client', () => {
  let api: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the module cache so we get a fresh axios instance each time
    jest.resetModules();
  });

  it('has correct base URL in dev mode', () => {
    // __DEV__ is set to true in jest.setup.ts, Platform.OS is 'ios'
    const { api: apiInstance } = require('@/lib/api');
    expect(apiInstance.defaults.baseURL).toBe('http://localhost:8000/api/v1');
  });

  it('sets Content-Type and Accept headers', () => {
    const { api: apiInstance } = require('@/lib/api');
    expect(apiInstance.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiInstance.defaults.headers['Accept']).toBe('application/json');
  });

  it('has a 15 second timeout', () => {
    const { api: apiInstance } = require('@/lib/api');
    expect(apiInstance.defaults.timeout).toBe(15000);
  });

  describe('request interceptor', () => {
    it('adds auth token to request headers when token exists', async () => {
      // Re-require SecureStore after resetModules to get the same mock instance as the api module
      const SecureStoreFresh = require('expo-secure-store');
      (SecureStoreFresh.getItemAsync as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'auth_token') return 'test-bearer-token';
        if (key === 'language') return 'de';
        return null;
      });

      const { api: apiInstance } = require('@/lib/api');

      // Get the request interceptor and call it directly
      const interceptors = (apiInstance.interceptors.request as any).handlers;
      const requestInterceptor = interceptors[0];

      const config = { headers: {} as any };
      const result = await requestInterceptor.fulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer test-bearer-token');
      expect(result.headers['Accept-Language']).toBe('de');
    });

    it('uses default language when none is stored', async () => {
      const SecureStoreFresh = require('expo-secure-store');
      (SecureStoreFresh.getItemAsync as jest.Mock).mockImplementation(async (key: string) => {
        return null;
      });

      const { api: apiInstance } = require('@/lib/api');

      const interceptors = (apiInstance.interceptors.request as any).handlers;
      const requestInterceptor = interceptors[0];

      const config = { headers: {} as any };
      const result = await requestInterceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(result.headers['Accept-Language']).toBe('en');
    });
  });

  describe('response interceptor', () => {
    it('passes through successful responses', async () => {
      const { api: apiInstance } = require('@/lib/api');

      const interceptors = (apiInstance.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const mockResponse = { status: 200, data: { success: true } };
      const result = await responseInterceptor.fulfilled(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('deletes stored token on 401 error', async () => {
      const { api: apiInstance } = require('@/lib/api');
      const SecureStoreFresh = require('expo-secure-store');

      const interceptors = (apiInstance.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const error = { response: { status: 401 } };

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
      expect(SecureStoreFresh.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('rejects non-401 errors without clearing token', async () => {
      const { api: apiInstance } = require('@/lib/api');
      const SecureStoreFresh = require('expo-secure-store');

      const interceptors = (apiInstance.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const error = { response: { status: 500 } };

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);
      expect(SecureStoreFresh.deleteItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('API endpoints', () => {
    it('exports authApi with expected methods', () => {
      const { authApi } = require('@/lib/api');
      expect(authApi.login).toBeDefined();
      expect(authApi.logout).toBeDefined();
      expect(authApi.register).toBeDefined();
      expect(authApi.profile).toBeDefined();
      expect(authApi.updateProfile).toBeDefined();
      expect(authApi.changePassword).toBeDefined();
      expect(authApi.forgotPassword).toBeDefined();
      expect(authApi.resetPassword).toBeDefined();
    });

    it('exports freightApi with expected methods', () => {
      const { freightApi } = require('@/lib/api');
      expect(freightApi.list).toBeDefined();
      expect(freightApi.search).toBeDefined();
      expect(freightApi.create).toBeDefined();
      expect(freightApi.get).toBeDefined();
      expect(freightApi.update).toBeDefined();
      expect(freightApi.delete).toBeDefined();
    });

    it('exports orderApi with expected methods', () => {
      const { orderApi } = require('@/lib/api');
      expect(orderApi.list).toBeDefined();
      expect(orderApi.create).toBeDefined();
      expect(orderApi.get).toBeDefined();
      expect(orderApi.accept).toBeDefined();
      expect(orderApi.reject).toBeDefined();
    });

    it('exports vehicleApi with expected methods', () => {
      const { vehicleApi } = require('@/lib/api');
      expect(vehicleApi.list).toBeDefined();
      expect(vehicleApi.search).toBeDefined();
      expect(vehicleApi.create).toBeDefined();
      expect(vehicleApi.get).toBeDefined();
    });
  });
});
