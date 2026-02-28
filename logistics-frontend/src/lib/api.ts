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

// ── Warehouse API ─────────────────────────────────────
export const warehouseApi = {
  list: (params?: Record<string, unknown>) => api.get('/warehouses', { params }),
  create: (data: Record<string, unknown>) => api.post('/warehouses', data),
  get: (id: number) => api.get(`/warehouses/${id}`),
  update: (id: number, data: Record<string, unknown>) => api.put(`/warehouses/${id}`, data),
  delete: (id: number) => api.delete(`/warehouses/${id}`),
  search: (params: Record<string, unknown>) => api.get('/warehouses/search', { params }),
  myWarehouses: () => api.get('/warehouses/my'),
  book: (id: number, data: Record<string, unknown>) => api.post(`/warehouses/${id}/book`, data),
  myBookings: () => api.get('/warehouses/bookings/my'),
  bookingRequests: () => api.get('/warehouses/bookings/requests'),
  updateBookingStatus: (bookingId: number, data: { status: 'confirmed' | 'cancelled' }) =>
    api.put(`/warehouses/bookings/${bookingId}/status`, data),
};

// ── Barometer API ─────────────────────────────────────
export const barometerApi = {
  overview: () => api.get('/barometer/overview'),
  route: (params: { origin_country: string; destination_country: string; months?: number }) =>
    api.get('/barometer/route', { params }),
  heatmap: () => api.get('/barometer/heatmap'),
  priceTrends: (params?: { months?: number }) => api.get('/barometer/price-trends', { params }),
};

// ── Driving Bans API ──────────────────────────────────
export const drivingBanApi = {
  list: (params?: Record<string, unknown>) => api.get('/driving-bans', { params }),
  active: () => api.get('/driving-bans/active'),
  checkRoute: (data: { countries: string[]; departure_time?: string }) =>
    api.post('/driving-bans/check-route', data),
  types: () => api.get('/driving-bans/types'),
  countries: () => api.get('/driving-bans/countries'),
  country: (code: string) => api.get(`/driving-bans/countries/${code}`),
};

// ── Carbon Footprint API ──────────────────────────────
export const carbonApi = {
  calculate: (data: { distance_km: number; vehicle_type: string; fuel_type?: string; weight_kg?: number; load_factor_pct?: number; emission_standard?: string }) =>
    api.post('/carbon/calculate', data),
  dashboard: (months?: number) => api.get('/carbon/dashboard', { params: { months } }),
  forOrder: (orderId: number) => api.get(`/carbon/orders/${orderId}`),
  calculateForOrder: (orderId: number, data?: Record<string, unknown>) =>
    api.post(`/carbon/orders/${orderId}`, data),
  purchaseOffset: (footprintId: number) => api.post(`/carbon/${footprintId}/offset`),
  emissionFactors: () => api.get('/carbon/emission-factors'),
};

// ── Lexicon API ───────────────────────────────────────
export const lexiconApi = {
  list: (params?: { category?: string; language?: string; tag?: string; search?: string; page?: number }) =>
    api.get('/lexicon', { params }),
  get: (slug: string) => api.get(`/lexicon/${slug}`),
  categories: () => api.get('/lexicon/categories'),
  popular: (limit?: number) => api.get('/lexicon/popular', { params: { limit } }),
};

// ── Tracking Share API ────────────────────────────────
export const trackingShareApi = {
  create: (data: { shipment_id: number; recipient_name?: string; recipient_email?: string; expires_at?: string; permissions?: string[] }) =>
    api.post('/tracking-shares', data),
  forShipment: (shipmentId: number) => api.get(`/tracking-shares/shipment/${shipmentId}`),
  revoke: (shareId: number) => api.delete(`/tracking-shares/${shareId}`),
  viewShared: (token: string) => api.get(`/tracking/shared/${token}`),
};

// ── Price Insights API ────────────────────────────────
export const priceInsightApi = {
  route: (params: { origin_country: string; destination_country: string; origin_city?: string; destination_city?: string; vehicle_type?: string; months?: number }) =>
    api.get('/price-insights/route', { params }),
  topRoutes: (limit?: number) => api.get('/price-insights/top-routes', { params: { limit } }),
  heatmap: () => api.get('/price-insights/heatmap'),
  compare: (routes: { origin_country: string; destination_country: string }[]) =>
    api.post('/price-insights/compare', { routes }),
  estimate: (data: { origin_country: string; destination_country: string; distance_km: number; vehicle_type?: string }) =>
    api.post('/price-insights/estimate', data),
};

// ── Return Load API ───────────────────────────────────
export const returnLoadApi = {
  suggest: (data: { current_country: string; current_city?: string; current_lat?: number; current_lng?: number; destination_country?: string; vehicle_type?: string; max_weight_kg?: number; max_radius_km?: number }) =>
    api.post('/return-loads/suggest', data),
  forOrder: (orderId: number) => api.get(`/return-loads/for-order/${orderId}`),
  emptyLegs: () => api.get('/return-loads/empty-legs'),
};

// ── Insurance API ─────────────────────────────────────
export const insuranceApi = {
  quote: (data: { cargo_value: number; coverage_type: 'basic' | 'all_risk' | 'extended'; distance_km?: number; is_hazardous?: boolean; cargo_type?: string }) =>
    api.post('/insurance/quote', data),
  createForOrder: (orderId: number, data: Record<string, unknown>) =>
    api.post(`/insurance/orders/${orderId}`, data),
  accept: (quoteId: number) => api.post(`/insurance/${quoteId}/accept`),
  fileClaim: (quoteId: number, data: { claim_description: string; claim_amount: number }) =>
    api.post(`/insurance/${quoteId}/claim`, data),
  myQuotes: (params?: ListParams) => api.get('/insurance/my', { params }),
  coverageTypes: () => api.get('/insurance/coverage-types'),
};

// ── Escrow API ────────────────────────────────────────
export const escrowApi = {
  list: (params?: { status?: string } & ListParams) => api.get('/escrow', { params }),
  create: (orderId: number, data: { amount: number; currency?: string }) =>
    api.post(`/escrow/orders/${orderId}`, data),
  forOrder: (orderId: number) => api.get(`/escrow/orders/${orderId}`),
  fund: (escrowId: number, paymentMethod?: string) =>
    api.post(`/escrow/${escrowId}/fund`, { payment_method: paymentMethod }),
  release: (escrowId: number) => api.post(`/escrow/${escrowId}/release`),
  dispute: (escrowId: number, reason: string) =>
    api.post(`/escrow/${escrowId}/dispute`, { reason }),
  refund: (escrowId: number) => api.post(`/escrow/${escrowId}/refund`),
  cancel: (escrowId: number) => api.post(`/escrow/${escrowId}/cancel`),
};

// ── Debt Collection API ──────────────────────────────
export const debtCollectionApi = {
  list: (params?: { status?: string } & ListParams) => api.get('/debt-collection', { params }),
  create: (data: Record<string, unknown>) => api.post('/debt-collection', data),
  get: (id: number) => api.get(`/debt-collection/${id}`),
  stats: () => api.get('/debt-collection/stats'),
  calculateFee: (amount: number) => api.post('/debt-collection/calculate-fee', { amount }),
  sendReminder: (id: number) => api.post(`/debt-collection/${id}/reminder`),
  escalate: (id: number) => api.post(`/debt-collection/${id}/escalate`),
  markPaid: (id: number, amount: number) => api.post(`/debt-collection/${id}/pay`, { amount }),
  cancel: (id: number, action: 'cancel' | 'write_off') =>
    api.post(`/debt-collection/${id}/cancel`, { action }),
};

export default api;
