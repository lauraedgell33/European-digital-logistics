<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    public function __construct(
        private readonly PricingService $pricingService
    ) {}

    /**
     * Calculate suggested price for a shipment.
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'distance_km' => 'required|integer|min:1',
            'weight_kg' => 'required|numeric|min:0',
            'vehicle_type' => 'required|string|max:50',
            'is_hazardous' => 'nullable|boolean',
            'temperature_controlled' => 'nullable|boolean',
            'loading_date' => 'nullable|date',
        ]);

        $pricing = $this->pricingService->calculateSuggestedPrice(
            $validated['distance_km'],
            $validated['weight_kg'],
            $validated['vehicle_type'],
            collect($validated)->only(['is_hazardous', 'temperature_controlled', 'loading_date'])->toArray()
        );

        return response()->json(['data' => $pricing]);
    }
}
