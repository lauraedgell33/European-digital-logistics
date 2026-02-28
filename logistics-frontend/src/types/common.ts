import type { Company } from './auth';

// ── API Response Types ────────────────────────────────
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

// ── API Input Types ───────────────────────────────────
export interface ListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

// ── Notification ──────────────────────────────────────
export interface AppNotification {
  id: string;
  type: string;
  data: {
    title: string;
    body: string;
    url?: string;
    [key: string]: unknown;
  };
  read_at?: string;
  created_at: string;
}

export interface NewNotificationEvent {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// ── Route & Pricing ───────────────────────────────────
export interface RouteCalculateInput {
  origin_country: string;
  origin_city: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_country: string;
  destination_city: string;
  destination_lat?: number;
  destination_lng?: number;
}

export interface PricingCalculateInput {
  distance_km: number;
  weight_kg?: number;
  vehicle_type: string;
  is_hazardous?: boolean;
  temperature_controlled?: boolean;
  loading_date?: string;
}

export interface RouteInfo {
  distance_km: number;
  duration_minutes: number;
  fuel_cost: number;
  toll_costs: { country: string; cost: number }[];
  total_cost: number;
  source: string;
}

export interface PricingInfo {
  suggested_price: number;
  price_range: { low: number; high: number };
  breakdown: Record<string, number>;
  price_per_km: number;
  currency: string;
}

// ── Network ───────────────────────────────────────────
export interface NetworkCreateInput {
  name: string;
  description?: string;
  type?: 'open' | 'private' | 'verified';
}

export interface PartnerNetwork {
  id: number;
  owner_company_id: number;
  owner?: Company;
  name: string;
  description?: string;
  access_code?: string;
  is_active: boolean;
  max_members?: number;
  active_members_count?: number;
  members?: Company[];
}

// ── Warehouse ─────────────────────────────────────────
export interface Warehouse {
  id: number;
  company_id: number;
  company?: Company;
  name: string;
  description?: string;
  country: string;
  city: string;
  postal_code: string;
  address: string;
  latitude?: number;
  longitude?: number;
  total_area_m2: number;
  available_area_m2: number;
  ceiling_height_m?: number;
  storage_types?: string[];
  equipment?: string[];
  certifications?: string[];
  has_loading_dock: boolean;
  has_rail_access: boolean;
  has_temperature_control: boolean;
  has_hazardous_storage: boolean;
  has_customs_warehouse: boolean;
  has_cross_docking: boolean;
  has_pick_and_pack: boolean;
  has_labeling: boolean;
  has_24h_access: boolean;
  has_security_system: boolean;
  has_fire_suppression: boolean;
  has_office_space: boolean;
  temperature_min_c?: number;
  temperature_max_c?: number;
  pallet_spaces?: number;
  loading_docks?: number;
  price_per_m2_month?: number;
  price_per_pallet_month?: number;
  currency: string;
  min_rental_months?: number;
  available_from?: string;
  available_until?: string;
  status: 'active' | 'inactive' | 'maintenance';
  visibility: 'public' | 'network' | 'private';
  photos?: string[];
  created_at: string;
  // Aliases used by frontend pages
  available_space_sqm?: number;
  total_space_sqm?: number;
  warehouse_type?: string;
  price_per_sqm_month?: number;
  has_forklift?: boolean;
  is_temperature_controlled?: boolean;
  is_bonded?: boolean;
  has_cctv?: boolean;
  has_sprinklers?: boolean;
  has_alarm?: boolean;
  loading_docks_count?: number;
  min_temperature?: number;
  max_temperature?: number;
}

export interface WarehouseBooking {
  id: number;
  warehouse_id: number;
  warehouse?: Warehouse;
  tenant_company_id: number;
  tenant_company?: Company;
  area_m2?: number;
  pallet_spaces?: number;
  start_date: string;
  end_date?: string;
  monthly_price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

// ── Lexicon ───────────────────────────────────────────
export interface LexiconArticle {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  content_html?: string;
  category: string;
  tags?: string[];
  language: string;
  translations?: Record<string, { title: string; content: string }>;
  view_count: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  related_articles?: LexiconArticle[];
}

// ── Multimodal (Phase 5) ──────────────────────────────
export interface MultimodalBooking {
  id: number;
  booking_reference: string;
  company_id: number;
  company?: Company;
  mode: 'rail' | 'sea' | 'air' | 'barge';
  origin: string;
  destination: string;
  origin_terminal?: string;
  destination_terminal?: string;
  departure_date: string;
  arrival_date?: string;
  cargo_type: string;
  weight_kg: number;
  volume_m3?: number;
  container_type?: string;
  container_count?: number;
  wagon_type?: string;
  wagon_count?: number;
  price: number;
  currency: string;
  co2_kg: number;
  operator_name?: string;
  status: 'quoted' | 'booked' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  tracking_number?: string;
  is_delayed?: boolean;
  created_at: string;
}

export interface IntermodalPlan {
  id: number;
  company_id: number;
  origin: string;
  destination: string;
  cargo_weight_kg: number;
  cargo_volume_m3?: number;
  legs: Array<{
    sequence: number;
    mode: string;
    origin: string;
    destination: string;
    distance_km: number;
    duration_hours: number;
    cost_eur: number;
    co2_kg: number;
    operator?: string;
  }>;
  total_cost_eur: number;
  total_co2_kg: number;
  total_duration_hours: number;
  road_only_cost_eur: number;
  road_only_co2_kg: number;
  cost_savings_pct: number;
  co2_savings_pct: number;
  modes_used?: string[];
  status: 'draft' | 'planned' | 'booked' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface MultimodalSearchResult {
  mode: string;
  operator: string;
  origin_terminal: string;
  destination_terminal: string;
  departure_date: string;
  arrival_date: string;
  transit_days: number;
  price_eur: number;
  co2_kg: number;
  container_types?: string[];
  available_capacity?: number;
}

export interface MultimodalStats {
  total_bookings: number;
  total_co2_saved_kg: number;
  by_mode: Record<string, { count: number; co2_saved_kg: number }>;
  intermodal_plans: number;
  avg_cost_saving_pct: number;
}

// ── Enterprise (Phase 6) ─────────────────────────────
export interface WhiteLabel {
  id: number;
  company_id: number;
  company?: Company;
  subdomain: string;
  custom_domain?: string;
  brand_name: string;
  brand_colors?: { primary?: string; secondary?: string; accent?: string };
  logo_url?: string;
  favicon_url?: string;
  support_email?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  features?: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
}

export interface ApiKeyItem {
  id: number;
  name: string;
  key_prefix: string;
  permissions: string[];
  requests_today: number;
  requests_total: number;
  rate_limits?: { requests_per_minute?: number; requests_per_day?: number };
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface ApiUsageStats {
  total_requests: number;
  today_requests: number;
  avg_response_time_ms: number;
  by_endpoint: Array<{ endpoint: string; count: number; avg_time: number }>;
}

export interface ErpIntegration {
  id: number;
  company_id: number;
  integration_type: 'sap' | 'oracle' | 'microsoft_dynamics' | 'custom_tms' | 'wms' | 'other';
  name: string;
  sync_direction: 'inbound' | 'outbound' | 'bidirectional';
  field_mappings?: Record<string, string>;
  last_sync_at?: string;
  sync_success_count: number;
  sync_error_count: number;
  is_active: boolean;
  created_at: string;
}

export interface EdiMessage {
  id: number;
  company_id: number;
  message_type: 'IFTMIN' | 'IFTSTA' | 'INVOIC' | 'DESADV' | 'ORDERS';
  message_reference: string;
  direction: 'inbound' | 'outbound';
  format: 'EDIFACT' | 'XML' | 'JSON' | 'CSV';
  raw_content?: string;
  is_valid: boolean;
  validation_errors?: Array<{ field: string; message: string }>;
  status: 'received' | 'validated' | 'processed' | 'failed' | 'acknowledged';
  transport_order_id?: number;
  created_at: string;
}

export interface EdiStats {
  total_messages: number;
  inbound: number;
  outbound: number;
  failed: number;
  by_type: Array<{ message_type: string; count: number }>;
}
