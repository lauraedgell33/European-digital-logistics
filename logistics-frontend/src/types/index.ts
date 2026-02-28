// ── Company ───────────────────────────────────────────
export interface Company {
  id: number;
  name: string;
  vat_number: string;
  registration_number?: string;
  type: 'shipper' | 'carrier' | 'forwarder';
  verification_status: 'pending' | 'verified' | 'rejected';
  country_code: string;
  country?: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  verified_at?: string;
  created_at: string;
}

// ── User ──────────────────────────────────────────────
export interface User {
  id: number;
  company_id: number;
  company?: Company;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  language: string;
  phone?: string;
  position?: string;
  avatar?: string;
  is_active: boolean;
  preferences?: Record<string, unknown>;
  last_login_at?: string;
}

// ── Freight Offer ─────────────────────────────────────
export interface FreightOffer {
  id: number;
  company_id: number;
  company?: Company;
  user_id: number;
  origin_country: string;
  origin_city: string;
  origin_postal_code: string;
  origin_lat?: number;
  origin_lng?: number;
  origin_address?: string;
  destination_country: string;
  destination_city: string;
  destination_postal_code: string;
  destination_lat?: number;
  destination_lng?: number;
  destination_address?: string;
  cargo_type: string;
  cargo_description?: string;
  weight: number;
  volume?: number;
  length?: number;
  width?: number;
  height?: number;
  loading_meters?: number;
  pallet_count?: number;
  is_hazardous: boolean;
  adr_class?: string;
  requires_temperature_control: boolean;
  min_temperature?: number;
  max_temperature?: number;
  loading_date: string;
  loading_time_from?: string;
  loading_time_to?: string;
  unloading_date: string;
  unloading_time_from?: string;
  unloading_time_to?: string;
  vehicle_type: string;
  required_equipment?: string[];
  price?: number;
  currency: string;
  price_type: 'fixed' | 'per_km' | 'negotiable';
  status: 'active' | 'matched' | 'in_transit' | 'completed' | 'cancelled' | 'expired';
  is_public: boolean;
  network_id?: number;
  distance_km?: number;
  estimated_duration_hours?: number;
  notes?: string;
  expires_at?: string;
  created_at: string;
}

// ── Vehicle Offer ─────────────────────────────────────
export interface VehicleOffer {
  id: number;
  company_id: number;
  company?: Company;
  user_id: number;
  vehicle_type: string;
  vehicle_registration?: string;
  capacity_kg: number;
  capacity_m3?: number;
  loading_meters?: number;
  pallet_spaces?: number;
  equipment?: string[];
  has_adr: boolean;
  has_temperature_control: boolean;
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
  currency: string;
  status: 'available' | 'booked' | 'in_transit' | 'unavailable';
  is_public: boolean;
  driver_name?: string;
  driver_phone?: string;
  notes?: string;
  created_at: string;
}

// ── Transport Order ───────────────────────────────────
export interface TransportOrder {
  id: number;
  order_number: string;
  freight_offer_id?: number;
  vehicle_offer_id?: number;
  shipper_id: number;
  shipper?: Company;
  carrier_id: number;
  carrier?: Company;
  pickup_country: string;
  pickup_city: string;
  pickup_address: string;
  pickup_postal_code: string;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  pickup_date: string;
  delivery_country: string;
  delivery_city: string;
  delivery_address: string;
  delivery_postal_code: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_date: string;
  cargo_type: string;
  cargo_description?: string;
  weight: number;
  volume?: number;
  pallet_count?: number;
  total_price: number;
  currency: string;
  payment_terms: string;
  payment_status: 'pending' | 'invoiced' | 'paid' | 'overdue';
  status: OrderStatus;
  documents?: MediaDocument[];
  special_instructions?: string;
  accepted_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  shipment?: Shipment;
  created_at: string;
}

export type OrderStatus =
  | 'draft' | 'pending' | 'accepted' | 'rejected'
  | 'pickup_scheduled' | 'picked_up' | 'in_transit'
  | 'delivered' | 'completed' | 'cancelled' | 'disputed';

