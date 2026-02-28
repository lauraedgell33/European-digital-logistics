# LogiMarket Design System

> A Geist/Vercel-inspired design system powering the LogiMarket European digital logistics platform across web, mobile, and admin.

---

## Philosophy

The LogiMarket design system draws inspiration from **Vercel's Geist** design language — prioritising clarity, precision, and functional beauty. Every element exists to serve the logistics workflows our users depend on, not to decorate.

### Core Principles

| Principle | Description |
|---|---|
| **Clarity first** | Information density is high in logistics; every pixel must earn its place. |
| **Systematic color** | A full HSL-based palette (gray, blue, red, amber, green) with 10-step scales for light and dark themes. |
| **Platform-coherent** | Tokens are shared across Next.js frontend, React Native mobile, and Filament admin — one source of truth. |
| **Accessible by default** | WCAG 2.1 AA contrast ratios, keyboard navigation, screen reader support built into every component. |
| **Motion with purpose** | Spring-based easings (`cubic-bezier(0.22, 1, 0.36, 1)`) that feel natural, never gratuitous. |

---

## Architecture

```
shared/
├── design-tokens.json        ← Single source of truth
├── generate-css.js            ← Generates CSS custom properties
├── generate-rn.js             ← Generates React Native theme.ts
├── generate-filament.js       ← Generates Filament admin CSS vars
└── dist/                      ← Generated output
    ├── tokens.css
    ├── theme.ts
    └── filament-tokens.css
```

Run `npm run generate` in `shared/` to regenerate all platform tokens from the JSON source.

---

## Color Tokens

All colors use HSL notation and follow a 100–1000 scale where lower numbers are lighter (in light mode) and darker (in dark mode), inverting for dark theme.

### Gray Scale

| Step | Light | Dark | Usage |
|------|-------|------|-------|
| 100 | `hsl(0, 0%, 95%)` | `hsl(0, 0%, 10%)` | Hover backgrounds |
| 200 | `hsl(0, 0%, 92%)` | `hsl(0, 0%, 12%)` | Active backgrounds, borders |
| 300 | `hsl(0, 0%, 90%)` | `hsl(0, 0%, 16%)` | Subtle borders |
| 400 | `hsl(0, 0%, 92%)` | `hsl(0, 0%, 18%)` | Component borders |
| 500 | `hsl(0, 0%, 79%)` | `hsl(0, 0%, 27%)` | Placeholder text |
| 600 | `hsl(0, 0%, 66%)` | `hsl(0, 0%, 53%)` | Tertiary text |
| 700 | `hsl(0, 0%, 56%)` | `hsl(0, 0%, 56%)` | Secondary labels |
| 800 | `hsl(0, 0%, 49%)` | `hsl(0, 0%, 49%)` | Secondary text |
| 900 | `hsl(0, 0%, 40%)` | `hsl(0, 0%, 63%)` | Primary labels |
| 1000 | `hsl(0, 0%, 9%)` | `hsl(0, 0%, 93%)` | Primary text |

### Blue Scale (Primary / Info)

| Step | Light | Dark |
|------|-------|------|
| 100 | `hsl(212, 100%, 97%)` | `hsl(216, 50%, 12%)` |
| 700 | `hsl(212, 100%, 48%)` | `hsl(212, 100%, 48%)` |
| 900 | `hsl(211, 100%, 42%)` | `hsl(210, 100%, 66%)` |

### Red Scale (Danger / Error)

| Step | Light | Dark |
|------|-------|------|
| 100 | `hsl(0, 100%, 97%)` | `hsl(357, 37%, 12%)` |
| 700 | `hsl(358, 75%, 59%)` | `hsl(358, 75%, 59%)` |
| 900 | `hsl(358, 66%, 48%)` | `hsl(358, 100%, 69%)` |

### Amber Scale (Warning)

| Step | Light | Dark |
|------|-------|------|
| 100 | `hsl(39, 100%, 95%)` | `hsl(35, 100%, 8%)` |
| 700 | `hsl(39, 100%, 57%)` | `hsl(39, 100%, 57%)` |
| 900 | `hsl(30, 100%, 32%)` | `hsl(39, 90%, 50%)` |

### Green Scale (Success)

