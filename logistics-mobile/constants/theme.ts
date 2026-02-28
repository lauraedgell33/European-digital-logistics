// Geist Design System — Shared Color Tokens for React Native
// Synchronized with frontend's Geist/Vercel-inspired design system

export const GeistColors = {
  // Primary Blue Scale
  blue100: '#f0f7ff',
  blue200: '#e6f0ff',
  blue300: '#d4e4ff',
  blue400: '#b8d4fe',
  blue500: '#7ab8ff',
  blue600: '#52a8ff',
  blue700: '#0070f3',  // PRIMARY
  blue800: '#0060d1',
  blue900: '#0050b3',
  blue1000: '#002966',

  // Gray Scale
  gray100: '#f2f2f2',
  gray200: '#ebebeb',
  gray300: '#e6e6e6',
  gray400: '#ebebeb',
  gray500: '#c9c9c9',
  gray600: '#a8a8a8',
  gray700: '#8f8f8f',
  gray800: '#7d7d7d',
  gray900: '#666666',
  gray1000: '#171717',

  // Red Scale
  red100: '#fff5f5',
  red200: '#ffe0e0',
  red400: '#ffbdbd',
  red600: '#ff6166',
  red700: '#e5484d',
  red900: '#cd2b31',

  // Amber Scale
  amber100: '#fff8e6',
  amber200: '#ffeecc',
  amber400: '#ffd580',
  amber600: '#e6a117',
  amber700: '#f5a623',
  amber900: '#a35200',

  // Green Scale
  green100: '#eef9f0',
  green200: '#dff3e3',
  green400: '#b8e5c0',
  green600: '#5fba68',
  green700: '#45a557',
  green900: '#297a32',
};

export const Colors = {
  // Primary
  primary: GeistColors.blue700,       // #0070f3
  primaryLight: GeistColors.blue500,
  primaryDark: GeistColors.blue900,
  primaryBg: GeistColors.blue100,

  // Secondary (purple accent)
  secondary: '#6c63ff',
  secondaryLight: '#8b84ff',

  // Status
  success: GeistColors.green700,      // #45a557
  successLight: GeistColors.green100,
  successDark: GeistColors.green900,

  warning: GeistColors.amber700,      // #f5a623
  warningLight: GeistColors.amber100,
  warningDark: GeistColors.amber900,

  danger: GeistColors.red700,         // #e5484d
  dangerLight: GeistColors.red100,
  dangerDark: GeistColors.red900,

  info: GeistColors.blue600,
  infoLight: GeistColors.blue100,
  infoDark: GeistColors.blue900,
  infoBg: GeistColors.blue100,

  // Neutrals — Geist
  white: '#ffffff',
  card: '#ffffff',
  neutralLight: GeistColors.gray100,
  background: '#fafafa',
  surface: '#ffffff',
  surfaceSecondary: GeistColors.gray100,
  border: GeistColors.gray200,
  borderLight: GeistColors.gray100,
  divider: GeistColors.gray200,

  // Text — Geist
  text: GeistColors.gray1000,         // #171717
  textSecondary: GeistColors.gray800, // #7d7d7d
  textTertiary: GeistColors.gray600,  // #a8a8a8
  textInverse: '#ffffff',
  textLink: GeistColors.blue700,

  // Status Colors (for badges)
  statusActive: GeistColors.green700,
  statusPending: GeistColors.amber700,
  statusInTransit: GeistColors.blue700,
  statusCompleted: GeistColors.green700,
  statusCancelled: GeistColors.red700,
  statusDraft: GeistColors.gray600,
  statusRejected: GeistColors.red700,

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
  in_transit: { bg: Colors.infoBg, text: Colors.infoDark, dot: Colors.info },
  picked_up: { bg: Colors.infoBg, text: Colors.infoDark, dot: Colors.info },
  pickup_scheduled: { bg: Colors.infoBg, text: Colors.infoDark, dot: Colors.info },
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
  out_for_delivery: { bg: Colors.infoBg, text: Colors.infoDark, dot: Colors.info },
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
