# LogiMarket — Plan Complet UI/UX

> **Data**: 28 Februarie 2026  
> **Platforme**: Frontend (Next.js 14) · Mobile (Expo/React Native) · Admin (Filament v3)  
> **Design System**: Geist/Vercel-inspired  

---

## Starea Curentă (Audit)

| Aspect | Frontend | Mobile | Admin |
|--------|:--------:|:------:|:-----:|
| Componente UI | 24 | 10 | 44 resurse |
| Pagini/Ecrane | ~34 | ~35 | 44 CRUD |
| Design Tokens | Geist CSS vars + Tailwind | Constante hardcodate | Geist CSS overlay |
| Culoare Primară | `#0070f3` (Geist Blue) | `#1e40af` (Tailwind Blue) ⚠️ | `#0070f3` (Geist Blue) |
| Font | Geist Sans | System default ⚠️ | Inter |
| Dark Mode | ✅ Complet | ⚠️ Incomplet | ✅ Complet |
| Accesibilitate | Bun | ⚠️ Minim | Bun (Filament) |
| Animații | Bogate | Bazice | Framework-level |

### Probleme Critice Identificate

1. **Culori inconsistente pe mobil** — Primary `#1e40af` vs `#0070f3` pe frontend/admin
2. **Dark mode rupt pe mobil** — ThemeProvider există dar Colors n-au variante dark
3. **Deficit de componente mobile** — 10 vs 24 pe frontend (lipsesc Modal, Select, Skeleton, etc.)
4. **Font inconsistent** — 3 strategii diferite (Geist Sans → System → Inter)
5. **Accesibilitate absentă pe mobil** — fără accessibilityLabel/Role pe componente
6. **Admin CSS incomplet** — lipsesc scale red/amber/green din tema Geist

---

## Faza 1 — Design System Unificat (Fundație)

**Obiectiv**: Un singur set de design tokens partajat între toate 3 platformele

### 1.1 Token-uri de Culoare Unificate
```
Fișier: shared/design-tokens.json (Sursă unică de adevăr)
```
| Token | Light | Dark | Utilizare |
|-------|-------|------|-----------|
| `primary-500` | `#0070f3` | `#3291ff` | Butoane, link-uri, focus |
| `primary-600` | `#0761d1` | `#0070f3` | Hover butoane |
| `primary-700` | `#0059b3` | `#0761d1` | Active/Pressed |
| `danger-500` | `#e5484d` | `#e5484d` | Erori, ștergere |
| `success-500` | `#45a557` | `#45a557` | Confirmare, status OK |
| `warning-500` | `#f5a623` | `#f5a623` | Atenționări |
| `gray-100` | `hsl(0,0%,95%)` | `hsl(0,0%,11%)` | Fundal subtil |
| `gray-200` | `hsl(0,0%,92%)` | `hsl(0,0%,14%)` | Borduri |
| `gray-600` | `hsl(0,0%,66%)` | `hsl(0,0%,63%)` | Text secundar |
| `gray-1000` | `hsl(0,0%,9%)` | `hsl(0,0%,93%)` | Text primar |
| `background-100` | `#ffffff` | `#0a0a0a` | Fundal pagină |
| `background-200` | `#fafafa` | `#111111` | Fundal card |

**Acțiuni:**
- [ ] Creare `shared/design-tokens.json` cu toate culorile (10 shade-uri × 5 scale = 50 culori)
- [ ] Script generator: `tokens → CSS vars` (frontend), `tokens → TypeScript consttable` (mobile), `tokens → CSS vars` (admin)
- [ ] Sincronizare automată la build (`prebuild` hook)

### 1.2 Tipografie Unificată
| Nivel | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| Display | Inter/Geist | 36px | 700 | 1.1 |
| H1 | Inter/Geist | 30px | 700 | 1.2 |
| H2 | Inter/Geist | 24px | 600 | 1.3 |
| H3 | Inter/Geist | 20px | 600 | 1.4 |
| Body | Inter/Geist | 15px | 400 | 1.6 |
| Body Small | Inter/Geist | 13px | 400 | 1.5 |
| Caption | Inter/Geist | 11px | 500 | 1.4 |
| Mono | Geist Mono | 13px | 400 | 1.5 |

