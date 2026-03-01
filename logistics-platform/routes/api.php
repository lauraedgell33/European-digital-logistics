<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FreightController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TenderController;
use App\Http\Controllers\Api\TrackingController;
use App\Http\Controllers\Api\NetworkController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\MatchingController;
use App\Http\Controllers\Api\RoutePlanningController;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\BarometerController;
use App\Http\Controllers\Api\DrivingBanController;
use App\Http\Controllers\Api\CarbonController;
use App\Http\Controllers\Api\LexiconController;
use App\Http\Controllers\Api\TrackingShareController;
use App\Http\Controllers\Api\PriceInsightController;
use App\Http\Controllers\Api\InsuranceController;
use App\Http\Controllers\Api\EscrowController;
use App\Http\Controllers\Api\DebtCollectionController;
use App\Http\Controllers\Api\ReturnLoadController;
use App\Http\Controllers\Api\AiMatchingController;
use App\Http\Controllers\Api\PredictiveAnalyticsController;
use App\Http\Controllers\Api\DynamicPricingController;
use App\Http\Controllers\Api\RouteOptimizationController;
use App\Http\Controllers\Api\DocumentOcrController;
use App\Http\Controllers\Api\BlockchainController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\MultimodalController;
use App\Http\Controllers\Api\EnterpriseController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\AiCopilotController;
use App\Http\Controllers\Api\CustomerPortalController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\MetricsController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\CurrencyController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\IntegrationHubController;
use App\Http\Controllers\Api\Q3FeaturesController;
use App\Http\Controllers\Api\Q4ScaleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check routes (no auth, no prefix)
Route::get('/health', [HealthController::class, 'index']);
Route::get('/health/detailed', [HealthController::class, 'detailed']);
Route::get('/health/cache', [HealthController::class, 'cacheStats']);

// Prometheus metrics endpoint (API key protected)
Route::get('/metrics', MetricsController::class);

// Stripe webhook (no auth)
Route::post('/stripe/webhook', [PaymentController::class, 'webhook']);
Route::post('/docusign/webhook', [Q3FeaturesController::class, 'docusignWebhook']);

// Public routes
Route::prefix('v1')->group(function () {

    // Authentication (login-specific rate limit)
    Route::post('/auth/register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1');
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('rate.limit:login');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('rate.limit:login');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('rate.limit:login');

    // Public tracking
    Route::get('/tracking/{trackingCode}', [TrackingController::class, 'track']);

    // Device webhook (authenticated via API key)
    Route::post('/webhooks/tracking-device', [TrackingController::class, 'deviceWebhook'])
        ->middleware('throttle:tracking');

    // Public tracking share link (no auth)
    Route::get('/tracking/shared/{token}', [TrackingShareController::class, 'viewShared']);

    // Public lexicon (no auth, cached 1h)
    Route::middleware('cache.response:3600,public')->group(function () {
        Route::get('/lexicon', [LexiconController::class, 'index']);
        Route::get('/lexicon/categories', [LexiconController::class, 'categories']);
        Route::get('/lexicon/popular', [LexiconController::class, 'popular']);
        Route::get('/lexicon/{slug}', [LexiconController::class, 'show']);
    });

    // Public driving bans (no auth, cached 30min)
    Route::middleware('cache.response:1800,public')->group(function () {
        Route::get('/driving-bans', [DrivingBanController::class, 'index']);
        Route::get('/driving-bans/active', [DrivingBanController::class, 'active']);
        Route::get('/driving-bans/types', [DrivingBanController::class, 'types']);
        Route::get('/driving-bans/countries', [DrivingBanController::class, 'countries']);
        Route::get('/driving-bans/countries/{countryCode}', [DrivingBanController::class, 'country']);
    });
    Route::post('/driving-bans/check-route', [DrivingBanController::class, 'checkRoute']);

    // Public carbon calculator (no auth)
    Route::post('/carbon/calculate', [CarbonController::class, 'calculate']);
    Route::get('/carbon/emission-factors', [CarbonController::class, 'emissionFactors'])
        ->middleware('cache.response:86400,public');

    // Public price insights (limited, no auth, cached 15min)
    Route::middleware('cache.response:900,public')->group(function () {
        Route::get('/price-insights/top-routes', [PriceInsightController::class, 'topRoutes']);
        Route::get('/price-insights/heatmap', [PriceInsightController::class, 'heatmap']);
    });

    // Customer Portal (public, no auth required)
    Route::prefix('portal')->group(function () {
        Route::post('/track', [CustomerPortalController::class, 'trackByNumber']);
        Route::get('/track/{token}', [CustomerPortalController::class, 'trackByToken']);
        Route::get('/pod/{trackingNumber}', [CustomerPortalController::class, 'getProofOfDelivery']);
        Route::post('/feedback', [CustomerPortalController::class, 'submitFeedback']);
    });

    // Public insurance coverage types (cached 1h)
    Route::get('/insurance/coverage-types', [InsuranceController::class, 'coverageTypes'])
        ->middleware('cache.response:3600,public');

    // ── Full-text Search (public, rate-limited) ─────────
    Route::prefix('search')->middleware('throttle:60,1')->group(function () {
        Route::get('/', [SearchController::class, 'search']);
        Route::get('/suggest', [SearchController::class, 'suggest']);
        Route::get('/freight', [SearchController::class, 'freight']);
        Route::get('/vehicles', [SearchController::class, 'vehicles']);
        Route::get('/companies', [SearchController::class, 'companies']);
    });
});

