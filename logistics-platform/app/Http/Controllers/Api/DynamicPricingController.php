<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DynamicPricingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DynamicPricingController extends Controller
{
    public function __construct(
        private readonly DynamicPricingService $pricingService
    ) {}

    public function calculate(Request $request): JsonResponse
    {
        $request->validate([
            'origin_country' => 'required|string|size:2',
            'destination_country' => 'required|string|size:2',
            'vehicle_type' => 'nullable|string',
            'distance_km' => 'nullable|numeric|min:1',
            'weight_kg' => 'nullable|numeric|min:1',
        ]);

        $result = $this->pricingService->calculatePrice(
            $request->input('origin_country'),
            $request->input('destination_country'),
            $request->input('vehicle_type'),
            $request->input('distance_km'),
            $request->input('weight_kg')
        );

        return response()->json(['data' => $result]);
    }

    public function history(Request $request): JsonResponse
    {
        $request->validate([
            'origin' => 'required|string|size:2',
            'destination' => 'required|string|size:2',
            'days' => 'nullable|integer|min:1|max:90',
        ]);

        $result = $this->pricingService->getPriceHistory(
            $request->input('origin'),
            $request->input('destination'),
            $request->input('days', 30)
        );

        return response()->json(['data' => $result]);
    }

    public function activePrices(): JsonResponse
    {
        $prices = $this->pricingService->getActivePrices();
        return response()->json(['data' => $prices]);
    }
}
