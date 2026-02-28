# Component Catalog

> Cross-platform component inventory for the LogiMarket design system.

Each component is listed with its platform availability, props/API, and usage notes.

**Legend:** ✅ Available | ❌ Not available | 🔧 Filament built-in (themed via CSS)

---

## Primitives

### Button

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Button.tsx` |
| Mobile | ✅ | `components/ui/Button.tsx` |
| Admin | 🔧 | `.fi-btn` (Filament) |

**Frontend Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable interaction |
| `icon` | `ReactNode` | — | Leading icon |
| `onClick` | `() => void` | — | Click handler |

**Mobile Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'danger'` | `'primary'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show ActivityIndicator |
| `disabled` | `boolean` | `false` | Disable interaction |
| `onPress` | `() => void` | — | Press handler |

---

### Input

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Input.tsx` |
| Mobile | ✅ | `components/ui/Input.tsx` |
| Admin | 🔧 | `.fi-input` (Filament) |

**Frontend Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label |
| `error` | `string` | — | Error message |
| `icon` | `ReactNode` | — | Leading icon |
| `type` | `string` | `'text'` | HTML input type |
| `placeholder` | `string` | — | Placeholder text |
| `disabled` | `boolean` | `false` | Disable input |

**Mobile Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label |
| `error` | `string` | — | Error message |
| `secureTextEntry` | `boolean` | `false` | Password field |
| `placeholder` | `string` | — | Placeholder text |

---

### Card

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Card.tsx` |
| Mobile | ✅ | `components/ui/Card.tsx` |
| Admin | 🔧 | `.fi-section` (Filament) |

**Frontend Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | Inner padding |
| `hover` | `boolean` | `false` | Hover shadow effect |
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | — | Card content |

**Mobile Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `ViewStyle` | — | Custom styles |
| `onPress` | `() => void` | — | Press handler (makes card tappable) |
| `children` | `ReactNode` | — | Card content |

---

### Badge

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Badge.tsx` |
| Mobile | ✅ | `components/ui/Badge.tsx` |
| Admin | 🔧 | `.fi-badge` (Filament) |

**Frontend Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | Color variant |
| `size` | `'sm' \| 'md'` | `'md'` | Badge size |
| `children` | `ReactNode` | — | Badge text |

**Mobile Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | — | Status key (maps to `StatusColors`) |
| `label` | `string` | — | Display text |

---

### Select

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Select.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-select` (Filament) |

**Frontend Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `{ value: string; label: string }[]` | — | Select options |
| `value` | `string` | — | Selected value |
| `onChange` | `(value: string) => void` | — | Change handler |
| `placeholder` | `string` | — | Placeholder text |
| `error` | `string` | — | Error message |

---

### Textarea

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Textarea.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-textarea` (Filament) |

---

### Switch / Toggle

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Switch.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-toggle` (Filament) |

---

### Tabs

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Tabs.tsx` |
| Mobile | ✅ | `components/ui/TabBar.tsx` |
| Admin | 🔧 | `.fi-tabs` (Filament) |

---

## Layout

### Modal / Dialog

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Modal.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-modal` (Filament) |

**Frontend Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `onClose` | `() => void` | — | Close handler |
| `title` | `string` | — | Modal title |
| `children` | `ReactNode` | — | Modal content |
| `footer` | `ReactNode` | — | Footer actions |

---

### Breadcrumb

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Breadcrumb.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-breadcrumbs` (Filament) |

---

## Feedback

### Notification / Toast

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Notification.tsx` |
| Mobile | ✅ | `components/ui/Toast.tsx` |
| Admin | 🔧 | `.fi-notification` (Filament) |

---

### Progress

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Progress.tsx` |
| Mobile | ❌ | — |
| Admin | ❌ | — |

---

### Loading / Skeleton

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Loading.tsx`, `PageSkeleton.tsx` |
| Mobile | ✅ | `components/ui/LoadingScreen.tsx` |
| Admin | 🔧 | `.fi-loading-indicator` (Filament) |

---

### EmptyState

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/EmptyState.tsx` |
| Mobile | ✅ | `components/ui/EmptyState.tsx` |
| Admin | 🔧 | `.fi-ta-empty-state` (Filament) |

---

### ErrorBoundary

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/ErrorBoundary.tsx` |
| Mobile | ✅ | `components/ErrorBoundary.tsx` |
| Admin | ❌ | — |

---

## Data Display

### DataTable

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/DataTable.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-ta` (Filament) |

