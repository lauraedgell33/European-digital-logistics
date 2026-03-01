# LogiMarket — Post-Launch Roadmap

## Completed Phases (4–11)

### Phase 4: Backend Completion ✅
- Fixed duplicate notification routes
- Added RolesAndPermissionsSeeder
- Moved inline closures to 4 controllers (Notification, Matching, RoutePlanning, Pricing)
- Created 5 Job classes (ProcessOrderNotification, SendDailyDigest, SyncTrackingData, ProcessMatchingNotification, ProcessTenderDeadlineReminders)
- Created 7 factories (Tender, TenderBid, Shipment, ShipmentEvent, PartnerNetwork, Conversation, Message)
- Created 6 Filament Admin resources (User, VehicleOffer, Tender, Shipment, PartnerNetwork, Conversation)
- **87 API routes validated**

### Phase 5: Frontend Fortification ✅
- SVG favicon + apple-touch-icon with LogiMarket branding
- CSP/HSTS/caching security headers in next.config.js
- Secure cookie helpers for auth tokens
- Eliminated 100+ `any` types across 26 files, added 25+ new interfaces
- Sentry integration (client, server, edge)
- **0 TypeScript errors, build SUCCESS**

### Phase 6: Mobile Feature Completion ✅
- Tenders screens (list + detail with bid submission modal)
- Networks screens (list + detail with join/leave actions)
- Companies directory (searchable with detail pages)
- Analytics dashboard (revenue, orders, routes, trends)
- Edit freight/vehicle offer forms
- Full settings: profile edit, change password, company profile
- Tab layout restructured (5 visible tabs + hidden routes)
- **0 TypeScript errors**

### Phase 7: Mobile Polish & Production ✅
- ErrorBoundary component with dev-mode stack traces
- OfflineBanner with animated reconnection indicator
- WebSocket service (socket.io) with real-time query invalidation
- Deep linking configuration (scheme + universal links)
- Integrated into root layout: ErrorBoundary, OfflineBanner, WebSocket

### Phase 8: Testing ✅
- **Backend**: 6 test suites, 34 tests (Auth, FreightOffer, TransportOrder, Tender, Dashboard, Notification)
- **Frontend**: 5 test suites, 73 tests (LoginForm, DataTable, authStore, api, helpers)
- **Mobile**: 4 test suites, 57 tests (deepLinking, authStore, appStore, api)

### Phase 9: Security & Compliance ✅
- Rate limiting middleware (5/min login, 60/min API)
- Security headers middleware (CSP, HSTS, X-Frame-Options, etc.)
- Input sanitization middleware (HTML stripping, unicode normalization)
- 3 Authorization policies (FreightOffer, TransportOrder, Tender)
- CORS configuration with env-driven origins
- Middleware registered in bootstrap/app.php

### Phase 10: Store Submission & Deploy ✅
- Backend Dockerfile (PHP 8.3-fpm-alpine, OPcache, JIT)
- Backend docker-compose (app, nginx, mysql, redis, queue worker, scheduler)
- Frontend Dockerfile (multi-stage Node 20, standalone output)
- Frontend docker-compose
- Mobile EAS build config (development, preview, production profiles)
- GitHub Actions CI (3 parallel jobs: backend, frontend, mobile)
- GitHub Actions Deploy (tag-triggered, Docker registry, SSH deploy)
- Master docker-compose for full stack

### Phase 11: Infrastructure Production ✅
- Laravel logging config (daily + stderr + Slack + Sentry channels)
- Database backup command (`php artisan db:backup`)
- Health check command (`php artisan health:check`)
- HTTP health endpoints (`/api/health`, `/api/health/detailed`)
- Exception handling with Sentry, context enrichment, JSON error responses
- Prometheus + Grafana monitoring stack
- Server backup script with S3 upload
- SSL certificate renewal script

---

## Post-Launch Roadmap (Phase 12+)

