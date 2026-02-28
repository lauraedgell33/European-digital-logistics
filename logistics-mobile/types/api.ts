// ── API Request/Response Types ────────────────────────
// These types replace `any` usage in the API layer

import type { User, FreightOffer, VehicleOffer, TransportOrder } from './index';

// ── Auth ──────────────────────────────────────────────
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  company_type: string;
  vat_number: string;
  country_code: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  language?: string;
  position?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  current_password: string;
  password?: string;
  new_password?: string;
  password_confirmation?: string;
  new_password_confirmation?: string;
}

// ── Freight ───────────────────────────────────────────
export interface FreightFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  status?: string;
  origin_country?: string;
  origin_city?: string;
  destination_country?: string;
  destination_city?: string;
  vehicle_type?: string;
  date_from?: string;
  date_to?: string;
  min_weight?: number;
  max_weight?: number;
}

export interface FreightCreateData {
  origin_country: string;
  origin_city: string;
  origin_postal_code?: string;
  origin_lat?: number;
  origin_lng?: number;
  origin_address?: string;
  destination_country: string;
  destination_city: string;
  destination_postal_code?: string;
  destination_lat?: number;
  destination_lng?: number;
  destination_address?: string;
  cargo_type: string;
  cargo_description?: string;
  description?: string;
  weight: number;
  volume?: number;
  length?: number;
  width?: number;
  height?: number;
  loading_meters?: number;
  pallet_count?: number;
  is_hazardous?: boolean;
  adr_class?: string;
  requires_temperature_control?: boolean;
  min_temperature?: number;
  max_temperature?: number;
  loading_date: string;
  loading_time_from?: string;
  loading_time_to?: string;
  unloading_date?: string;
  unloading_time_from?: string;
  unloading_time_to?: string;
  vehicle_type?: string;
  required_equipment?: string[];
  price?: number;
  currency?: string;
  price_type?: 'fixed' | 'per_km' | 'negotiable';
  is_public?: boolean;
  network_id?: number;
  notes?: string;
  [key: string]: unknown;
}

// ── Vehicle ───────────────────────────────────────────
export interface VehicleFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  status?: string;
  current_country?: string;
  current_city?: string;
  destination_country?: string;
  vehicle_type?: string;
  available_from?: string;
  available_to?: string;
  min_capacity?: number;
}

export interface VehicleCreateData {
  vehicle_type: string;
  vehicle_registration?: string;
  capacity_kg?: number;
  capacity_m3?: number;
  max_weight?: number;
  loading_meters?: number;
  pallet_spaces?: number;
  equipment?: string[];
  has_adr?: boolean;
  has_temperature_control?: boolean;
  min_temperature?: number;
  max_temperature?: number;
  current_country: string;
  current_city: string;
  current_postal_code?: string;
  current_lat?: number;
  current_lng?: number;
  destination_country?: string;
  destination_city?: string;
  available_from: string;
  available_to?: string;
  price_per_km?: number;
  flat_price?: number;
  currency?: string;
  is_public?: boolean;
  driver_name?: string;
  driver_phone?: string;
  notes?: string;
  description?: string;
  [key: string]: unknown;
}

// ── Order ─────────────────────────────────────────────
export interface OrderFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  status?: string;
}

export interface OrderCreateData {
  freight_offer_id?: number;
  vehicle_offer_id?: number;
  carrier_id?: number;
  pickup_country?: string;
  pickup_city: string;
  pickup_address: string;
  pickup_postal_code?: string;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  pickup_date: string;
  delivery_country?: string;
  delivery_city: string;
  delivery_address: string;
  delivery_postal_code?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_date: string;
  cargo_type: string;
  cargo_description?: string;
  weight: number;
  volume?: number;
  pallet_count?: number;
  total_price: number;
  currency?: string;
  payment_terms?: string;
  special_instructions?: string;
  [key: string]: unknown;
}

export interface OrderStatusUpdate {
  status: string;
  notes?: string;
  location?: string;
  [key: string]: unknown;
}

// ── Tender ────────────────────────────────────────────
export interface TenderCreateData {
  title: string;
  description: string;
  reference_number?: string;
  route_origin_country: string;
  route_origin_city: string;
  route_destination_country: string;
  route_destination_city: string;
  cargo_type?: string;
  vehicle_type?: string;
  frequency: string;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  budget?: number;
  currency?: string;
  budget_type?: 'per_shipment' | 'total' | 'per_month';
  is_public?: boolean;
}

export interface TenderBidData {
  proposed_price: number;
  currency?: string;
  proposal: string;
  transit_time_hours?: number;
}

// ── Tracking ──────────────────────────────────────────
export interface TrackingPositionUpdate {
  lat: number;
  lng: number;
  speed_kmh?: number;
  heading?: number;
  temperature?: number;
  battery_level?: number;
}

export interface TrackingEventData {
  event_type: string;
  description?: string;
  lat?: number;
  lng?: number;
  location_name?: string;
}

// ── Network ───────────────────────────────────────────
export interface NetworkCreateData {
  name: string;
  description?: string;
  type?: 'open' | 'private' | 'verified';
}

// ── Messaging ─────────────────────────────────────────
export interface Conversation {
  id: number;
  subject?: string;
  type: string;
  reference_type?: string;
  reference_id?: number;
  last_message_at?: string;
  participants?: User[];
  last_message?: Message;
  unread_count?: number;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  user_id: number;
  sender?: User;
  body: string;
  type: string;
  metadata?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

// ── Notification ──────────────────────────────────────
export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

// ── eCMR ──────────────────────────────────────────────
export interface EcmrCreateData {
  transport_order_id: number;
  sender_name: string;
  sender_address: string;
  carrier_name: string;
  carrier_address: string;
  consignee_name: string;
  consignee_address: string;
  goods_description: string;
  weight: number;
  packages_count: number;
  pickup_date: string;
  delivery_date: string;
  pickup_location: string;
  delivery_location: string;
  notes?: string;
}

// ── Multimodal ────────────────────────────────────────
export interface MultimodalSearchData {
  origin: string;
  destination: string;
  mode?: 'rail' | 'sea' | 'air' | 'barge' | 'intermodal';
  departure_date?: string;
  weight_kg?: number;
  volume_m3?: number;
}

export interface MultimodalBookData {
  mode: string;
  origin: string;
  destination: string;
  departure_date: string;
  cargo_type?: string;
  weight_kg?: number;
  volume_m3?: number;
  operator?: string;
}

// ── Invoice ───────────────────────────────────────────
export interface InvoiceCreateData {
  client_company_id: number;
  transport_order_id?: number;
  line_items?: Array<{ description: string; quantity: number; unit_price: number }>;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  notes?: string;
}

// ── Generic ───────────────────────────────────────────
export interface ListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
