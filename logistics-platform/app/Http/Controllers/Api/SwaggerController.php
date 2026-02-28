<?php

namespace App\Http\Controllers\Api;

/**
 * @OA\Info(
 *     title="LogiMarket API — European Digital Logistics Platform",
 *     version="1.0.0",
 *     description="Comprehensive REST API for the European Digital Logistics Marketplace. Provides freight exchange, vehicle matching, order management, real-time tracking, invoicing, payments, blockchain eCMR, and enterprise integrations.",
 *     @OA\Contact(
 *         name="LogiMarket API Support",
 *         email="api@logimarket.eu",
 *         url="https://logimarket.eu/support"
 *     ),
 *     @OA\License(
 *         name="Proprietary",
 *         url="https://logimarket.eu/terms"
 *     )
 * )
 *
 * @OA\Server(
 *     url="/api/v1",
 *     description="Production API v1"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="Sanctum Token",
 *     description="Use the token from /auth/login response. Format: Bearer {token}"
 * )
 *
 * @OA\Tag(name="Authentication", description="Register, login, logout, profile management")
 * @OA\Tag(name="Dashboard", description="Dashboard analytics and statistics")
 * @OA\Tag(name="Freight Exchange", description="Post and search freight offers across Europe")
 * @OA\Tag(name="Vehicle Exchange", description="Post and search vehicle/truck offers")
 * @OA\Tag(name="Transport Orders", description="Create and manage transport orders")
 * @OA\Tag(name="Tenders", description="Tender management and bidding")
 * @OA\Tag(name="Tracking", description="Real-time shipment tracking with GPS")
 * @OA\Tag(name="Partner Networks", description="Create and manage logistics networks")
 * @OA\Tag(name="Messaging", description="In-platform messaging between companies")
 * @OA\Tag(name="Notifications", description="Push and in-app notification management")
 * @OA\Tag(name="Companies", description="Company directory and profiles")
 * @OA\Tag(name="Matching", description="Load-to-vehicle matching engine")
 * @OA\Tag(name="AI Smart Matching", description="AI-powered intelligent matching with ML predictions")
 * @OA\Tag(name="Predictive Analytics", description="Demand, pricing, and capacity forecasting")
 * @OA\Tag(name="Dynamic Pricing", description="Real-time market-based price calculation")
 * @OA\Tag(name="Route Optimization", description="Multi-stop route optimization with constraints")
 * @OA\Tag(name="Document OCR", description="Automated document scanning and data extraction")
 * @OA\Tag(name="Blockchain & eCMR", description="Electronic CMR, smart contracts, and digital identity")
 * @OA\Tag(name="Invoicing", description="Invoice creation, factoring, and management")
 * @OA\Tag(name="Payments", description="Payment processing, SEPA, refunds, exchange rates")
 * @OA\Tag(name="VAT", description="EU VAT rates, reporting, and reverse charge")
 * @OA\Tag(name="Warehousing", description="Warehouse exchange and space booking")
 * @OA\Tag(name="Transport Barometer", description="Market overview, heatmaps, and price trends")
 * @OA\Tag(name="Carbon Footprint", description="CO2 emission calculation and offset purchasing")
 * @OA\Tag(name="Driving Bans", description="European driving ban lookup by country and date")
 * @OA\Tag(name="Price Insights", description="Route pricing analytics and estimation")
 * @OA\Tag(name="Insurance", description="Freight insurance quotes and claims")
 * @OA\Tag(name="Escrow", description="Secure escrow payment management")
 * @OA\Tag(name="Debt Collection", description="Automated debt collection and reminders")
 * @OA\Tag(name="Return Loads", description="Return load suggestions and empty leg optimization")
 * @OA\Tag(name="Multimodal Transport", description="Multi-modal transport search and booking")
 * @OA\Tag(name="Enterprise", description="White-label, API keys, ERP integration, EDI")
 * @OA\Tag(name="Export", description="PDF and CSV data exports")
 * @OA\Tag(name="Audit", description="GDPR-compliant audit logging")
 * @OA\Tag(name="Lexicon", description="Transport logistics terminology and glossary")
 * @OA\Tag(name="Health", description="System health check endpoints")
 *
 * ── Common Response Schemas ────────────────────────────────
 *
 * @OA\Schema(
 *     schema="PaginatedResponse",
 *     @OA\Property(property="current_page", type="integer", example=1),
 *     @OA\Property(property="last_page", type="integer", example=10),
 *     @OA\Property(property="per_page", type="integer", example=15),
 *     @OA\Property(property="total", type="integer", example=150),
 *     @OA\Property(property="from", type="integer", example=1),
 *     @OA\Property(property="to", type="integer", example=15)
 * )
 *
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     required={"message"},
 *     @OA\Property(property="message", type="string", example="The given data was invalid."),
 *     @OA\Property(property="errors", type="object",
 *         @OA\AdditionalProperties(type="array", @OA\Items(type="string"))
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="SuccessResponse",
 *     @OA\Property(property="message", type="string", example="Operation completed successfully"),
 *     @OA\Property(property="data", type="object")
 * )
 *
 * ── Model Schemas ──────────────────────────────────────────
 *
 * @OA\Schema(
 *     schema="User",
 *     required={"id","name","email","role"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@company.eu"),
 *     @OA\Property(property="role", type="string", enum={"admin","manager","operator"}, example="admin"),
 *     @OA\Property(property="phone", type="string", example="+49 170 1234567"),
 *     @OA\Property(property="language", type="string", example="en"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="company", ref="#/components/schemas/Company"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="Company",
 *     required={"id","name","type","country_code"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Acme Logistics GmbH"),
 *     @OA\Property(property="type", type="string", enum={"shipper","carrier","forwarder"}, example="carrier"),
 *     @OA\Property(property="vat_number", type="string", example="DE123456789"),
 *     @OA\Property(property="country_code", type="string", example="DE"),
 *     @OA\Property(property="city", type="string", example="Berlin"),
 *     @OA\Property(property="address", type="string", example="Musterstraße 1"),
 *     @OA\Property(property="postal_code", type="string", example="10115"),
 *     @OA\Property(property="phone", type="string"),
 *     @OA\Property(property="email", type="string"),
 *     @OA\Property(property="website", type="string"),
 *     @OA\Property(property="verification_status", type="string", enum={"pending","verified","rejected"}, example="verified"),
 *     @OA\Property(property="rating", type="number", format="float", example=4.5)
 * )
 *
 * @OA\Schema(
 *     schema="FreightOffer",
 *     required={"id","origin_country","origin_city","destination_country","destination_city","cargo_type","weight"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="origin_country", type="string", example="DE"),
 *     @OA\Property(property="origin_city", type="string", example="Berlin"),
 *     @OA\Property(property="origin_postal_code", type="string", example="10115"),
 *     @OA\Property(property="destination_country", type="string", example="FR"),
 *     @OA\Property(property="destination_city", type="string", example="Paris"),
 *     @OA\Property(property="destination_postal_code", type="string", example="75001"),
 *     @OA\Property(property="cargo_type", type="string", example="general"),
 *     @OA\Property(property="weight", type="number", format="float", example=12500),
 *     @OA\Property(property="volume", type="number", format="float", example=33.5),
 *     @OA\Property(property="loading_date", type="string", format="date", example="2026-03-01"),
 *     @OA\Property(property="unloading_date", type="string", format="date", example="2026-03-03"),
 *     @OA\Property(property="price", type="number", format="float", example=2500.00),
 *     @OA\Property(property="currency", type="string", example="EUR"),
 *     @OA\Property(property="status", type="string", enum={"active","matched","completed","cancelled"}, example="active"),
 *     @OA\Property(property="vehicle_type", type="string", example="curtainsider"),
 *     @OA\Property(property="is_adr", type="boolean", example=false),
 *     @OA\Property(property="is_temperature_controlled", type="boolean", example=false),
 *     @OA\Property(property="notes", type="string"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="VehicleOffer",
 *     required={"id","origin_country","origin_city","vehicle_type"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="origin_country", type="string", example="PL"),
 *     @OA\Property(property="origin_city", type="string", example="Warsaw"),
 *     @OA\Property(property="destination_country", type="string"),
 *     @OA\Property(property="destination_city", type="string"),
 *     @OA\Property(property="vehicle_type", type="string", example="curtainsider"),
 *     @OA\Property(property="max_weight", type="number", format="float", example=24000),
 *     @OA\Property(property="max_volume", type="number", format="float", example=90),
 *     @OA\Property(property="available_date", type="string", format="date"),
 *     @OA\Property(property="price_per_km", type="number", format="float", example=1.25),
 *     @OA\Property(property="status", type="string", enum={"available","booked","unavailable"}),
 *     @OA\Property(property="has_adr", type="boolean"),
 *     @OA\Property(property="has_temperature_control", type="boolean")
 * )
 *
 * @OA\Schema(
 *     schema="TransportOrder",
 *     required={"id","status","shipper_id","carrier_id"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="order_number", type="string", example="ORD-2026-001234"),
 *     @OA\Property(property="status", type="string", enum={"pending","accepted","in_transit","delivered","cancelled"}, example="pending"),
 *     @OA\Property(property="shipper_company", ref="#/components/schemas/Company"),
 *     @OA\Property(property="carrier_company", ref="#/components/schemas/Company"),
 *     @OA\Property(property="origin", type="string", example="Berlin, DE"),
 *     @OA\Property(property="destination", type="string", example="Paris, FR"),
 *     @OA\Property(property="total_amount", type="number", format="float", example=3200.00),
 *     @OA\Property(property="currency", type="string", example="EUR"),
 *     @OA\Property(property="payment_terms", type="string", enum={"prepaid","30_days","60_days","90_days"})
 * )
 *
 * @OA\Schema(
 *     schema="Invoice",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="invoice_number", type="string", example="INV-2026-001"),
 *     @OA\Property(property="status", type="string", enum={"draft","sent","paid","overdue","cancelled"}),
 *     @OA\Property(property="amount", type="number", format="float"),
 *     @OA\Property(property="tax_amount", type="number", format="float"),
 *     @OA\Property(property="total_amount", type="number", format="float"),
 *     @OA\Property(property="currency", type="string", example="EUR"),
 *     @OA\Property(property="issue_date", type="string", format="date"),
 *     @OA\Property(property="due_date", type="string", format="date"),
 *     @OA\Property(property="paid_at", type="string", format="date-time", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="EcmrDocument",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="ecmr_number", type="string"),
 *     @OA\Property(property="status", type="string", enum={"draft","signed_sender","signed_carrier","signed_receiver","completed"}),
 *     @OA\Property(property="blockchain_hash", type="string"),
 *     @OA\Property(property="sender_country", type="string"),
 *     @OA\Property(property="place_of_taking_over", type="string"),
 *     @OA\Property(property="place_of_delivery", type="string"),
 *     @OA\Property(property="goods_description", type="array", @OA\Items(type="string"))
 * )
 *
 * ── Auth Endpoint Documentation ────────────────────────────
 *
 * @OA\Post(
 *     path="/auth/register",
 *     tags={"Authentication"},
 *     summary="Register a new company and admin user",
 *     @OA\RequestBody(required=true,
 *         @OA\JsonContent(required={"name","email","password","password_confirmation","company_name","company_type","vat_number","country_code","city","address","postal_code"},
 *             @OA\Property(property="name", type="string", example="John Doe"),
 *             @OA\Property(property="email", type="string", format="email", example="john@acme.eu"),
 *             @OA\Property(property="password", type="string", format="password", minLength=8),
 *             @OA\Property(property="password_confirmation", type="string", format="password"),
 *             @OA\Property(property="company_name", type="string", example="Acme Logistics GmbH"),
 *             @OA\Property(property="company_type", type="string", enum={"shipper","carrier","forwarder"}),
 *             @OA\Property(property="vat_number", type="string", example="DE123456789"),
 *             @OA\Property(property="country_code", type="string", example="DE", minLength=2, maxLength=2),
 *             @OA\Property(property="city", type="string", example="Berlin"),
 *             @OA\Property(property="address", type="string", example="Musterstraße 1"),
 *             @OA\Property(property="postal_code", type="string", example="10115")
 *         )
 *     ),
 *     @OA\Response(response=201, description="Registered successfully",
 *         @OA\JsonContent(@OA\Property(property="user", ref="#/components/schemas/User"),
 *             @OA\Property(property="token", type="string"), @OA\Property(property="message", type="string"))
 *     ),
 *     @OA\Response(response=422, description="Validation error", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 *
 * @OA\Post(
 *     path="/auth/login",
 *     tags={"Authentication"},
 *     summary="Login and receive a bearer token",
 *     @OA\RequestBody(required=true,
 *         @OA\JsonContent(required={"email","password"},
 *             @OA\Property(property="email", type="string", format="email", example="admin@logistics.eu"),
 *             @OA\Property(property="password", type="string", format="password", example="Admin@2026!")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Login successful",
 *         @OA\JsonContent(@OA\Property(property="user", ref="#/components/schemas/User"),
 *             @OA\Property(property="token", type="string", example="1|abc123token"))
 *     ),
 *     @OA\Response(response=422, description="Invalid credentials", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 *
 * @OA\Post(
 *     path="/auth/logout",
 *     tags={"Authentication"},
 *     summary="Logout and revoke current token",
 *     security={{"sanctum":{}}},
 *     @OA\Response(response=200, description="Logged out successfully")
 * )
 *
 * @OA\Get(
 *     path="/auth/profile",
 *     tags={"Authentication"},
 *     summary="Get authenticated user profile",
 *     security={{"sanctum":{}}},
 *     @OA\Response(response=200, description="User profile", @OA\JsonContent(ref="#/components/schemas/User"))
 * )
 *
 * ── Freight Endpoints ──────────────────────────────────────
 *
 * @OA\Get(
 *     path="/freight",
 *     tags={"Freight Exchange"},
 *     summary="List freight offers with filtering",
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(name="page", in="query", @OA\Schema(type="integer")),
 *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer", default=15)),
 *     @OA\Parameter(name="origin_country", in="query", @OA\Schema(type="string")),
 *     @OA\Parameter(name="destination_country", in="query", @OA\Schema(type="string")),
 *     @OA\Parameter(name="cargo_type", in="query", @OA\Schema(type="string")),
 *     @OA\Parameter(name="status", in="query", @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="Paginated freight list")
 * )
 *
 * @OA\Post(
 *     path="/freight",
 *     tags={"Freight Exchange"},
 *     summary="Create a new freight offer",
 *     security={{"sanctum":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\JsonContent(ref="#/components/schemas/FreightOffer")
 *     ),
 *     @OA\Response(response=201, description="Freight offer created")
 * )
 *
 * @OA\Post(
 *     path="/freight/search",
 *     tags={"Freight Exchange"},
 *     summary="Search freight offers with advanced filters",
 *     security={{"sanctum":{}}},
 *     @OA\RequestBody(@OA\JsonContent(
 *         @OA\Property(property="origin_country", type="string"),
 *         @OA\Property(property="destination_country", type="string"),
 *         @OA\Property(property="min_weight", type="number"),
 *         @OA\Property(property="max_weight", type="number"),
 *         @OA\Property(property="loading_date_from", type="string", format="date"),
 *         @OA\Property(property="loading_date_to", type="string", format="date"),
 *         @OA\Property(property="cargo_type", type="string"),
 *         @OA\Property(property="vehicle_type", type="string")
 *     )),
 *     @OA\Response(response=200, description="Search results")
 * )
 *
 * ── Orders Endpoints ───────────────────────────────────────
 *
 * @OA\Get(
 *     path="/orders",
 *     tags={"Transport Orders"},
 *     summary="List transport orders",
 *     security={{"sanctum":{}}},
 *     @OA\Response(response=200, description="Paginated orders list")
 * )
 *
 * @OA\Post(
 *     path="/orders",
 *     tags={"Transport Orders"},
 *     summary="Create a transport order",
 *     security={{"sanctum":{}}},
 *     @OA\RequestBody(required=true, @OA\JsonContent(ref="#/components/schemas/TransportOrder")),
 *     @OA\Response(response=201, description="Order created")
 * )
 *
 * @OA\Get(
 *     path="/orders/stats/overview",
 *     tags={"Transport Orders"},
 *     summary="Get order statistics overview",
 *     security={{"sanctum":{}}},
 *     @OA\Response(response=200, description="Order statistics")
 * )
 *
 * ── Tracking Endpoints ─────────────────────────────────────
 *
 * @OA\Get(
 *     path="/tracking/{trackingCode}",
 *     tags={"Tracking"},
 *     summary="Track a shipment by tracking code (public)",
 *     @OA\Parameter(name="trackingCode", in="path", required=true, @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="Shipment tracking data"),
 *     @OA\Response(response=404, description="Tracking code not found")
 * )
 *
 * @OA\Get(
 *     path="/tracking/active",
 *     tags={"Tracking"},
 *     summary="Get all active shipments for the authenticated user",
 *     security={{"sanctum":{}}},
 *     @OA\Response(response=200, description="Active shipments list")
 * )
 *
 * ── Blockchain / eCMR ──────────────────────────────────────
 *
 * @OA\Post(
 *     path="/ecmr",
 *     tags={"Blockchain & eCMR"},
 *     summary="Create an electronic CMR document",
 *     security={{"sanctum":{}}},
 *     @OA\RequestBody(required=true, @OA\JsonContent(
 *         required={"sender_country","place_of_taking_over","place_of_delivery","goods_description"},
 *         @OA\Property(property="sender_country", type="string", example="DE"),
 *         @OA\Property(property="place_of_taking_over", type="string", example="Berlin"),
 *         @OA\Property(property="place_of_delivery", type="string", example="Paris"),
 *         @OA\Property(property="goods_description", type="array", @OA\Items(type="string"))
 *     )),
 *     @OA\Response(response=201, description="eCMR created with blockchain hash")
 * )
 *
 * ── Invoicing ──────────────────────────────────────────────
 *
 * @OA\Get(
 *     path="/invoices",
 *     tags={"Invoicing"},
 *     summary="List invoices",
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(name="status", in="query", @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="Paginated invoices")
 * )
 *
 * @OA\Post(
 *     path="/invoices",
 *     tags={"Invoicing"},
 *     summary="Create a new invoice",
 *     security={{"sanctum":{}}},
 *     @OA\RequestBody(required=true, @OA\JsonContent(ref="#/components/schemas/Invoice")),
 *     @OA\Response(response=201, description="Invoice created")
 * )
 *
 * ── Payments ───────────────────────────────────────────────
 *
 * @OA\Get(
 *     path="/payments/history",
 *     tags={"Payments"},
 *     summary="Get payment history",
 *     security={{"sanctum":{}}},
 *     @OA\Response(response=200, description="Payment transactions")
 * )
 *
 * @OA\Get(
 *     path="/payments/exchange-rates",
 *     tags={"Payments"},
 *     summary="Get current EUR exchange rates",
 *     security={{"sanctum":{}}},
 *     @OA\Response(response=200, description="Exchange rate data")
 * )
 *
 * ── Health ──────────────────────────────────────────────────
 *
 * @OA\Get(
 *     path="/health",
 *     tags={"Health"},
 *     summary="Basic health check",
 *     @OA\Response(response=200, description="System is healthy",
 *         @OA\JsonContent(@OA\Property(property="status", type="string", example="ok"))
 *     )
 * )
 */
class SwaggerController extends Controller
{
    // This controller only holds OpenAPI annotations.
    // Swagger UI is served via /api/documentation route.
}
