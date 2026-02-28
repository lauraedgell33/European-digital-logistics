# UI Patterns

> Reusable interaction and layout patterns across the LogiMarket platform.

---

## 1. Forms

### Standard Form Layout

All forms follow a consistent vertical layout:

```
┌─────────────────────────────────────┐
│ Form Title (h2)                     │
│ Description text (gray-700)         │
│                                     │
│ Label ─────────────────────────     │
│ ┌─────────────────────────────┐     │
│ │ Input                       │     │
│ └─────────────────────────────┘     │
│ Helper text / Error message         │
│                                     │
│ Label ─────────────────────────     │
│ ┌─────────────────────────────┐     │
│ │ Input                       │     │
│ └─────────────────────────────┘     │
│                                     │
│              ┌─────────┐ ┌────────┐ │
│              │ Cancel  │ │ Submit │ │
│              └─────────┘ └────────┘ │
└─────────────────────────────────────┘
```

### Rules

- Labels are always above inputs (never inline for forms).
- Required fields show `*` indicator and `aria-required="true"`.
- Error messages appear below the field in `red-700` with an error icon.
- Buttons are right-aligned. Primary action on the right, secondary on the left.
- Form sections use `Card` with `md` padding.
- Multi-step forms show a progress indicator / stepper at the top.

### Validation

- **Inline validation:** validate on blur; show errors immediately.
- **Submit validation:** validate all; focus the first errored field.
- **Async validation:** show a loading spinner on the field being validated.
- Error messages are specific: "Enter a valid email" not "Invalid input".

### Mobile Forms

- Use `KeyboardAvoidingView` to prevent the keyboard from covering inputs.
- Group related fields in sections with clear headers.
- Use appropriate keyboard types: `email-address`, `numeric`, `phone-pad`.
- Provide "Done" / "Next" return key types for navigation between fields.

---

## 2. Data Tables

### Layout

```
┌─────────────────────────────────────────────────┐
│ ┌─ Toolbar ──────────────────────────────────┐  │
│ │ Search [        ]  Filter ▼  Export ▼      │  │
│ └────────────────────────────────────────────┘  │
│                                                 │
│ ┌─ Header ───────────────────────────────────┐  │
│ │  ☐  Name ▲     Status    Date      Actions │  │
│ ├────────────────────────────────────────────┤  │
│ │  ☐  Shipment   ● Active  2025-01  ···     │  │
│ │  ☐  Delivery   ● Pending 2025-01  ···     │  │
│ │  ☐  Order #42  ● Done    2025-01  ···     │  │
│ └────────────────────────────────────────────┘  │
│                                                 │
│ ┌─ Footer ───────────────────────────────────┐  │
│ │ Showing 1-25 of 142        ← 1 2 3 4 5 →  │  │
│ └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Rules

- Header cells: `caption` scale (11px), uppercase, `gray-700`.
- Body cells: `bodySmall` scale (13px), `gray-1000`.
- Use `tabular-nums` for numeric columns (amounts, dates, IDs).
- Row hover: `gray-100` background.
- Row borders: `gray-200` bottom border.
- Sortable columns show sort indicator (▲/▼).
- Actions column uses icon buttons with `Tooltip`.
- Bulk actions appear in toolbar when rows are selected.
- Empty state: centred `EmptyState` component with icon + message + CTA.

### Pagination

- Default page size: 25 rows.
- Show "Showing X–Y of Z" count.
- Provide page number buttons + prev/next arrows.
- Allow page size selection: 10 / 25 / 50 / 100.

### Mobile Alternative

Mobile doesn't use data tables. Instead:
- Use scrollable card lists (`FlatList`) with `ListItem` or domain cards.
- Provide pull-to-refresh.
- Use infinite scroll (load more on scroll end).
- Filters accessible via bottom sheet or modal.

---

## 3. Navigation

### Sidebar (Frontend & Admin)

```
┌──────────┬──────────────────────────────────┐
│ Logo     │  Breadcrumb > Path > Current     │
│──────────│──────────────────────────────────│
│ Dashboard│  Page Content                     │
│ Orders   │                                   │
│ Freight  │                                   │
│ Vehicles │                                   │
│──────────│                                   │
│ SETTINGS │                                   │
│ Profile  │                                   │
│ Billing  │                                   │
│──────────│                                   │
│ [Avatar] │                                   │
│ User     │                                   │
└──────────┴──────────────────────────────────┘
```

- Sidebar width: 260px (collapsible on desktop, drawer on mobile).
- Active item: `gray-200` background, `gray-1000` text, weight 600.
- Hover: `gray-100` background.
- Group labels: `caption` scale, uppercase, `gray-700`.
- Icons: 18×18px, inherit colour from text.

### Top Bar (Frontend & Admin)

- Height: 64px.
- Background: `background-100` with 1px `gray-400` bottom border.
- Includes: breadcrumbs, global search, user menu, notifications.
- Dark mode: semi-transparent background with `backdrop-filter: blur(12px)`.

### Mobile Tab Bar

```
┌─────────────────────────────────────┐
│                                     │
│         Screen Content              │
│                                     │
├─────────────────────────────────────┤
│  🏠       📦       🚚       👤     │
│  Home   Orders  Tracking  Profile  │
└─────────────────────────────────────┘
```

- Fixed at bottom, 49px height (iOS standard).
- Active tab: `blue-700` icon + label.
- Inactive tab: `gray-600` icon + label.
- Uses `accessibilityRole="tab"`.

### Breadcrumbs

- Font: `bodySmall` (13px), `gray-700`.
- Current (last) item: `gray-1000`, weight 500.
- Separator: `/` character in `gray-500`.

---

## 4. Dashboard Widgets

### Widget Card

```
┌─────────────────────────────────────┐
│ Widget Title                    ⋮   │
│ Description                         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │       Chart / Content           │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