### Phase 12: Design System Unification ✅
- Design token audit and color variable consolidation
- Shared design tokens (JSON → CSS/Tailwind/React Native generators)
- Dark mode infrastructure with CSS custom properties
- Color accessibility fixes (WCAG 2.1 AA contrast ratios)

### Phase 13: Internationalization Expansion ✅
- Expanded from 7 → 27 EU languages (all 24 official EU languages + 3 regional)
- Language files: en, de, fr, ro, es, it, pl, nl, pt, sv, cs, da, fi, hu, hr, bg, el, et, lv, lt, mt, sk, sl, no, is, ga, uk
- Each locale: 22 sections, 450+ translation keys
- i18n.ts updated with all language registrations and supportedLocales

### Phase 14: Q1 Optimization ✅
- **Redis API Response Caching**
  - CacheResponse HTTP middleware (TTL + public/per-user scope)
  - CacheService with group-based invalidation, key builders, stats monitoring
  - Caching added to: Dashboard (120s/600s), Matching (300s), Companies (600s), Order statistics (180s)
  - Cache invalidation on mutations: Freight, Vehicle, Order (store/update/destroy/accept/reject/cancel)
  - Route-level caching: lexicon (1h), driving bans (30min), carbon factors (24h), price insights (15min), insurance types (1h), barometer (5min), VAT rates (1h), exchange rates (5min)
  - Cache health/stats endpoint for Grafana monitoring
- **Database Query Optimization**
  - Enabled `Model::preventLazyLoading()` for non-production
  - Slow query logging (>500ms) via `DB::listen()`
  - Fixed N+1 in MessageController::unreadCount() — replaced loop with single query
  - Fixed InvoiceController::stats() — replaced ->get()->avg() with SQL AVG()
  - Added eager loading to 11 endpoints: BlockchainController, PaymentController, DocumentOcrController, RouteOptimizationController, MultimodalController, EnterpriseController, AuditController
- **Pagination Added**
  - IntegrationController::exportOrders() — paginated (50/page)
  - TrackingController — activeShipments (25/page), history (100/page), events (50/page)
  - NotificationController::index() — proper pagination with meta
  - NetworkController::index() — dual paginated responses
- **Mobile Type Safety**
  - Replaced all `any` types in source code with proper interfaces
  - OfflineActionPayload, SentryInterface, LocalAuthModule, DictionaryValue types
  - Fixed FormData casts in api.ts (unknown as Blob instead of any)
  - Proper router.push types for notification deep links
  - Typed documents array in TransportOrder interface
- **Zod Form Validation**
  - Created shared `lib/schemas.ts` with 9 reusable Zod schemas
  - Migrated Edit Profile, Change Password, Company Profile to react-hook-form + Zod
  - All 9 form screens now use consistent Zod + Controller pattern
  - Type-safe form data exports for all schemas

### Q1 — Remaining Items (All Completed ✅)
- [x] **Elasticsearch Full-Text Search** (Phase 15)
  - Added Elasticsearch 8.15 to docker-compose with healthcheck, volume, and network
  - Installed `laravel/scout` ^10.0 + `matchish/laravel-scout-elasticsearch` ^7.0
  - Created `config/scout.php` with ES connection, queue indexing, soft deletes support
  - Created `app/Search/ElasticsearchIndexConfig.php` — custom analyzers (autocomplete edge_ngram, multilingual snowball), geo_point fields for lat/lng
  - 4 index mappings: freight_offers (26 fields, 2 geo_points), vehicle_offers (22 fields, 1 geo_point), companies (18 fields), lexicon_articles (12 fields)
  - Added `Searchable` trait + `toSearchableArray()` + `shouldBeSearchable()` to FreightOffer, VehicleOffer, Company, LexiconArticle
  - Created `SearchService` — unified search, per-type search, autocomplete suggestions, filter application
  - Created `SearchController` — 5 endpoints: unified search, suggest, freight, vehicles, companies
  - Updated FreightController::search() — Scout for text queries, SQL fallback for geo-only
  - Updated VehicleController::search() — Scout for text queries, SQL fallback
  - Updated CompanyController::index() — Scout for search queries, cached SQL for browse
  - Search routes: `GET /api/v1/search`, `/search/suggest`, `/search/freight`, `/search/vehicles`, `/search/companies`
  - Artisan command: `php artisan scout:configure-indices` (creates/updates ES indices with mappings)
  - Elasticsearch health check added to HealthController::detailed()