**Acțiuni:**
- [ ] Frontend: Deja folosește Geist Sans ✅
- [ ] Mobile: Instalare Inter font (`expo-font` + `@expo-google-fonts/inter`)
- [ ] Admin: Deja folosește Inter ✅
- [ ] Definire scale tipografice comune în tokens

### 1.3 Spații, Raze & Umbre
| Token | Valoare | Utilizare |
|-------|---------|-----------|
| `space-1` | 4px | Micro spacing |
| `space-2` | 8px | Padding intern compact |
| `space-3` | 12px | Gap între elemente |
| `space-4` | 16px | Padding card |
| `space-6` | 24px | Padding secțiune |
| `space-8` | 32px | Margin între secțiuni |
| `radius-sm` | 4px | Badges, chips |
| `radius-md` | 6px | Cards, inputs, butoane |
| `radius-lg` | 8px | Modals, dropdowns |
| `radius-full` | 9999px | Avatars, pills |
| `shadow-border` | `0 0 0 1px rgba(0,0,0,0.08)` | Card borders |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Elevație subtilă |
| `shadow-md` | `0 8px 30px rgba(0,0,0,0.12)` | Dropdowns, modals |

---

## Faza 2 — Componente Mobile (Gap Critic)

**Obiectiv**: Aducerea mobilului la paritate cu frontend-ul (10 → 24 componente)

### 2.1 Componente Noi de Creat

| # | Componentă | Prioritate | Descriere |
|---|-----------|:----------:|-----------|
| 1 | `Modal` | 🔴 Critică | Bottom sheet + centered modal cu animații |
| 2 | `Select/Picker` | 🔴 Critică | Selector nativ iOS/Android cu search |
| 3 | `Textarea` | 🔴 Critică | Input multilinie cu auto-resize |
| 4 | `Skeleton` | 🟡 Importantă | Loading placeholder animat (shimmer) |
| 5 | `Progress` | 🟡 Importantă | Bară de progres + circular |
| 6 | `Switch/Toggle` | 🟡 Importantă | Toggle cu animație smooth |
| 7 | `Tooltip` | 🟢 Nice-to-have | Tooltip pe long press |
| 8 | `Avatar` | 🟡 Importantă | Imagine utilizator cu fallback la inițiale |
| 9 | `DataList` | 🟡 Importantă | FlashList optimizat cu pull-to-refresh |
| 10 | `SearchBar` | 🔴 Critică | Input de căutare cu debounce + clear |
| 11 | `DatePicker` | 🟡 Importantă | Calendar picker nativ |
| 12 | `ActionSheet` | 🟡 Importantă | Bottom action sheet cu opțiuni |
| 13 | `Chip/Tag` | 🟢 Nice-to-have | Tag selectabil cu dismiss |
| 14 | `Tabs` | 🟡 Importantă | Tab bar custom pentru conținut |

### 2.2 Upgrade Componente Existente

| Componentă | Îmbunătățiri |
|-----------|-------------|
| `Button` | + `Pressable` cu `react-native-reanimated` (scale 0.97), + haptic feedback (`expo-haptics`), + `accessibilityRole="button"` |
| `Card` | + Umbre Geist (`shadow-border`), + `accessibilityRole="summary"`, + varianta `interactive` cu press feedback |
| `Badge` | + Culorile Geist (sync cu frontend), + varianta `dot` (indicator) |
| `Input` | + Focus ring animat, + error state shake animation, + `accessibilityLabel` |
| `StatCard` | + Sparkline integrat, + AnimatedNumber, + trend arrows |
| `ListItem` | + Swipeable actions (react-native-gesture-handler), + separator styling |
| `TabBar` | + Culorile Geist, + indicator animat, + badge pe tab |
| `Toast` | + Variante (success/error/warning/info), + auto-dismiss, + swipe to dismiss |

### 2.3 Dark Mode Complet (Mobil)

