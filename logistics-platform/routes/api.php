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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check routes (no auth, no prefix)
Route::get('/health', [HealthController::class, 'index']);
Route::get('/health/detailed', [HealthController::class, 'detailed']);

// Public routes
Route::prefix('v1')->group(function () {

    // Authentication (login-specific rate limit)
    Route::post('/auth/register', [AuthController::class, 'register']);
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

    // Public lexicon (no auth)
    Route::get('/lexicon', [LexiconController::class, 'index']);
    Route::get('/lexicon/categories', [LexiconController::class, 'categories']);
    Route::get('/lexicon/popular', [LexiconController::class, 'popular']);
    Route::get('/lexicon/{slug}', [LexiconController::class, 'show']);

    // Public driving bans (no auth)
    Route::get('/driving-bans', [DrivingBanController::class, 'index']);
    Route::get('/driving-bans/active', [DrivingBanController::class, 'active']);
    Route::get('/driving-bans/types', [DrivingBanController::class, 'types']);
    Route::get('/driving-bans/countries', [DrivingBanController::class, 'countries']);
    Route::get('/driving-bans/countries/{countryCode}', [DrivingBanController::class, 'country']);
    Route::post('/driving-bans/check-route', [DrivingBanController::class, 'checkRoute']);

    // Public carbon calculator (no auth)
    Route::post('/carbon/calculate', [CarbonController::class, 'calculate']);
    Route::get('/carbon/emission-factors', [CarbonController::class, 'emissionFactors']);

    // Public price insights (limited, no auth)
    Route::get('/price-insights/top-routes', [PriceInsightController::class, 'topRoutes']);
    Route::get('/price-insights/heatmap', [PriceInsightController::class, 'heatmap']);

    // Public insurance coverage types
    Route::get('/insurance/coverage-types', [InsuranceController::class, 'coverageTypes']);
});

// Protected routes
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Broadcasting auth (for WebSocket channel authorization)
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    });

    // Auth
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);

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

    // Messaging
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::post('/messages/conversations', [MessageController::class, 'startConversation']);
    Route::get('/messages/conversations/{conversation}', [MessageController::class, 'messages']);
    Route::post('/messages/conversations/{conversation}', [MessageController::class, 'sendMessage']);
    Route::post('/messages/conversations/{conversation}/read', [MessageController::class, 'markRead']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);

    // Company Directory
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/{company}', [CompanyController::class, 'show']);

    // Matching
    Route::get('/matching/freight/{freight}', [MatchingController::class, 'matchFreight']);
    Route::get('/matching/vehicle/{vehicle}', [MatchingController::class, 'matchVehicle']);

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

    // ─── Transport Barometer ──────────────────────────────────────
    Route::prefix('barometer')->group(function () {
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
});