// ── Shipment ──────────────────────────────────────────
export interface Shipment {
  id: number;
  transport_order_id: number;
  transport_order?: TransportOrder;
  tracking_code: string;
  current_lat?: number;
  current_lng?: number;
  current_location_name?: string;
  eta?: string;
  status: ShipmentStatus;
  tracking_device_id?: string;
  speed_kmh?: number;
  heading?: number;
  temperature?: number;
  battery_level?: number;
  last_update?: string;
  total_distance_km?: number;
  remaining_distance_km?: number;
  events?: ShipmentEvent[];
}

export type ShipmentStatus =
  | 'waiting_pickup' | 'picked_up' | 'in_transit'
  | 'at_customs' | 'out_for_delivery' | 'delivered'
  | 'delayed' | 'exception';

export interface ShipmentEvent {
  id: number;
  shipment_id: number;
  event_type: string;
  description?: string;
  lat?: number;
  lng?: number;
  location_name?: string;
  metadata?: Record<string, unknown>;
  occurred_at: string;
}

export interface TrackingPosition {
  id: number;
  shipment_id: number;
  lat: number;
  lng: number;
  speed_kmh?: number;
  heading?: number;
  temperature?: number;
  recorded_at: string;
}

// ── Tender ────────────────────────────────────────────
export interface Tender {
  id: number;
  company_id: number;
  company?: Company;
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
  currency: string;
  budget_type: 'per_shipment' | 'total' | 'per_month';
  status: 'draft' | 'open' | 'evaluation' | 'awarded' | 'closed' | 'cancelled';
  is_public: boolean;
  bids_count?: number;
  bids?: TenderBid[];
  created_at: string;
}

export interface TenderBid {
  id: number;
  tender_id: number;
  tender?: Tender;
  company_id: number;
  company?: Company;
  proposed_price: number;
  currency: string;
  proposal: string;
  transit_time_hours?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  score?: number;
  submitted_at?: string;
  created_at: string;
}

// ── Partner Network ───────────────────────────────────
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

