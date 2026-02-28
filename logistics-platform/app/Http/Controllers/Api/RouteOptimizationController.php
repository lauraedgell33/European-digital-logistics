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
            'constraints' => 'nullable|array',
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

    public function history(Request $request): JsonResponse
    {
        $optimizations = RouteOptimization::where('company_id', $request->user()->company_id)
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($optimizations);
    }

    public function show(RouteOptimization $optimization): JsonResponse
    {
        return response()->json(['data' => $optimization]);
    }
}