- Container: `Card` with `borderSmall` shadow.
- Title: `body` scale (15px), weight 600, `gray-1000`.
- Description: `bodySmall` (13px), `gray-700`.
- Hover: elevate to `medium` shadow.
- Drag handle: visible on hover, `gray-500` dots.

### Stat Card

```
┌─────────────────────┐
│ Label (caption)     │
│ 1,234  ↑ 12%       │
│ vs. last month      │
└─────────────────────┘
```

- Value: `h2` scale (24px), weight 700, `gray-1000`, `tabular-nums`.
- Label: `bodySmall` (13px), weight 500, `gray-700`.
- Trend: `green-700` for positive, `red-700` for negative.

---

## 5. Error Handling

### Error States

| State | Visual | Message Pattern |
|-------|--------|----------------|
| Form field error | Red border + inline message | "Email is required" / "Enter a valid email" |
| API error (recoverable) | Toast notification | "Failed to save. Please try again." |
| API error (blocking) | Full-screen error card | "Something went wrong" + retry button |
| 404 | EmptyState with illustration | "Page not found" + back/home links |
| Network offline | OfflineBanner (mobile) | "You're offline. Data may not be current." |
| Permission denied | Card with lock icon | "You don't have access to this resource." |

### ErrorBoundary

- Catches unhandled React errors.
- Renders a recovery UI with error details (in dev) and a retry button.
- Logs the error (Sentry integration).

### Toast Notifications

- **Success:** `green-100` background, `green-900` text, checkmark icon.
- **Error:** `red-100` background, `red-900` text, alert icon.
- **Warning:** `amber-100` background, `amber-900` text, warning icon.
- **Info:** `blue-100` background, `blue-900` text, info icon.
- Position: top-right on desktop, top-centre on mobile.
- Auto-dismiss: 5 seconds (configurable).
- Dismissible via close button or swipe (mobile).

---

## 6. Loading States

### Skeleton Loading

Used for initial page/section loads to indicate layout structure:

```css
background: linear-gradient(90deg,
    var(--ds-gray-200) 25%,
    var(--ds-gray-300) 50%,
    var(--ds-gray-200) 75%
);
animation: shimmer 1.5s infinite;
```

- Match the shape and size of the content being loaded.
- Use `border-radius` matching the eventual component.
- Never show skeleton for more than 3 seconds — switch to a spinner or error.

### Spinner Loading

- Used for button actions, inline operations.
- Primary buttons: white spinner replacing button text.
- Standalone: centred spinner with `gray-600` colour.
- Include `aria-busy="true"` on the loading container.

### Page Skeleton

- Full-page skeleton showing the header, sidebar, and content area placeholders.
- Used during initial app hydration and route transitions.

### Mobile Loading

- `LoadingScreen`: full-screen centred spinner with the LogiMarket logo.
- Pull-to-refresh: native `RefreshControl` with `blue-700` tint.
- Inline: `ActivityIndicator` with size and colour from tokens.

---

## 7. Empty States

### Structure

