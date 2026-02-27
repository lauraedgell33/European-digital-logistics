export const Colors = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',
  primaryBg: '#eff6ff',

  secondary: '#6366f1',
  secondaryLight: '#818cf8',

  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#065f46',

  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#92400e',

  danger: '#ef4444',
  dangerLight: '#fee2e2',
  dangerDark: '#991b1b',

  info: '#06b6d4',
  infoLight: '#cffafe',
  infoDark: '#155e75',
  infoBg: '#ecfeff',

  // Neutrals
  white: '#ffffff',
  card: '#ffffff',
  neutralLight: '#f1f5f9',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSecondary: '#f1f5f9',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#e2e8f0',

  // Text
  text: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',
  textLink: '#2563eb',

  // Status colors
  statusActive: '#10b981',
  statusPending: '#f59e0b',
  statusInTransit: '#3b82f6',
  statusCompleted: '#10b981',
  statusCancelled: '#ef4444',
  statusDraft: '#94a3b8',
  statusRejected: '#ef4444',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  title: 34,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const StatusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
  available: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
  pending: { bg: Colors.warningLight, text: Colors.warningDark, dot: Colors.warning },
  draft: { bg: Colors.surfaceSecondary, text: Colors.textSecondary, dot: Colors.textTertiary },
  accepted: { bg: Colors.primaryBg, text: Colors.primary, dot: Colors.primaryLight },
  in_transit: { bg: Colors.infoLight, text: Colors.infoDark, dot: Colors.info },
  picked_up: { bg: Colors.infoLight, text: Colors.infoDark, dot: Colors.info },
  pickup_scheduled: { bg: Colors.infoLight, text: Colors.infoDark, dot: Colors.info },
  delivered: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
  completed: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
  cancelled: { bg: Colors.dangerLight, text: Colors.dangerDark, dot: Colors.danger },
  rejected: { bg: Colors.dangerLight, text: Colors.dangerDark, dot: Colors.danger },
  disputed: { bg: Colors.warningLight, text: Colors.warningDark, dot: Colors.warning },
  expired: { bg: Colors.surfaceSecondary, text: Colors.textSecondary, dot: Colors.textTertiary },
  matched: { bg: Colors.primaryBg, text: Colors.primary, dot: Colors.primaryLight },
  booked: { bg: Colors.primaryBg, text: Colors.primary, dot: Colors.primaryLight },
  unavailable: { bg: Colors.surfaceSecondary, text: Colors.textSecondary, dot: Colors.textTertiary },
  waiting_pickup: { bg: Colors.warningLight, text: Colors.warningDark, dot: Colors.warning },
  at_customs: { bg: Colors.warningLight, text: Colors.warningDark, dot: Colors.warning },
  out_for_delivery: { bg: Colors.infoLight, text: Colors.infoDark, dot: Colors.info },
  delayed: { bg: Colors.dangerLight, text: Colors.dangerDark, dot: Colors.danger },
  exception: { bg: Colors.dangerLight, text: Colors.dangerDark, dot: Colors.danger },
  open: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
  evaluation: { bg: Colors.warningLight, text: Colors.warningDark, dot: Colors.warning },
  awarded: { bg: Colors.primaryBg, text: Colors.primary, dot: Colors.primaryLight },
  closed: { bg: Colors.surfaceSecondary, text: Colors.textSecondary, dot: Colors.textTertiary },
  paid: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
  invoiced: { bg: Colors.primaryBg, text: Colors.primary, dot: Colors.primaryLight },
  overdue: { bg: Colors.dangerLight, text: Colors.dangerDark, dot: Colors.danger },
  verified: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
};