```typescript
// constants/theme.ts — restructurare
export const Colors = {
  light: {
    primary: '#0070f3',
    primaryHover: '#0761d1',
    background: '#ffffff',
    backgroundSubtle: '#fafafa',
    foreground: '#000000',
    gray100: '#f2f2f2', gray200: '#ebebeb', gray600: '#a8a8a8',
    gray700: '#8f8f8f', gray900: '#666666', gray1000: '#171717',
    border: '#ebebeb',
    danger: '#e5484d', success: '#45a557', warning: '#f5a623',
  },
  dark: {
    primary: '#3291ff',
    primaryHover: '#0070f3',
    background: '#0a0a0a',
    backgroundSubtle: '#111111',
    foreground: '#ededed',
    gray100: '#1a1a1a', gray200: '#232323', gray600: '#a0a0a0',
    gray700: '#6e6e6e', gray900: '#a0a0a0', gray1000: '#ededed',
    border: '#333333',
    danger: '#e5484d', success: '#45a557', warning: '#f5a623',
  }
}
```

**Acțiuni:**
- [ ] Restructurare `constants/theme.ts` cu light/dark variante complete
- [ ] Update `ThemeContext.tsx` cu `useColorScheme()` hook + toggle manual
- [ ] Update toate componentele să folosească `useTheme()` hook
- [ ] Testare pe iOS + Android cu dark mode system

---

## Faza 3 — Accesibilitate (A11y)

**Obiectiv**: WCAG 2.1 AA pe frontend, accesibilitate bună pe mobil

### 3.1 Frontend (Next.js) — Rafinare

| Acțiune | Fișiere | Detalii |
|---------|---------|---------|
| Contrast ratio audit | `globals.css` | Verificare toate combinațiile text/background ≥ 4.5:1 |
| Skip navigation | `layout.tsx` | Deja există `SkipNav` ✅ |
| Focus management | Toate componentele | Reduce motion: `prefers-reduced-motion` pe toate animațiile |
| Form validation | `FormField.tsx` | `aria-describedby` pe erori, `aria-required` pe required |
| Live regions | `Notification.tsx` | `aria-live="polite"` pe toast notifications |
| Keyboard navigation | `DataTable.tsx` | Arrow keys pe rânduri, Enter pe acțiuni |
| Color-blind safe | Toate badges/statusuri | Nu te baza doar pe culoare — adaugă icons/patterns |
| Screen reader testing | Pagini critice | Test cu NVDA/VoiceOver pe: login, dashboard, orders, tracking |

### 3.2 Mobile (React Native) — Acțiuni Critice

| Componentă | Props de Adăugat |
|-----------|-----------------|
| `Button` | `accessibilityRole="button"`, `accessibilityLabel={label}`, `accessibilityState={{ disabled }}` |
| `Card` | `accessibilityRole="summary"`, `accessibilityLabel={title + " card"}` |
| `Input` | `accessibilityLabel={label}`, `accessibilityHint={placeholder}`, `accessibilityState={{ disabled }}` |
| `Badge` | `accessibilityRole="text"`, `accessibilityLabel={"Status: " + label}` |
| `StatCard` | `accessibilityRole="text"`, `accessibilityLabel={label + ": " + value}` |
| `ListItem` | `accessibilityRole="button"`, `accessibilityHint="Tap to view details"` |
| `TabBar` | `accessibilityRole="tabBar"`, tabs cu `accessibilityRole="tab"` + `accessibilityState={{ selected }}` |
| Toate ecranele | `<Text accessibilityRole="header">` pe titluri |

### 3.3 Admin (Filament) — Minim
- Filament are A11y built-in ✅
- [ ] Verificare contrast culori Geist pe dark mode
- [ ] Test keyboard navigation pe custom pages

---

## Faza 4 — Îmbunătățiri Frontend

**Obiectiv**: Finisare și componente lipsă

### 4.1 Componente Noi
| # | Componentă | Descriere |
|---|-----------|-----------|
| 1 | `DatePicker` | Calendar cu range selection (pentru freight dates) |
| 2 | `Dropdown/Menu` | Context menu cu keyboard nav (pentru acțiuni pe rânduri table) |
| 3 | `Stepper/Wizard` | Multi-step form (pentru onboarding, creare comenzi) |
| 4 | `Chart` | Wrapper unificat peste Recharts cu tema Geist |
| 5 | `FileUpload` | Drag & drop cu preview, progress, validation |
| 6 | `RichTextEditor` | Editor text formatat pentru mesaje/descrieri |
| 7 | `Timeline` | Vertical timeline pentru tracking și activități |
| 8 | `KanbanBoard` | Drag & drop board pentru managementul comenzilor |
| 9 | `Map` | Componentă hartă cu tracking rute |
| 10 | `Drawer` | Side panel pentru detalii rapide (alternativă la modal) |