```
┌─────────────────────────────────────┐
│                                     │
│          [Illustration]             │
│                                     │
│       No orders yet                 │
│   Create your first order to get    │
│   started with LogiMarket.          │
│                                     │
│        [ Create Order ]             │
│                                     │
└─────────────────────────────────────┘
```

### Rules

- Centred layout with generous vertical padding (48px+).
- Illustration or icon: 64px, `gray-400` colour.
- Heading: `h3` scale (20px), weight 600, `gray-1000`.
- Description: `body` scale (15px), `gray-700`, max-width 400px, centred.
- CTA button: primary variant, action-oriented text ("Create Order" not "Go").
- For filtered empty states: "No results found. Try adjusting your filters." + Clear Filters button.

---

## 8. Modals & Dialogs

### Structure

```
┌─────────────────────────────────────┐
│ Title                           ✕   │  ← Header (border-bottom)
├─────────────────────────────────────┤
│                                     │
│ Modal content goes here. This can   │  ← Content (padding: 20px 24px)
│ include forms, confirmations, or    │
│ detailed information.               │
│                                     │
├─────────────────────────────────────┤
│                    Cancel   Confirm  │  ← Footer (border-top)
└─────────────────────────────────────┘
```

### Rules

- Max width: 520px (sm), 680px (md), 900px (lg).
- Border radius: `xl` (12px).
- Backdrop: `rgba(0, 0, 0, 0.5)` light, `rgba(0, 0, 0, 0.7)` dark.
- Focus trap: Tab cycles within modal.
- Close: Escape key, backdrop click, close button.
- Animation: fade + scale-up, `normal` duration (250ms), `spring` easing.

### Confirmation Dialog

For destructive actions:
- Title: "Delete {resource}?"
- Description: "This action cannot be undone."
- Buttons: "Cancel" (secondary) + "Delete" (danger).
- require explicit confirmation — never auto-proceed.

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Behaviour |
|------------|-------|-----------|
| Mobile | < 640px | Single column, bottom tab nav |
| Tablet | 640–1024px | Collapsible sidebar, 2-column grid |
| Desktop | 1024–1400px | Full sidebar, multi-column grid |
| Wide | > 1400px | Max-width constraint, centred content |

### Sidebar Behaviour

- **Desktop:** Persistent sidebar (260px).
- **Tablet:** Collapsed sidebar (icons only) or overlay drawer.
- **Mobile web:** Full-screen drawer, triggered by hamburger menu.

---

## 10. Status Indicators

### Status Badge Pattern

Used throughout the platform for order, delivery, vehicle, and freight statuses:

| Status | Light Background | Text Color | Dot Color |
|--------|-----------------|------------|-----------|
| Active / Available | `green-200` | `green-1000` | `green-700` |
| Pending / Draft | `amber-200` / `gray-100` | `amber-1000` / `gray-800` | `amber-700` / `gray-600` |
| In Transit / Processing | `blue-200` | `blue-1000` | `blue-700` |
| Completed / Delivered | `green-200` | `green-1000` | `green-700` |
| Cancelled / Rejected | `red-200` | `red-1000` | `red-700` |
| Expired / Unavailable | `gray-100` | `gray-800` | `gray-600` |

### Badge Format

```
● Status Label
```
- Dot: 6px circle with `dot` colour.
- Text: `caption` or `bodySmall` scale.
- Background: pill-shaped (`border-radius: full`), padded 2px 10px.

---

## 11. Filters & Search

### Search Bar

- Position: top of data tables, top bar (global search).
- Icon: magnifying glass, left-aligned inside input.
- Behaviour: debounced (300ms), client-side for small datasets, server-side for large.
- Clear: show "×" button when input has value.
- Shortcut: `⌘K` / `Ctrl+K` opens CommandPalette.

### Filter Panel

- Trigger: "Filter" button with badge showing count of active filters.
- Position: dropdown panel below trigger or slide-out side panel.
- Each filter: type-appropriate control (select, date range, number range, toggle).
- "Clear all" button to reset.
- Applied filters shown as removable chips/badges above the data.

---

## 12. Drag & Drop

### Dashboard Widget Rearrangement

- Visual cue: grip handle (dots icon) appears on hover.
- Drag feedback: card elevates with `large` shadow, slight scale (1.02).
- Drop zone: highlighted with `blue-200` background and dashed `blue-400` border.
- Snap: widgets snap to grid positions.
- Persist: save layout changes automatically with debounced API call.

### Mobile

- Long-press to initiate drag (with haptic feedback).
- Visual card elevation during drag.
- Drop zones shown as highlighted areas.