// Protected routes
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Broadcasting auth (for WebSocket channel authorization)
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    });

    // Email Verification
    Route::post('/auth/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed'])
        ->name('verification.verify');
    Route::post('/auth/email/resend', [AuthController::class, 'resendVerification'])
        ->middleware(['throttle:6,1'])
        ->name('verification.send');

    // Two-Factor Authentication
    Route::prefix('auth/2fa')->group(function () {
        Route::post('/enable', [TwoFactorController::class, 'enable']);
        Route::post('/verify', [TwoFactorController::class, 'verify']);
        Route::post('/disable', [TwoFactorController::class, 'disable']);
    });

    // Auth
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard (cached per-user)
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('cache.response:120');
    Route::get('/dashboard/analytics', [DashboardController::class, 'analytics'])
        ->middleware('cache.response:600');

    // Freight Exchange
    Route::apiResource('/freight', FreightController::class)->parameters(['freight' => 'freight']);
    Route::post('/freight/search', [FreightController::class, 'search']);
    Route::get('/freight/my/offers', [FreightController::class, 'myOffers']);

    // Vehicle Exchange
    Route::apiResource('/vehicles', VehicleController::class);
    Route::post('/vehicles/search', [VehicleController::class, 'search']);
    Route::get('/vehicles/my/offers', [VehicleController::class, 'myOffers']);

    // Transport Orders
    Route::apiResource('/orders', OrderController::class)->only(['index', 'store', 'show']);
    Route::post('/orders/{order}/accept', [OrderController::class, 'accept']);
    Route::post('/orders/{order}/reject', [OrderController::class, 'reject']);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::get('/orders/{order}/documents', [OrderController::class, 'documents']);
    Route::post('/orders/{order}/documents', [OrderController::class, 'uploadDocument']);
    Route::delete('/orders/{order}/documents/{media}', [OrderController::class, 'deleteDocument']);
    Route::get('/orders/stats/overview', [OrderController::class, 'statistics']);

    // Tenders
    Route::apiResource('/tenders', TenderController::class)->except(['destroy']);
    Route::post('/tenders/{tender}/bids', [TenderController::class, 'submitBid']);
    Route::post('/tenders/{tender}/bids/{bid}/award', [TenderController::class, 'awardBid']);
    Route::get('/tenders/my/tenders', [TenderController::class, 'myTenders']);
    Route::get('/tenders/my/bids', [TenderController::class, 'myBids']);

    // Tracking
    Route::get('/tracking/active', [TrackingController::class, 'activeShipments']);
    Route::put('/tracking/{shipment}/position', [TrackingController::class, 'updatePosition']);
    Route::get('/tracking/{shipment}/history', [TrackingController::class, 'history']);
    Route::get('/tracking/{shipment}/events', [TrackingController::class, 'events']);
    Route::post('/tracking/{shipment}/events', [TrackingController::class, 'addEvent']);
    Route::get('/tracking/{shipment}/eta', [TrackingController::class, 'eta']);

    // Partner Networks
    Route::apiResource('/networks', NetworkController::class)->only(['index', 'store', 'show']);
    Route::post('/networks/join', [NetworkController::class, 'join']);
    Route::post('/networks/{network}/invite', [NetworkController::class, 'invite']);
    Route::delete('/networks/{network}/members/{company}', [NetworkController::class, 'removeMember']);
    Route::post('/networks/{network}/leave', [NetworkController::class, 'leave']);

    // Integration / External API
    Route::post('/integration/import-freight', [IntegrationController::class, 'importFreight']);
    Route::get('/integration/export-orders', [IntegrationController::class, 'exportOrders']);
    Route::post('/integration/webhook', [IntegrationController::class, 'webhook']);

    // Export / Download
    Route::get('/export/orders/pdf', [ExportController::class, 'ordersPdf']);
    Route::get('/export/orders/csv', [ExportController::class, 'ordersCsv']);
    Route::get('/export/orders/{order}/pdf', [ExportController::class, 'orderDetailPdf']);
    Route::get('/export/freight/csv', [ExportController::class, 'freightCsv']);
    Route::get('/export/vehicles/csv', [ExportController::class, 'vehiclesCsv']);
    Route::get('/export/analytics/pdf', [ExportController::class, 'analyticsPdf']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'read']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Push Notifications
    Route::post('/notifications/push-subscribe', [\App\Http\Controllers\Api\PushNotificationController::class, 'subscribe']);
    Route::post('/notifications/push-unsubscribe', [\App\Http\Controllers\Api\PushNotificationController::class, 'unsubscribe']);
    Route::post('/notifications/push-test', [\App\Http\Controllers\Api\PushNotificationController::class, 'sendTest']);

    // Messaging
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::post('/messages/conversations', [MessageController::class, 'startConversation']);
    Route::get('/messages/conversations/{conversation}', [MessageController::class, 'messages']);
    Route::post('/messages/conversations/{conversation}', [MessageController::class, 'sendMessage']);
    Route::post('/messages/conversations/{conversation}/read', [MessageController::class, 'markRead']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);

    // Company Directory (cached, shared)
    Route::get('/companies', [CompanyController::class, 'index'])
        ->middleware('cache.response:600,public');
    Route::get('/companies/{company}', [CompanyController::class, 'show'])
        ->middleware('cache.response:600,public');

    // Matching (cached per-user, 5min)
    Route::get('/matching/freight/{freight}', [MatchingController::class, 'matchFreight'])
        ->middleware('cache.response:300');
    Route::get('/matching/vehicle/{vehicle}', [MatchingController::class, 'matchVehicle'])
        ->middleware('cache.response:300');

    // Route Planning
    Route::post('/routes/calculate', [RoutePlanningController::class, 'calculate']);

    // Pricing
    Route::post('/pricing/calculate', [PricingController::class, 'calculate']);

    // Audit Logs (GDPR compliance)
    Route::prefix('audit')->group(function () {
        Route::get('/', [AuditController::class, 'index']);
        Route::get('/export', [AuditController::class, 'export']);
        Route::get('/summary', [AuditController::class, 'summary']);
    });

    // ─── Warehousing Exchange ─────────────────────────────────────
    Route::prefix('warehouses')->group(function () {
        Route::get('/', [WarehouseController::class, 'index']);
        Route::post('/', [WarehouseController::class, 'store']);
        Route::get('/search', [WarehouseController::class, 'search']);
        Route::get('/my', [WarehouseController::class, 'myWarehouses']);
        Route::get('/bookings/my', [WarehouseController::class, 'myBookings']);
        Route::get('/bookings/requests', [WarehouseController::class, 'bookingRequests']);
        Route::get('/{warehouse}', [WarehouseController::class, 'show']);
        Route::put('/{warehouse}', [WarehouseController::class, 'update']);
        Route::delete('/{warehouse}', [WarehouseController::class, 'destroy']);
        Route::post('/{warehouse}/book', [WarehouseController::class, 'book']);
        Route::put('/bookings/{booking}/status', [WarehouseController::class, 'updateBookingStatus']);
    });

    // ─── Transport Barometer (cached 5min, shared) ────────────────
    Route::prefix('barometer')->middleware('cache.response:300,public')->group(function () {
        Route::get('/overview', [BarometerController::class, 'overview']);
        Route::get('/route', [BarometerController::class, 'route']);
        Route::get('/heatmap', [BarometerController::class, 'heatmap']);
        Route::get('/price-trends', [BarometerController::class, 'priceTrends']);
    });

    // ─── Carbon Footprint ─────────────────────────────────────────
    Route::prefix('carbon')->group(function () {
        Route::get('/dashboard', [CarbonController::class, 'dashboard']);
        Route::get('/orders/{order}', [CarbonController::class, 'forOrder']);
        Route::post('/orders/{order}', [CarbonController::class, 'calculateForOrder']);
        Route::post('/{footprint}/offset', [CarbonController::class, 'purchaseOffset']);
    });

    // ─── Tracking Shares ──────────────────────────────────────────
    Route::prefix('tracking-shares')->group(function () {
        Route::post('/', [TrackingShareController::class, 'store']);
        Route::get('/shipment/{shipment}', [TrackingShareController::class, 'forShipment']);
        Route::delete('/{share}', [TrackingShareController::class, 'revoke']);
    });

    // ─── Price Insights ───────────────────────────────────────────
    Route::prefix('price-insights')->group(function () {
        Route::get('/route', [PriceInsightController::class, 'route']);
        Route::post('/compare', [PriceInsightController::class, 'compare']);
        Route::post('/estimate', [PriceInsightController::class, 'estimate']);
    });

    // ─── Return Load Suggestions ──────────────────────────────────
    Route::prefix('return-loads')->group(function () {
        Route::post('/suggest', [ReturnLoadController::class, 'suggest']);
        Route::get('/for-order/{orderId}', [ReturnLoadController::class, 'forOrder']);
        Route::get('/empty-legs', [ReturnLoadController::class, 'emptyLegs']);
    });

    // ─── Insurance ────────────────────────────────────────────────
    Route::prefix('insurance')->group(function () {
        Route::post('/quote', [InsuranceController::class, 'quote']);
        Route::post('/orders/{order}', [InsuranceController::class, 'createForOrder']);
        Route::post('/{quote}/accept', [InsuranceController::class, 'accept']);
        Route::post('/{quote}/claim', [InsuranceController::class, 'fileClaim']);
        Route::get('/my', [InsuranceController::class, 'myQuotes']);
    });

    // ─── Escrow Payments ──────────────────────────────────────────
    Route::prefix('escrow')->group(function () {
        Route::get('/', [EscrowController::class, 'index']);
        Route::post('/orders/{order}', [EscrowController::class, 'create']);
        Route::get('/orders/{order}', [EscrowController::class, 'forOrder']);
        Route::post('/{escrow}/fund', [EscrowController::class, 'fund']);
        Route::post('/{escrow}/release', [EscrowController::class, 'release']);
        Route::post('/{escrow}/dispute', [EscrowController::class, 'dispute']);
        Route::post('/{escrow}/refund', [EscrowController::class, 'refund']);
        Route::post('/{escrow}/cancel', [EscrowController::class, 'cancel']);
    });

    // ─── Debt Collection ──────────────────────────────────────────
    Route::prefix('debt-collection')->group(function () {
        Route::get('/', [DebtCollectionController::class, 'index']);
        Route::post('/', [DebtCollectionController::class, 'store']);
        Route::get('/stats', [DebtCollectionController::class, 'stats']);
        Route::post('/calculate-fee', [DebtCollectionController::class, 'calculateFee']);
        Route::get('/{debtCollection}', [DebtCollectionController::class, 'show']);
        Route::post('/{debtCollection}/reminder', [DebtCollectionController::class, 'sendReminder']);
        Route::post('/{debtCollection}/escalate', [DebtCollectionController::class, 'escalate']);
        Route::post('/{debtCollection}/pay', [DebtCollectionController::class, 'markPaid']);
        Route::post('/{debtCollection}/cancel', [DebtCollectionController::class, 'cancel']);
    });

    // ─── Lexicon Admin ────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin/lexicon')->group(function () {
        Route::post('/', [LexiconController::class, 'store']);
        Route::put('/{article}', [LexiconController::class, 'update']);
        Route::delete('/{article}', [LexiconController::class, 'destroy']);
    });

    // ─── AI Smart Matching (v2 — learned weights, batch, analytics) ───
    Route::prefix('ai-matching')->group(function () {
        Route::post('/match', [AiMatchingController::class, 'smartMatch']);
        Route::post('/batch', [AiMatchingController::class, 'batchMatch']);
        Route::get('/suggestions', [AiMatchingController::class, 'suggestions']);
        Route::get('/analytics', [AiMatchingController::class, 'analytics']);
        Route::post('/recalibrate', [AiMatchingController::class, 'recalibrate']);
        Route::post('/respond/{aiMatchResult}', [AiMatchingController::class, 'respond']);
        Route::get('/history', [AiMatchingController::class, 'history']);
    });

    // ─── Predictive Analytics ─────────────────────────────────────
    Route::prefix('predictions')->group(function () {
        Route::post('/demand', [PredictiveAnalyticsController::class, 'demandForecast']);
        Route::post('/pricing', [PredictiveAnalyticsController::class, 'priceForecast']);
        Route::post('/capacity', [PredictiveAnalyticsController::class, 'capacityForecast']);
        Route::get('/market', [PredictiveAnalyticsController::class, 'marketAnalytics']);
    });

    // ─── Dynamic Pricing ─────────────────────────────────────────
    Route::prefix('dynamic-pricing')->group(function () {
        Route::post('/calculate', [DynamicPricingController::class, 'calculate']);
        Route::get('/history', [DynamicPricingController::class, 'history']);
        Route::get('/active', [DynamicPricingController::class, 'activePrices']);

        // Automated Pricing Engine v2
        Route::prefix('engine')->group(function () {
            Route::post('/calculate', [DynamicPricingController::class, 'engineCalculate']);
            Route::get('/analysis', [DynamicPricingController::class, 'engineAnalysis']);
            Route::get('/alerts', [DynamicPricingController::class, 'engineAlerts']);
            Route::post('/forecast', [DynamicPricingController::class, 'engineForecast']);
            Route::get('/profitability', [DynamicPricingController::class, 'engineProfitability']);
        });

        // Pricing Rules CRUD
        Route::prefix('rules')->group(function () {
            Route::get('/', [DynamicPricingController::class, 'rulesList']);
            Route::post('/', [DynamicPricingController::class, 'rulesCreate']);
            Route::put('/{id}', [DynamicPricingController::class, 'rulesUpdate']);
            Route::delete('/{id}', [DynamicPricingController::class, 'rulesDelete']);
        });
    });

    // ─── Route Optimization (v2 — external APIs, fleet CVRP, tolls) ──
    Route::prefix('route-optimization')->group(function () {
        Route::post('/optimize', [RouteOptimizationController::class, 'optimize']);
        Route::post('/fleet', [RouteOptimizationController::class, 'optimizeFleet']);
        Route::get('/history', [RouteOptimizationController::class, 'history']);
        Route::get('/{routeOptimization}', [RouteOptimizationController::class, 'show']);
    });

    // ─── Document OCR ─────────────────────────────────────────────
    Route::prefix('documents/ocr')->group(function () {
        Route::post('/upload', [DocumentOcrController::class, 'upload']);
        Route::post('/{documentScan}/validate', [DocumentOcrController::class, 'validateExtraction']);
        Route::get('/', [DocumentOcrController::class, 'index']);
        Route::get('/stats', [DocumentOcrController::class, 'stats']);
        Route::get('/{documentScan}', [DocumentOcrController::class, 'show']);
    });

    // ─── Blockchain / eCMR ────────────────────────────────────────
    Route::prefix('ecmr')->group(function () {
        Route::post('/', [BlockchainController::class, 'createEcmr']);
        Route::get('/', [BlockchainController::class, 'listEcmr']);
        Route::get('/{ecmrDocument}', [BlockchainController::class, 'showEcmr']);
        Route::post('/{ecmrDocument}/sign', [BlockchainController::class, 'signEcmr']);
        Route::get('/{ecmrDocument}/verify', [BlockchainController::class, 'verifyEcmr']);
    });

    Route::prefix('smart-contracts')->group(function () {
        Route::post('/', [BlockchainController::class, 'createContract']);
        Route::get('/', [BlockchainController::class, 'listContracts']);
        Route::post('/{smartContract}/evaluate', [BlockchainController::class, 'evaluateContract']);
    });

    Route::prefix('digital-identity')->group(function () {
        Route::get('/', [BlockchainController::class, 'getIdentity']);
        Route::post('/verify', [BlockchainController::class, 'verifyIdentity']);
    });

    // ─── Invoicing ────────────────────────────────────────────────
    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'index']);
        Route::post('/', [InvoiceController::class, 'store']);
        Route::get('/stats', [InvoiceController::class, 'stats']);
        Route::get('/{invoice}', [InvoiceController::class, 'show']);
        Route::post('/{invoice}/send', [InvoiceController::class, 'send']);
        Route::post('/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);
        Route::post('/{invoice}/factoring', [InvoiceController::class, 'requestFactoring']);
    });

    // ─── Payments ─────────────────────────────────────────────────
    Route::prefix('payments')->group(function () {
        Route::post('/stripe', [PaymentController::class, 'processStripe']);
        Route::post('/create-intent', [PaymentController::class, 'processStripe']);
        Route::post('/confirm', [PaymentController::class, 'confirm']);
        Route::post('/setup-intent', [PaymentController::class, 'setupIntent']);
        Route::post('/sepa', [PaymentController::class, 'processSepa']);
        Route::post('/{paymentTransaction}/refund', [PaymentController::class, 'refund']);
        Route::get('/history', [PaymentController::class, 'history']);
        Route::get('/summary', [PaymentController::class, 'summary']);
        Route::get('/exchange-rates', [PaymentController::class, 'exchangeRates'])
            ->middleware('cache.response:300,public');
    });

    // ─── VAT ──────────────────────────────────────────────────────
    Route::prefix('vat')->group(function () {
        Route::get('/report', [PaymentController::class, 'vatReport']);
        Route::get('/rates', [PaymentController::class, 'vatRates'])
            ->middleware('cache.response:3600,public');
        Route::post('/reverse-charge', [PaymentController::class, 'checkReverseCharge']);
    });

    // ─── Multimodal Transport ─────────────────────────────────────
    Route::prefix('multimodal')->group(function () {
        Route::post('/search', [MultimodalController::class, 'search']);
        Route::post('/book', [MultimodalController::class, 'book']);
        Route::get('/bookings', [MultimodalController::class, 'bookings']);
        Route::get('/bookings/{multimodalBooking}', [MultimodalController::class, 'showBooking']);
        Route::get('/statistics', [MultimodalController::class, 'statistics']);
    });

    Route::prefix('intermodal')->group(function () {
        Route::post('/plan', [MultimodalController::class, 'createPlan']);
        Route::get('/plans', [MultimodalController::class, 'plans']);
        Route::get('/plans/{intermodalPlan}', [MultimodalController::class, 'showPlan']);
    });

    // ─── Enterprise / White Label ─────────────────────────────────
    Route::prefix('white-label')->group(function () {
        Route::get('/', [EnterpriseController::class, 'getWhiteLabel']);
        Route::post('/', [EnterpriseController::class, 'saveWhiteLabel']);
    });

    // ─── API Marketplace ──────────────────────────────────────────
    Route::prefix('api-keys')->group(function () {
        Route::get('/', [EnterpriseController::class, 'listApiKeys']);
        Route::post('/', [EnterpriseController::class, 'createApiKey']);
        Route::delete('/{apiKey}', [EnterpriseController::class, 'revokeApiKey']);
        Route::get('/usage', [EnterpriseController::class, 'apiUsageStats']);
    });

    // ─── ERP Integrations ─────────────────────────────────────────
    Route::prefix('erp')->group(function () {
        Route::get('/', [EnterpriseController::class, 'listIntegrations']);
        Route::post('/', [EnterpriseController::class, 'createIntegration']);
        Route::post('/{integration}/toggle', [EnterpriseController::class, 'toggleIntegration']);
        Route::post('/{integration}/sync', [EnterpriseController::class, 'syncIntegration']);
    });

    // ─── EDI Messages ─────────────────────────────────────────────
    Route::prefix('edi')->group(function () {
        Route::get('/', [EnterpriseController::class, 'listEdiMessages']);
        Route::post('/send', [EnterpriseController::class, 'sendEdiMessage']);
        Route::get('/stats', [EnterpriseController::class, 'ediStats']);
    });

    // ─── AI Copilot ───────────────────────────────────────────────
    Route::prefix('copilot')->group(function () {
        Route::post('/chat', [AiCopilotController::class, 'chat']);
        Route::get('/suggestions', [AiCopilotController::class, 'suggestions']);
    });

    // ─── Document Generation (PDF — invoice, CMR, waybill) ───────
    Route::prefix('documents')->group(function () {
        Route::get('/invoices/{invoice}/pdf', [DocumentController::class, 'invoicePdf']);
        Route::get('/orders/{order}/cmr', [DocumentController::class, 'cmrPdf']);
        Route::get('/orders/{order}/waybill', [DocumentController::class, 'waybillPdf']);
        Route::get('/orders/{order}/delivery-note', [DocumentController::class, 'deliveryNotePdf']);
        Route::get('/orders/{order}/available', [DocumentController::class, 'availableDocuments']);
    });

    // ─── Multi-Currency & Exchange Rates ──────────────────────────
    Route::prefix('currency')->group(function () {
        Route::get('/rates', [CurrencyController::class, 'rates']);
        Route::post('/convert', [CurrencyController::class, 'convert']);
        Route::get('/supported', [CurrencyController::class, 'supported']);
        Route::get('/history', [CurrencyController::class, 'history']);
    });

    // ─── Advanced Reporting ───────────────────────────────────────
    Route::prefix('reports')->group(function () {
        Route::get('/revenue', [ReportController::class, 'revenue']);
        Route::get('/orders', [ReportController::class, 'orders']);
        Route::get('/routes', [ReportController::class, 'routes']);
        Route::get('/carriers', [ReportController::class, 'carriers']);
        Route::get('/carbon', [ReportController::class, 'carbon']);
        Route::get('/summary', [ReportController::class, 'summary']);
        Route::get('/export/{type}', [ReportController::class, 'export']);
    });

    // ═══════════════════════════════════════════════════════════════
    // Q3 — INTEGRATION HUB (ERP, TMS, GPS Fleet Tracking)
    // ═══════════════════════════════════════════════════════════════

    Route::prefix('integration-hub')->group(function () {

        // ─── ERP Integration (SAP, Oracle, Dynamics) ──────────────
        Route::prefix('erp')->group(function () {
            Route::post('/sync/{integration}', [IntegrationHubController::class, 'erpSync']);
            Route::post('/test-connection/{integration}', [IntegrationHubController::class, 'erpTestConnection']);
            Route::post('/webhook/{integration}', [IntegrationHubController::class, 'erpWebhook']);
            Route::post('/send-webhook/{integration}', [IntegrationHubController::class, 'erpSendWebhook']);
            Route::get('/sap-idoc/{order}', [IntegrationHubController::class, 'erpSapIdoc']);
            Route::get('/oracle-record/{order}', [IntegrationHubController::class, 'erpOracleRecord']);
            Route::get('/sync-health/{integration}', [IntegrationHubController::class, 'erpSyncHealth']);
        });

        // ─── TMS Connectors (Transporeon, TIMOCOM, etc.) ─────────
        Route::prefix('tms')->group(function () {
            Route::get('/providers', [IntegrationHubController::class, 'tmsProviders']);
            Route::post('/publish-freight', [IntegrationHubController::class, 'tmsPublishFreight']);
            Route::post('/fetch-loads', [IntegrationHubController::class, 'tmsFetchLoads']);
            Route::post('/import-orders', [IntegrationHubController::class, 'tmsImportOrders']);
            Route::post('/push-tracking', [IntegrationHubController::class, 'tmsPushTracking']);
        });

        // ─── GPS Fleet Tracking (Samsara, Geotab) ────────────────
        Route::prefix('gps')->group(function () {
            Route::get('/providers', [IntegrationHubController::class, 'gpsProviders']);
            Route::get('/fleet-positions', [IntegrationHubController::class, 'gpsFleetPositions']);
            Route::get('/vehicle-history/{vehicleId}', [IntegrationHubController::class, 'gpsVehicleHistory']);
            Route::get('/diagnostics/{vehicleId}', [IntegrationHubController::class, 'gpsVehicleDiagnostics']);
            Route::get('/driver-hos/{driverId}', [IntegrationHubController::class, 'gpsDriverHos']);
            Route::post('/link-shipment', [IntegrationHubController::class, 'gpsLinkShipment']);
            Route::post('/sync-shipments', [IntegrationHubController::class, 'gpsSyncShipments']);
            Route::get('/geofence-alerts', [IntegrationHubController::class, 'gpsGeofenceAlerts']);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Q3 — ELECTRONIC SIGNATURES
    // ═══════════════════════════════════════════════════════════════

    Route::prefix('e-signature')->group(function () {
        Route::post('/contract/{order}', [Q3FeaturesController::class, 'createContractSignature']);
        Route::post('/cmr/{ecmr}', [Q3FeaturesController::class, 'signCmr']);
        Route::get('/status/{envelopeId}', [Q3FeaturesController::class, 'signatureStatus']);
        Route::get('/verify/{signatureId}', [Q3FeaturesController::class, 'verifySignature']);
        Route::post('/sign/{signatureId}', [Q3FeaturesController::class, 'signInternal']);
        Route::get('/download/{envelopeId}', [Q3FeaturesController::class, 'downloadSigned']);
        Route::get('/list', [Q3FeaturesController::class, 'listSignatures']);
    });

    // ═══════════════════════════════════════════════════════════════
    // Q3 — EU MOBILITY PACKAGE COMPLIANCE
    // ═══════════════════════════════════════════════════════════════

    Route::prefix('compliance')->group(function () {
        Route::get('/driver/{driverId}', [Q3FeaturesController::class, 'driverComplianceCheck']);
        Route::post('/cabotage', [Q3FeaturesController::class, 'cabotageCheck']);
        Route::post('/posted-workers', [Q3FeaturesController::class, 'postedWorkersCheck']);
        Route::post('/tachograph', [Q3FeaturesController::class, 'validateTachograph']);
        Route::get('/fleet-report', [Q3FeaturesController::class, 'fleetComplianceReport']);
        Route::get('/minimum-wages', [Q3FeaturesController::class, 'minimumWages']);
    });

    // ═══════════════════════════════════════════════════════════════
    // Q3 — ENHANCED CARBON CALCULATOR (GLEC v3 / ISO 14083)
    // ═══════════════════════════════════════════════════════════════

    Route::prefix('carbon-v2')->group(function () {
        Route::post('/calculate-glec', [Q3FeaturesController::class, 'calculateGlec']);
        Route::post('/compare-multimodal', [Q3FeaturesController::class, 'compareMultimodal']);
        Route::post('/multimodal-route', [Q3FeaturesController::class, 'multimodalRoute']);
        Route::get('/fleet-benchmark', [Q3FeaturesController::class, 'fleetCarbonBenchmark']);
        Route::get('/recommendations', [Q3FeaturesController::class, 'carbonRecommendations']);
    });

    // ═══════════════════════════════════════════════════════════════
    // Q4 — MULTI-TENANT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    Route::prefix('tenants')->group(function () {
        Route::get('/', [Q4ScaleController::class, 'listTenants']);
        Route::post('/provision', [Q4ScaleController::class, 'provisionTenant']);
        Route::delete('/{tenantId}', [Q4ScaleController::class, 'deprovisionTenant']);
        Route::put('/{tenantId}/plan', [Q4ScaleController::class, 'changePlan']);
        Route::get('/{tenantId}/usage', [Q4ScaleController::class, 'tenantUsage']);
        Route::get('/{tenantId}/branding', [Q4ScaleController::class, 'tenantBranding']);
        Route::put('/{tenantId}/branding', [Q4ScaleController::class, 'updateBranding']);
    });

    // ═══════════════════════════════════════════════════════════════
    // Q4 — DATABASE READ REPLICAS & ANALYTICS
    // ═══════════════════════════════════════════════════════════════

    Route::prefix('scale')->group(function () {
        Route::get('/replica-status', [Q4ScaleController::class, 'replicaStatus']);
        Route::post('/analytics-query', [Q4ScaleController::class, 'analyticsQuery']);
        Route::get('/websocket-cluster', [Q4ScaleController::class, 'websocketClusterStatus']);
        Route::post('/broadcast-test', [Q4ScaleController::class, 'broadcastTest']);
        Route::get('/cdn-status', [Q4ScaleController::class, 'cdnStatus']);
        Route::get('/infrastructure-health', [Q4ScaleController::class, 'infrastructureHealth']);
    });
});
