<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrackingShare;
use App\Models\Shipment;
use App\Models\TrackingPosition;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TrackingShareController extends Controller
{
    /**
     * Create a tracking share link.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'shipment_id' => 'required|exists:shipments,id',
            'recipient_name' => 'nullable|string|max:255',
            'recipient_email' => 'nullable|email',
            'recipient_company' => 'nullable|string|max:255',
            'expires_at' => 'nullable|date|after:now',
            'permissions' => 'nullable|array',
        ]);

        // Verify the user has access to this shipment
        $shipment = Shipment::findOrFail($data['shipment_id']);
        $companyId = $request->user()->company_id;
        if ($shipment->shipper_company_id !== $companyId && $shipment->carrier_company_id !== $companyId) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data['created_by'] = $request->user()->id;
        $data['expires_at'] = $data['expires_at'] ?? now()->addDays(7);
        $data['permissions'] = $data['permissions'] ?? ['view_location', 'view_eta'];

        $share = TrackingShare::create($data);

        return response()->json([
            'message' => 'Tracking share link created.',
            'data' => [
                'id' => $share->id,
                'share_url' => url("/tracking/shared/{$share->share_token}"),
                'share_token' => $share->share_token,
                'expires_at' => $share->expires_at,
            ],
        ], 201);
    }

    /**
     * List share links for a shipment.
     */
    public function forShipment(Request $request, Shipment $shipment): JsonResponse
    {
        $companyId = $request->user()->company_id;
        if ($shipment->shipper_company_id !== $companyId && $shipment->carrier_company_id !== $companyId) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $shares = TrackingShare::where('shipment_id', $shipment->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $shares]);
    }

    /**
     * View shared tracking data (public, no auth required).
     */
    public function viewShared(string $token): JsonResponse
    {
        $share = TrackingShare::where('share_token', $token)->firstOrFail();

        if (!$share->isValid()) {
            return response()->json(['message' => 'This tracking link has expired or been revoked.'], 410);
        }

        $share->recordView();

        $shipment = $share->shipment()->with('events')->first();
        $permissions = $share->permissions ?? ['view_location', 'view_eta'];

        $data = [
            'shipment_reference' => $shipment->reference_number ?? $shipment->id,
            'status' => $shipment->status,
        ];

        // Location data
        if (in_array('view_location', $permissions)) {
            $latestPosition = TrackingPosition::where('shipment_id', $shipment->id)
                ->orderByDesc('recorded_at')
                ->first();

            $data['current_location'] = $latestPosition ? [
                'latitude' => $latestPosition->latitude,
                'longitude' => $latestPosition->longitude,
                'recorded_at' => $latestPosition->recorded_at,
                'speed_kmh' => $latestPosition->speed_kmh,
                'heading' => $latestPosition->heading,
            ] : null;
        }

        // ETA
        if (in_array('view_eta', $permissions)) {
            $data['estimated_arrival'] = $shipment->estimated_arrival;
        }

        // Events timeline
        if (in_array('view_events', $permissions)) {
            $data['events'] = $shipment->events->map(fn($e) => [
                'type' => $e->event_type,
                'description' => $e->description,
                'timestamp' => $e->created_at,
            ]);
        }

        // Route history
        if (in_array('view_route', $permissions)) {
            $positions = TrackingPosition::where('shipment_id', $shipment->id)
                ->orderBy('recorded_at')
                ->get(['latitude', 'longitude', 'recorded_at']);

            $data['route_history'] = $positions;
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Revoke a tracking share link.
     */
    public function revoke(Request $request, TrackingShare $share): JsonResponse
    {
        $shipment = $share->shipment;
        $companyId = $request->user()->company_id;
        if ($shipment->shipper_company_id !== $companyId && $shipment->carrier_company_id !== $companyId) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $share->revoke();

        return response()->json(['message' => 'Tracking share revoked.']);
    }
}
