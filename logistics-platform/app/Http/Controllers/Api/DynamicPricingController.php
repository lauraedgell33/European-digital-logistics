<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PricingRule;
use App\Services\DynamicPricingService;
use App\Services\AutomatedPricingEngine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DynamicPricingController extends Controller
{
    public function __construct(
        private readonly DynamicPricingService $pricingService,
        private readonly AutomatedPricingEngine $engine = new AutomatedPricingEngine(),
    ) {}

    // ─── Legacy Dynamic Pricing ─────────────────────────────────

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
            'days' => 'nullable|integer|min:1|max:180',
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

    // ─── Automated Pricing Engine (v2) ──────────────────────────

    /**
     * Calculate price using the automated engine (historical + rules + ML-like).
     */
    public function engineCalculate(Request $request): JsonResponse
    {
        $request->validate([
            'origin_country'         => 'required|string|size:2',
            'destination_country'    => 'required|string|size:2',
            'vehicle_type'           => 'nullable|string',
            'distance_km'            => 'nullable|numeric|min:1',
            'weight_kg'              => 'nullable|numeric|min:1',
            'cargo_type'             => 'nullable|string',
            'loading_date'           => 'nullable|date',
            'is_hazardous'           => 'nullable|boolean',
            'temperature_controlled' => 'nullable|boolean',
        ]);

        $result = $this->engine->calculatePrice($request->all());

        return response()->json(['data' => $result]);
    }

    /**
     * Analyze historical pricing for a route.
     */
    public function engineAnalysis(Request $request): JsonResponse
    {
        $request->validate([
            'origin'       => 'required|string|size:2',
            'destination'  => 'required|string|size:2',
            'vehicle_type' => 'nullable|string',
            'period_days'  => 'nullable|integer|min:7|max:365',
        ]);

        $analysis = $this->engine->analyzeHistoricalPricing(
            $request->input('origin'),
            $request->input('destination'),
            $request->input('vehicle_type'),
            $request->input('period_days', 90)
        );

        return response()->json(['data' => $analysis]);
    }

    /**
     * Get active price alerts (deviations from market).
     */
    public function engineAlerts(Request $request): JsonResponse
    {
        $threshold = $request->input('threshold_pct', 15.0);
        $alerts = $this->engine->getPriceAlerts((float) $threshold);

        return response()->json([
            'data' => $alerts,
            'total' => count($alerts),
            'threshold_pct' => $threshold,
        ]);
    }

    /**
     * Forecast future prices for a route.
     */
    public function engineForecast(Request $request): JsonResponse
    {
        $request->validate([
            'origin'        => 'required|string|size:2',
            'destination'   => 'required|string|size:2',
            'vehicle_type'  => 'nullable|string',
            'forecast_days' => 'nullable|integer|min:7|max:180',
        ]);

        $forecast = $this->engine->forecastPrice(
            $request->input('origin'),
            $request->input('destination'),
            $request->input('vehicle_type'),
            $request->input('forecast_days', 30)
        );

        return response()->json(['data' => $forecast]);
    }

    /**
     * Get route profitability rankings.
     */
    public function engineProfitability(Request $request): JsonResponse
    {
        $topN = $request->input('top', 20);
        $routes = $this->engine->getRouteProfitability((int) $topN);

        return response()->json([
            'data' => $routes,
            'total' => count($routes),
        ]);
    }

    // ─── Pricing Rules CRUD ─────────────────────────────────────

    /**
     * List pricing rules.
     */
    public function rulesList(Request $request): JsonResponse
    {
        $rules = $this->engine->listRules($request->only([
            'active_only', 'rule_type', 'origin_country',
        ]));

        return response()->json(['data' => $rules]);
    }

    /**
     * Create a pricing rule.
     */
    public function rulesCreate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                => 'required|string|max:255',
            'rule_type'           => 'required|string|in:base_rate,surcharge,multiplier,discount,minimum,maximum,fuel_surcharge,seasonal',
            'origin_country'      => 'nullable|string|size:2',
            'destination_country' => 'nullable|string|size:2',
            'vehicle_type'        => 'nullable|string',
            'cargo_type'          => 'nullable|string',
            'value'               => 'required|numeric',
            'value_type'          => 'nullable|string|in:fixed,percentage',
            'conditions'          => 'nullable|array',
            'priority'            => 'nullable|integer|min:0|max:999',
            'is_active'           => 'nullable|boolean',
            'valid_from'          => 'nullable|date',
            'valid_until'         => 'nullable|date|after_or_equal:valid_from',
        ]);

        $rule = $this->engine->createRule($data);

        return response()->json(['data' => $rule], 201);
    }

    /**
     * Update a pricing rule.
     */
    public function rulesUpdate(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'name'                => 'sometimes|string|max:255',
            'rule_type'           => 'sometimes|string|in:base_rate,surcharge,multiplier,discount,minimum,maximum,fuel_surcharge,seasonal',
            'origin_country'      => 'nullable|string|size:2',
            'destination_country' => 'nullable|string|size:2',
            'vehicle_type'        => 'nullable|string',
            'cargo_type'          => 'nullable|string',
            'value'               => 'sometimes|numeric',
            'value_type'          => 'nullable|string|in:fixed,percentage',
            'conditions'          => 'nullable|array',
            'priority'            => 'nullable|integer|min:0|max:999',
            'is_active'           => 'nullable|boolean',
            'valid_from'          => 'nullable|date',
            'valid_until'         => 'nullable|date|after_or_equal:valid_from',
        ]);

        $rule = $this->engine->updateRule($id, $data);

        return response()->json(['data' => $rule]);
    }

    /**
     * Delete a pricing rule.
     */
    public function rulesDelete(int $id): JsonResponse
    {
        $this->engine->deleteRule($id);
        return response()->json(['message' => 'Pricing rule deleted']);
    }
}
