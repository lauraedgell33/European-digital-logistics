/**
 * generate-rn.js
 * ─────────────────────────────────────────────────────────────────────
 * Reads design-tokens.json and generates a TypeScript constants file
 * compatible with React Native / Expo (logistics-mobile).
 *
 * The output mirrors the existing `constants/theme.ts` structure with
 * Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow, and
 * StatusColors exports.
 *
 * Usage:  node generate-rn.js
 * Output: ./dist/theme.ts
 * ─────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');

const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'design-tokens.json'), 'utf-8')
);

const DIST = path.join(__dirname, 'dist');
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

/* ── helpers ──────────────────────────────────────────────────────── */

/**
 * Convert an HSL string "hsl(h, s%, l%)" to a hex color.
 * Needed because React Native doesn't support HSL in all cases.
 */
function hslToHex(hslStr) {
  const m = hslStr.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/);
  if (!m) return hslStr; // return as-is if not HSL (e.g. already hex)

  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/* ── build Colors object ──────────────────────────────────────────── */

function buildColors() {
  const light = tokens.colors;
  const sem = light.semantic.light;

  // Map Geist tokens to the mobile Colors shape
  return {
    // Primary — use blue-700 (matches frontend #0070f3 equivalent)
    primary: hslToHex(light.blue.light['700']),
    primaryLight: hslToHex(light.blue.light['500']),
    primaryDark: hslToHex(light.blue.light['900']),
    primaryBg: hslToHex(light.blue.light['100']),

    // Secondary — use blue-600
    secondary: hslToHex(light.blue.light['600']),
    secondaryLight: hslToHex(light.blue.light['400']),

    // Success — green
    success: hslToHex(light.green.light['700']),
    successLight: hslToHex(light.green.light['200']),
    successDark: hslToHex(light.green.light['1000']),

    // Warning — amber
    warning: hslToHex(light.amber.light['700']),
    warningLight: hslToHex(light.amber.light['200']),
    warningDark: hslToHex(light.amber.light['1000']),

    // Danger — red
    danger: hslToHex(light.red.light['700']),
    dangerLight: hslToHex(light.red.light['200']),
    dangerDark: hslToHex(light.red.light['1000']),

    // Info — blue
    info: hslToHex(light.blue.light['600']),
    infoLight: hslToHex(light.blue.light['200']),
    infoDark: hslToHex(light.blue.light['1000']),
    infoBg: hslToHex(light.blue.light['100']),

    // Neutrals
    white: '#ffffff',
    card: '#ffffff',
    neutralLight: hslToHex(light.gray.light['100']),
    background: sem.background200,
    surface: '#ffffff',
    surfaceSecondary: hslToHex(light.gray.light['100']),
    border: hslToHex(light.gray.light['400']),
    borderLight: hslToHex(light.gray.light['100']),
    divider: hslToHex(light.gray.light['400']),

    // Text
    text: hslToHex(light.gray.light['1000']),
    textSecondary: hslToHex(light.gray.light['800']),
    textTertiary: hslToHex(light.gray.light['600']),
    textInverse: '#ffffff',
    textLink: hslToHex(light.blue.light['700']),

    // Status
    statusActive: hslToHex(light.green.light['700']),
    statusPending: hslToHex(light.amber.light['700']),
    statusInTransit: hslToHex(light.blue.light['700']),
    statusCompleted: hslToHex(light.green.light['700']),
    statusCancelled: hslToHex(light.red.light['700']),
    statusDraft: hslToHex(light.gray.light['600']),
    statusRejected: hslToHex(light.red.light['700']),

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.08)',
  };
}

/* ── build Dark Colors ────────────────────────────────────────────── */