- [x] **Grafana Analytics Dashboards** (Phase 15)
  - Dashboard provisioning config + 4 auto-provisioned dashboards
  - **Logistics Platform Overview**: 6 service health stats, CPU/memory/disk gauges, MySQL connections/queries, Redis memory/operations/hit-rate
  - **API Performance**: Request rate by status code, error rate, active connections, p50/p95/p99 response times, queue jobs
  - **Search & Elasticsearch Analytics**: Cluster health, document count, index size, search queries/s, search latency, indexing rate, per-index breakdown, JVM/thread pool metrics
  - **Business & APM Analytics**: 24h request totals, avg response time, slow requests, error rate, per-route performance table, response time distribution, search performance
  - Added Elasticsearch Exporter to monitoring stack (port 9114)
  - Added Elasticsearch scrape job to Prometheus config
- [x] **A/B Testing Framework** (Phase 15)
  - Created `stores/abTestingStore.ts` — Zustand store with AsyncStorage persistence
  - 5 default experiments: onboarding_flow_v2, freight_card_layout, search_bar_position, cta_color_test, dashboard_metrics_order
  - Deterministic variant assignment via hashing (consistent per user + experiment)
  - Audience percentage targeting, date constraints, auto-exposure tracking
  - Created `hooks/useExperiment.ts` — `useExperiment()`, `useVariant()`, `useABAnalytics()` hooks
  - Event tracking with flush/sync to backend API, experiment config remote fetching
- [x] **APM Integration** (Phase 15)
  - Installed `sentry/sentry-laravel` ^4.0 for backend (existing config/sentry.php already configured)
  - Installed `@sentry/react-native` ^6.0 for mobile (replaced stub implementation)
  - Full mobile Sentry: performance tracing (20%), profiling (10%), app start tracking, native frames, stall tracking
  - Added `@sentry/react-native/expo` plugin to app.json
  - Created `TrackPerformance` middleware — Redis-backed request metrics (count, duration histogram, slow requests, per-route tracking)
  - Created `MetricsController` — Prometheus-compatible `/api/metrics` endpoint with request metrics, duration histogram, MySQL connections, queue size, app info
  - Added `TrackPerformance` to API middleware stack in bootstrap/app.php
  - `Server-Timing` header added to all API responses for browser DevTools
  - Updated Prometheus scrape config to use `/api/metrics` endpoint

### Q2 — Advanced Features ✅ COMPLETE
- [x] AI-powered freight matching algorithm
  - Rewrote `AiMatchingService` v2.0: 8-factor scoring (distance, capacity, timing, reliability, price, carbon, route_compat, history)
  - Learned weights from accept/reject feedback via EWMA, auto-recalibration every 50 entries
  - Batch matching via `BatchAiMatchingJob` queue job, confidence tiers (excellent/good/fair/low)
  - Analytics endpoint with match quality stats, feedback loop metrics
- [x] Route optimization with external mapping APIs
  - Created `ExternalRoutingService` — OpenRouteService API integration (HGV profile, directions, matrix, geocoding)
  - Toll cost estimation for 28 EU countries, EC 561/2006 rest stop calculation (4.5h driving, 9h daily max)
  - Fleet CVRP optimization (greedy nearest-neighbor with capacity constraints) in `optimizeFleet()`
  - Haversine fallback when API unavailable; turn-by-turn directions + geometry data
- [x] Document generation (invoices, CMR, waybills) as PDF
  - Created `DocumentGenerationService` using barryvdh/laravel-dompdf
  - Professional Blade templates: invoice (blue theme, IBAN/BIC), CMR (Geneva 1956 convention, 14 boxes), waybill (green theme), delivery note (purple, 6-item checklist)
  - `DocumentController` with 5 endpoints (invoicePdf, cmrPdf, waybillPdf, deliveryNotePdf, availableDocuments)
