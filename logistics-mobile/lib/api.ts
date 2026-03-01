import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type {
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  FreightFilters,
  FreightCreateData,
  VehicleFilters,
  VehicleCreateData,
  OrderFilters,
  OrderCreateData,
  OrderStatusUpdate,
  TenderCreateData,
  TenderBidData,
  TrackingPositionUpdate,
  TrackingEventData,
  NetworkCreateData,
  ListParams,
  EcmrCreateData,
  MultimodalSearchData,
  MultimodalBookData,
  InvoiceCreateData,
} from '@/types/api';

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
  } catch (error) {
    if (__DEV__) console.error('Auth interceptor error:', error);
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch (storeError) {
        if (__DEV__) console.error('Failed to clear auth token:', storeError);
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────
export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data: UpdateProfileData) => api.put('/auth/profile', data),
  changePassword: (data: ChangePasswordData) => api.post('/auth/change-password', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { email: string; password: string; password_confirmation: string; token: string }) =>
    api.post('/auth/reset-password', data),
};

// ── Freight API ───────────────────────────────────────
export const freightApi = {
  list: (params?: FreightFilters) => api.get('/freight', { params }),
  search: (data: FreightFilters) => api.post('/freight/search', data),
  create: (data: FreightCreateData) => api.post('/freight', data),
  get: (id: number) => api.get(`/freight/${id}`),
  update: (id: number, data: Partial<FreightCreateData>) => api.put(`/freight/${id}`, data),
  delete: (id: number) => api.delete(`/freight/${id}`),
  myOffers: (params?: FreightFilters) => api.get('/freight/my/offers', { params }),
};

// ── Vehicle API ───────────────────────────────────────
export const vehicleApi = {
  list: (params?: VehicleFilters) => api.get('/vehicles', { params }),
  search: (data: VehicleFilters) => api.post('/vehicles/search', data),
  create: (data: VehicleCreateData) => api.post('/vehicles', data),
  get: (id: number) => api.get(`/vehicles/${id}`),
  update: (id: number, data: Partial<VehicleCreateData>) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  myOffers: (params?: VehicleFilters) => api.get('/vehicles/my/offers', { params }),
};

// ── Order API ─────────────────────────────────────────
export const orderApi = {
  list: (params?: OrderFilters) => api.get('/orders', { params }),
  create: (data: OrderCreateData) => api.post('/orders', data),
  get: (id: number) => api.get(`/orders/${id}`),
  accept: (id: number) => api.post(`/orders/${id}/accept`),
  reject: (id: number) => api.post(`/orders/${id}/reject`),
  updateStatus: (id: number, data: OrderStatusUpdate) => api.put(`/orders/${id}/status`, data),
  cancel: (id: number, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),
  statistics: () => api.get('/orders/stats/overview'),
  documents: (id: number) => api.get(`/orders/${id}/documents`),
  uploadDocument: (id: number, uri: string, name: string, collection: string) => {
    const form = new FormData();
    form.append('file', {
      uri,
      name,
      type: 'application/octet-stream',
    } as unknown as Blob);
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
  list: (params?: ListParams) => api.get('/tenders', { params }),
  create: (data: TenderCreateData) => api.post('/tenders', data),
  get: (id: number) => api.get(`/tenders/${id}`),
  update: (id: number, data: Partial<TenderCreateData>) => api.put(`/tenders/${id}`, data),
  submitBid: (tenderId: number, data: TenderBidData) => api.post(`/tenders/${tenderId}/bids`, data),
  awardBid: (tenderId: number, bidId: number) => api.post(`/tenders/${tenderId}/bids/${bidId}/award`),
  myTenders: (params?: ListParams) => api.get('/tenders/my/tenders', { params }),
  myBids: (params?: ListParams) => api.get('/tenders/my/bids', { params }),
};

// ── Tracking API ──────────────────────────────────────
export const trackingApi = {
  track: (code: string) => api.get(`/tracking/${code}`),
  activeShipments: () => api.get('/tracking/active'),
  positions: (shipmentId: number) => api.get(`/tracking/${shipmentId}/history`),
  updatePosition: (id: number, data: TrackingPositionUpdate) => api.put(`/tracking/${id}/position`, data),
  history: (id: number) => api.get(`/tracking/${id}/history`),
  events: (id: number) => api.get(`/tracking/${id}/events`),
  addEvent: (id: number, data: TrackingEventData) => api.post(`/tracking/${id}/events`, data),
  eta: (id: number) => api.get(`/tracking/${id}/eta`),
};

// ── Network API ───────────────────────────────────────
export const networkApi = {
  list: (params?: ListParams) => api.get('/networks', { params }),
  create: (data: NetworkCreateData) => api.post('/networks', data),
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
  conversations: (params?: ListParams) => api.get('/messages/conversations', { params }),
  startConversation: (data: {
    recipient_id: number;
    message: string;
    subject?: string;
    type?: string;
    reference_type?: string;
    reference_id?: number;
  }) => api.post('/messages/conversations', data),
  messages: (conversationId: number, params?: ListParams) =>
    api.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage: (conversationId: number, data: { body: string; type?: string; metadata?: Record<string, unknown> }) =>
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
  list: (params?: ListParams) => api.get('/companies', { params }),
  get: (id: number) => api.get(`/companies/${id}`),
  update: (id: number, data: Record<string, string>) => api.put(`/companies/${id}`, data),
};

// ── eCMR API ──────────────────────────────────────────
export const ecmrApi = {
  list: (params?: ListParams) => api.get('/ecmr', { params }),
  get: (id: number) => api.get(`/ecmr/${id}`),
  create: (data: EcmrCreateData) => api.post('/ecmr', data),
  sign: (id: number, data: { role: string; signature: string; signed_at: string }) =>
    api.post(`/ecmr/${id}/sign`, data),
  verify: (id: number) => api.get(`/ecmr/${id}/verify`),
};

// ── Document OCR API ──────────────────────────────────
export const documentOcrApi = {
  list: (params?: ListParams) => api.get('/documents/ocr', { params }),
  scan: (uri: string, documentType: string) => {
    const form = new FormData();
    form.append('file', {
      uri,
      name: `scan_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);
    form.append('document_type', documentType);
    return api.post('/documents/ocr/scan', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },
  get: (id: number) => api.get(`/documents/ocr/${id}`),
  validate: (id: number) => api.post(`/documents/ocr/${id}/validate`),
  stats: () => api.get('/documents/ocr/stats'),
};

// ── AI Matching API (Mobile) ──────────────────────────
export const aiMatchingMobileApi = {
  match: (data: { freight_id?: number; vehicle_id?: number }) =>
    api.post('/ai-matching/match', data),
  suggestions: () => api.get('/ai-matching/suggestions'),
};

// ── Multimodal API (Mobile) ───────────────────────────
export const multimodalMobileApi = {
  search: (data: MultimodalSearchData) => api.post('/multimodal/search', data),
  bookings: (params?: ListParams) => api.get('/multimodal/bookings', { params }),
  book: (data: MultimodalBookData) => api.post('/multimodal/book', data),
};

// ── Invoice API (Mobile) ─────────────────────────────
export const invoiceMobileApi = {
  list: (params?: ListParams) => api.get('/invoices', { params }),
  get: (id: number) => api.get(`/invoices/${id}`),
  create: (data: InvoiceCreateData) => api.post('/invoices', data),
  stats: () => api.get('/invoices/stats'),
};

export default api;