| Step | Light | Dark |
|------|-------|------|
| 100 | `hsl(120, 60%, 96%)` | `hsl(136, 50%, 9%)` |
| 700 | `hsl(131, 41%, 46%)` | `hsl(131, 41%, 46%)` |
| 900 | `hsl(133, 50%, 32%)` | `hsl(131, 43%, 57%)` |

---

## Typography

| Scale | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | 36px | 700 | 1.1 | -0.02em | Hero sections, landing pages |
| H1 | 30px | 700 | 1.2 | -0.02em | Page titles |
| H2 | 24px | 600 | 1.3 | -0.01em | Section headers |
| H3 | 20px | 600 | 1.4 | -0.01em | Card titles, sub-sections |
| Body | 15px | 400 | 1.6 | 0 | Default paragraph text |
| Body Small | 13px | 400 | 1.5 | 0 | Table cells, descriptions |
| Caption | 11px | 500 | 1.4 | 0.01em | Labels, badges, metadata |
| Mono | 13px | 400 | 1.5 | 0 | Code, tracking numbers |

### Font Stacks

- **Sans:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Mono:** `'Geist Mono', 'SF Mono', 'Fira Code', monospace`

---

## Spacing

Based on a 4px base unit. All spacing values are multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Minimal gaps (icon padding) |
| `2` | 8px | Tight spacing (button padding) |
| `3` | 12px | Standard inner padding |
| `4` | 16px | Card padding, form gaps |
| `5` | 20px | Section spacing |
| `6` | 24px | Standard gap (grid/flex gap) |
| `8` | 32px | Large section padding |
| `10` | 40px | Page-level vertical rhythm |
| `gap` | 24px | Default layout gap |
| `gapHalf` | 12px | Half layout gap |
| `pageMargin` | 24px | Page edge margin |

---

## Shadows

| Token | Light | Dark |
|-------|-------|------|
| Border Base | `0 0 0 1px rgba(0,0,0,0.08)` | `0 0 0 1px rgba(255,255,255,0.145)` |
| Small | `0px 1px 2px rgba(0,0,0,0.04)` | `0px 1px 2px rgba(0,0,0,0.16)` |
| Border + Small | Combined | Combined |
| Medium | `0 8px 30px rgba(0,0,0,0.12)` | `0 0 0 1px rgba(255,255,255,0.145)` |
| Large | `0 30px 60px rgba(0,0,0,0.12)` | `0 0 0 1px rgba(255,255,255,0.2)` |

---

## Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Small elements (badges) |
| `md` | 6px | Default (inputs, buttons, cards) |
| `lg` | 8px | Marketing/landing page cards |
| `xl` | 12px | Modals, large containers |
| `full` | 9999px | Pills, avatars |

---

## Animation

### Easing Functions

| Name | Value | Usage |
|------|-------|-------|
| Spring | `cubic-bezier(0.22, 1, 0.36, 1)` | Default UI transitions |
| Out Expo | `cubic-bezier(0.16, 1, 0.3, 1)` | Slide-ins, expandable panels |
| In-Out Quart | `cubic-bezier(0.76, 0, 0.24, 1)` | Page transitions |

### Durations

| Name | Value | Usage |
|------|-------|-------|
| Fast | 150ms | Hover states, micro-interactions |
| Normal | 250ms | Standard transitions |
| Slow | 350ms | Panel open/close |
| Slower | 500ms | Full-page transitions |

---

## Component Inventory

### Frontend (Next.js)