- [x] Multi-currency support with real-time exchange rates
  - Created `CurrencyService` — 18 EU currencies (EUR, USD, GBP, CHF, PLN, CZK, HUF, RON, BGN, etc.)
  - ECB rates via exchangerate.host API, cached 30min, fallback hardcoded rates
  - `exchange_rate_history` table for rate tracking, conversion via EUR intermediary
  - `CurrencyController` with rates, convert, supported, history endpoints
- [x] Advanced reporting with exportable charts
  - Created `ReportingService` — 6 report types: revenue, orders, routes, carriers, carbon, executive summary
  - Chart-ready datasets with monthly breakdowns, YoY growth, completion rates, MoM comparisons
  - `ReportController` with 7 endpoints including PDF/CSV/XLSX export via DomPDF + Maatwebsite Excel
  - Professional PDF report template (`exports/report-pdf.blade.php`) with KPI cards and data tables
- [x] Automated pricing engine based on historical data
  - Created `AutomatedPricingEngine` — EWMA-based historical price analysis, linear regression trend detection
  - Supply/demand elasticity via sigmoid function, configurable pricing rules (8 rule types)
  - `PricingRule` model: base_rate, surcharge, multiplier, discount, minimum, maximum, fuel_surcharge, seasonal
  - Price alerts for market deviations (severity levels: critical/warning/info)
  - Price forecasting with seasonal adjustment + trend extrapolation, route profitability analysis
  - Pricing rules CRUD (create, update, delete with validation), confidence scoring

### Q3 — Integration & Expansion ✅
- [x] ERP integration (SAP, Oracle) via webhooks
  - Created `ErpIntegrationService` — full SAP IDoc (DELVRY07/DESADV with E1EDL20 segments), Oracle TMS REST, Microsoft Dynamics OData v4
  - Bidirectional sync (inbound/outbound) with field mapping per ERP type, webhook processing (6 event types)
  - HMAC signature validation for webhook security, connection health monitoring (healthy/degraded/stale/never_synced)
  - Provider-specific auth: SAP (Basic + CSRF), Oracle (Bearer), Dynamics (Bearer + OData), Custom (API key)
- [x] TMS (Transport Management System) connectors
  - Created `TmsConnectorService` — 6 provider connectors: Transporeon, TIMOCOM, Sixfold, project44, FourKites, Alpega/Teleroute
  - Freight publishing with provider-specific formatting, available load fetching with normalised response
  - Tracking push (Sixfold GPS, project44 milestones, FourKites shipment updates), order import via `updateOrCreate`
  - Provider capabilities: freight_exchange, tracking, load_board, tender, analytics
- [x] GPS fleet tracking integration (Samsara, Geotab)
  - Created `GpsFleetTrackingService` — Samsara (Bearer, REST), Geotab (session-based auth, 55min cache)
  - Real-time fleet positions, vehicle history, diagnostics (fuel, engine hours, odometer)
  - Driver HOS (Hours of Service) per EC 561/2006, shipment-to-GPS linking, geofence alerts
  - `IntegrationHubController` — unified 20-endpoint controller (ERP 7, TMS 5, GPS 8)
- [x] Electronic signature for contracts (DocuSign API)
  - Created `ESignatureService` — DocuSign API v2.1 (OAuth2 refresh token, envelopes, recipient tabs)
  - Adobe Sign provider support, built-in internal e-signature (token-based, multi-party)
  - Contract & CMR signing workflows, signature verification, signed document download
  - DocuSign webhook handling (envelope-completed/declined/voided events)
  - `e_signature_requests` table with audit trail (IP, user agent, signature hash)