**Frontend Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | — | Column definitions |
| `data` | `T[]` | — | Row data |
| `sortable` | `boolean` | `true` | Enable column sorting |
| `filterable` | `boolean` | `false` | Enable column filtering |
| `pagination` | `boolean` | `true` | Enable pagination |
| `pageSize` | `number` | `25` | Rows per page |
| `loading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `string` | — | Empty state text |

---

### Avatar

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Avatar.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-avatar` (Filament) |

---

### AnimatedNumber

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/AnimatedNumber.tsx` |
| Mobile | ❌ | — |
| Admin | ❌ | — |

---

### StatCard

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ❌ | — |
| Mobile | ✅ | `components/ui/StatCard.tsx` |
| Admin | 🔧 | `.fi-wi-stats-overview-stat` (Filament) |

---

### ListItem

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ❌ | — |
| Mobile | ✅ | `components/ui/ListItem.tsx` |
| Admin | ❌ | — |

---

## Navigation

### CommandPalette

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/CommandPalette.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-global-search` (Filament) |

---

### SkipNav

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/SkipNav.tsx` |
| Mobile | ❌ | — |
| Admin | ❌ | — |

---

### Tooltip

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/Tooltip.tsx` |
| Mobile | ❌ | — |
| Admin | ❌ | — |

---

## Domain-Specific (Mobile)

| Component | File | Description |
|-----------|------|-------------|
| DeliveryCard | `components/DeliveryCard.tsx` | Delivery details with status, addresses, timeline |
| FreightCard | `components/FreightCard.tsx` | Freight listing with route, weight, price |
| OrderCard | `components/OrderCard.tsx` | Order summary with items, status, actions |
| VehicleCard | `components/VehicleCard.tsx` | Vehicle info with type, capacity, location |
| OfflineBanner | `components/OfflineBanner.tsx` | Network connectivity warning banner |

---

## Dashboard (Frontend)

| Component | File | Description |
|-----------|------|-------------|
| DashboardToolbar | `components/dashboard/DashboardToolbar.tsx` | Dashboard action toolbar |
| WidgetPicker | `components/dashboard/WidgetPicker.tsx` | Widget selection dialog |
| WidgetWrapper | `components/dashboard/WidgetWrapper.tsx` | Widget container with drag/resize |

---

## Utility

### ExportMenu

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/ExportMenu.tsx` |
| Mobile | ❌ | — |
| Admin | ❌ | — |

---

### FormField

| Platform | Available | Location |
|----------|-----------|----------|
| Frontend | ✅ | `components/ui/FormField.tsx` |
| Mobile | ❌ | — |
| Admin | 🔧 | `.fi-fo-field-wrp` (Filament) |

---

## Cross-Platform Parity Matrix

| Component | Frontend | Mobile | Admin |
|-----------|----------|--------|-------|
| Button | ✅ | ✅ | 🔧 |
| Input | ✅ | ✅ | 🔧 |
| Card | ✅ | ✅ | 🔧 |
| Badge | ✅ | ✅ | 🔧 |
| Tabs | ✅ | ✅ | 🔧 |
| Toast / Notification | ✅ | ✅ | 🔧 |
| Loading | ✅ | ✅ | 🔧 |
| EmptyState | ✅ | ✅ | 🔧 |
| ErrorBoundary | ✅ | ✅ | ❌ |
| Modal | ✅ | ❌ | 🔧 |
| DataTable | ✅ | ❌ | 🔧 |
| Select | ✅ | ❌ | 🔧 |
| Textarea | ✅ | ❌ | 🔧 |
| Switch | ✅ | ❌ | 🔧 |
| Breadcrumb | ✅ | ❌ | 🔧 |
| Avatar | ✅ | ❌ | 🔧 |
| CommandPalette | ✅ | ❌ | 🔧 |
| Progress | ✅ | ❌ | ❌ |
| Tooltip | ✅ | ❌ | ❌ |
| SkipNav | ✅ | ❌ | ❌ |
| AnimatedNumber | ✅ | ❌ | ❌ |
| ExportMenu | ✅ | ❌ | ❌ |
| StatCard | ❌ | ✅ | 🔧 |
| ListItem | ❌ | ✅ | ❌ |
