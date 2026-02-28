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
