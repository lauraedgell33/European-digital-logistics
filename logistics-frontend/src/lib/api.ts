import axios from 'axios';
import { removeAuthCookie } from '@/lib/cookies';
import type {
  ListParams,
  FreightSearchParams,
  VehicleSearchParams,
  OrderStatusUpdate,
  TrackingPositionUpdate,
  TrackingEventInput,
  NetworkCreateInput,
  RouteCalculateInput,
  PricingCalculateInput,
  MessageInput,
  ConversationStartInput,
} from '@/types';
import type {
  RegisterFormData,
  ProfileFormData,
  ChangePasswordFormData,
  FreightOfferFormData,
  VehicleOfferFormData,
  TransportOrderFormData,
  TenderFormData,
  TenderBidFormData,
} from '@/lib/validations';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - attach auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const lang = localStorage.getItem('language') || 'en';
    config.headers['Accept-Language'] = lang;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        removeAuthCookie();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────
export const authApi = {
  register: (data: RegisterFormData) => api.post('/auth/register', data),
  login: (data: { email: string; password: string; recaptcha_token?: string | null }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data: ProfileFormData) => api.put('/auth/profile', data),
  changePassword: (data: ChangePasswordFormData) => api.post('/auth/change-password', data),
  forgotPassword: (data: { email: string; recaptcha_token?: string | null }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { email: string; password: string; password_confirmation: string; token: string }) =>
    api.post('/auth/reset-password', data),
};

// ── Freight API ───────────────────────────────────────
export const freightApi = {
  list: (params?: ListParams) => api.get('/freight', { params }),
  search: (data: FreightSearchParams) => api.post('/freight/search', data),
  create: (data: FreightOfferFormData) => api.post('/freight', data),
  get: (id: number) => api.get(`/freight/${id}`),
  update: (id: number, data: Partial<FreightOfferFormData>) => api.put(`/freight/${id}`, data),
  delete: (id: number) => api.delete(`/freight/${id}`),
  myOffers: (params?: ListParams) => api.get('/freight/my/offers', { params }),
};

// ── Vehicle API ───────────────────────────────────────
export const vehicleApi = {
  list: (params?: ListParams) => api.get('/vehicles', { params }),
  search: (data: VehicleSearchParams) => api.post('/vehicles/search', data),
  create: (data: VehicleOfferFormData) => api.post('/vehicles', data),
  get: (id: number) => api.get(`/vehicles/${id}`),
  update: (id: number, data: Partial<VehicleOfferFormData>) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  myOffers: (params?: ListParams) => api.get('/vehicles/my/offers', { params }),
};

// ── Order API ─────────────────────────────────────────
export const orderApi = {
  list: (params?: ListParams) => api.get('/orders', { params }),
  create: (data: TransportOrderFormData) => api.post('/orders', data),
  get: (id: number) => api.get(`/orders/${id}`),
  accept: (id: number) => api.post(`/orders/${id}/accept`),
  reject: (id: number) => api.post(`/orders/${id}/reject`),
  updateStatus: (id: number, data: OrderStatusUpdate) => api.put(`/orders/${id}/status`, data),
  cancel: (id: number, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),
  statistics: () => api.get('/orders/stats/overview'),
  documents: (id: number) => api.get(`/orders/${id}/documents`),
  uploadDocument: (id: number, file: File, collection: string) => {
    const form = new FormData();
    form.append('file', file);
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
  create: (data: TenderFormData) => api.post('/tenders', data),
  get: (id: number) => api.get(`/tenders/${id}`),
  update: (id: number, data: Partial<TenderFormData>) => api.put(`/tenders/${id}`, data),
  submitBid: (tenderId: number, data: TenderBidFormData) => api.post(`/tenders/${tenderId}/bids`, data),
  awardBid: (tenderId: number, bidId: number) => api.post(`/tenders/${tenderId}/bids/${bidId}/award`),
  myTenders: (params?: ListParams) => api.get('/tenders/my/tenders', { params }),
  myBids: (params?: ListParams) => api.get('/tenders/my/bids', { params }),
};

// ── Tracking API ──────────────────────────────────────
export const trackingApi = {
  track: (code: string) => api.get(`/tracking/${code}`),
  activeShipments: () => api.get('/tracking/active'),
  updatePosition: (id: number, data: TrackingPositionUpdate) => api.put(`/tracking/${id}/position`, data),
  history: (id: number) => api.get(`/tracking/${id}/history`),
  events: (id: number) => api.get(`/tracking/${id}/events`),
  addEvent: (id: number, data: TrackingEventInput) => api.post(`/tracking/${id}/events`, data),
  eta: (id: number) => api.get(`/tracking/${id}/eta`),
};

// ── Network API ───────────────────────────────────────
export const networkApi = {
  list: () => api.get('/networks'),
  create: (data: NetworkCreateInput) => api.post('/networks', data),
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
};

// ── Messaging API ─────────────────────────────────────
export const messageApi = {
  conversations: (params?: ListParams) => api.get('/messages/conversations', { params }),
  startConversation: (data: ConversationStartInput) =>
    api.post('/messages/conversations', data),
  messages: (conversationId: number, params?: ListParams) => api.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage: (conversationId: number, data: MessageInput) =>
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
};

// ── Route & Pricing API ──────────────────────────────
export const routeApi = {
  calculate: (data: RouteCalculateInput) => api.post('/routes/calculate', data),
};

export const pricingApi = {
  calculate: (data: PricingCalculateInput) => api.post('/pricing/calculate', data),
};

export default api;
