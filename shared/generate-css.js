/**
 * generate-css.js
 * ─────────────────────────────────────────────────────────────────────
 * Reads design-tokens.json and generates CSS custom properties
 * compatible with the frontend's globals.css pattern.
 *
 * Usage:  node generate-css.js
 * Output: ./dist/tokens.css
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

/** Indent a line by `depth` levels (2-space tabs) */
const indent = (depth) => '  '.repeat(depth);

/** Convert camelCase to kebab-case */
const kebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/* ── color variables ──────────────────────────────────────────────── */

function buildColorVars(mode) {
  const lines = [];
  const colorNames = ['gray', 'blue', 'red', 'amber', 'green'];

  for (const name of colorNames) {
    const scale = tokens.colors[name]?.[mode];
    if (!scale) continue;

    lines.push(`${indent(1)}/* Geist ${name.charAt(0).toUpperCase() + name.slice(1)} — ${mode === 'light' ? 'Light' : 'Dark'} */`);

    for (const [step, value] of Object.entries(scale)) {
      lines.push(`${indent(1)}--ds-${name}-${step}: ${value};`);
    }
    lines.push('');
  }

  // Semantic colors
  const sem = tokens.colors.semantic[mode];
  if (sem) {
    lines.push(`${indent(1)}/* Semantic — ${mode === 'light' ? 'Light' : 'Dark'} */`);
    lines.push(`${indent(1)}--ds-background-100: ${sem.background100};`);
    lines.push(`${indent(1)}--ds-background-200: ${sem.background200};`);
    lines.push(`${indent(1)}--geist-foreground: ${sem.foreground};`);
    lines.push(`${indent(1)}--geist-background: ${sem.background};`);
    lines.push(`${indent(1)}--geist-link-color: ${sem.linkColor};`);
    lines.push(`${indent(1)}--geist-selection: ${sem.selection};`);
    lines.push(`${indent(1)}--geist-selection-text-color: ${sem.selectionText};`);
    lines.push('');
  }

  return lines;
}

/* ── shadow variables ─────────────────────────────────────────────── */

function buildShadowVars(mode) {
  const s = tokens.shadows[mode];
  if (!s) return [];
  const lines = [];
  lines.push(`${indent(1)}/* Shadows — ${mode === 'light' ? 'Light' : 'Dark'} */`);
  lines.push(`${indent(1)}--ds-shadow-border-base: ${s.borderBase};`);
  lines.push(`${indent(1)}--ds-shadow-border: var(--ds-shadow-border-base);`);
  lines.push(`${indent(1)}--ds-shadow-small: ${s.small};`);
  lines.push(`${indent(1)}--ds-shadow-border-small: var(--ds-shadow-border-base), var(--ds-shadow-small);`);
  lines.push(`${indent(1)}--shadow-medium: ${s.medium};`);
  lines.push(`${indent(1)}--shadow-large: ${s.large};`);
  lines.push('');
  return lines;
}

/* ── spacing / radii / layout ─────────────────────────────────────── */

function buildSpacingVars() {
  const lines = [];
  lines.push(`${indent(1)}/* Spacing */`);
  lines.push(`${indent(1)}--geist-space: ${tokens.spacing['1']}px;`);
  lines.push(`${indent(1)}--geist-gap: ${tokens.spacing.gap}px;`);
  lines.push(`${indent(1)}--geist-gap-half: ${tokens.spacing.gapHalf}px;`);
  lines.push(`${indent(1)}--geist-gap-quarter: ${tokens.spacing.gapQuarter}px;`);
  lines.push(`${indent(1)}--geist-page-margin: ${tokens.spacing.pageMargin}px;`);
  lines.push('');
  return lines;
}

function buildRadiiVars() {
  const lines = [];
  lines.push(`${indent(1)}/* Radii */`);
  for (const [name, value] of Object.entries(tokens.radii)) {
    lines.push(`${indent(1)}--geist-radius-${name}: ${value === 9999 ? '9999px' : value + 'px'};`);
  }
  lines.push(`${indent(1)}--geist-radius: ${tokens.radii.md}px;`);
  lines.push(`${indent(1)}--geist-marketing-radius: ${tokens.radii.lg}px;`);
  lines.push('');
  return lines;
}

