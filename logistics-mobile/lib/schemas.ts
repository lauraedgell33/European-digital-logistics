import { z } from 'zod';

// ── Auth Schemas ──────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
  company_name: z.string().min(2, 'Company name is required'),
  company_type: z.string().min(1, 'Company type is required'),
  vat_number: z.string().min(1, 'VAT number is required'),
  country_code: z.string().min(2, 'Country is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

// ── Profile Schemas ───────────────────────────────────
export const editProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email address').trim(),
  phone: z.string().optional().default(''),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  new_password_confirmation: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: 'Passwords do not match',
  path: ['new_password_confirmation'],
});

export const companyProfileSchema = z.object({
  name: z.string().min(1, 'Company name is required').trim(),
  type: z.string().min(1, 'Company type is required'),
  vat_number: z.string().min(1, 'VAT number is required').trim(),
  country_code: z.string().min(2, 'Country is required'),
  city: z.string().optional().default(''),
  address: z.string().optional().default(''),
  postal_code: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional().default(''),
});

// ── Freight Schemas ───────────────────────────────────
export const freightSchema = z.object({
  origin_city: z.string().min(1, 'Origin city is required'),
  origin_country: z.string().min(1, 'Origin country is required'),
  origin_postal_code: z.string().optional(),
  destination_city: z.string().min(1, 'Destination city is required'),
  destination_country: z.string().min(1, 'Destination country is required'),
  destination_postal_code: z.string().optional(),
  cargo_type: z.string().min(1, 'Cargo type is required'),
  weight: z.coerce.number().positive('Weight must be positive'),
  volume: z.coerce.number().positive('Volume must be positive').optional(),
  loading_date: z.string().min(1, 'Loading date is required'),
  unloading_date: z.string().optional(),
  vehicle_type: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive').optional(),
  currency: z.string().optional().default('EUR'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

// ── Vehicle Schemas ───────────────────────────────────
export const vehicleSchema = z.object({
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  current_city: z.string().min(1, 'Current city is required'),
  current_country: z.string().min(1, 'Current country is required'),
  destination_city: z.string().optional(),
  destination_country: z.string().optional(),
  max_weight: z.coerce.number().positive('Max weight must be positive').optional(),
  max_volume: z.coerce.number().positive('Max volume must be positive').optional(),
  loading_meters: z.coerce.number().positive().optional(),
  pallet_spaces: z.coerce.number().int().positive().optional(),
  available_from: z.string().min(1, 'Available from date is required'),
  available_to: z.string().optional(),
  price_per_km: z.coerce.number().positive('Price must be positive').optional(),
  flat_price: z.coerce.number().positive('Price must be positive').optional(),
  currency: z.string().optional().default('EUR'),
  description: z.string().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
});

// ── Order Schemas ─────────────────────────────────────
export const orderSchema = z.object({
  pickup_address: z.string().min(1, 'Pickup address is required'),
  pickup_city: z.string().min(1, 'Pickup city is required'),
  pickup_country: z.string().min(1, 'Pickup country is required'),
  pickup_date: z.string().min(1, 'Pickup date is required'),
  delivery_address: z.string().min(1, 'Delivery address is required'),
  delivery_city: z.string().min(1, 'Delivery city is required'),
  delivery_country: z.string().min(1, 'Delivery country is required'),
  delivery_date: z.string().min(1, 'Delivery date is required'),
  cargo_type: z.string().min(1, 'Cargo type is required'),
  weight: z.coerce.number().positive('Weight must be positive'),
  volume: z.coerce.number().positive().optional(),
  pallet_count: z.coerce.number().int().positive().optional(),
  total_price: z.coerce.number().positive('Price must be positive'),
  currency: z.string().optional().default('EUR'),
  special_instructions: z.string().optional(),
});

// ── Tender Schemas ────────────────────────────────────
export const tenderBidSchema = z.object({
  proposed_price: z.coerce.number().positive('Price must be positive'),
  currency: z.string().optional().default('EUR'),
  proposal: z.string().min(10, 'Proposal must be at least 10 characters'),
  transit_time_hours: z.coerce.number().int().positive('Transit time must be positive').optional(),
});

// ── Type exports ──────────────────────────────────────
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;
export type FreightFormData = z.infer<typeof freightSchema>;
export type VehicleFormData = z.infer<typeof vehicleSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type TenderBidFormData = z.infer<typeof tenderBidSchema>;
