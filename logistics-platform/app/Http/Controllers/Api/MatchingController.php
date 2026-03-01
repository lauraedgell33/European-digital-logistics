<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Services\CacheService;
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

        $cacheKey = CacheService::publicKey('matching:freight', ['id' => $freight->id, 'updated' => $freight->updated_at->timestamp]);

        $matches = CacheService::remember($cacheKey, 300, function () use ($freight) {
            return $this->matchingService->findMatchingVehicles($freight);
        }, ['matching']);

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

        $cacheKey = CacheService::publicKey('matching:vehicle', ['id' => $vehicle->id, 'updated' => $vehicle->updated_at->timestamp]);

        $matches = CacheService::remember($cacheKey, 300, function () use ($vehicle) {
            return $this->matchingService->findMatchingFreight($vehicle);
        }, ['matching']);

        return response()->json([
            'data' => $matches,
            'meta' => [
                'vehicle_id' => $vehicle->id,
                'total_matches' => $matches->count(),
            ],
        ]);
    }
}
