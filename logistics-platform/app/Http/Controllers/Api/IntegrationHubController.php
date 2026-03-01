<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ErpIntegration;
use App\Models\FreightOffer;
use App\Models\Shipment;
use App\Services\ErpIntegrationService;
use App\Services\TmsConnectorService;
use App\Services\GpsFleetTrackingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IntegrationHubController extends Controller
{
    public function __construct(
        private readonly ErpIntegrationService $erpService = new ErpIntegrationService(),
        private readonly TmsConnectorService $tmsService = new TmsConnectorService(),
        private readonly GpsFleetTrackingService $gpsService = new GpsFleetTrackingService(),
    ) {}

    // ─── ERP Integration ────────────────────────────────────────

    /**
     * Sync an ERP integration (inbound/outbound/bidirectional).
     */
    public function erpSync(ErpIntegration $integration): JsonResponse
    {
        $this->authorizeIntegration($integration);
        $result = $this->erpService->sync($integration);

        return response()->json(['data' => $result]);
    }

    /**
     * Test ERP connection.
     */
    public function erpTestConnection(ErpIntegration $integration): JsonResponse
    {
        $this->authorizeIntegration($integration);
        $result = $this->erpService->testConnection($integration);

        return response()->json(['data' => $result]);
    }

    /**
     * Process incoming ERP webhook.
     */
    public function erpWebhook(Request $request, ErpIntegration $integration): JsonResponse
    {
        $request->validate([
            'event' => 'required|string',
            'data' => 'required|array',
        ]);

        $result = $this->erpService->processWebhook(
            $integration,
            $request->input('event'),
            $request->input('data')
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Send outbound webhook to ERP.
     */
    public function erpSendWebhook(Request $request, ErpIntegration $integration): JsonResponse
    {
        $this->authorizeIntegration($integration);

        $request->validate([
            'event' => 'required|string',
            'data' => 'required|array',
        ]);

        $success = $this->erpService->sendWebhook(
            $integration,
            $request->input('event'),
            $request->input('data')
        );

        return response()->json([
            'sent' => $success,
            'message' => $success ? 'Webhook sent' : 'Webhook delivery failed',
        ]);
    }

    /**
     * Generate SAP IDoc for an order.
     */
    public function erpSapIdoc(\App\Models\TransportOrder $order): JsonResponse
    {
        $idoc = $this->erpService->generateSapIdoc($order);
        return response()->json(['data' => $idoc]);
    }

    /**
     * Generate Oracle TMS record for an order.
     */
    public function erpOracleRecord(\App\Models\TransportOrder $order): JsonResponse
    {
        $record = $this->erpService->generateOracleTmsRecord($order);
        return response()->json(['data' => $record]);
    }

    /**
     * Get sync health for all integrations.
     */
    public function erpSyncHealth(Request $request): JsonResponse
    {
        $health = $this->erpService->getSyncHealth($request->user()->company_id);
        return response()->json(['data' => $health]);
    }

    // ─── TMS Connectors ─────────────────────────────────────────

    /**
     * List supported TMS providers.
     */
    public function tmsProviders(): JsonResponse
    {
        return response()->json(['data' => $this->tmsService->getSupportedProviders()]);
    }

    /**
     * Publish a freight offer to an external TMS/exchange.
     */
    public function tmsPublishFreight(Request $request, ErpIntegration $integration): JsonResponse
    {
        $this->authorizeIntegration($integration);

        $request->validate(['freight_offer_id' => 'required|exists:freight_offers,id']);

        $freight = FreightOffer::findOrFail($request->input('freight_offer_id'));
        $result = $this->tmsService->publishFreight($integration, $freight);

        return response()->json(['data' => $result]);
    }

    /**
     * Fetch available loads from a TMS exchange.
     */
    public function tmsFetchLoads(Request $request, ErpIntegration $integration): JsonResponse
    {
        $this->authorizeIntegration($integration);

        $result = $this->tmsService->fetchAvailableLoads(
            $integration,
            $request->only(['origin_country', 'destination_country', 'vehicle_type', 'date_from', 'date_to', 'page', 'limit'])
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Import orders from a connected TMS.
     */
    public function tmsImportOrders(Request $request, ErpIntegration $integration): JsonResponse
    {
        $this->authorizeIntegration($integration);

        $result = $this->tmsService->importOrders($integration, $request->all());

        return response()->json(['data' => $result]);
    }

    /**
     * Push tracking update to a visibility platform.
     */
    public function tmsPushTracking(Request $request, ErpIntegration $integration): JsonResponse
    {
        $this->authorizeIntegration($integration);

        $request->validate([
            'shipment_reference' => 'required|string',
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $success = $this->tmsService->pushTrackingUpdate(
            $integration,
            $request->input('shipment_reference'),
            $request->input('lat'),
            $request->input('lng'),
            $request->only(['speed_kmh', 'heading', 'temperature'])
        );

        return response()->json(['sent' => $success]);
    }

    // ─── GPS Fleet Tracking ─────────────────────────────────────

    /**
     * List supported GPS providers.
     */
    public function gpsProviders(): JsonResponse
    {
        return response()->json(['data' => $this->gpsService->getSupportedProviders()]);
    }

    /**
     * Get fleet positions from a GPS provider.
     */
    public function gpsFleetPositions(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string',
            'config' => 'required|array',
        ]);

        $positions = $this->gpsService->getFleetPositions(
            $request->input('provider'),
            $request->input('config')
        );

        return response()->json(['data' => $positions]);
    }

    /**
     * Get position history for a vehicle.
     */
    public function gpsVehicleHistory(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string',
            'config' => 'required|array',
            'vehicle_id' => 'required|string',
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $history = $this->gpsService->getVehicleHistory(
            $request->input('provider'),
            $request->input('config'),
            $request->input('vehicle_id'),
            $request->input('from'),
            $request->input('to')
        );

        return response()->json(['data' => $history]);
    }

    /**
     * Get vehicle diagnostics.
     */
    public function gpsVehicleDiagnostics(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string',
            'config' => 'required|array',
            'vehicle_id' => 'required|string',
        ]);

        $diagnostics = $this->gpsService->getVehicleDiagnostics(
            $request->input('provider'),
            $request->input('config'),
            $request->input('vehicle_id')
        );

        return response()->json(['data' => $diagnostics]);
    }

    /**
     * Get driver HOS (Hours of Service) status.
     */
    public function gpsDriverHos(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string',
            'config' => 'required|array',
            'driver_id' => 'nullable|string',
        ]);

        $hos = $this->gpsService->getDriverHos(
            $request->input('provider'),
            $request->input('config'),
            $request->input('driver_id')
        );

        return response()->json(['data' => $hos]);
    }

    /**
     * Link a GPS device to a shipment.
     */
    public function gpsLinkShipment(Request $request, Shipment $shipment): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string',
            'device_id' => 'required|string',
            'config' => 'required|array',
        ]);

        $result = $this->gpsService->linkToShipment(
            $shipment,
            $request->input('provider'),
            $request->input('device_id'),
            $request->input('config')
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Sync all linked shipments from GPS.
     */
    public function gpsSyncShipments(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string',
            'config' => 'required|array',
        ]);

        $result = $this->gpsService->syncAllLinkedShipments(
            $request->input('provider'),
            $request->input('config')
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Get geofence alerts.
     */
    public function gpsGeofenceAlerts(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string',
            'config' => 'required|array',
        ]);

        $alerts = $this->gpsService->getGeofenceAlerts(
            $request->input('provider'),
            $request->input('config')
        );

        return response()->json(['data' => $alerts]);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    private function authorizeIntegration(ErpIntegration $integration): void
    {
        if ($integration->company_id !== request()->user()->company_id) {
            abort(403, 'Unauthorized access to this integration');
        }
    }
}