function buildDarkColors() {
  const dark = tokens.colors;
  const sem = dark.semantic.dark;

  return {
    // Primary
    primary: hslToHex(dark.blue.dark['700']),
    primaryLight: hslToHex(dark.blue.dark['600']),
    primaryDark: hslToHex(dark.blue.dark['900']),
    primaryBg: hslToHex(dark.blue.dark['100']),

    // Secondary
    secondary: hslToHex(dark.blue.dark['600']),
    secondaryLight: hslToHex(dark.blue.dark['500']),

    // Success
    success: hslToHex(dark.green.dark['700']),
    successLight: hslToHex(dark.green.dark['200']),
    successDark: hslToHex(dark.green.dark['900']),

    // Warning
    warning: hslToHex(dark.amber.dark['700']),
    warningLight: hslToHex(dark.amber.dark['200']),
    warningDark: hslToHex(dark.amber.dark['900']),

    // Danger
    danger: hslToHex(dark.red.dark['700']),
    dangerLight: hslToHex(dark.red.dark['200']),
    dangerDark: hslToHex(dark.red.dark['900']),

    // Info
    info: hslToHex(dark.blue.dark['600']),
    infoLight: hslToHex(dark.blue.dark['200']),
    infoDark: hslToHex(dark.blue.dark['900']),
    infoBg: hslToHex(dark.blue.dark['100']),

    // Neutrals
    white: '#000000',
    card: hslToHex(dark.gray.dark['100']),
    neutralLight: hslToHex(dark.gray.dark['200']),
    background: sem.background100,
    surface: hslToHex(dark.gray.dark['100']),
    surfaceSecondary: hslToHex(dark.gray.dark['200']),
    border: hslToHex(dark.gray.dark['400']),
    borderLight: hslToHex(dark.gray.dark['300']),
    divider: hslToHex(dark.gray.dark['400']),

    // Text
    text: hslToHex(dark.gray.dark['1000']),
    textSecondary: hslToHex(dark.gray.dark['900']),
    textTertiary: hslToHex(dark.gray.dark['600']),
    textInverse: '#000000',
    textLink: hslToHex(dark.blue.dark['900']),

    // Status
    statusActive: hslToHex(dark.green.dark['700']),
    statusPending: hslToHex(dark.amber.dark['700']),
    statusInTransit: hslToHex(dark.blue.dark['700']),
    statusCompleted: hslToHex(dark.green.dark['700']),
    statusCancelled: hslToHex(dark.red.dark['700']),
    statusDraft: hslToHex(dark.gray.dark['600']),
    statusRejected: hslToHex(dark.red.dark['700']),

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.24)',
  };
}

/* ── build GeistColors (full palette for both modes) ──────────────── */

function buildGeistColors() {
  const light = tokens.colors;
  const colorNames = ['blue', 'gray', 'red', 'amber', 'green'];
  const scales = {};

  for (const name of colorNames) {
    for (const step of ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000']) {
      const lightVal = light[name]?.light?.[step];
      if (lightVal) scales[`${name}${step}`] = hslToHex(lightVal);
    }
  }
  return scales;
}

/* ── build other exports ──────────────────────────────────────────── */

function buildSpacing() {
  const sp = tokens.spacing;
  return {
    xs: sp['1'],
    sm: sp['2'],
    md: sp['3'],
    lg: sp['4'],
    xl: sp['5'],
    xxl: sp['6'],
    xxxl: sp['8'],
    xxxxl: sp['10'],
  };
}

function buildFontSize() {
  const sc = tokens.typography.scale;
  return {
    xs: sc.caption.size,
    sm: sc.bodySmall.size,
    md: sc.body.size,
    lg: 17,
    xl: sc.h3.size,
    xxl: sc.h2.size,
    xxxl: sc.h1.size,
    title: sc.display.size,
  };
}

function buildFontWeight() {
  return {
    regular: "'400' as const",
    medium: "'500' as const",
    semibold: "'600' as const",
    bold: "'700' as const",
  };
}

function buildBorderRadius() {
  return {
    sm: tokens.radii.md,
    md: 10,
    lg: 14,
    xl: 20,
    full: tokens.radii.full,
  };
}

function buildShadow() {
  return {
    sm: {
      shadowColor: "'#000'",
      shadowOffset: '{ width: 0, height: 1 }',
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "'#000'",
      shadowOffset: '{ width: 0, height: 2 }',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "'#000'",
      shadowOffset: '{ width: 0, height: 4 }',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
  };
}

/* ── serialise to TS ──────────────────────────────────────────────── */

function objectToTS(obj, depth = 1) {
  const pad = '  '.repeat(depth);
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      lines.push(`${pad}${k}: {`);
      lines.push(objectToTS(v, depth + 1));
      lines.push(`${pad}},`);
    } else if (typeof v === 'string') {
      // Check for raw TS expressions (as const, objects)
      if (v.includes(' as const') || v.startsWith('{') || v.startsWith('Colors.')) {
        lines.push(`${pad}${k}: ${v},`);
      } else {
        lines.push(`${pad}${k}: '${v}',`);
      }
    } else {
      lines.push(`${pad}${k}: ${v},`);
    }
  }
  return lines.join('\n');
}