### 4.2 Îmbunătățiri Existente
| Componentă | Upgrade |
|-----------|---------|
| `DataTable` | + Column resizing, + Row virtualization (TanStack Virtual), + Bulk actions, + Export (CSV/PDF) |
| `CommandPalette` | + Recent searches, + Categorii vizuale, + Keyboard shortcut hints |
| `Card` | + Varianta `collapsible`, + Footer slot, + Loading overlay |
| `Modal` | + Size `full-screen`, + Nested modals, + Swipe to close pe mobile |
| `Button` | + `IconButton` variant, + Button group, + Dropdown button |
| `Badge` | + Animație de count (AnimatedNumber), + Badge pe Avatar |
| `Notification` | + Action buttons pe notificări, + Stack notifications, + Undo action |

### 4.3 Storybook Complet
- [ ] Stories pentru TOATE componentele (acum doar 3/24)
- [ ] Documentație props cu `argTypes`
- [ ] Visual regression testing cu Chromatic
- [ ] Accessibility testing in stories (`@storybook/addon-a11y`)

---

## Faza 5 — Micro-interacțiuni & Animații

**Obiectiv**: Polish de nivel Vercel/Linear pe toate platformele

### 5.1 Frontend — Animații
| Element | Animație | Implementare |
|---------|----------|-------------|
| Page transitions | Fade + slide up | `framer-motion` `AnimatePresence` pe layout |
| Table row hover | Highlight subtle + lift | CSS `transform: translateY(-1px)` + shadow |
| Button click | Ripple effect | Deja există ✅ |
| Number changes | Count-up animation | `AnimatedNumber` deja există ✅ |
| Charts | Draw-in on viewport enter | `Intersection Observer` + chart animation |
| Status changes | Color morph | CSS `transition: background-color 300ms` |
| Sidebar collapse | Width transition | `transition: width 200ms ease` |
| Card skeleton | Shimmer effect | `@keyframes shimmer` deja în globals ✅ |
| Toast enter/exit | Slide in + fade out | HeadlessUI Transition |
| Modal open | Scale up + backdrop blur | HeadlessUI Transition ✅ |
| Dropdown | Scale Y from top | `transform-origin: top` + `scaleY(0→1)` |
| Loading states | Skeleton → Content | Smooth height transition |

### 5.2 Mobile — Animații
| Element | Animație | Library |
|---------|----------|---------|
| Screen transitions | Shared element transitions | `react-native-reanimated` |
| Pull to refresh | Custom spinner animation | `reanimated` worklet |
| Button press | Scale 0.97 + haptics | `Pressable` + `expo-haptics` |
| List items | Staggered fade-in | `entering={FadeInDown.delay(index * 50)}` |
| Status badge | Pulse effect | `reanimated` `useSharedValue` loop |
| Tab switch | Indicator slide | `reanimated` spring animation |
| Bottom sheet | Gesture-driven | `@gorhom/bottom-sheet` |
| Swipe actions | Reveal + snap | `react-native-gesture-handler` `Swipeable` |
| Card flip | 3D rotation | `reanimated` `rotateY` interpolation |
| Loading | Lottie animation | `lottie-react-native` |

### 5.3 Admin — Animații
- Filament SPA mode deja activat ✅
- [ ] Smooth page transitions prin Alpine.js `x-transition`
- [ ] Widget loading cu skeleton → content fade
- [ ] Dashboard chart entry animations

---

## Faza 6 — Responsive & Adaptive

### 6.1 Frontend — Breakpoints
```
Mobile:    < 640px   (sm)  — 1 coloană, sidebar ascuns, bottom nav
Tablet:    640-1024px (md) — 2 coloane, sidebar colapsabil
Desktop:   1024-1440px (lg) — 3 coloane, sidebar permanent
Wide:      > 1440px (xl)   — 4 coloane, layout maxim
```

