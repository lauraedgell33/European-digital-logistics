import type { Company } from './auth';
import type { ListParams } from './common';

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