export interface FreightSearchParams extends ListParams {
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

export interface VehicleSearchParams extends ListParams {
  current_country?: string;
  current_city?: string;
  destination_country?: string;
  vehicle_type?: string;
  available_from?: string;
  available_to?: string;
  min_capacity?: number;
}

export interface OrderStatusUpdate {
  status: string;
}

export interface TrackingPositionUpdate {
  lat: number;
  lng: number;
  speed_kmh?: number;
  heading?: number;
  temperature?: number;
  battery_level?: number;
}

export interface TrackingEventInput {
  event_type: string;
  description?: string;
  lat?: number;
  lng?: number;
  location_name?: string;
}

export interface NetworkCreateInput {
  name: string;
  description?: string;
  type?: 'open' | 'private' | 'verified';
}

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

export interface MessageInput {
  body: string;
  type?: 'text' | 'file' | 'system';
  metadata?: Record<string, unknown>;
}

export interface ConversationStartInput {
  recipient_id: number;
  message: string;
  subject?: string;
  type?: string;
  reference_type?: string;
  reference_id?: number;
}

// ── WebSocket Event Types ─────────────────────────────
export interface ShipmentLocationEvent {
  shipment_id: number;
  lat: number;
  lng: number;
  speed_kmh?: number;
  heading?: number;
  location_name?: string;
}

export interface OrderStatusEvent {
  order_id: number;
  status: OrderStatus;
  updated_at: string;
}

export interface NewMessageEvent {
  conversation_id: number;
  message: {
    id: number;
    body: string;
    sender_id: number;
    type: string;
    created_at: string;
  };
}

export interface NewNotificationEvent {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// ── Document ──────────────────────────────────────────
export interface MediaDocument {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  collection_name: string;
  created_at: string;
}

// ── Conversation & Message ────────────────────────────
export interface Conversation {
  id: number;
  subject?: string;
  type: 'direct' | 'freight_inquiry' | 'order_discussion' | 'tender_discussion';
  creator_id: number;
  creator?: User;
  last_message_at?: string;
  messages_count?: number;
  unread_count?: number;
  participants?: User[];
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender?: User;
  body: string;
  type: 'text' | 'file' | 'system';
  metadata?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
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

// ── Analytics ─────────────────────────────────────────
export interface MonthlyOrderData {
  month: string;
  orders: number;
  revenue: number;
}

export interface TopRoute {
  origin: string;
  destination: string;
  count: number;
  revenue: number;
}

export interface AnalyticsData {
  total_orders: number;
  total_revenue: number;
  active_shipments: number;
  avg_delivery_time_hours: number;
  monthly_orders: MonthlyOrderData[];
  top_routes: TopRoute[];
  order_status_distribution: Record<string, number>;
  revenue_by_type: Record<string, number>;
}

// ── Matching ──────────────────────────────────────────
export interface MatchResult {
  vehicle: VehicleOffer;
  score: number;
  distance_km?: number;
}

// ── Dashboard ─────────────────────────────────────────
export interface DashboardData {
  overview: {
    active_freight_offers: number;
    active_vehicle_offers: number;
    pending_orders: number;
    active_orders: number;
    active_shipments: number;
    monthly_revenue: number;
    monthly_orders: number;
  };
  recent_orders: TransportOrder[];
  active_shipments: Shipment[];
  my_active_offers: {
    freight: FreightOffer[];
    vehicles: VehicleOffer[];
  };
}

// ── Route Planning ────────────────────────────────────
export interface RouteInfo {
  distance_km: number;
  duration_minutes: number;
  fuel_cost: number;
  toll_costs: { country: string; cost: number }[];
  total_cost: number;
  source: string;
}

// ── Pricing ───────────────────────────────────────────
export interface PricingInfo {
  suggested_price: number;
  price_range: { low: number; high: number };
  breakdown: Record<string, number>;
  price_per_km: number;
  currency: string;
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

// ── Transport Barometer ───────────────────────────────
export interface BarometerSnapshot {
  id: number;
  origin_country: string;
  destination_country: string;
  snapshot_date: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  freight_offer_count: number;
  vehicle_offer_count: number;
  supply_demand_ratio: number;
  avg_price_per_km: number;
  min_price_per_km: number;
  max_price_per_km: number;
  median_price_per_km?: number;
  total_volume: number;
  avg_distance_km: number;
  vehicle_type_breakdown?: Record<string, number>;
  cargo_type_breakdown?: Record<string, number>;
}

export interface BarometerOverview {
  total_freight_offers: number;
  total_vehicle_offers: number;
  supply_demand_ratio: number;
  avg_price_per_km: number;
  top_routes: { origin: string; destination: string; count: number; avg_price_per_km: number }[];
  vehicle_type_distribution: Record<string, number>;
  origin_heatmap: Record<string, number>;
  destination_heatmap: Record<string, number>;
  prices_by_type: Record<string, number>;
}

// ── Driving Bans ──────────────────────────────────────
export interface DrivingBan {
  id: number;
  country: string;
  region?: string;
  ban_type: 'weekend' | 'holiday' | 'night' | 'seasonal' | 'environmental' | 'weight_restriction' | 'height_restriction';
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  start_date?: string;
  end_date?: string;
  is_recurring: boolean;
  specific_dates?: string[];
  min_weight_tons?: number;
  max_height_m?: number;
  max_width_m?: number;
  max_length_m?: number;
  exemptions?: string[];
  affected_roads?: string[];
  affected_zones?: string[];
  fine_amount?: number;
  fine_currency?: string;
}

export interface RouteCheckResult {
  bans_found: DrivingBan[];
  warnings: DrivingBan[];
  is_clear: boolean;
}

// ── Carbon Footprint ──────────────────────────────────
export interface CarbonFootprint {
  id: number;
  transport_order_id?: number;
  company_id?: number;
  co2_kg: number;
  co2_per_km: number;
  co2_per_ton_km?: number;
  distance_km: number;
  weight_kg?: number;
  vehicle_type: string;
  fuel_type: string;
  emission_standard?: string;
  load_factor_pct?: number;
  industry_avg_co2_kg?: number;
  savings_vs_avg_pct?: number;
  offset_purchased_kg: number;
  offset_cost: number;
  is_carbon_neutral: boolean;
  created_at: string;
}

export interface CarbonCalculationResult {
  co2_kg: number;
  co2_per_km: number;
  co2_per_ton_km?: number;
  co2_per_tkm?: number;
  total_co2_kg?: number;
  distance_km: number;
  vehicle_type: string;
  fuel_type: string;
  emission_factor: number;
  industry_avg_co2_kg: number;
  savings_vs_avg_pct: number;
  offset_cost_eur: number;
  comparison?: Record<string, number>;
}

export interface CarbonDashboard {
  totals: {
    total_co2_kg: number;
    avg_co2_per_km: number;
    avg_savings_pct: number;
    total_offset_kg: number;
    total_offset_cost: number;
    transport_count: number;
    total_distance_km: number;
  };
  sustainability_score: number;
  monthly_trend: { month: string; co2_kg: number; count: number; avg_co2_per_km: number }[];
  monthly_trends?: { month: string; co2_kg: number; count: number; avg_co2_per_km: number }[];
  by_vehicle_type: { vehicle_type: string; co2_kg: number; count: number; avg_co2_per_km: number }[];
  by_fuel_type: { fuel_type: string; co2_kg: number; count: number }[];
  carbon_neutral_pct: number;
  // Top-level aliases for dashboard page
  total_co2_year?: number;
  shipments_count?: number;
  avg_co2_per_shipment?: number;
  total_offset_kg?: number;
}

// ── Lexicon Articles ──────────────────────────────────
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

// ── Tracking Share ────────────────────────────────────
export interface TrackingShare {
  id: number;
  shipment_id: number;
  share_token: string;
  share_url?: string;
  recipient_name?: string;
  recipient_email?: string;
  recipient_company?: string;
  expires_at: string;
  is_active: boolean;
  permissions?: string[];
  view_count: number;
  created_at: string;
}

export interface SharedTrackingData {
  shipment_reference: string;
  status: string;
  current_location?: {
    latitude: number;
    longitude: number;
    recorded_at: string;
    speed_kmh?: number;
    heading?: number;
  };
  estimated_arrival?: string;
  events?: { type: string; description: string; timestamp: string }[];
  route_history?: { latitude: number; longitude: number; recorded_at: string }[];
}

// ── Price Insights ────────────────────────────────────
export interface PriceInsight {
  id: number;
  origin_country: string;
  origin_city?: string;
  destination_country: string;
  destination_city?: string;
  vehicle_type?: string;
  period_date: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  period?: string;
  sample_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  median_price?: number;
  avg_price_per_km?: number;
  min_price_per_km?: number;
  max_price_per_km?: number;
  median_price_per_km?: number;
  avg_distance_km?: number;
}

export interface PriceEstimate {
  estimated_price_eur: number;
  estimated_price?: number;
  price_per_km: number;
  distance_km: number;
  confidence: string;
  based_on_samples: number;
  price_range?: { min: number; max: number };
}

// ── Insurance ─────────────────────────────────────────
export interface InsuranceQuote {
  id: number;
  transport_order_id?: number;
  transport_order?: TransportOrder;
  company_id: number;
  provider: string;
  cargo_value: number;
  premium: number;
  premium_amount?: number;
  coverage_amount?: number;
  cargo_type?: string;
  currency: string;
  coverage_type: 'basic' | 'all_risk' | 'extended';
  coverage_details?: string[];
  exclusions?: string[];
  deductible?: number;
  policy_number?: string;
  status: 'quoted' | 'active' | 'expired' | 'claimed' | 'cancelled';
  valid_until?: string;
  created_at: string;
}

export interface CoverageType {
  type: string;
  name: string;
  rate_pct: number;
  base_rate?: number;
  description?: string;
  inclusions: string[];
  exclusions: string[];
}

// ── Escrow ────────────────────────────────────────────
export interface EscrowPayment {
  id: number;
  transport_order_id: number;
  order_id?: number;
  transport_order?: TransportOrder;
  payer_company_id: number;
  payer_company?: Company;
  payee_company_id: number;
  payee_company?: Company;
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'funded' | 'released' | 'disputed' | 'refunded' | 'cancelled';
  payment_reference: string;
  payment_method?: string;
  dispute_reason?: string;
  funded_at?: string;
  released_at?: string;
  disputed_at?: string;
  refunded_at?: string;
  created_at: string;
}

// ── Debt Collection ───────────────────────────────────
export interface DebtCollection {
  id: number;
  creditor_company_id: number;
  creditor_company?: Company;
  debtor_company_id: number;
  debtor_company?: Company;
  transport_order_id?: number;
  order_id?: number;
  transport_order?: TransportOrder;
  debtor_name: string;
  debtor_email?: string;
  debtor_phone?: string;
  debtor_address?: string;
  debtor_vat_number?: string;
  invoice_number: string;
  invoice_date: string;
  invoice_due_date: string;
  due_date?: string;
  invoice_amount: number;
  original_amount?: number;
  total_with_fees?: number;
  currency: string;
  description?: string;
  status: 'new' | 'reminder_sent' | 'second_reminder' | 'final_notice' | 'collection_agency' | 'legal_action' | 'paid' | 'cancelled' | 'written_off';
  reminder_count: number;
  reminders_sent?: number;
  days_overdue?: number;
  last_reminder_at?: string;
  collected_amount: number;
  collection_fee: number;
  created_at: string;
}

export interface DebtCollectionStats {
  total_cases: number;
  active_cases: number;
  total_owed: number;
  total_outstanding?: number;
  total_collected: number;
  paid_cases: number;
  written_off_cases: number;
  recovery_rate: number;
  avg_days_overdue?: number;
}

// ── Return Loads ──────────────────────────────────────
export interface ReturnLoadSuggestion {
  offer?: FreightOffer & { cargo_weight?: number };
  relevance_score: number;
  distance_km?: number;
}

export interface EmptyLeg {
  origin_country: string;
  destination_country: string;
  available_vehicles: number;
  freight_demand: number;
  surplus_vehicles: number;
  fill_rate_pct: number;
  supply_demand_ratio?: number;
}

// ══════════════════════════════════════════════════════
// Phase 2 — AI & Smart Matching
// ══════════════════════════════════════════════════════

export interface AiMatchResult {
  id: number;
  freight_offer_id: number;
  freight_offer?: FreightOffer;
  vehicle_offer_id: number;
  vehicle_offer?: VehicleOffer;
  overall_score: number;
  distance_score: number;
  capacity_score: number;
  timing_score: number;
  reliability_score: number;
  price_score: number;
  carbon_score: number;
  factors: Record<string, unknown>;
  model_version: string;
  status: 'suggested' | 'accepted' | 'rejected' | 'expired';
  responded_at?: string;
  created_at: string;
}

export interface AiPrediction {
  id: number;
  prediction_type: 'demand' | 'pricing' | 'capacity' | 'delay' | 'route_risk';
  target_region: string;
  prediction_date: string;
  predicted_value: number;
  confidence: number;
  lower_bound: number;
  upper_bound: number;
  factors: Record<string, unknown>;
  model_version: string;
  actual_value?: number;
  created_at: string;
}

export interface DynamicPrice {
  id: number;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  vehicle_type: string;
  base_price: number;
  dynamic_price: number;
  surge_multiplier: number;
  demand_index: number;
  supply_index: number;
  currency: string;
  valid_until: string;
  price_change?: number;
  created_at: string;
}

export interface RouteOptimization {
  id: number;
  user_id: number;
  origin: string;
  destination: string;
  waypoints: Array<{ lat: number; lng: number; name: string }>;
  optimized_waypoints: Array<{ lat: number; lng: number; name: string; order: number }>;
  total_distance_km: number;
  estimated_duration_hours: number;
  co2_savings_kg: number;
  cost_savings_eur: number;
  constraints: Record<string, unknown>;
  alternatives: Array<Record<string, unknown>>;
  created_at: string;
}

export interface DocumentScan {
  id: number;
  company_id: number;
  user_id: number;
  document_type: 'cmr' | 'invoice' | 'pod' | 'customs' | 'other';
  file_path: string;
  original_filename: string;
  ocr_text?: string;
  extracted_data?: Record<string, unknown>;
  confidence_score?: number;
  validation_status: 'pending' | 'processing' | 'validated' | 'failed';
  validation_errors?: Array<{ field: string; message: string }>;
  created_at: string;
}

// ══════════════════════════════════════════════════════
// Phase 3 — Blockchain / eCMR
// ══════════════════════════════════════════════════════

export interface EcmrDocument {
  id: number;
  ecmr_number: string;
  transport_order_id?: number;
  transport_order?: TransportOrder;
  sender_company_id: number;
  sender_company?: Company;
  carrier_company_id: number;
  carrier_company?: Company;
  consignee_company_id?: number;
  consignee_company?: Company;
  sender_name: string;
  sender_address: string;
  carrier_name: string;
  carrier_address: string;
  consignee_name: string;
  consignee_address: string;
  goods_description: string;
  weight_kg: number;
  number_of_packages: number;
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  delivery_date?: string;
  special_instructions?: string;
  sender_signature?: string;
  carrier_signature?: string;
  consignee_signature?: string;
  sender_signed_at?: string;
  carrier_signed_at?: string;
  consignee_signed_at?: string;
  blockchain_tx_hash?: string;
  blockchain_block_number?: number;
  ipfs_hash?: string;
  status: 'draft' | 'issued' | 'in_transit' | 'delivered' | 'completed' | 'disputed';
  is_fully_signed?: boolean;
  created_at: string;
}

export interface SmartContract {
  id: number;
  contract_hash: string;
  name: string;
  company_id: number;
  company?: Company;
  contract_type: 'rate_agreement' | 'sla' | 'payment_terms' | 'capacity_guarantee';
  conditions: Array<{ type: string; parameter: string; operator: string; value: string }>;
  actions: Array<{ trigger: string; action: string; parameters: Record<string, unknown> }>;
  status: 'draft' | 'active' | 'executed' | 'expired' | 'terminated';
  execution_log: Array<{ timestamp: string; condition: string; result: boolean; action?: string }>;
  valid_from: string;
  valid_until: string;
  blockchain_address?: string;
  created_at: string;
}

export interface DigitalIdentity {
  id: number;
  company_id: number;
  company?: Company;
  did_identifier: string;
  verification_status: 'unverified' | 'pending' | 'verified' | 'revoked';
  credentials: Array<{ type: string; issuer: string; issued_at: string; expires_at?: string }>;
  attestations: Array<{ type: string; attester: string; value: string; timestamp: string }>;
  verified_at?: string;
  created_at: string;
}

// ══════════════════════════════════════════════════════
// Phase 4 — Fintech / Invoicing / Payments
// ══════════════════════════════════════════════════════

export interface Invoice {
  id: number;
  invoice_number: string;
  company_id: number;
  company?: Company;
  client_company_id: number;
  client_company?: Company;
  transport_order_id?: number;
  transport_order?: TransportOrder;
  line_items: Array<{ description: string; quantity: number; unit_price: number; total: number }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  paid_at?: string;
  paid_amount: number;
  balance_due?: number;
  is_overdue?: boolean;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export interface InvoiceFactoring {
  id: number;
  invoice_id: number;
  invoice?: Invoice;
  company_id: number;
  original_amount: number;
  advance_rate: number;
  advance_amount: number;
  fee_rate: number;
  fee_amount: number;
  net_amount: number;
  status: 'requested' | 'approved' | 'funded' | 'collected' | 'rejected';
  funded_at?: string;
  collected_at?: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: number;
  payment_reference: string;
  company_id: number;
  invoice_id?: number;
  invoice?: Invoice;
  transport_order_id?: number;
  amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  payment_provider: 'stripe' | 'sepa' | 'bank_transfer' | 'paypal';
  provider_reference?: string;
  payment_method?: string;
  exchange_rate?: number;
  original_currency?: string;
  original_amount?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  refund_amount?: number;
  refunded_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface VatRecord {
  id: number;
  company_id: number;
  invoice_id?: number;
  transaction_type: 'sale' | 'purchase' | 'intra_community' | 'reverse_charge';
  seller_country: string;
  buyer_country: string;
  seller_vat_number?: string;
  buyer_vat_number?: string;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  is_reverse_charge: boolean;
  reporting_period: string;
  created_at: string;
}

export interface InvoiceStats {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  overdue_amount: number;
  overdue_count: number;
  by_status: Record<string, number>;
}

export interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  total_fees: number;
  by_provider: Record<string, { count: number; amount: number }>;
  by_currency: Record<string, { count: number; amount: number }>;
}

// ══════════════════════════════════════════════════════
// Phase 5 — Multi-modal Transport
// ══════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════
// Phase 6 — Enterprise
// ══════════════════════════════════════════════════════

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
