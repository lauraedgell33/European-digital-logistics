import { z } from 'zod';

// ─── Common Validators ──────────────────────────────────────
const email = z.string().email('Invalid email address').min(1, 'Email is required');
const password = z.string().min(8, 'Password must be at least 8 characters');
const phone = z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number').optional().or(z.literal(''));
const vatNumber = z.string().regex(/^[A-Z]{2}\d{8,12}$/, 'Invalid VAT number (e.g. DE123456789)').optional().or(z.literal(''));
const url = z.string().url('Invalid URL').optional().or(z.literal(''));
const positiveNumber = z.coerce.number().positive('Must be a positive number');
const requiredString = (field: string) => z.string().min(1, `${field} is required`);

// ─── Auth Schemas ───────────────────────────────────────────
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: requiredString('Name'),
  email,
  password,
  password_confirmation: z.string().min(1, 'Please confirm password'),
  company_name: requiredString('Company name'),
  country: requiredString('Country'),
  accept_terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  email,
  password,
  password_confirmation: z.string().min(1, 'Please confirm password'),
  token: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

// ─── Freight Offer Schema ───────────────────────────────────
export const freightOfferSchema = z.object({
  origin_country: requiredString('Origin country'),
  origin_city: requiredString('Origin city'),
  origin_postal_code: z.string().optional(),
  destination_country: requiredString('Destination country'),
  destination_city: requiredString('Destination city'),
  destination_postal_code: z.string().optional(),
  loading_date: z.string().min(1, 'Loading date is required'),
  unloading_date: z.string().optional(),
  vehicle_type: requiredString('Vehicle type'),
  weight: positiveNumber.optional(),
  volume: z.coerce.number().positive().optional(),
  loading_meters: z.coerce.number().positive().optional(),
  cargo_description: z.string().optional(),
  is_hazardous: z.boolean().default(false),
  is_temperature_controlled: z.boolean().default(false),
  temperature_min: z.coerce.number().optional(),
  temperature_max: z.coerce.number().optional(),
  price: z.coerce.number().positive('Price must be positive').optional(),
  currency: z.enum(['EUR', 'USD', 'GBP', 'PLN', 'CZK', 'RON']).default('EUR'),
  price_type: z.enum(['fixed', 'per_km', 'per_ton', 'negotiable']).default('fixed'),
  notes: z.string().max(2000, 'Notes too long').optional(),
}).refine((data) => {
  if (data.is_temperature_controlled && !data.temperature_min && !data.temperature_max) {
    return false;
  }
  return true;
}, {
  message: 'Temperature range required for temperature-controlled cargo',
  path: ['temperature_min'],
});

// ─── Vehicle Offer Schema ───────────────────────────────────
export const vehicleOfferSchema = z.object({
  vehicle_type: requiredString('Vehicle type'),
  vehicle_registration: z.string().optional(),
  capacity_kg: positiveNumber,
  capacity_m3: z.coerce.number().positive().optional(),
  loading_meters: z.coerce.number().positive().optional(),
  pallet_spaces: z.coerce.number().int().positive().optional(),
  current_country: requiredString('Current country'),
  current_city: requiredString('Current city'),
  current_postal_code: z.string().optional(),
  destination_country: z.string().optional(),
  destination_city: z.string().optional(),
  available_from: z.string().min(1, 'Available from is required'),
  available_to: z.string().optional(),
  price_per_km: z.coerce.number().positive().optional(),
  flat_price: z.coerce.number().positive().optional(),
  currency: z.enum(['EUR', 'USD', 'GBP', 'PLN', 'CZK', 'RON']).default('EUR'),
  has_adr: z.boolean().default(false),
  has_temperature_control: z.boolean().default(false),
  has_gps: z.boolean().default(false),
  has_tail_lift: z.boolean().default(false),
  min_temperature: z.coerce.number().optional(),
  max_temperature: z.coerce.number().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  notes: z.string().max(1000).optional(),
  is_public: z.boolean().default(true),
});

