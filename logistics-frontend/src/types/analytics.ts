import type { Company } from './auth';
import type { FreightOffer } from './freight';
import type { VehicleOffer } from './vehicles';
import type { TransportOrder } from './orders';
import type { Shipment } from './tracking';

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

// ── AI Match Result (Phase 2) ─────────────────────────
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
