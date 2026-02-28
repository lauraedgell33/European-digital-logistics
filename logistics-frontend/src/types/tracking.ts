import type { TransportOrder, OrderStatus } from './orders';

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

// ── Tracking Input Types ──────────────────────────────
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

// ── WebSocket Events ──────────────────────────────────
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
