<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceInsight;
use App\Models\TransportOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PriceInsightController extends Controller
{
    /**
     * Get price insights for a specific route.
     */
    public function route(Request $request): JsonResponse
    {
        $request->validate([
            'origin_country' => 'required|string|size:2',
            'destination_country' => 'required|string|size:2',
            'origin_city' => 'nullable|string',
            'destination_city' => 'nullable|string',
            'vehicle_type' => 'nullable|string',
            'months' => 'nullable|integer|min:1|max:24',
        ]);

        $months = $request->input('months', 6);

        // Query stored price insights
        $query = PriceInsight::forRoute(
            $request->origin_country,
            $request->destination_country,
            $request->origin_city,
            $request->destination_city
        );

        if ($request->vehicle_type) {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        $insights = $query->where('period_date', '>=', now()->subMonths($months))
            ->orderBy('period_date')
            ->get();

        // Also get live market rate from recent orders
        $liveData = $this->getLiveMarketData(
            $request->origin_country,
            $request->destination_country,
            $request->vehicle_type
        );

        return response()->json([
            'data' => [
                'route' => [
                    'origin' => [
                        'country' => $request->origin_country,
                        'city' => $request->origin_city,
                    ],
                    'destination' => [
                        'country' => $request->destination_country,
                        'city' => $request->destination_city,
                    ],
                ],
                'historical' => $insights,
                'current_market' => $liveData,
            ],
        ]);
    }

    /**
     * Get top routes with their pricing info.
     */
    public function topRoutes(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 20);

        $routes = Cache::remember('price_insights:top_routes', 3600, function () use ($limit) {
            return PriceInsight::where('period_type', 'monthly')
                ->where('period_date', '>=', now()->subMonths(3))
                ->select(
                    'origin_country',
                    'destination_country',
                    DB::raw('AVG(avg_price) as avg_price'),
                    DB::raw('AVG(avg_price_per_km) as avg_price_per_km'),
                    DB::raw('SUM(sample_count) as total_samples'),
                    DB::raw('AVG(avg_distance_km) as avg_distance')
                )
                ->groupBy('origin_country', 'destination_country')
                ->orderByDesc('total_samples')
                ->limit($limit)
                ->get();
        });

        return response()->json(['data' => $routes]);
    }

    /**
     * Price comparison — compare multiple routes.
     */
    public function compare(Request $request): JsonResponse
    {
        $request->validate([
            'routes' => 'required|array|min:2|max:10',
            'routes.*.origin_country' => 'required|string|size:2',
            'routes.*.destination_country' => 'required|string|size:2',
        ]);

        $results = [];
        foreach ($request->routes as $route) {
            $insight = PriceInsight::forRoute($route['origin_country'], $route['destination_country'])
                ->where('period_type', 'monthly')
                ->orderByDesc('period_date')
                ->first();

            $results[] = [
                'origin_country' => $route['origin_country'],
                'destination_country' => $route['destination_country'],
                'latest' => $insight,
            ];
        }

        return response()->json(['data' => $results]);
    }

    /**
     * Price heatmap — matrix of average prices between countries.
     */
    public function heatmap(): JsonResponse
    {
        $data = Cache::remember('price_insights:heatmap', 3600, function () {
            return PriceInsight::where('period_type', 'monthly')
                ->where('period_date', '>=', now()->subMonths(3))
                ->select(
                    'origin_country',
                    'destination_country',
                    DB::raw('AVG(avg_price_per_km) as avg_price_per_km'),
                    DB::raw('SUM(sample_count) as samples')
                )
                ->groupBy('origin_country', 'destination_country')
                ->get();
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Price estimate for a specific route query.
     */
    public function estimate(Request $request): JsonResponse
    {
        $request->validate([
            'origin_country' => 'required|string|size:2',
            'destination_country' => 'required|string|size:2',
            'distance_km' => 'required|numeric|min:1',
            'vehicle_type' => 'nullable|string',
            'weight_kg' => 'nullable|numeric',
        ]);

        // Get historical average per km for this route
        $insight = PriceInsight::forRoute($request->origin_country, $request->destination_country)
            ->where('period_type', 'monthly')
            ->orderByDesc('period_date')
            ->first();

        if (!$insight) {
            // Fallback to any-route average
            $avgPerKm = PriceInsight::where('period_type', 'monthly')
                ->where('period_date', '>=', now()->subMonths(3))
                ->avg('avg_price_per_km') ?? 1.5;
        } else {
            $avgPerKm = $insight->avg_price_per_km;
        }

        $estimatedPrice = round($request->distance_km * $avgPerKm, 2);

        return response()->json([
            'data' => [
                'estimated_price_eur' => $estimatedPrice,
                'price_per_km' => round($avgPerKm, 2),
                'distance_km' => $request->distance_km,
                'confidence' => $insight ? ($insight->sample_count > 50 ? 'high' : ($insight->sample_count > 10 ? 'medium' : 'low')) : 'very_low',
                'based_on_samples' => $insight->sample_count ?? 0,
                'price_range' => $insight ? [
                    'min' => round($request->distance_km * ($insight->min_price / max($insight->avg_distance_km, 1)), 2),
                    'max' => round($request->distance_km * ($insight->max_price / max($insight->avg_distance_km, 1)), 2),
                ] : null,
            ],
        ]);
    }

    private function getLiveMarketData(string $originCountry, string $destCountry, ?string $vehicleType = null): array
    {
        $query = TransportOrder::where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->whereHas('freightOffer', function ($q) use ($originCountry, $destCountry) {
                $q->where('origin_country', $originCountry)
                    ->where('destination_country', $destCountry);
            });

        $stats = $query->select(
            DB::raw('COUNT(*) as count'),
            DB::raw('AVG(final_price) as avg_price'),
            DB::raw('MIN(final_price) as min_price'),
            DB::raw('MAX(final_price) as max_price')
        )->first();

        return [
            'sample_count' => $stats->count ?? 0,
            'avg_price' => round($stats->avg_price ?? 0, 2),
            'min_price' => round($stats->min_price ?? 0, 2),
            'max_price' => round($stats->max_price ?? 0, 2),
            'period' => 'last_30_days',
        ];
    }
}
