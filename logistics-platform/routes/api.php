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
});