**Acțiuni:**
- [ ] Dashboard: Grid adaptiv (1→2→3→4 coloane pe breakpoints)
- [ ] Tables: Horizontal scroll pe mobile, column hiding, card view pe `< 640px`
- [ ] Forms: Stack vertical pe mobile, 2 coloane pe tablet+
- [ ] Sidebar: Bottom navigation pe mobile (`< 640px`)
- [ ] Modals: Full-screen pe mobile, centered pe desktop
- [ ] Charts: Touch-friendly (larger hit areas) pe mobile

### 6.2 Mobile — Tablet Support
- [ ] iPad/Android tablet: 2-column layout (`SplitView`)
- [ ] Landscape orientation support
- [ ] Adaptive font sizes (`PixelRatio.getFontScale()`)
- [ ] Safe area handling (notch, Dynamic Island)

---

## Faza 7 — Performance UI

### 7.1 Frontend
| Optimizare | Acțiune | Impact |
|-----------|---------|--------|
| Bundle size | Dynamic imports (`next/dynamic`) pentru pagini grele | -40% initial JS |
| Image optimization | `next/image` pe toate imaginile | -60% image weight |
| Font loading | `next/font` cu `display: swap` | Elimină FOUT |
| CSS | Purge unused Tailwind | -30% CSS |
| Virtual scrolling | TanStack Virtual pe tabele mari (>100 rows) | -90% DOM nodes |
| Memoization | `React.memo` pe widget-uri dashboard | -50% re-renders |
| Prefetching | `<Link prefetch>` pe navigare predictibilă | -500ms navigation |

### 7.2 Mobile
| Optimizare | Acțiune | Impact |
|-----------|---------|--------|
| List performance | `FlashList` înlocuiește `FlatList` | 5× faster scroll |
| Image caching | `expo-image` (SWR caching) | -80% image loads |
| Animations | `reanimated` worklets (UI thread) | 60fps consistent |
| Bundle | Hermes engine optimizations | -50% startup time |
| Memory | `useMemo`/`useCallback` pe ecrane grele | -30% memory |

---

## Faza 8 — Teme & Personalizare

### 8.1 Sistem de Teme
```
Temele disponibile:
├── Light (default pe prima vizită)
├── Dark (default curent pe frontend)
├── System (detectare automată OS)
└── High Contrast (accesibilitate)
```

**Acțiuni:**
- [ ] Frontend: Toggle light/dark/system în header (deja parțial) — adaugă High Contrast
- [ ] Mobile: System sync implicit + toggle manual în Settings
- [ ] Admin: Filament toggle (deja funcțional) ✅
- [ ] Sincronizare preferință temă între platforme (API `user.preferences.theme`)

### 8.2 Branding Consistent
| Element | Frontend | Mobile | Admin |
|---------|----------|--------|-------|
| Logo | Truck + "LogiMarket" sidebar | Truck + "LogiMarket" splash | Truck + "LogiMarket" sidebar ✅ |
| Favicon | Truck icon 32×32 | App icon (adaptive) | Same favicon ✅ |
| Culoare nav | `--ds-background-200` | `Colors.background` | Geist gray ✅ |
| Loading | Spinner custom | LoadingScreen | Filament spinner |
| Error pages | Custom 404/500 | Catch-all error | Filament default |
| Empty states | `EmptyState` component ✅ | `EmptyState` component ✅ | Filament default |

---

## Faza 9 — Testare UI

### 9.1 Unit Tests Componente
```
Frontend: Jest + React Testing Library
├── Fiecare componentă UI: render, interacțiuni, a11y
├── Coverage target: 80%+ pe componente
└── Snapshot tests pe variante vizuale

Mobile: Jest + React Native Testing Library
├── Fiecare componentă: render, press, states
├── Coverage target: 70%+ pe componente
└── Detox E2E pe flow-uri critice
```

### 9.2 Visual Regression
- [ ] Storybook + Chromatic pe frontend (screenshot diffs)
- [ ] Maestro pe mobile (screenshot comparisons)
- [ ] Percy/Playwright pe admin pages

### 9.3 A11y Testing Automatizat
- [ ] `axe-core` integration pe frontend CI
- [ ] `eslint-plugin-jsx-a11y` reguli stricte
- [ ] Screen reader manual testing checklist (VoiceOver, TalkBack, NVDA)

---

## Faza 10 — Design System Documentation

