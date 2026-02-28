<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\TransportOrder;
use App\Models\TrackingPosition;
use App\Models\TrackingShare;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerPortalController extends Controller
{
    /**
     * Track a shipment by tracking code (public, no auth).
     */
    public function trackByNumber(Request $request): JsonResponse
    {
        $request->validate(['tracking_number' => 'required|string']);

        $shipment = Shipment::where('tracking_code', $request->input('tracking_number'))
            ->with(['transportOrder:id,status,pickup_city,pickup_country,delivery_city,delivery_country,pickup_date,delivery_date,delivered_at',
                    'events' => fn($q) => $q->orderByDesc('occurred_at')->limit(20)])
            ->first();

        if (!$shipment) {
            return response()->json(['message' => 'Shipment not found.'], 404);
        }

        $positions = TrackingPosition::where('shipment_id', $shipment->id)
            ->orderByDesc('recorded_at')
            ->limit(50)
            ->get(['lat', 'lng', 'speed_kmh', 'recorded_at']);

        return response()->json([
            'data' => [
                'tracking_number' => $shipment->tracking_code,
                'status' => $shipment->status,
                'origin' => [
                    'city' => $shipment->transportOrder->pickup_city ?? null,
                    'country' => $shipment->transportOrder->pickup_country ?? null,
                ],
                'destination' => [
                    'city' => $shipment->transportOrder->delivery_city ?? null,
                    'country' => $shipment->transportOrder->delivery_country ?? null,
                ],
                'estimated_delivery' => $shipment->eta,
                'actual_delivery' => $shipment->transportOrder->delivered_at ?? null,
                'last_position' => $positions->first(),
                'positions' => $positions,
                'events' => $shipment->events->map(fn($e) => [
                    'type' => $e->event_type,
                    'description' => $e->description,
                    'location' => $e->location_name,
                    'timestamp' => $e->occurred_at?->toIso8601String(),
                ]),
                'progress' => $this->calculateProgress($shipment),
            ],
        ]);
    }

    /**
     * Track via shared link token.
     */
    public function trackByToken(string $token): JsonResponse
    {
        $share = TrackingShare::where('share_token', $token)
            ->where('is_active', true)
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->with('shipment.transportOrder', 'shipment.events')
            ->first();

        if (!$share) {
            return response()->json(['message' => 'Invalid or expired tracking link.'], 404);
        }

        $share->recordView();

        $positions = TrackingPosition::where('shipment_id', $share->shipment_id)
            ->orderByDesc('recorded_at')
            ->limit(50)
            ->get(['lat', 'lng', 'speed_kmh', 'recorded_at']);

        $shipment = $share->shipment;

        return response()->json([
            'data' => [
                'tracking_number' => $shipment->tracking_code,
                'status' => $shipment->status,
                'origin' => [
                    'city' => $shipment->transportOrder->pickup_city ?? null,
                    'country' => $shipment->transportOrder->pickup_country ?? null,
                ],
                'destination' => [
                    'city' => $shipment->transportOrder->delivery_city ?? null,
                    'country' => $shipment->transportOrder->delivery_country ?? null,
                ],
                'estimated_delivery' => $shipment->eta,
                'actual_delivery' => $shipment->transportOrder->delivered_at ?? null,
                'last_position' => $positions->first(),
                'positions' => $positions,
                'events' => $shipment->events->map(fn($e) => [
                    'type' => $e->event_type,
                    'description' => $e->description,
                    'location' => $e->location_name,
                    'timestamp' => $e->occurred_at?->toIso8601String(),
                ]),
                'progress' => $this->calculateProgress($shipment),
                'permissions' => $share->permissions ?? ['view'],
            ],
        ]);
    }

    /**
     * Get delivery proof (POD) for a shipment.
     */
    public function getProofOfDelivery(string $trackingNumber): JsonResponse
    {
        $shipment = Shipment::where('tracking_code', $trackingNumber)
            ->where('status', 'delivered')
            ->with('transportOrder:id,delivered_at')
            ->first();

        if (!$shipment) {
            return response()->json(['message' => 'No delivery proof available.'], 404);
        }

        // POD data stored in the latest 'delivered' event's metadata
        $deliveryEvent = $shipment->events()
            ->where('event_type', 'delivered')
            ->latest('occurred_at')
            ->first();

        $meta = $deliveryEvent->metadata ?? [];

        return response()->json([
            'data' => [
                'tracking_number' => $shipment->tracking_code,
                'delivered_at' => $shipment->transportOrder->delivered_at,
                'signed_by' => $meta['signed_by'] ?? null,
                'signature_url' => $meta['signature_url'] ?? null,
                'photos' => $meta['delivery_photos'] ?? [],
                'notes' => $meta['delivery_notes'] ?? null,
            ],
        ]);
    }

    /**
     * Submit a delivery rating/feedback.
     */
    public function submitFeedback(Request $request): JsonResponse
    {
        $request->validate([
            'tracking_number' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'categories' => 'nullable|array',
        ]);

        $shipment = Shipment::where('tracking_code', $request->input('tracking_number'))->first();
        if (!$shipment) {
            return response()->json(['message' => 'Shipment not found.'], 404);
        }

        // Store feedback as a shipment event
        $shipment->addEvent('customer_feedback', $request->input('comment'), [
            'rating' => $request->input('rating'),
            'categories' => $request->input('categories', []),
            'submitted_at' => now()->toIso8601String(),
        ]);

        return response()->json(['message' => 'Thank you for your feedback!']);
    }

    private function calculateProgress(Shipment $shipment): array
    {
        $steps = [
            ['key' => 'booked', 'label' => 'Order Placed', 'completed' => true],
            ['key' => 'picked_up', 'label' => 'Picked Up', 'completed' => in_array($shipment->status, ['in_transit', 'delivered', 'picked_up'])],
            ['key' => 'in_transit', 'label' => 'In Transit', 'completed' => in_array($shipment->status, ['in_transit', 'delivered'])],
            ['key' => 'delivered', 'label' => 'Delivered', 'completed' => $shipment->status === 'delivered'],
        ];

        return [
            'current_step' => collect($steps)->filter(fn($s) => $s['completed'])->count() - 1,
            'total_steps' => count($steps),
            'steps' => $steps,
        ];
    }
}
