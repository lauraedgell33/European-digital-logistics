<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PredictiveAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PredictiveAnalyticsController extends Controller
{
    public function __construct(
        private readonly PredictiveAnalyticsService $analyticsService
    ) {}

    public function demandForecast(Request $request): JsonResponse
    {
        $request->validate([
            'origin' => 'required|string|size:2',
            'destination' => 'required|string|size:2',
            'days' => 'nullable|integer|min:1|max:90',
        ]);

        $result = $this->analyticsService->predictDemand(
            $request->input('origin'),
            $request->input('destination'),
            $request->input('days', 30)
        );

        return response()->json(['data' => $result]);
    }

    public function priceForecast(Request $request): JsonResponse
    {
        $request->validate([
            'origin' => 'required|string|size:2',
            'destination' => 'required|string|size:2',
            'days' => 'nullable|integer|min:1|max:30',
        ]);

        $result = $this->analyticsService->predictPricing(
            $request->input('origin'),
            $request->input('destination'),
            $request->input('days', 14)
        );

        return response()->json(['data' => $result]);
    }

    public function capacityForecast(Request $request): JsonResponse
    {
        $request->validate([
            'origin' => 'required|string|size:2',
            'destination' => 'required|string|size:2',
        ]);

        $result = $this->analyticsService->predictCapacity(
            $request->input('origin'),
            $request->input('destination')
        );

        return response()->json(['data' => $result]);
    }

    public function marketAnalytics(): JsonResponse
    {
        $result = $this->analyticsService->getMarketAnalytics();
        return response()->json(['data' => $result]);
    }
}
