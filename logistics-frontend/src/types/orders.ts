import type { Company } from './auth';
import type { Shipment } from './tracking';

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

export interface OrderStatusUpdate {
  status: string;
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

// ── eCMR (Phase 3) ───────────────────────────────────
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

// ── Invoice (Phase 4) ────────────────────────────────
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
