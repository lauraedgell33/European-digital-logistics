import {
  cn,
  formatDate,
  formatDateTime,
  formatCurrency,
  formatWeight,
  formatDistance,
  formatDuration,
  getCountryName,
  getCountryFlag,
  ORDER_STATUS_COLORS,
  SHIPMENT_STATUS_COLORS,
} from '@/lib/utils';

describe('cn (tailwind class merger)', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-3')).toBe('px-2 py-3');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
  });

  it('resolves conflicting tailwind classes', () => {
    // twMerge should keep the last conflicting class
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2025-03-15T10:30:00Z');
    expect(result).toBe('15 Mar 2025');
  });

  it('formats Date object', () => {
    const result = formatDate(new Date(2024, 11, 25)); // Dec 25, 2024
    expect(result).toBe('25 Dec 2024');
  });

  it('handles different date formats consistently', () => {
    const result = formatDate('2025-01-01');
    expect(result).toContain('Jan 2025');
  });
});

describe('formatDateTime', () => {
  it('formats date with time', () => {
    const result = formatDateTime('2025-06-15T14:30:00Z');
    // Should include both date and time
    expect(result).toContain('15 Jun 2025');
    expect(result).toMatch(/\d{2}:\d{2}/); // HH:mm pattern
  });
});

describe('formatCurrency', () => {
  it('formats EUR amount by default', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
    // Intl.NumberFormat may use symbol or code depending on locale
    expect(result).toMatch(/EUR|€/);
  });

  it('formats with specified currency', () => {
    const result = formatCurrency(2500, 'USD');
    expect(result).toContain('2,500');
  });

  it('handles zero amount', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('handles decimal amounts', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234');
  });

  it('handles large amounts', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1,000,000');
  });
});

describe('formatWeight', () => {
  it('formats weight in kg for values under 1000', () => {
    expect(formatWeight(500)).toBe('500 kg');
  });

  it('formats weight in tonnes for values >= 1000', () => {
    expect(formatWeight(1000)).toBe('1.0 t');
    expect(formatWeight(2500)).toBe('2.5 t');
  });

  it('handles fractional tonnes', () => {
    expect(formatWeight(1500)).toBe('1.5 t');
    expect(formatWeight(24000)).toBe('24.0 t');
  });
});

describe('formatDistance', () => {
  it('formats distance in km with locale formatting', () => {
    expect(formatDistance(1500)).toContain('1,500');
    expect(formatDistance(1500)).toContain('km');
  });

  it('handles small distances', () => {
    expect(formatDistance(50)).toBe('50 km');
  });
});

describe('formatDuration', () => {
  it('formats minutes only for less than 60 minutes', () => {
    expect(formatDuration(45)).toBe('45min');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('formats exact hours', () => {
    expect(formatDuration(120)).toBe('2h 0m');
  });
});

describe('getCountryName', () => {
  it('returns full country name for known code', () => {
    expect(getCountryName('DE')).toBe('Germany');
    expect(getCountryName('FR')).toBe('France');
    expect(getCountryName('PL')).toBe('Poland');
    expect(getCountryName('RO')).toBe('Romania');
  });

  it('returns the code itself for unknown country code', () => {
    expect(getCountryName('XX')).toBe('XX');
  });
});

describe('getCountryFlag', () => {
  it('returns flag emoji for country code', () => {
    const flag = getCountryFlag('DE');
    // Flag emoji for DE is 🇩🇪
    expect(flag).toBeDefined();
    expect(typeof flag).toBe('string');
    expect(flag.length).toBeGreaterThan(0);
  });
});

describe('ORDER_STATUS_COLORS', () => {
  it('maps draft to gray', () => {
    expect(ORDER_STATUS_COLORS.draft).toBe('gray');
  });

  it('maps pending to amber', () => {
    expect(ORDER_STATUS_COLORS.pending).toBe('amber');
  });

  it('maps accepted to green', () => {
    expect(ORDER_STATUS_COLORS.accepted).toBe('green');
  });

  it('maps rejected to red', () => {
    expect(ORDER_STATUS_COLORS.rejected).toBe('red');
  });

  it('maps in_transit to blue', () => {
    expect(ORDER_STATUS_COLORS.in_transit).toBe('blue');
  });

  it('maps delivered and completed to green', () => {
    expect(ORDER_STATUS_COLORS.delivered).toBe('green');
    expect(ORDER_STATUS_COLORS.completed).toBe('green');
  });

  it('maps cancelled to red', () => {
    expect(ORDER_STATUS_COLORS.cancelled).toBe('red');
  });
});

describe('SHIPMENT_STATUS_COLORS', () => {
  it('maps waiting_pickup to gray', () => {
    expect(SHIPMENT_STATUS_COLORS.waiting_pickup).toBe('gray');
  });

  it('maps in_transit to blue', () => {
    expect(SHIPMENT_STATUS_COLORS.in_transit).toBe('blue');
  });

  it('maps delivered to green', () => {
    expect(SHIPMENT_STATUS_COLORS.delivered).toBe('green');
  });

  it('maps delayed to red', () => {
    expect(SHIPMENT_STATUS_COLORS.delayed).toBe('red');
  });
});
