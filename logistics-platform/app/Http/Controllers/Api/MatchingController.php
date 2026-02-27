<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Services\MatchingService;
use Illuminate\Http\JsonResponse;

class MatchingController extends Controller
{
    public function __construct(
        private readonly MatchingService $matchingService
    ) {}

    /**
     * Find matching vehicles for a freight offer.
     */
    public function matchFreight(FreightOffer $freight): JsonResponse
    {
        $this->authorize('view', $freight);

        $matches = $this->matchingService->findMatchingVehicles($freight);

        return response()->json([
            'data' => $matches,
            'meta' => [
                'freight_id' => $freight->id,
                'total_matches' => $matches->count(),
            ],
        ]);
    }

    /**
     * Find matching freight for a vehicle offer.
     */
    public function matchVehicle(VehicleOffer $vehicle): JsonResponse
    {
        $this->authorize('view', $vehicle);

        $matches = $this->matchingService->findMatchingFreight($vehicle);

        return response()->json([
            'data' => $matches,
            'meta' => [
                'vehicle_id' => $vehicle->id,
                'total_matches' => $matches->count(),
            ],
        ]);
    }
}
