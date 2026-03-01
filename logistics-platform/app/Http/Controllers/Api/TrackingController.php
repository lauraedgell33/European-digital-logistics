<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tracking\UpdatePositionRequest;
use App\Http\Requests\Tracking\AddShipmentEventRequest;
use App\Http\Requests\Tracking\DeviceWebhookRequest;
use App\Http\Resources\ShipmentResource;
use App\Http\Resources\ShipmentEventResource;
use App\Http\Resources\TrackingPositionResource;
use App\Models\Shipment;
use App\Models\TransportOrder;
use App\Services\TrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function __construct(
        protected TrackingService $trackingService
    ) {}

    /**
     * Get shipment tracking info by tracking code.
     */
    public function track(string $trackingCode): JsonResponse
    {
        $shipment = Shipment::where('tracking_code', $trackingCode)
            ->with([
                'transportOrder:id,order_number,pickup_city,pickup_country,delivery_city,delivery_country,status',
                'events',
            ])
            ->firstOrFail();

        return (new ShipmentResource($shipment))->response();
    }

    /**
     * Get active shipments for the authenticated company.
     */
    public function activeShipments(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $shipments = Shipment::whereHas('transportOrder', function ($q) use ($companyId) {
                $q->where('shipper_id', $companyId)
                    ->orWhere('carrier_id', $companyId);
            })
            ->whereNotIn('status', ['delivered'])
            ->with('transportOrder:id,order_number,pickup_city,delivery_city,shipper_id,carrier_id')
            ->orderBy('last_update', 'desc')
            ->paginate($request->input('per_page', 25));

        return ShipmentResource::collection($shipments)->response();
    }

    /**
     * Update shipment position (from tracking device or driver app).
     */
    public function updatePosition(UpdatePositionRequest $request, Shipment $shipment): JsonResponse
    {
        $validated = $request->validated();

        $this->trackingService->updatePosition(
            $shipment,
            $validated['lat'],
            $validated['lng'],
            $validated
        );

        return (new ShipmentResource($shipment->fresh()))
            ->additional(['message' => 'Position updated.'])
            ->response();
    }

    /**
     * Get shipment history (all positions).
     */
    public function history(Request $request, Shipment $shipment): JsonResponse
    {
        $this->authorize('view', $shipment);

        $positions = $shipment->positions()
            ->orderBy('recorded_at', 'asc')
            ->paginate($request->input('per_page', 100));

        return TrackingPositionResource::collection($positions)->response();
    }

    /**
     * Get shipment events timeline.
     */
    public function events(Request $request, Shipment $shipment): JsonResponse
    {
        $this->authorize('view', $shipment);

        $events = $shipment->events()
            ->orderBy('occurred_at', 'desc')
            ->paginate($request->input('per_page', 50));

        return ShipmentEventResource::collection($events)->response();
    }

    /**
     * Add a manual event to the shipment.
     */
    public function addEvent(AddShipmentEventRequest $request, Shipment $shipment): JsonResponse
    {
        $validated = $request->validated();

        $event = $shipment->addEvent(
            $validated['event_type'],
            $validated['description'] ?? null,
            $validated['metadata'] ?? []
        );

        return (new ShipmentEventResource($event))
            ->additional(['message' => 'Event added.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Get ETA for a shipment.
     */
    public function eta(Request $request, Shipment $shipment): JsonResponse
    {
        $this->authorize('view', $shipment);

        $eta = $this->trackingService->calculateEta($shipment);

        return response()->json([
            'data' => [
                'eta' => $eta,
                'remaining_distance_km' => $shipment->remaining_distance_km,
                'current_location' => $shipment->current_location_name,
            ],
        ]);
    }

    /**
     * Webhook endpoint for external tracking devices.
     */
    public function deviceWebhook(DeviceWebhookRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $shipment = Shipment::where('tracking_device_id', $validated['device_id'])->first();

        if (!$shipment) {
            return response()->json(['message' => 'Device not linked to any shipment.'], 404);
        }

        $this->trackingService->updatePosition($shipment, $validated['lat'], $validated['lng'], [
            'speed_kmh' => $validated['speed'] ?? null,
            'heading' => $validated['heading'] ?? null,
            'temperature' => $validated['temperature'] ?? null,
            'battery_level' => $validated['battery'] ?? null,
        ]);

        return response()->json(['message' => 'Position recorded.']);
    }
}