function buildStatusColors() {
  const colors = buildColors();
  // Reference Colors.* for StatusColors to keep it DRY
  const statuses = {
    active: { bg: 'Colors.successLight', text: 'Colors.successDark', dot: 'Colors.success' },
    available: { bg: 'Colors.successLight', text: 'Colors.successDark', dot: 'Colors.success' },
    pending: { bg: 'Colors.warningLight', text: 'Colors.warningDark', dot: 'Colors.warning' },
    draft: { bg: 'Colors.surfaceSecondary', text: 'Colors.textSecondary', dot: 'Colors.textTertiary' },
    accepted: { bg: 'Colors.primaryBg', text: 'Colors.primary', dot: 'Colors.primaryLight' },
    in_transit: { bg: 'Colors.infoLight', text: 'Colors.infoDark', dot: 'Colors.info' },
    picked_up: { bg: 'Colors.infoLight', text: 'Colors.infoDark', dot: 'Colors.info' },
    pickup_scheduled: { bg: 'Colors.infoLight', text: 'Colors.infoDark', dot: 'Colors.info' },
    delivered: { bg: 'Colors.successLight', text: 'Colors.successDark', dot: 'Colors.success' },
    completed: { bg: 'Colors.successLight', text: 'Colors.successDark', dot: 'Colors.success' },
    cancelled: { bg: 'Colors.dangerLight', text: 'Colors.dangerDark', dot: 'Colors.danger' },
    rejected: { bg: 'Colors.dangerLight', text: 'Colors.dangerDark', dot: 'Colors.danger' },
    disputed: { bg: 'Colors.warningLight', text: 'Colors.warningDark', dot: 'Colors.warning' },
    expired: { bg: 'Colors.surfaceSecondary', text: 'Colors.textSecondary', dot: 'Colors.textTertiary' },
    matched: { bg: 'Colors.primaryBg', text: 'Colors.primary', dot: 'Colors.primaryLight' },
    booked: { bg: 'Colors.primaryBg', text: 'Colors.primary', dot: 'Colors.primaryLight' },
    unavailable: { bg: 'Colors.surfaceSecondary', text: 'Colors.textSecondary', dot: 'Colors.textTertiary' },
    waiting_pickup: { bg: 'Colors.warningLight', text: 'Colors.warningDark', dot: 'Colors.warning' },
    at_customs: { bg: 'Colors.warningLight', text: 'Colors.warningDark', dot: 'Colors.warning' },
    out_for_delivery: { bg: 'Colors.infoLight', text: 'Colors.infoDark', dot: 'Colors.info' },
    delayed: { bg: 'Colors.dangerLight', text: 'Colors.dangerDark', dot: 'Colors.danger' },
    exception: { bg: 'Colors.dangerLight', text: 'Colors.dangerDark', dot: 'Colors.danger' },
    open: { bg: 'Colors.successLight', text: 'Colors.successDark', dot: 'Colors.success' },
    evaluation: { bg: 'Colors.warningLight', text: 'Colors.warningDark', dot: 'Colors.warning' },
    awarded: { bg: 'Colors.primaryBg', text: 'Colors.primary', dot: 'Colors.primaryLight' },
    closed: { bg: 'Colors.surfaceSecondary', text: 'Colors.textSecondary', dot: 'Colors.textTertiary' },
    paid: { bg: 'Colors.successLight', text: 'Colors.successDark', dot: 'Colors.success' },
    invoiced: { bg: 'Colors.primaryBg', text: 'Colors.primary', dot: 'Colors.primaryLight' },
    overdue: { bg: 'Colors.dangerLight', text: 'Colors.dangerDark', dot: 'Colors.danger' },
    verified: { bg: 'Colors.successLight', text: 'Colors.successDark', dot: 'Colors.success' },
  };
  return statuses;
}

/* ── assemble ─────────────────────────────────────────────────────── */

const lines = [];