function buildLayoutVars() {
  const lines = [];
  lines.push(`${indent(1)}/* Layout */`);
  lines.push(`${indent(1)}--ds-header-height: ${tokens.layout.headerHeight}px;`);
  lines.push(`${indent(1)}--ds-sidebar-width: ${tokens.layout.sidebarWidth}px;`);
  lines.push(`${indent(1)}--ds-page-width: ${tokens.layout.maxPageWidth}px;`);
  lines.push(`${indent(1)}--ds-grid-cell-padding: ${tokens.layout.gridCellPadding}px;`);
  lines.push('');
  return lines;
}

/* ── typography ───────────────────────────────────────────────────── */

function buildTypographyVars() {
  const lines = [];
  lines.push(`${indent(1)}/* Typography */`);
  lines.push(`${indent(1)}--font-sans: ${tokens.typography.fontFamily.sans};`);
  lines.push(`${indent(1)}--font-mono: ${tokens.typography.fontFamily.mono};`);
  lines.push('');
  for (const [name, spec] of Object.entries(tokens.typography.scale)) {
    lines.push(`${indent(1)}--text-${kebab(name)}-size: ${spec.size}px;`);
    lines.push(`${indent(1)}--text-${kebab(name)}-weight: ${spec.weight};`);
    lines.push(`${indent(1)}--text-${kebab(name)}-lh: ${spec.lineHeight};`);
    lines.push(`${indent(1)}--text-${kebab(name)}-ls: ${spec.letterSpacing}em;`);
  }
  lines.push('');
  return lines;
}

/* ── animation ────────────────────────────────────────────────────── */

function buildAnimationVars() {
  const lines = [];
  lines.push(`${indent(1)}/* Animation */`);
  for (const [name, value] of Object.entries(tokens.animation.easing)) {
    lines.push(`${indent(1)}--ease-${kebab(name)}: ${value};`);
  }
  for (const [name, value] of Object.entries(tokens.animation.duration)) {
    lines.push(`${indent(1)}--duration-${kebab(name)}: ${value}ms;`);
  }
  lines.push('');
  return lines;
}

/* ── assemble output ──────────────────────────────────────────────── */

const output = [];

output.push('/* ═════════════════════════════════════════════════════════════════');
output.push('   LogiMarket Design Tokens — Auto-generated from design-tokens.json');
output.push('   DO NOT EDIT MANUALLY — run `npm run generate:css` instead');
output.push('   ═════════════════════════════════════════════════════════════════ */');
output.push('');

// Light theme (:root)
output.push(':root {');
output.push(...buildSpacingVars());
output.push(...buildRadiiVars());
output.push(...buildLayoutVars());
output.push(...buildTypographyVars());
output.push(...buildAnimationVars());
output.push(...buildColorVars('light'));
output.push(...buildShadowVars('light'));
output.push('}');
output.push('');

// Dark theme (.dark / prefers-color-scheme)
output.push('.dark,');
output.push('[data-theme="dark"] {');
output.push(...buildColorVars('dark'));
output.push(...buildShadowVars('dark'));
output.push('}');
output.push('');

output.push('@media (prefers-color-scheme: dark) {');
output.push('  :root:not([data-theme="light"]) {');
// Re-indent dark vars with extra level
for (const line of buildColorVars('dark')) {
  output.push('  ' + line);
}
for (const line of buildShadowVars('dark')) {
  output.push('  ' + line);
}
output.push('  }');
output.push('}');

const css = output.join('\n') + '\n';
const outPath = path.join(DIST, 'tokens.css');
fs.writeFileSync(outPath, css, 'utf-8');
console.log(`✓ CSS tokens written to ${outPath} (${css.split('\n').length} lines)`);
