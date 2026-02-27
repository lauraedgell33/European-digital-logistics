<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RoutePlanningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoutePlanningController extends Controller
{
    public function __construct(
        private readonly RoutePlanningService $routePlanningService
    ) {}

    /**
     * Calculate route between two points.
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'origin_country' => 'nullable|string|max:2',
            'origin_city' => 'required|string|max:100',
            'destination_country' => 'nullable|string|max:2',
            'destination_city' => 'required|string|max:100',
            'origin_lat' => 'nullable|numeric|between:-90,90',
            'origin_lng' => 'nullable|numeric|between:-180,180',
            'destination_lat' => 'nullable|numeric|between:-90,90',
            'destination_lng' => 'nullable|numeric|between:-180,180',
        ]);

        $route = $this->routePlanningService->calculateRoute(
            $validated['origin_country'] ?? '',
            $validated['origin_city'],
            $validated['destination_country'] ?? '',
            $validated['destination_city'],
            $validated['origin_lat'] ?? null,
            $validated['origin_lng'] ?? null,
            $validated['destination_lat'] ?? null,
            $validated['destination_lng'] ?? null
        );

        return response()->json(['data' => $route]);
    }
}
