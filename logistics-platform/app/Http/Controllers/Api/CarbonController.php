<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarbonFootprint;
use App\Models\TransportOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CarbonController extends Controller
{
    /**
     * Calculate CO₂ for a transport (without saving).
     */
    public function calculate(Request $request): JsonResponse
    {
        $request->validate([
            'distance_km' => 'required|numeric|min:1',
            'vehicle_type' => 'required|string',
            'fuel_type' => 'nullable|string',
            'weight_kg' => 'nullable|numeric|min:0',
            'load_factor_pct' => 'nullable|numeric|between:0,100',
            'emission_standard' => 'nullable|string',
        ]);

        $result = CarbonFootprint::calculate(
            $request->distance_km,
            $request->vehicle_type,
            $request->input('fuel_type', 'diesel'),
            $request->weight_kg,
            $request->load_factor_pct,
            $request->emission_standard
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Get CO₂ footprint for a specific transport order.
     */
    public function forOrder(TransportOrder $order): JsonResponse
    {
        $footprint = CarbonFootprint::where('transport_order_id', $order->id)->first();

        if (!$footprint) {
            return response()->json(['message' => 'No carbon footprint calculated for this order.'], 404);
        }

        return response()->json(['data' => $footprint]);
    }

    /**
     * Calculate and save CO₂ for a transport order.
     */
    public function calculateForOrder(Request $request, TransportOrder $order): JsonResponse
    {
        $request->validate([
            'vehicle_type' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'emission_standard' => 'nullable|string',
            'load_factor_pct' => 'nullable|numeric|between:0,100',
        ]);

        // Auto-detect params from order
        $distance = $order->freightOffer?->distance_km ?? 500;
        $weight = $order->weight ?? $order->freightOffer?->weight;
        $vehicleType = $request->input('vehicle_type', $order->freightOffer?->vehicle_type ?? 'standard_truck');

        $result = CarbonFootprint::calculate(
            $distance,
            $vehicleType,
            $request->input('fuel_type', 'diesel'),
            $weight,
            $request->load_factor_pct,
            $request->emission_standard
        );

        $footprint = CarbonFootprint::updateOrCreate(
            ['transport_order_id' => $order->id],
            [
                'company_id' => $request->user()->company_id,
                'co2_kg' => $result['co2_kg'],
                'co2_per_km' => $result['co2_per_km'],
                'co2_per_ton_km' => $result['co2_per_ton_km'],
                'distance_km' => $result['distance_km'],
                'weight_kg' => $weight,
                'vehicle_type' => $vehicleType,
                'fuel_type' => $result['fuel_type'],
                'emission_standard' => $request->emission_standard,
                'load_factor_pct' => $request->load_factor_pct,
                'industry_avg_co2_kg' => $result['industry_avg_co2_kg'],
                'savings_vs_avg_pct' => $result['savings_vs_avg_pct'],
            ]
        );

        return response()->json([
            'message' => 'Carbon footprint calculated.',
            'data' => $footprint,
        ]);
    }

    /**
     * Company sustainability dashboard — aggregated CO₂ data.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $months = $request->input('months', 12);

        // Total emissions
        $totals = CarbonFootprint::where('company_id', $companyId)
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                DB::raw('SUM(co2_kg) as total_co2_kg'),
                DB::raw('AVG(co2_per_km) as avg_co2_per_km'),
                DB::raw('AVG(savings_vs_avg_pct) as avg_savings_pct'),
                DB::raw('SUM(offset_purchased_kg) as total_offset_kg'),
                DB::raw('SUM(offset_cost) as total_offset_cost'),
                DB::raw('COUNT(*) as transport_count'),
                DB::raw('SUM(distance_km) as total_distance_km')
            )
            ->first();

        // Monthly trend
        $monthly = CarbonFootprint::where('company_id', $companyId)
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(co2_kg) as co2_kg'),
                DB::raw('COUNT(*) as count'),
                DB::raw('AVG(co2_per_km) as avg_co2_per_km')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // By vehicle type
        $byVehicleType = CarbonFootprint::where('company_id', $companyId)
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                'vehicle_type',
                DB::raw('SUM(co2_kg) as co2_kg'),
                DB::raw('COUNT(*) as count'),
                DB::raw('AVG(co2_per_km) as avg_co2_per_km')
            )
            ->groupBy('vehicle_type')
            ->orderByDesc('co2_kg')
            ->get();

        // By fuel type
        $byFuelType = CarbonFootprint::where('company_id', $companyId)
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                'fuel_type',
                DB::raw('SUM(co2_kg) as co2_kg'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('fuel_type')
            ->orderByDesc('co2_kg')
            ->get();

        // Sustainability score (0-100)
        $score = $this->calculateSustainabilityScore($totals);

        return response()->json([
            'data' => [
                'totals' => $totals,
                'sustainability_score' => $score,
                'monthly_trend' => $monthly,
                'by_vehicle_type' => $byVehicleType,
                'by_fuel_type' => $byFuelType,
                'carbon_neutral_pct' => $totals->transport_count > 0
                    ? CarbonFootprint::where('company_id', $companyId)->where('is_carbon_neutral', true)->count() / $totals->transport_count * 100
                    : 0,
            ],
        ]);
    }

    /**
     * Purchase carbon offset for a transport.
     */
    public function purchaseOffset(Request $request, CarbonFootprint $footprint): JsonResponse
    {
        if ($footprint->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $offsetKg = $footprint->co2_kg - $footprint->offset_purchased_kg;
        if ($offsetKg <= 0) {
            return response()->json(['message' => 'Already fully offset.'], 422);
        }

        $costPerTon = 25.0; // €25/ton CO₂
        $cost = round(($offsetKg / 1000) * $costPerTon, 2);

        $footprint->update([
            'offset_purchased_kg' => $footprint->co2_kg,
            'offset_cost' => $footprint->offset_cost + $cost,
            'is_carbon_neutral' => true,
        ]);

        return response()->json([
            'message' => 'Carbon offset purchased.',
            'data' => [
                'offset_kg' => $offsetKg,
                'cost_eur' => $cost,
                'is_carbon_neutral' => true,
            ],
        ]);
    }

    /**
     * Get emission factors reference data.
     */
    public function emissionFactors(): JsonResponse
    {
        $vehicleTypes = ['van', 'box_truck', 'standard_truck', 'curtainsider', 'mega_trailer', 'refrigerated', 'tanker', 'flatbed', 'container'];
        $fuelTypes = ['diesel', 'lng', 'cng', 'hvo', 'electric', 'hybrid', 'hydrogen'];

        $factors = [];
        foreach ($vehicleTypes as $vt) {
            foreach ($fuelTypes as $ft) {
                $factors[] = [
                    'vehicle_type' => $vt,
                    'fuel_type' => $ft,
                    'emission_factor_kg_per_km' => CarbonFootprint::getEmissionFactor($vt, $ft),
                ];
            }
        }

        return response()->json(['data' => $factors]);
    }

    private function calculateSustainabilityScore($totals): int
    {
        $score = 50; // base

        // Bonus for being below industry average
        if ($totals->avg_savings_pct > 0) {
            $score += min(25, $totals->avg_savings_pct / 2);
        }

        // Bonus for carbon offsets
        if ($totals->total_co2_kg > 0 && $totals->total_offset_kg > 0) {
            $offsetPct = ($totals->total_offset_kg / $totals->total_co2_kg) * 100;
            $score += min(25, $offsetPct / 4);
        }

        return min(100, max(0, (int) $score));
    }
}