### 10.1 Documentație Vie
```
docs/design-system/
├── README.md           — Filosofie și principii
├── tokens.md           — Culori, tipografie, spații, umbre
├── components.md       — Catalog componente cu exemple
├── patterns.md         — Patterns UI (forms, tables, navigation)
├── accessibility.md    — Ghid A11y
├── mobile.md           — Specificități mobile
├── changelog.md        — Istoricul modificărilor
└── figma-link.md       — Link către Figma (dacă există)
```

### 10.2 Storybook ca Documentație
- URL: `/storybook` sau subdomain `design.logimarket.eu`
- Fiecare componentă: descriere, props, variante, do's/don'ts
- Playground interactiv pentru fiecare componentă

---

## Prioritizare & Timeline

### Sprint 1 (Săptămâna 1-2) — 🔴 Fundație
| # | Task | Efort | Impact |
|---|------|:-----:|:------:|
| 1 | Creare `shared/design-tokens.json` + generatoare | 4h | 🔥🔥🔥 |
| 2 | Mobile: Restructurare `Colors` cu light/dark | 3h | 🔥🔥🔥 |
| 3 | Mobile: Sincronizare culoare primară → `#0070f3` | 1h | 🔥🔥🔥 |
| 4 | Mobile: Instalare Inter font | 2h | 🔥🔥 |
| 5 | Admin: Completare scale culori (red/amber/green) în CSS | 2h | 🔥🔥 |
| 6 | Mobile: A11y props pe toate 10 componentele | 3h | 🔥🔥🔥 |

### Sprint 2 (Săptămâna 3-4) — 🟡 Componente Mobile
| # | Task | Efort | Impact |
|---|------|:-----:|:------:|
| 7 | Mobile: `Modal` component (bottom sheet) | 4h | 🔥🔥🔥 |
| 8 | Mobile: `Select/Picker` component | 3h | 🔥🔥🔥 |
| 9 | Mobile: `SearchBar` component | 2h | 🔥🔥🔥 |
| 10 | Mobile: `Textarea` component | 2h | 🔥🔥 |
| 11 | Mobile: `Skeleton` + `Progress` components | 3h | 🔥🔥 |
| 12 | Mobile: `Switch`, `Avatar`, `DatePicker` | 4h | 🔥🔥 |
| 13 | Mobile: Dark mode complet (toate ecranele) | 6h | 🔥🔥🔥 |

### Sprint 3 (Săptămâna 5-6) — 🟡 Frontend Polish
| # | Task | Efort | Impact |
|---|------|:-----:|:------:|
| 14 | Frontend: `DatePicker` + `Dropdown` components | 6h | 🔥🔥 |
| 15 | Frontend: `Stepper/Wizard` component | 4h | 🔥🔥 |
| 16 | Frontend: `FileUpload` component | 4h | 🔥🔥 |
| 17 | Frontend: `Timeline` component | 3h | 🔥 |
| 18 | Frontend: Page transitions (framer-motion) | 4h | 🔥🔥 |
| 19 | Frontend: DataTable upgrades (virtualization, bulk) | 6h | 🔥🔥 |
| 20 | Frontend: Responsive tables → card view pe mobile | 4h | 🔥🔥🔥 |

### Sprint 4 (Săptămâna 7-8) — 🟢 Animații & Performance
| # | Task | Efort | Impact |
|---|------|:-----:|:------:|
| 21 | Mobile: `reanimated` pe toate butoanele/card-urile | 4h | 🔥🔥 |
| 22 | Mobile: Haptic feedback | 2h | 🔥 |
| 23 | Mobile: `FlashList` + `expo-image` | 3h | 🔥🔥 |
| 24 | Frontend: Virtual scrolling pe tabele | 3h | 🔥🔥 |
| 25 | Frontend: `next/dynamic` pe pagini grele | 3h | 🔥🔥 |
| 26 | Admin: Widget skeleton → content transitions | 2h | 🔥 |