- [x] EU Mobility Package compliance features
  - Created `EuMobilityComplianceService` — EC 561/2006 driving & rest time validation
  - Max continuous driving (4.5h), daily (9h/10h extended), weekly (56h), biweekly (90h)
  - Break rules (45min after 4.5h), daily rest (11h regular / 9h reduced), weekly rest (45h/24h)
  - Cabotage rules (EU 2020/1055): max 3 ops in 7 days, 4-day cooling-off period
  - Posted Workers Directive (EU 2020/1057): posting declaration check, minimum wage validation (27 EU countries)
  - Tachograph validation (EU 165/2014): calibration, driver card expiry, smart gen2 requirement, anomaly detection
  - Fleet-wide compliance report with compliance score
- [x] Carbon footprint calculator for shipments (enhanced)
  - Created `CarbonFootprintCalculatorService` — GLEC Framework v3 / ISO 14083
  - Well-to-Wheel (WTW = WTT + TTW) emissions, GHG Protocol Scope 1/2/3 breakdown
  - Multimodal comparison: road, rail, sea container, sea bulk, inland waterway, air cargo/express
  - Multi-leg route carbon calculation with all-road alternative comparison
  - Fleet carbon benchmarking with percentile ranking, YoY improvement tracking
  - Automated carbon reduction recommendations (fuel transition, modal shift, load consolidation, eco-driving, EV last-mile)
  - EU ETS carbon pricing integration (€65-85/ton), voluntary offset cost (Gold Standard €30/ton)
  - `Q3FeaturesController` — unified controller for e-signatures, compliance, and carbon v2
  - Migration: `e_signature_requests`, `cabotage_tracking`, `driver_activity_log`, `tachograph_records`

### Q4 — Scale & Growth
- [x] Multi-tenant architecture for white-label deployments
  - Created `MultiTenantService` — tenant resolution (header, subdomain, custom domain), provisioning/deprovisioning
  - 3 subscription plans: Starter (€199/mo), Professional (€599/mo), Enterprise (€1999/mo)
  - Feature gating per plan, usage limits (users, freight, orders, storage), usage dashboard with billing
  - `ResolveTenant` middleware — resolves tenant from request context, sets X-Tenant/X-Tenant-Plan response headers
  - `CheckTenantFeature` middleware — blocks access if feature not in tenant's plan
  - `EnforceTenantLimit` middleware — returns 429 when plan limits are reached
  - `config/tenancy.php` — base domain, reserved subdomains, cache TTL configuration
  - Branding API for frontend theming (logo, colors, favicon, custom domain)
- [x] Mobile app localization (30 EU/regional languages)
  - 27 languages from Phase 13 + 3 new: Turkish (tr), Serbian (sr), Albanian (sq)
  - All locale files follow identical 22-section structure (551 keys each)
  - Updated `lib/i18n.ts` — imports, dictionary registration, supportedLocales with flag emojis
  - Full coverage: Balkans corridor (SR, SQ), Turkey transit (TR)
- [x] Horizontal scaling with Kubernetes (Helm charts)
  - Created `deploy/helm/logimarket/` — full Helm chart with Chart.yaml + values.yaml
  - Templates: API deployment (HPA 3-15 pods, PDB), frontend deployment (HPA 2-10), queue workers (HPA 2-10)
  - Reverb WebSocket deployment with Redis scaling, scheduler (single replica)
  - Ingress with cert-manager TLS, CORS, rate limiting, security headers
  - ConfigMap for app settings, PHP OPcache/JIT tuning
  - Bitnami subcharts: MySQL (primary + 2 read replicas), Redis (master + 2 replicas), Elasticsearch (3 nodes)
  - CDN configuration, ExternalSecrets integration, ServiceMonitor for Prometheus
  - Pod anti-affinity, rolling update strategy, resource requests/limits
