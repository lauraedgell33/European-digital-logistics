# Accessibility Guidelines

> WCAG 2.1 AA compliance requirements and platform-specific guidance for the LogiMarket design system.

---

## Standards

LogiMarket targets **WCAG 2.1 Level AA** across all platforms. This document defines the requirements and provides implementation guidance.

---

## 1. Color & Contrast

### Minimum Contrast Ratios

| Element | Ratio | WCAG Criterion |
|---------|-------|----------------|
| Body text (< 18px) | ≥ 4.5:1 | 1.4.3 Contrast (Minimum) |
| Large text (≥ 18px or 14px bold) | ≥ 3:1 | 1.4.3 Contrast (Minimum) |
| UI components & graphical objects | ≥ 3:1 | 1.4.11 Non-text Contrast |
| Focus indicators | ≥ 3:1 | 1.4.11 Non-text Contrast |

### Token Contrast Verification

The Geist color scale is designed to meet these ratios:

| Combination (Light) | Approximate Ratio | Pass? |
|---------------------|-------------------|-------|
| gray-1000 on background (#fff) | 17.4:1 | ✅ |
| gray-900 on background | 7.1:1 | ✅ |
| gray-800 on background | 5.3:1 | ✅ |
| gray-700 on background | 3.9:1 | ✅ (large text only) |
| blue-700 on background | 4.6:1 | ✅ |
| red-700 on background | 4.1:1 | ✅ (large text) |
| green-700 on background | 4.5:1 | ✅ |
| amber-700 on background | 2.6:1 | ⚠️ Large text only; pair with dark text |

| Combination (Dark) | Approximate Ratio | Pass? |
|---------------------|-------------------|-------|
| gray-1000 on background (#000) | 17.1:1 | ✅ |
| gray-900 on background | 5.8:1 | ✅ |
| blue-900 on background | 8.2:1 | ✅ |
| red-900 on background | 6.7:1 | ✅ |
| green-900 on background | 5.4:1 | ✅ |

### Guidelines

- **Never use color alone** to convey information. Always pair with text labels, icons, or patterns.
- Status indicators (badges, dots) must include text labels — the colored dot is supplementary.
- Charts and graphs must use patterns/textures in addition to color differentiation.
- Error states: use `red-700` text + error icon + descriptive message, not just a red border.

---

## 2. Keyboard Navigation

### Focus Management

All interactive elements must be reachable and operable via keyboard.

**Focus ring style (applied globally):**
```css
*:focus-visible {
    outline: 2px solid var(--ds-blue-700);
    outline-offset: 2px;
}
```

### Required Keyboard Interactions

| Component | Keys | Behaviour |
|-----------|------|-----------|
| Button | `Enter`, `Space` | Activate |
| Link | `Enter` | Navigate |
| Modal | `Escape` | Close |
| Modal | `Tab` | Trap focus within modal |
| Dropdown | `Enter`/`Space` | Open; `Escape` to close |
| Dropdown items | `↑`/`↓` | Navigate options |
| Tabs | `←`/`→` | Switch tabs |
| DataTable | `Tab` | Navigate cells; `Enter` to activate row actions |
| CommandPalette | `⌘K` / `Ctrl+K` | Open |
| CommandPalette | `↑`/`↓` | Navigate results |
| CommandPalette | `Enter` | Select result |
| CommandPalette | `Escape` | Close |
| Switch/Toggle | `Space` | Toggle |
| Select | `↑`/`↓` | Navigate; `Enter` to select |

### Skip Navigation

The frontend includes a `SkipNav` component that renders a visually-hidden link at the top of the page:
```tsx
<SkipNav />
```
When focused via `Tab`, it becomes visible and allows keyboard users to jump directly to the main content area, bypassing the header and sidebar navigation.

### Tab Order

- Follow the visual reading order (left-to-right, top-to-bottom for LTR layouts).
- Never use `tabindex` values greater than 0.
- Use `tabindex="-1"` only for programmatic focus (e.g., focus trap in modals).
- Ensure all interactive elements within cards and list items are individually focusable.

---

## 3. Screen Reader Support

### Semantic HTML

- Use correct heading hierarchy (`h1` → `h2` → `h3`); never skip levels.
- Use `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>` landmarks.
- Use `<button>` for actions, `<a>` for navigation — never `<div onclick>`.
- Tables must have `<caption>`, `<thead>`, `<th scope>` elements.

### ARIA Usage

| Pattern | Implementation |
|---------|---------------|
| Navigation | `<nav aria-label="Main navigation">` |
| Current page | `aria-current="page"` on active sidebar/breadcrumb item |
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Loading | `aria-busy="true"` on container, `role="status"` on spinner |
| Toast | `role="alert"` or `role="status"` (for non-critical) |
| Form errors | `aria-invalid="true"`, `aria-describedby` pointing to error message |
| Icon buttons | `aria-label` describing the action (e.g., `aria-label="Close modal"`) |
| Decorative icons | `aria-hidden="true"` |
| Expandable | `aria-expanded="true|false"` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| DataTable sort | `aria-sort="ascending|descending|none"` |

### Live Regions

- Use `aria-live="polite"` for non-urgent updates (data loaded, filter applied).
- Use `aria-live="assertive"` for urgent messages (errors, session expiry).
- Toast notifications should use `role="alert"` (assertive) or `role="status"` (polite).

---

## 4. Touch & Mobile Accessibility

### Touch Target Sizes

- **Minimum:** 44 × 44 px (WCAG 2.5.5 Target Size)
- **Recommended:** 48 × 48 px for primary actions
- Ensure adequate spacing (≥ 8px) between adjacent touch targets.

### Gestures

- All gesture-based actions (swipe, pinch, long-press) must have a single-pointer alternative.
- Swipe-to-delete must also offer a delete button in the UI.
- Gestures should be cancel-able (lift finger off target to cancel).

### React Native Specifics

| Requirement | Implementation |
|-------------|---------------|
| Accessible labels | `accessible={true}` + `accessibilityLabel` on all interactive elements |
| Roles | `accessibilityRole="button"` / `"link"` / `"header"` / etc. |
| State | `accessibilityState={{ disabled, selected, checked }}` |
| Live regions | `accessibilityLiveRegion="polite"` or `"assertive"` |
| Grouping | `accessibilityElementsHidden` to hide decorative elements |
| Hints | `accessibilityHint` for non-obvious actions |

### iOS VoiceOver & Android TalkBack

- Test all screens with VoiceOver (iOS) and TalkBack (Android).
- Ensure swipe navigation follows a logical reading order.
- Custom components must implement proper accessibility traits.
- Ensure the `OfflineBanner` announces network status changes.

---

## 5. Motion & Animation

### Reduced Motion

Respect the user's motion preference:

**CSS:**
```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

**React Native:**
```tsx
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);
useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
        'reduceMotionChanged', setReduceMotion
    );
    return () => sub.remove();
}, []);
```

### Guidelines

- Never use motion as the sole indicator of state change.
- Auto-playing animations (carousels, counters) must be pause-able.
- Parallax and scroll-linked animations should be disabled when reduced motion is preferred.

---

## 6. Forms

### Labels & Instructions

- Every form field must have a visible `<label>` or `aria-label`.
- Required fields must be indicated with both visual and programmatic cues (`aria-required="true"`).
- Provide clear instructions before the form begins (e.g., "Fields marked with * are required").

### Error Handling

- Display errors inline, adjacent to the field.
- Focus the first errored field on form submission.
- Use `aria-invalid="true"` on errored fields.
- Link error messages via `aria-describedby`.
- Error messages must include remediation guidance (e.g., "Email must contain @").

### Autocomplete

- Use `autocomplete` attributes on address, name, email, and payment fields.
- This is required by WCAG 1.3.5 (Identify Input Purpose).

---

## 7. Images & Media

- All informative images must have descriptive `alt` text.
- Decorative images: use `alt=""` and `aria-hidden="true"`.
- Complex images (charts, maps): provide a text alternative or data table.
- Video content: provide captions and/or transcripts.

---

## 8. Internationalization (i18n)

- Support `dir="rtl"` for right-to-left languages.
- Avoid hardcoding text direction in layouts — use logical properties (`margin-inline-start` not `margin-left`).
- Ensure translated text can expand up to 200% without breaking layouts.
- Date/number formatting must respect the user's locale.

---

## 9. Testing Checklist

### Automated Testing

- [ ] Axe-core / Lighthouse accessibility audit passes with 0 violations
- [ ] All headings follow correct hierarchy
- [ ] All images have `alt` text
- [ ] All form fields have labels
- [ ] Color contrast ratios meet minimums
- [ ] Focus order matches visual order

### Manual Testing

- [ ] Full keyboard navigation (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader walkthrough (VoiceOver on macOS/iOS, NVDA/JAWS on Windows, TalkBack on Android)
- [ ] Zoom to 200% — content remains usable
- [ ] Reduced motion — animations disabled
- [ ] High contrast mode — content remains visible
- [ ] Touch-only navigation on mobile — all features accessible

### Tools

| Tool | Platform | Purpose |
|------|----------|---------|
| axe DevTools | Browser | Automated a11y audit |
| Lighthouse | Browser | Performance + a11y audit |
| WAVE | Browser | Visual a11y checker |
| VoiceOver | macOS / iOS | Screen reader testing |
| TalkBack | Android | Screen reader testing |
| NVDA | Windows | Screen reader testing |
| Accessibility Inspector | macOS | Native a11y tree inspection |
| Playwright a11y | CI/CD | Automated a11y regression tests |

---

## 10. Platform-Specific Notes

### Frontend (Next.js)

- The `SkipNav` component is included in the root layout.
- All interactive components use `focus-visible` (not `focus`) to avoid focus rings on mouse clicks.
- The `ErrorBoundary` provides a recovery UI with keyboard-accessible retry button.
- Lighthouse a11y score target: **≥ 95**.

### Mobile (React Native / Expo)

- The `OfflineBanner` uses `accessibilityLiveRegion="assertive"` to announce connectivity changes.
- All cards (`DeliveryCard`, `FreightCard`, etc.) are wrapped in `accessible` views with descriptive labels summarising the card content.
- Bottom tab bar uses `accessibilityRole="tab"` and `accessibilityState={{ selected }}`.

### Admin (Filament / Laravel)

- Filament provides built-in accessibility for its components.
- The Geist theme CSS preserves Filament's ARIA attributes and focus styles.
- Custom focus ring (`2px solid blue-700, offset 2px`) is applied globally.
- All custom action dropdowns maintain keyboard navigability.
