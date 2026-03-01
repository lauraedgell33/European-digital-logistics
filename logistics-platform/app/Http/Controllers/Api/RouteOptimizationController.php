<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RouteOptimizationService;
use App\Models\RouteOptimization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RouteOptimizationController extends Controller
{
    public function __construct(
        private readonly RouteOptimizationService $routeService
    ) {}

    public function optimize(Request $request): JsonResponse
    {
        $request->validate([
            'waypoints' => 'required|array|min:2',
            'waypoints.*.lat' => 'required|numeric',
            'waypoints.*.lng' => 'required|numeric',
            'waypoints.*.name' => 'nullable|string',
            'waypoints.*.country' => 'nullable|string|size:2',
            'constraints' => 'nullable|array',
            'constraints.max_driving_hours' => 'nullable|numeric|min:1',
            'constraints.avg_speed_kmh' => 'nullable|numeric|min:20|max:130',
            'constraints.weight_tons' => 'nullable|numeric|min:1',
            'constraints.avoid' => 'nullable|array',
        ]);

        $result = $this->routeService->optimize(
            $request->input('waypoints'),
            $request->input('constraints', []),
            $request->user()->company_id,
            $request->user()->id
        );

        return response()->json([
            'message' => 'Route optimized.',
            'data' => $result,
        ]);
    }

    /**
     * Fleet optimization — assign multiple stops among multiple vehicles (CVRP).
     */
    public function optimizeFleet(Request $request): JsonResponse
    {
        $request->validate([
            'vehicles' => 'required|array|min:1',
            'vehicles.*.id' => 'nullable|integer',
            'vehicles.*.lat' => 'required|numeric',
            'vehicles.*.lng' => 'required|numeric',
            'vehicles.*.capacity_kg' => 'nullable|numeric',
            'vehicles.*.max_stops' => 'nullable|integer|min:1',
            'stops' => 'required|array|min:1',
            'stops.*.id' => 'nullable|integer',
            'stops.*.lat' => 'required|numeric',
            'stops.*.lng' => 'required|numeric',
            'stops.*.weight_kg' => 'nullable|numeric',
            'constraints' => 'nullable|array',
        ]);

        $result = $this->routeService->optimizeFleet(
            $request->input('vehicles'),
            $request->input('stops'),
            $request->input('constraints', [])
        );

        return response()->json([
            'message' => count($result['routes']) . ' vehicle routes optimized.',
            'data' => $result,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $optimizations = RouteOptimization::where('company_id', $request->user()->company_id)
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($optimizations);
    }

    public function show(RouteOptimization $optimization): JsonResponse
    {
        return response()->json(['data' => $optimization]);
    }
}