lines.push('/**');
lines.push(' * LogiMarket Design Tokens — React Native / Expo');
lines.push(' * Auto-generated from design-tokens.json');
lines.push(' * DO NOT EDIT MANUALLY — run `npm run generate:rn` instead');
lines.push(' */');
lines.push('');
lines.push("import { ColorSchemeName } from 'react-native';");
lines.push('');

// GeistColors (full palette)
lines.push('export const GeistColors = {');
const geist = buildGeistColors();
for (const [k, v] of Object.entries(geist)) {
  lines.push(`  ${k}: '${v}',`);
}
lines.push('};');
lines.push('');

// Light Colors
lines.push('export const LightColors = {');
const colorsObj = buildColors();
for (const [k, v] of Object.entries(colorsObj)) {
  lines.push(`  ${k}: '${v}',`);
}
lines.push('};');
lines.push('');

// Dark Colors
lines.push('export const DarkColors = {');
const darkColorsObj = buildDarkColors();
for (const [k, v] of Object.entries(darkColorsObj)) {
  lines.push(`  ${k}: '${v}',`);
}
lines.push('};');
lines.push('');

// Colors alias (default to light for backward compat)
lines.push('export const Colors = LightColors;');
lines.push('');

// getColors helper
lines.push("/** Get colors based on color scheme. Returns dark colors if scheme is 'dark', light otherwise. */");
lines.push("export function getColors(scheme: ColorSchemeName = 'light') {");
lines.push("  return scheme === 'dark' ? DarkColors : LightColors;");
lines.push('}');
lines.push('');

// Spacing
lines.push('export const Spacing = {');
lines.push(objectToTS(buildSpacing()));
lines.push('};');
lines.push('');

// FontSize
lines.push('export const FontSize = {');
lines.push(objectToTS(buildFontSize()));
lines.push('};');
lines.push('');

// FontWeight
lines.push('export const FontWeight = {');
const fw = buildFontWeight();
for (const [k, v] of Object.entries(fw)) {
  lines.push(`  ${k}: ${v},`);
}
lines.push('};');
lines.push('');

// BorderRadius
lines.push('export const BorderRadius = {');
lines.push(objectToTS(buildBorderRadius()));
lines.push('};');
lines.push('');

// Shadow
lines.push('export const Shadow = {');
const shadow = buildShadow();
for (const [size, props] of Object.entries(shadow)) {
  lines.push(`  ${size}: {`);
  for (const [pk, pv] of Object.entries(props)) {
    if (typeof pv === 'string') {
      lines.push(`    ${pk}: ${pv},`);
    } else {
      lines.push(`    ${pk}: ${pv},`);
    }
  }
  lines.push('  },');
}
lines.push('};');
lines.push('');

// StatusColors (light)
lines.push("export const StatusColors: Record<string, { bg: string; text: string; dot: string }> = {");
const sc = buildStatusColors();
for (const [status, mapping] of Object.entries(sc)) {
  lines.push(`  ${status}: { bg: ${mapping.bg}, text: ${mapping.text}, dot: ${mapping.dot} },`);
}
lines.push('};');
lines.push('');

// DarkStatusColors
lines.push("export const DarkStatusColors: Record<string, { bg: string; text: string; dot: string }> = {");
for (const [status, mapping] of Object.entries(sc)) {
  // Replace Colors. with DarkColors.
  const bg = mapping.bg.replace('Colors.', 'DarkColors.');
  const text = mapping.text.replace('Colors.', 'DarkColors.');
  const dot = mapping.dot.replace('Colors.', 'DarkColors.');
  lines.push(`  ${status}: { bg: ${bg}, text: ${text}, dot: ${dot} },`);
}
lines.push('};');
lines.push('');

// getStatusColors helper
lines.push("/** Get status colors based on color scheme */");
lines.push("export function getStatusColors(scheme: ColorSchemeName = 'light') {");
lines.push("  return scheme === 'dark' ? DarkStatusColors : StatusColors;");
lines.push('}');
lines.push('');

const ts = lines.join('\n');
const outPath = path.join(DIST, 'theme.ts');
fs.writeFileSync(outPath, ts, 'utf-8');
console.log(`✓ React Native theme written to ${outPath} (${ts.split('\n').length} lines)`);
