<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BarometerSnapshot;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\TransportOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class BarometerController extends Controller
{
    /**
     * Get current barometer overview — freight-to-vehicle ratio across Europe.
     */
    public function overview(Request $request): JsonResponse
    {
        $cacheKey = 'barometer_overview_' . now()->format('Y-m-d-H');

        $data = Cache::remember($cacheKey, 900, function () { // 15 min cache
            // Current active offers
            $freightCount = FreightOffer::where('status', 'active')->count();
            $vehicleCount = VehicleOffer::where('status', 'available')->count();
            $ratio = $vehicleCount > 0 ? round($freightCount / $vehicleCount, 4) : 0;

            // Top routes by freight volume
            $topRoutes = FreightOffer::where('status', 'active')
                ->select(
                    'origin_country',
                    'destination_country',
                    DB::raw('COUNT(*) as offer_count'),
                    DB::raw('AVG(price) as avg_price'),
                    DB::raw('AVG(distance_km) as avg_distance')
                )
                ->groupBy('origin_country', 'destination_country')
                ->orderByDesc('offer_count')
                ->limit(20)
                ->get();

            // Vehicle type distribution
            $vehicleTypes = FreightOffer::where('status', 'active')
                ->select('vehicle_type', DB::raw('COUNT(*) as count'))
                ->whereNotNull('vehicle_type')
                ->groupBy('vehicle_type')
                ->orderByDesc('count')
                ->get();

            // Country heatmap — freight offers by origin country
            $originHeatmap = FreightOffer::where('status', 'active')
                ->select('origin_country', DB::raw('COUNT(*) as count'))
                ->groupBy('origin_country')
                ->orderByDesc('count')
                ->get();

            $destHeatmap = FreightOffer::where('status', 'active')
                ->select('destination_country', DB::raw('COUNT(*) as count'))
                ->groupBy('destination_country')
                ->orderByDesc('count')
                ->get();

            // Average prices by vehicle type
            $pricesByType = TransportOrder::whereNotNull('total_price')
                ->where('total_price', '>', 0)
                ->where('status', 'completed')
                ->where('created_at', '>=', now()->subMonths(3))
                ->join('freight_offers', 'transport_orders.freight_offer_id', '=', 'freight_offers.id')
                ->select(
                    'freight_offers.vehicle_type',
                    DB::raw('AVG(transport_orders.total_price) as avg_price'),
                    DB::raw('MIN(transport_orders.total_price) as min_price'),
                    DB::raw('MAX(transport_orders.total_price) as max_price'),
                    DB::raw('COUNT(*) as sample_count')
                )
                ->groupBy('freight_offers.vehicle_type')
                ->get();

            return [
                'timestamp' => now()->toIso8601String(),
                'summary' => [
                    'active_freight_offers' => $freightCount,
                    'available_vehicles' => $vehicleCount,
                    'freight_to_vehicle_ratio' => $ratio,
                    'market_status' => $ratio > 1.5 ? 'high_demand' : ($ratio < 0.7 ? 'oversupply' : 'balanced'),
                ],
                'top_routes' => $topRoutes,
                'vehicle_type_distribution' => $vehicleTypes,
                'origin_heatmap' => $originHeatmap,
                'destination_heatmap' => $destHeatmap,
                'prices_by_vehicle_type' => $pricesByType,
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Get barometer data for a specific route (country-to-country).
     */
    public function route(Request $request): JsonResponse
    {
        $request->validate([
            'origin_country' => 'required|string|size:2',
            'destination_country' => 'required|string|size:2',
            'period' => 'nullable|in:daily,weekly,monthly',
            'days' => 'nullable|integer|min:7|max:365',
        ]);

        $origin = strtoupper($request->origin_country);
        $dest = strtoupper($request->destination_country);
        $days = $request->input('days', 90);
        $period = $request->input('period', 'daily');

        // Historical snapshots
        $snapshots = BarometerSnapshot::forRoute($origin, $dest)
            ->where('period', $period)
            ->dateRange(now()->subDays($days), now())
            ->orderBy('snapshot_date')
            ->get();

        // Current live data for this route
        $currentFreight = FreightOffer::where('status', 'active')
            ->where('origin_country', $origin)
            ->where('destination_country', $dest)
            ->count();

        $currentVehicles = VehicleOffer::where('status', 'available')
            ->where('current_country', $origin)
            ->where(function ($q) use ($dest) {
                $q->where('destination_country', $dest)->orWhereNull('destination_country');
            })
            ->count();

        // Recent completed orders on this route
        $recentPrices = TransportOrder::where('status', 'completed')
            ->where('pickup_country', $origin)
            ->where('delivery_country', $dest)
            ->where('completed_at', '>=', now()->subDays(30))
            ->whereNotNull('total_price')
            ->select(
                DB::raw('AVG(total_price) as avg_price'),
                DB::raw('MIN(total_price) as min_price'),
                DB::raw('MAX(total_price) as max_price'),
                DB::raw('COUNT(*) as count')
            )
            ->first();

        return response()->json([
            'data' => [
                'route' => ['origin' => $origin, 'destination' => $dest],
                'current' => [
                    'freight_offers' => $currentFreight,
                    'vehicle_offers' => $currentVehicles,
                    'ratio' => $currentVehicles > 0 ? round($currentFreight / $currentVehicles, 4) : 0,
                ],
                'recent_prices' => $recentPrices,
                'history' => $snapshots,
            ],
        ]);
    }

    /**
     * Get all country pairs with their current ratios.
     */
    public function heatmap(Request $request): JsonResponse
    {
        $cacheKey = 'barometer_heatmap_' . now()->format('Y-m-d-H');

        $data = Cache::remember($cacheKey, 900, function () {
            return FreightOffer::where('status', 'active')
                ->select(
                    'origin_country',
                    'destination_country',
                    DB::raw('COUNT(*) as freight_count'),
                    DB::raw('AVG(price) as avg_price'),
                    DB::raw('AVG(distance_km) as avg_distance')
                )
                ->groupBy('origin_country', 'destination_country')
                ->having('freight_count', '>=', 1)
                ->orderByDesc('freight_count')
                ->get();
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Get price trends over time for a route.
     */
    public function priceTrends(Request $request): JsonResponse
    {
        $request->validate([
            'origin_country' => 'required|string|size:2',
            'destination_country' => 'required|string|size:2',
            'vehicle_type' => 'nullable|string',
            'months' => 'nullable|integer|min:1|max:24',
        ]);

        $months = $request->input('months', 6);

        $query = TransportOrder::where('status', 'completed')
            ->where('pickup_country', strtoupper($request->origin_country))
            ->where('delivery_country', strtoupper($request->destination_country))
            ->whereNotNull('total_price')
            ->where('completed_at', '>=', now()->subMonths($months));

        $trends = $query->select(
                DB::raw('DATE_FORMAT(completed_at, "%Y-%m") as month'),
                DB::raw('AVG(total_price) as avg_price'),
                DB::raw('MIN(total_price) as min_price'),
                DB::raw('MAX(total_price) as max_price'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json(['data' => $trends]);
    }
}
