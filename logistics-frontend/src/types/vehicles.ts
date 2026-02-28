import type { Company } from './auth';
import type { ListParams } from './common';

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

export interface VehicleSearchParams extends ListParams {
  current_country?: string;
  current_city?: string;
  destination_country?: string;
  vehicle_type?: string;
  available_from?: string;
  available_to?: string;
  min_capacity?: number;
}
