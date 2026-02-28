// ── Company ───────────────────────────────────────────
export interface Company {
  id: number;
  name: string;
  slug?: string;
  type: 'carrier' | 'freight_forwarder' | 'shipper' | 'broker' | 'logistics_provider';
  tax_id?: string;
  registration_number?: string;
  country: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  is_verified: boolean;
  rating?: number;
  total_reviews?: number;
  fleet_size?: number;
  employees_count?: number;
  founded_year?: number;
  certifications?: string[];
  specializations?: string[];
  operating_countries?: string[];
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
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
  preferences?: Record<string, any>;
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
  documents?: any;
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
  metadata?: Record<string, any>;
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
  name: string;
  description?: string;
  type: 'consortium' | 'alliance' | 'marketplace' | 'cooperative';
  access_code?: string;
  owner_company_id: number;
  owner_company?: Company;
  owner?: Company;
  members_count?: number;
  active_members_count?: number;
  is_member?: boolean;
  is_active: boolean;
  status?: string;
  settings?: Record<string, unknown>;
  max_members?: number;
  members?: Company[];
  created_at: string;
  updated_at: string;
}

// ── Conversation / Message ────────────────────────────
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
  metadata?: Record<string, any>;
  read_at?: string;
  created_at: string;
}

// ── Notification ──────────────────────────────────────
export interface AppNotification {
  id: string;
  type: string;
  data: Record<string, any>;
  read_at?: string;
  created_at: string;
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

// ── Analytics ─────────────────────────────────────────
export interface AnalyticsData {
  revenue: { total: number; monthly: number; growth: number };
  orders: { total: number; completed: number; cancelled: number; in_transit: number; completion_rate: number };
  freight: { total_offers: number; active: number; matched: number; match_rate: number };
  vehicles: { total_offers: number; active: number; utilization_rate: number };
  top_routes: TopRoute[];
  monthly_orders: MonthlyOrderData[];
}

export interface TopRoute {
  origin: string;
  destination: string;
  count: number;
  revenue: number;
}

export interface MonthlyOrderData {
  month: string;
  count: number;
  revenue: number;
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

// ── eCMR Document ────────────────────────────────────
export interface EcmrDocument {
  id: number;
  ecmr_number: string;
  transport_order_id: number;
  status: 'draft' | 'issued' | 'in_transit' | 'delivered' | 'completed';
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
  sender_signed_at?: string;
  carrier_signed_at?: string;
  consignee_signed_at?: string;
  blockchain_hash?: string;
  notes?: string;
  created_at: string;
}

// ── Scanned Document ─────────────────────────────────
export interface ScannedDocument {
  id: number;
  original_filename: string;
  document_type: 'cmr' | 'invoice' | 'delivery_note' | 'customs' | 'insurance' | 'other';
  status: 'processing' | 'completed' | 'failed';
  extracted_data?: Record<string, any>;
  confidence_score?: number;
  validation_result?: { valid: boolean; errors: string[] };
  created_at: string;
}

// ── AI Match Result ──────────────────────────────────
export interface AiMatchResult {
  id: number;
  freight_offer_id?: number;
  vehicle_offer_id?: number;
  overall_score: number;
  distance_score: number;
  capacity_score: number;
  timing_score: number;
  reliability_score: number;
  price_score: number;
  carbon_score: number;
  status: 'suggested' | 'accepted' | 'rejected';
  created_at: string;
}

// ── Invoice ──────────────────────────────────────────
export interface MobileInvoice {
  id: number;
  invoice_number: string;
  company_id: number;
  client_company_id: number;
  transport_order_id?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  paid_at?: string;
  created_at: string;
}

// ── Multimodal Booking ───────────────────────────────
export interface MultimodalBooking {
  id: number;
  booking_reference: string;
  mode: 'rail' | 'sea' | 'air' | 'barge' | 'intermodal';
  status: 'pending' | 'confirmed' | 'in_transit' | 'completed' | 'cancelled';
  origin: string;
  destination: string;
  departure_date: string;
  arrival_date: string;
  price: number;
  currency: string;
  co2_kg: number;
  created_at: string;
}