- [x] CDN optimization for static assets
  - Created `config/cdn.php` — CloudFront/Cloudflare/BunnyCDN provider support
  - Cache rules: static (1yr immutable), HTML (5min + stale-while-revalidate), uploads (1 day), API (no-cache)
  - Image optimization: WebP/AVIF auto-format, responsive sizes, lazy loading, blur placeholders
  - Brotli + Gzip compression, origin shield (eu-central-1), WAF integration
  - Updated `next.config.js` — CDN asset prefix, standalone output for K8s, CDN image loader
  - Created `cdn-image-loader.js` for Next.js custom image optimization via CDN
- [x] Database read replicas for analytics queries
  - Updated `config/database.php` — read/write splitting with `DB_READ_HOST` env, sticky sessions enabled
  - Dedicated `mysql_read` connection for heavy analytics queries
  - `Q4ScaleController` — analytics query endpoints (revenue, orders, performance, routes, carriers)
  - Replica status monitoring with lag detection and acceptability threshold
  - Automatic fallback to primary when read replica not configured
- [x] WebSocket cluster with Redis adapter
  - Created `config/reverb.php` — Reverb server with Redis pub/sub scaling
  - Cluster topology: multiple Reverb nodes behind LB, synchronized via Redis pub/sub
  - Presence channels for real-time tracking, chat, and order updates
  - Node heartbeat TTL, health check intervals, state DB configuration
  - Created `config/broadcasting.php` — Reverb as default driver with Redis fallback
  - `Q4ScaleController` — cluster status, broadcast test, infrastructure health endpoints
  - 13 new API routes: tenants/* (7), scale/* (6)

---

## Technical Debt Tracking

| Priority | Item | Platform | Status |
|----------|------|----------|--------|
| ~~High~~ | ~~Replace `any` casts in api.ts params~~ | ~~Mobile~~ | ✅ Done |
| ~~High~~ | ~~Add pagination to all list endpoints~~ | ~~Backend~~ | ✅ Done |
| ~~Medium~~ | ~~Implement proper form validation with Zod~~ | ~~Mobile~~ | ✅ Done |
| ~~Medium~~ | ~~Add E2E tests with Cypress/Playwright~~ | ~~Frontend~~ | ✅ Done |
| ~~Medium~~ | ~~Add Detox E2E tests~~ | ~~Mobile~~ | ✅ Done |
| ~~Low~~ | ~~Migrate to React Server Components~~ | ~~Frontend~~ | ✅ Done |
| ~~Low~~ | ~~Implement dark mode fully~~ | ~~Mobile~~ | ✅ Done |
| ~~Low~~ | ~~Add PWA offline support~~ | ~~Frontend~~ | ✅ Done |

---

## Architecture Summary

```
┌──────────────────────────────────────────────────────┐
│                    CLIENTS                            │
├─────────────┬──────────────────┬─────────────────────┤
│  Next.js 14 │    Expo SDK 55   │   Filament Admin    │
│  Frontend   │    Mobile App    │   Panel             │
│  (React 18) │  (React Native)  │   (PHP/Livewire)    │
├─────────────┴──────────────────┴─────────────────────┤
│                                                       │
│              Nginx Reverse Proxy + SSL                │
│                                                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│           Laravel 11 API (87 routes)                  │
│   ┌──────────┬──────────┬──────────┬────────────┐    │
│   │ Sanctum  │ Policies │ Rate     │ Security   │    │
│   │ Auth     │ (RBAC)   │ Limiting │ Headers    │    │
│   └──────────┴──────────┴──────────┴────────────┘    │
│                                                       │
├────────────┬─────────────┬───────────────────────────┤
│  MySQL 8.4 │  Redis      │  Queue Worker             │
│  (14 tables)│  (Cache)   │  (5 Job classes)           │
├────────────┴─────────────┴───────────────────────────┤
│                                                       │
│  Monitoring: Prometheus + Grafana                     │
│  CI/CD: GitHub Actions                                │
│  Backups: Automated daily + S3                        │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Key Metrics to Track
- API response time (p50, p95, p99)
- Error rate by endpoint
- Active users (DAU, WAU, MAU)
- Order completion rate
- Freight/vehicle match rate
- Mobile app crash rate
- Push notification delivery rate
- WebSocket connection stability