// ─── Transport Order Schema ─────────────────────────────────
export const transportOrderSchema = z.object({
  freight_offer_id: z.coerce.number().positive().optional(),
  carrier_id: z.coerce.number().positive('Select a carrier'),
  origin_country: requiredString('Origin country'),
  origin_city: requiredString('Origin city'),
  origin_address: z.string().optional(),
  destination_country: requiredString('Destination country'),
  destination_city: requiredString('Destination city'),
  destination_address: z.string().optional(),
  pickup_date: z.string().min(1, 'Pickup date is required'),
  delivery_date: z.string().min(1, 'Delivery date is required'),
  cargo_description: requiredString('Cargo description'),
  weight: positiveNumber,
  agreed_price: positiveNumber,
  currency: z.enum(['EUR', 'USD', 'GBP', 'PLN', 'CZK', 'RON']).default('EUR'),
  notes: z.string().max(2000).optional(),
});

// ─── Tender Schema ──────────────────────────────────────────
export const tenderSchema = z.object({
  title: requiredString('Title').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  origin_country: requiredString('Origin country'),
  origin_city: requiredString('Origin city'),
  destination_country: requiredString('Destination country'),
  destination_city: requiredString('Destination city'),
  vehicle_type: requiredString('Vehicle type'),
  frequency: z.enum(['one_time', 'daily', 'weekly', 'monthly']),
  volume_per_period: z.coerce.number().positive().optional(),
  budget_min: z.coerce.number().positive().optional(),
  budget_max: z.coerce.number().positive().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  requirements: z.string().max(3000).optional(),
});

export const tenderBidSchema = z.object({
  price: positiveNumber,
  currency: z.enum(['EUR', 'USD', 'GBP', 'PLN', 'CZK', 'RON']).default('EUR'),
  transit_time_hours: z.coerce.number().int().positive('Transit time must be positive'),
  notes: z.string().max(1000).optional(),
  valid_until: z.string().optional(),
});

// ─── Profile Schema ─────────────────────────────────────────
export const profileSchema = z.object({
  name: requiredString('Name'),
  email,
  phone,
  position: z.string().optional(),
  language: z.enum(['en', 'de', 'fr', 'pl', 'nl', 'it', 'es', 'ro']).default('en'),
});

// ─── Company Schema ─────────────────────────────────────────
export const companySchema = z.object({
  name: requiredString('Company name'),
  vat_number: vatNumber,
  country: requiredString('Country'),
  city: requiredString('City'),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  website: url,
  description: z.string().max(2000).optional(),
});

// ─── Change Password Schema ─────────────────────────────────
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: password,
  new_password_confirmation: z.string().min(1, 'Please confirm new password'),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: 'Passwords do not match',
  path: ['new_password_confirmation'],
});

// ─── Partner Network Schema ─────────────────────────────────
export const partnerNetworkSchema = z.object({
  name: requiredString('Network name').max(100),
  description: z.string().max(1000).optional(),
  type: z.enum(['open', 'private', 'verified']).default('open'),
});

// ─── Search / Filter Schema ─────────────────────────────────
export const searchSchema = z.object({
  query: z.string().max(200).optional(),
  origin_country: z.string().optional(),
  destination_country: z.string().optional(),
  vehicle_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  min_weight: z.coerce.number().optional(),
  max_weight: z.coerce.number().optional(),
  status: z.string().optional(),
  sort_by: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
});

// ─── Type Exports ───────────────────────────────────────────
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type FreightOfferFormData = z.infer<typeof freightOfferSchema>;
export type VehicleOfferFormData = z.infer<typeof vehicleOfferSchema>;
export type TransportOrderFormData = z.infer<typeof transportOrderSchema>;
export type TenderFormData = z.infer<typeof tenderSchema>;
export type TenderBidFormData = z.infer<typeof tenderBidSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type PartnerNetworkFormData = z.infer<typeof partnerNetworkSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
