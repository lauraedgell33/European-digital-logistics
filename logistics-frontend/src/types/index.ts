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
