import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy HH:mm');
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${kg} kg`;
}

export function formatDistance(km: number): string {
  return `${km.toLocaleString()} km`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  return `${hours}h ${mins}m`;
}

export const VEHICLE_TYPES = [
  { value: 'standard_truck', label: 'Standard Truck' },
  { value: 'mega_trailer', label: 'Mega Trailer' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'container', label: 'Container' },
  { value: 'curtainsider', label: 'Curtainsider' },
  { value: 'box_truck', label: 'Box Truck' },
  { value: 'van', label: 'Van' },
] as const;

export const COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PL', name: 'Poland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'RO', name: 'Romania' },
  { code: 'HU', name: 'Hungary' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LV', name: 'Latvia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'GR', name: 'Greece' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NO', name: 'Norway' },
  { code: 'GB', name: 'United Kingdom' },
] as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  pending: 'amber',
  accepted: 'green',
  rejected: 'red',
  pickup_scheduled: 'blue',
  picked_up: 'blue',
  in_transit: 'blue',
  delivered: 'green',
  completed: 'green',
  cancelled: 'red',
  disputed: 'red',
};

export const SHIPMENT_STATUS_COLORS: Record<string, string> = {
  waiting_pickup: 'gray',
  picked_up: 'blue',
  in_transit: 'blue',
  at_customs: 'amber',
  out_for_delivery: 'blue',
  delivered: 'green',
  delayed: 'red',
  exception: 'red',
};

export function getCountryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name || code;
}

export function getCountryFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