### Sprint 5 (Săptămâna 9-10) — 🟢 Testing & Docs
| # | Task | Efort | Impact |
|---|------|:-----:|:------:|
| 27 | Frontend: Storybook stories pentru toate componentele | 8h | 🔥🔥 |
| 28 | Frontend: Unit tests componente (80% coverage) | 8h | 🔥🔥 |
| 29 | Mobile: Unit tests componente (70% coverage) | 6h | 🔥🔥 |
| 30 | A11y audit + remediere (toate platformele) | 4h | 🔥🔥🔥 |
| 31 | Design System Documentation | 4h | 🔥 |
| 32 | Visual regression setup (Chromatic/Percy) | 3h | 🔥 |

---

## Metrici de Succes

| Metrică | Target | Cum Măsurăm |
|---------|--------|-------------|
| Consistență culori cross-platform | 100% | Audit vizual pe screenshots |
| Dark mode funcțional | 3/3 platforme | Test manual pe fiecare |
| Componente mobile vs frontend | ≥ 80% paritate | Count componente |
| A11y score | ≥ 90 (Lighthouse) | `axe-core` + Lighthouse |
| Performance frontend | LCP < 2.5s, FID < 100ms | Core Web Vitals |
| Storybook coverage | 100% componente | Stories count |
| Test coverage UI | 80% frontend, 70% mobile | Jest coverage |
| Contrast ratio | ≥ 4.5:1 text, ≥ 3:1 UI | Contrast checker |

---

## Arhitectură Fișiere (Structura Finală)

```
shared/
├── design-tokens.json          ← Sursă unică
├── generate-css.js             ← → frontend/globals.css vars
├── generate-rn.js              ← → mobile/constants/theme.ts
└── generate-filament.js        ← → admin/filament-geist-theme.css

logistics-frontend/src/components/
├── ui/                         ← 34 componente (acum 24)
│   ├── Button.tsx, Input.tsx, Select.tsx...
│   ├── DatePicker.tsx          ← NOU
│   ├── Dropdown.tsx            ← NOU
│   ├── Stepper.tsx             ← NOU
│   ├── FileUpload.tsx          ← NOU
│   ├── Timeline.tsx            ← NOU
│   ├── Drawer.tsx              ← NOU
│   └── index.ts
├── dashboard/widgets/          ← 13 widget-uri
├── layout/                     ← Sidebar, Header
├── onboarding/                 ← Wizard
└── providers/                  ← Theme, Auth, Query

logistics-mobile/components/
├── ui/                         ← 24 componente (acum 10)
│   ├── Button.tsx, Card.tsx, Badge.tsx...
│   ├── Modal.tsx               ← NOU
│   ├── Select.tsx              ← NOU
│   ├── SearchBar.tsx           ← NOU
│   ├── Skeleton.tsx            ← NOU
│   ├── Switch.tsx              ← NOU
│   └── ... (14 noi)
├── OrderCard.tsx, FreightCard.tsx...
└── ErrorBoundary.tsx

logistics-platform/resources/css/
├── filament-geist-theme.css    ← Complet (800+ linii)
└── (served from public/css/)

docs/design-system/
├── README.md
├── tokens.md
├── components.md
├── patterns.md
└── accessibility.md
```

---

## Sumar Executiv

| Fază | Tasks | Efort Total | Prioritate |
|------|:-----:|:-----------:|:----------:|
| 1. Design Tokens Unificate | 6 | ~15h | 🔴 Critică |
| 2. Componente Mobile | 7 | ~24h | 🔴 Critică |
| 3. Accesibilitate | 8 | ~12h | 🔴 Critică |
| 4. Frontend Polish | 7 | ~31h | 🟡 Importantă |
| 5. Animații & Micro-interacțiuni | 6 | ~16h | 🟡 Importantă |
| 6. Responsive & Adaptive | 6 | ~18h | 🟡 Importantă |
| 7. Performance UI | 5 | ~12h | 🟡 Importantă |
| 8. Teme & Personalizare | 4 | ~8h | 🟢 Nice-to-have |
| 9. Testing UI | 6 | ~33h | 🟡 Importantă |
| 10. Documentație | 2 | ~7h | 🟢 Nice-to-have |
| **TOTAL** | **57 tasks** | **~176h** | — |

> **Estimare**: ~10 sprint-uri de 2 săptămâni = **~5 luni** cu 1 developer full-time  
> **Recomandare**: Începe cu **Faza 1 + 2 + 3** (fundație + mobile + a11y) — cele mai critice pentru consistență cross-platform