| Component | File | Description |
|-----------|------|-------------|
| AnimatedNumber | `ui/AnimatedNumber.tsx` | Animated stat counters |
| Avatar | `ui/Avatar.tsx` | User/entity avatars |
| Badge | `ui/Badge.tsx` | Status/label badges |
| Breadcrumb | `ui/Breadcrumb.tsx` | Navigation breadcrumbs |
| Button | `ui/Button.tsx` | Primary/secondary/danger buttons |
| Card | `ui/Card.tsx` | Content containers |
| CommandPalette | `ui/CommandPalette.tsx` | ⌘K search palette |
| DataTable | `ui/DataTable.tsx` | Sortable/filterable data tables |
| EmptyState | `ui/EmptyState.tsx` | Zero-data states |
| ErrorBoundary | `ui/ErrorBoundary.tsx` | React error boundaries |
| ExportMenu | `ui/ExportMenu.tsx` | CSV/PDF export dropdown |
| FormField | `ui/FormField.tsx` | Form field wrapper |
| Input | `ui/Input.tsx` | Text inputs |
| Loading | `ui/Loading.tsx` | Loading spinners/skeletons |
| Modal | `ui/Modal.tsx` | Dialog modals |
| Notification | `ui/Notification.tsx` | Toast notifications |
| PageSkeleton | `ui/PageSkeleton.tsx` | Full-page skeleton loaders |
| Progress | `ui/Progress.tsx` | Progress bars |
| Select | `ui/Select.tsx` | Dropdown selects |
| SkipNav | `ui/SkipNav.tsx` | Accessibility skip navigation |
| Switch | `ui/Switch.tsx` | Toggle switches |
| Tabs | `ui/Tabs.tsx` | Tab navigation |
| Textarea | `ui/Textarea.tsx` | Multi-line text input |
| Tooltip | `ui/Tooltip.tsx` | Hover tooltips |

### Mobile (React Native / Expo)

| Component | File | Description |
|-----------|------|-------------|
| Badge | `ui/Badge.tsx` | Status badges |
| Button | `ui/Button.tsx` | Touch-friendly buttons |
| Card | `ui/Card.tsx` | Content cards |
| EmptyState | `ui/EmptyState.tsx` | Empty content states |
| Input | `ui/Input.tsx` | Text inputs |
| ListItem | `ui/ListItem.tsx` | List row items |
| LoadingScreen | `ui/LoadingScreen.tsx` | Full-screen loaders |
| StatCard | `ui/StatCard.tsx` | Dashboard stat cards |
| TabBar | `ui/TabBar.tsx` | Bottom tab navigation |
| Toast | `ui/Toast.tsx` | Toast messages |
| DeliveryCard | `DeliveryCard.tsx` | Delivery detail card |
| FreightCard | `FreightCard.tsx` | Freight listing card |
| OrderCard | `OrderCard.tsx` | Order summary card |
| VehicleCard | `VehicleCard.tsx` | Vehicle info card |
| ErrorBoundary | `ErrorBoundary.tsx` | Error boundary |
| OfflineBanner | `OfflineBanner.tsx` | Network status banner |

### Admin (Filament / Laravel)

Filament provides its own component library. The Geist theme CSS customises their appearance:

- Sidebar navigation
- Top bar / header
- Cards & stat widgets
- Buttons (primary, secondary, danger)
- Form inputs & field wrappers
- Data tables with sort/filter
- Badges
- Modals & dialogs
- Notifications / toasts
- Tabs
- Dropdown menus
- Avatars
- Breadcrumbs

---

## Accessibility Guidelines

- **Contrast:** All text meets WCAG 2.1 AA (4.5:1 for body, 3:1 for large text)
- **Focus:** Visible focus ring (`2px solid blue-700`, `offset: 2px`) on all interactive elements
- **Skip navigation:** `SkipNav` component on frontend for keyboard users
- **ARIA:** Proper `role`, `aria-label`, `aria-current` on navigation items
- **Reduced motion:** Respect `prefers-reduced-motion` media query
- **Touch targets:** Minimum 44×44px on mobile
- **Screen readers:** All icons have `aria-hidden` or descriptive labels
- **Color independence:** Never rely solely on color to convey meaning — always pair with text/icons

See [accessibility.md](accessibility.md) for full guidelines.

---

## Contribution Guide

### Adding a New Token

1. Add the value to `shared/design-tokens.json`
2. Run `npm run generate` to regenerate all platform files
3. Update the frontend's `globals.css` if the CSS output needs manual integration
4. Update the mobile's `constants/theme.ts` if the RN output needs manual integration
5. Update `docs/design-system/tokens.md` with the new token documentation

### Adding a New Component

1. Build the component in the target platform following existing patterns
2. Use only design tokens — no hardcoded colors, sizes, or spacing
3. Ensure WCAG 2.1 AA compliance
4. Add Storybook stories (frontend) or snapshot tests (mobile)
5. Document in `docs/design-system/components.md`

### Code Style

- CSS: Use `var(--ds-*)` tokens; never hardcode HSL/hex values
- React Native: Import from `constants/theme.ts`; never inline colors
- Filament: Extend via `filament-geist-theme.css`; override with `!important` only where Filament requires it
