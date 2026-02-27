import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/v1'
    : 'http://localhost:8000/api/v1'
  : 'https://api.logimarket.eu/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = await SecureStore.getItemAsync('language');
    config.headers['Accept-Language'] = lang || 'en';
  } catch {}
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch {}
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { email: string; password: string; password_confirmation: string; token: string }) =>
    api.post('/auth/reset-password', data),
};

// ── Freight API ───────────────────────────────────────
export const freightApi = {
  list: (params?: any) => api.get('/freight', { params }),
  search: (data: any) => api.post('/freight/search', data),
  create: (data: any) => api.post('/freight', data),
  get: (id: number) => api.get(`/freight/${id}`),
  update: (id: number, data: any) => api.put(`/freight/${id}`, data),
  delete: (id: number) => api.delete(`/freight/${id}`),
  myOffers: (params?: any) => api.get('/freight/my/offers', { params }),
};

// ── Vehicle API ───────────────────────────────────────
export const vehicleApi = {
  list: (params?: any) => api.get('/vehicles', { params }),
  search: (data: any) => api.post('/vehicles/search', data),
  create: (data: any) => api.post('/vehicles', data),
  get: (id: number) => api.get(`/vehicles/${id}`),
  update: (id: number, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  myOffers: (params?: any) => api.get('/vehicles/my/offers', { params }),
};

// ── Order API ─────────────────────────────────────────
export const orderApi = {
  list: (params?: any) => api.get('/orders', { params }),
  create: (data: any) => api.post('/orders', data),
  get: (id: number) => api.get(`/orders/${id}`),
  accept: (id: number) => api.post(`/orders/${id}/accept`),
  reject: (id: number) => api.post(`/orders/${id}/reject`),
  updateStatus: (id: number, data: any) => api.put(`/orders/${id}/status`, data),
  cancel: (id: number, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),
  statistics: () => api.get('/orders/stats/overview'),
  documents: (id: number) => api.get(`/orders/${id}/documents`),
  uploadDocument: (id: number, uri: string, name: string, collection: string) => {
    const form = new FormData();
    form.append('file', {
      uri,
      name,
      type: 'application/octet-stream',
    } as any);
    form.append('collection', collection);
    return api.post(`/orders/${id}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument: (orderId: number, mediaId: number) =>
    api.delete(`/orders/${orderId}/documents/${mediaId}`),
};

// ── Tender API ────────────────────────────────────────
export const tenderApi = {
  list: (params?: any) => api.get('/tenders', { params }),
  create: (data: any) => api.post('/tenders', data),
  get: (id: number) => api.get(`/tenders/${id}`),
  update: (id: number, data: any) => api.put(`/tenders/${id}`, data),
  submitBid: (tenderId: number, data: any) => api.post(`/tenders/${tenderId}/bids`, data),
  awardBid: (tenderId: number, bidId: number) => api.post(`/tenders/${tenderId}/bids/${bidId}/award`),
  myTenders: (params?: any) => api.get('/tenders/my/tenders', { params }),
  myBids: (params?: any) => api.get('/tenders/my/bids', { params }),
};

// ── Tracking API ──────────────────────────────────────
export const trackingApi = {
  track: (code: string) => api.get(`/tracking/${code}`),
  activeShipments: () => api.get('/tracking/active'),
  positions: (shipmentId: number) => api.get(`/tracking/${shipmentId}/history`),
  updatePosition: (id: number, data: any) => api.put(`/tracking/${id}/position`, data),
  history: (id: number) => api.get(`/tracking/${id}/history`),
  events: (id: number) => api.get(`/tracking/${id}/events`),
  addEvent: (id: number, data: any) => api.post(`/tracking/${id}/events`, data),
  eta: (id: number) => api.get(`/tracking/${id}/eta`),
};

// ── Network API ───────────────────────────────────────
export const networkApi = {
  list: (params?: any) => api.get('/networks', { params }),
  create: (data: any) => api.post('/networks', data),
  get: (id: number) => api.get(`/networks/${id}`),
  join: (accessCode: string) => api.post('/networks/join', { access_code: accessCode }),
  invite: (networkId: number, companyId: number) =>
    api.post(`/networks/${networkId}/invite`, { company_id: companyId }),
  removeMember: (networkId: number, companyId: number) =>
    api.delete(`/networks/${networkId}/members/${companyId}`),
  leave: (networkId: number) => api.post(`/networks/${networkId}/leave`),
};

// ── Dashboard API ─────────────────────────────────────
export const dashboardApi = {
  index: () => api.get('/dashboard'),
  analytics: (period?: string) => api.get('/dashboard/analytics', { params: { period } }),
};

// ── Notifications API ─────────────────────────────────
export const notificationApi = {
  list: () => api.get('/notifications'),
  markAllRead: () => api.post('/notifications/read-all'),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  registerDevice: (data: { token: string; platform: string; device_name: string }) =>
    api.post('/notifications/register-device', data),
};

// ── Messaging API ─────────────────────────────────────
export const messageApi = {
  conversations: (params?: any) => api.get('/messages/conversations', { params }),
  startConversation: (data: {
    recipient_id: number;
    message: string;
    subject?: string;
    type?: string;
    reference_type?: string;
    reference_id?: number;
  }) => api.post('/messages/conversations', data),
  messages: (conversationId: number, params?: any) =>
    api.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage: (conversationId: number, data: { body: string; type?: string; metadata?: any }) =>
    api.post(`/messages/conversations/${conversationId}`, data),
  markRead: (conversationId: number) => api.post(`/messages/conversations/${conversationId}/read`),
  unreadCount: () => api.get('/messages/unread-count'),
};

// ── Matching API ──────────────────────────────────────
export const matchingApi = {
  matchFreight: (freightId: number) => api.get(`/matching/freight/${freightId}`),
  matchVehicle: (vehicleId: number) => api.get(`/matching/vehicle/${vehicleId}`),
};

// ── Company Directory API ─────────────────────────────
export const companyApi = {
  list: (params?: any) => api.get('/companies', { params }),
  get: (id: number) => api.get(`/companies/${id}`),
  update: (id: number, data: Record<string, string>) => api.put(`/companies/${id}`, data),
};

export default api;
