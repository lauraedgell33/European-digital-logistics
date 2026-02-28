<?php

namespace App\Services;

use App\Models\PriceInsight;
use App\Models\TransportOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PriceInsightService
{
    /**
     * Generate monthly price insights from completed transport orders.
     * Run on the 1st of each month for the previous month.
     */
    public function generateMonthlyInsights(): int
    {
        $month = now()->subMonth();
        $startDate = $month->copy()->startOfMonth();
        $endDate = $month->copy()->endOfMonth();
        $periodDate = $startDate->toDateString();
        $count = 0;

        // Get all route + vehicle type combos from completed orders
        $routes = TransportOrder::where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->join('freight_offers', 'transport_orders.freight_offer_id', '=', 'freight_offers.id')
            ->select(
                'freight_offers.origin_country',
                'freight_offers.origin_city',
                'freight_offers.destination_country',
                'freight_offers.destination_city',
                'freight_offers.vehicle_type',
                DB::raw('COUNT(*) as sample_count'),
                DB::raw('AVG(transport_orders.final_price) as avg_price'),
                DB::raw('MIN(transport_orders.final_price) as min_price'),
                DB::raw('MAX(transport_orders.final_price) as max_price'),
                DB::raw('AVG(freight_offers.distance_km) as avg_distance'),
                DB::raw('AVG(CASE WHEN freight_offers.distance_km > 0 THEN transport_orders.final_price / freight_offers.distance_km ELSE NULL END) as avg_price_per_km')
            )
            ->groupBy(
                'freight_offers.origin_country',
                'freight_offers.origin_city',
                'freight_offers.destination_country',
                'freight_offers.destination_city',
                'freight_offers.vehicle_type'
            )
            ->having('sample_count', '>=', 3) // Min 3 samples for statistical relevance
            ->get();

        foreach ($routes as $route) {
            try {
                // Calculate median
                $prices = TransportOrder::where('status', 'completed')
                    ->whereBetween('completed_at', [$startDate, $endDate])
                    ->whereHas('freightOffer', function ($q) use ($route) {
                        $q->where('origin_country', $route->origin_country)
                            ->where('destination_country', $route->destination_country);
                        if ($route->vehicle_type) {
                            $q->where('vehicle_type', $route->vehicle_type);
                        }
                    })
                    ->pluck('final_price')
                    ->sort()
                    ->values();

                $median = $prices->count() > 0
                    ? $prices->get((int) floor($prices->count() / 2))
                    : $route->avg_price;

                PriceInsight::updateOrCreate(
                    [
                        'origin_country' => $route->origin_country,
                        'origin_city' => $route->origin_city,
                        'destination_country' => $route->destination_country,
                        'destination_city' => $route->destination_city,
                        'vehicle_type' => $route->vehicle_type,
                        'period_date' => $periodDate,
                        'period_type' => 'monthly',
                    ],
                    [
                        'sample_count' => $route->sample_count,
                        'avg_price' => round($route->avg_price, 2),
                        'min_price' => round($route->min_price, 2),
                        'max_price' => round($route->max_price, 2),
                        'median_price' => round($median, 2),
                        'avg_price_per_km' => round($route->avg_price_per_km ?? 0, 2),
                        'avg_distance_km' => round($route->avg_distance ?? 0, 0),
                    ]
                );
                $count++;
            } catch (\Exception $e) {
                Log::error("Price insight generation failed: " . $e->getMessage());
            }
        }

        Log::info("Generated {$count} price insights for {$periodDate}");
        return $count;
    }
}
