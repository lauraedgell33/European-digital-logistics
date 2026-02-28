/**
 * generate-filament.js
 * ─────────────────────────────────────────────────────────────────────
 * Reads design-tokens.json and generates CSS custom properties
 * formatted for the Filament admin panel theme.
 *
 * Outputs a standalone CSS file with :root (light) and .dark overrides
 * matching the filament-geist-theme.css variable format.
 *
 * Usage:  node generate-filament.js
 * Output: ./dist/filament-tokens.css
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
const indent = (d) => '    '.repeat(d); // 4-space indent for Filament CSS

/**
 * The Filament theme uses a subset of the full color scale:
 * 100, 200, 400, 600, 700, 900  (matching the existing pattern)
 */
const FILAMENT_COLOR_STEPS = ['100', '200', '400', '600', '700', '900'];

/**
 * For gray we also include the full scale (100–1000) since gray
 * is the foundational neutral palette used throughout the admin.
 */
const FULL_STEPS = ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'];

/* ── build color block ────────────────────────────────────────────── */

function colorBlock(name, mode, steps) {
  const scale = tokens.colors[name]?.[mode];
  if (!scale) return [];
  const modeLabel = mode === 'light' ? 'Light' : 'Dark';
  const lines = [];
  lines.push(`${indent(1)}/* Geist ${name.charAt(0).toUpperCase() + name.slice(1)} — ${modeLabel} */`);
  for (const step of steps) {
    if (scale[step]) {
      lines.push(`${indent(1)}--ds-${name}-${step}: ${scale[step]};`);
    }
  }
  lines.push('');
  return lines;
}

/* ── build semantic block ─────────────────────────────────────────── */

function semanticBlock(mode) {
  const sem = tokens.colors.semantic[mode];
  if (!sem) return [];
  const lines = [];
  lines.push(`${indent(1)}/* Geist Semantic — ${mode === 'light' ? 'Light' : 'Dark'} */`);
  lines.push(`${indent(1)}--ds-background-100: ${sem.background100};`);
  lines.push(`${indent(1)}--ds-background-200: ${sem.background200};`);
  lines.push(`${indent(1)}--geist-foreground: ${sem.foreground};`);
  lines.push(`${indent(1)}--geist-background: ${sem.background};`);
  lines.push('');
  return lines;
}

/* ── build shadow block ───────────────────────────────────────────── */

function shadowBlock(mode) {
  const s = tokens.shadows[mode];
  if (!s) return [];
  const lines = [];
  lines.push(`${indent(1)}/* Shadows */`);
  lines.push(`${indent(1)}--ds-shadow-border-base: ${s.borderBase};`);
  lines.push(`${indent(1)}--ds-shadow-border: var(--ds-shadow-border-base);`);
  lines.push(`${indent(1)}--ds-shadow-small: ${s.small};`);
  lines.push(`${indent(1)}--ds-shadow-border-small: var(--ds-shadow-border-base), var(--ds-shadow-small);`);
  lines.push(`${indent(1)}--shadow-medium: ${s.medium};`);
  lines.push('');
  return lines;
}

/* ── assemble ─────────────────────────────────────────────────────── */

const out = [];

out.push('/* ═══════════════════════════════════════════════════════════════════════');
out.push('   LogiMarket Admin — Filament Design Tokens');
out.push('   Auto-generated from design-tokens.json');
out.push('   DO NOT EDIT MANUALLY — run `npm run generate:filament` instead');
out.push('   ═══════════════════════════════════════════════════════════════════════ */');
out.push('');

// ── Light theme (:root) ──
out.push(':root {');
out.push(`${indent(1)}/* Geist spacing */`);
out.push(`${indent(1)}--geist-space: ${tokens.spacing['1']}px;`);
out.push(`${indent(1)}--geist-radius: ${tokens.radii.md}px;`);
out.push(`${indent(1)}--geist-marketing-radius: ${tokens.radii.lg}px;`);
out.push('');
out.push(...colorBlock('gray', 'light', FULL_STEPS));
out.push(...colorBlock('blue', 'light', FILAMENT_COLOR_STEPS));
out.push(...colorBlock('red', 'light', FILAMENT_COLOR_STEPS));
out.push(...colorBlock('amber', 'light', FILAMENT_COLOR_STEPS));
out.push(...colorBlock('green', 'light', FILAMENT_COLOR_STEPS));
out.push(...semanticBlock('light'));
out.push(...shadowBlock('light'));
out.push('}');
out.push('');

// ── Dark theme (.dark) ──
out.push('.dark {');
out.push(...colorBlock('gray', 'dark', FULL_STEPS));
out.push(...colorBlock('blue', 'dark', FILAMENT_COLOR_STEPS));
out.push(...colorBlock('red', 'dark', FILAMENT_COLOR_STEPS));
out.push(...colorBlock('amber', 'dark', FILAMENT_COLOR_STEPS));
out.push(...colorBlock('green', 'dark', FILAMENT_COLOR_STEPS));
out.push(...semanticBlock('dark'));
out.push(...shadowBlock('dark'));
out.push('}');
out.push('');

const css = out.join('\n');
const outPath = path.join(DIST, 'filament-tokens.css');
fs.writeFileSync(outPath, css, 'utf-8');
console.log(`✓ Filament tokens written to ${outPath} (${css.split('\n').length} lines)`);
