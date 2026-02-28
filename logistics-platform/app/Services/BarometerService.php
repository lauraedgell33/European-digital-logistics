<?php

namespace App\Services;

use App\Models\BarometerSnapshot;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\TransportOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BarometerService
{
    /**
     * Generate daily barometer snapshots for all active routes.
     * Intended to be called by a scheduled command (daily).
     */
    public function generateDailySnapshots(): int
    {
        $date = now()->toDateString();
        $count = 0;

        // Get all active origin-destination country pairs
        $routes = FreightOffer::where('status', 'active')
            ->select('origin_country', 'destination_country')
            ->groupBy('origin_country', 'destination_country')
            ->get();

        foreach ($routes as $route) {
            try {
                $this->createSnapshot(
                    $route->origin_country,
                    $route->destination_country,
                    $date,
                    'daily'
                );
                $count++;
            } catch (\Exception $e) {
                Log::error("Barometer snapshot failed for {$route->origin_country}->{$route->destination_country}: " . $e->getMessage());
            }
        }

        Log::info("Generated {$count} barometer snapshots for {$date}");
        return $count;
    }

    /**
     * Generate weekly summaries (run on Mondays).
     */
    public function generateWeeklySnapshots(): int
    {
        $date = now()->startOfWeek()->toDateString();
        $count = 0;

        $routes = BarometerSnapshot::where('period_type', 'daily')
            ->where('snapshot_date', '>=', now()->subDays(7))
            ->select('origin_country', 'destination_country')
            ->groupBy('origin_country', 'destination_country')
            ->get();

        foreach ($routes as $route) {
            $dailies = BarometerSnapshot::forRoute($route->origin_country, $route->destination_country)
                ->daily()
                ->where('snapshot_date', '>=', now()->subDays(7))
                ->get();

            if ($dailies->isEmpty()) continue;

            BarometerSnapshot::updateOrCreate(
                [
                    'origin_country' => $route->origin_country,
                    'destination_country' => $route->destination_country,
                    'snapshot_date' => $date,
                    'period_type' => 'weekly',
                ],
                [
                    'freight_offer_count' => (int) $dailies->avg('freight_offer_count'),
                    'vehicle_offer_count' => (int) $dailies->avg('vehicle_offer_count'),
                    'supply_demand_ratio' => round($dailies->avg('supply_demand_ratio'), 2),
                    'avg_price_per_km' => round($dailies->avg('avg_price_per_km'), 2),
                    'min_price_per_km' => round($dailies->min('min_price_per_km'), 2),
                    'max_price_per_km' => round($dailies->max('max_price_per_km'), 2),
                    'median_price_per_km' => round($dailies->avg('median_price_per_km'), 2),
                    'total_volume' => (int) $dailies->sum('total_volume'),
                    'avg_distance_km' => round($dailies->avg('avg_distance_km'), 0),
                ]
            );
            $count++;
        }

        return $count;
    }

    /**
     * Create a single snapshot for a route on a date.
     */
    public function createSnapshot(string $originCountry, string $destCountry, string $date, string $periodType = 'daily'): BarometerSnapshot
    {
        // Count active freight offers for this route
        $freightStats = FreightOffer::where('status', 'active')
            ->where('origin_country', $originCountry)
            ->where('destination_country', $destCountry)
            ->select(
                DB::raw('COUNT(*) as count'),
                DB::raw('AVG(CASE WHEN distance_km > 0 THEN price / distance_km ELSE NULL END) as avg_price_km'),
                DB::raw('MIN(CASE WHEN distance_km > 0 THEN price / distance_km ELSE NULL END) as min_price_km'),
                DB::raw('MAX(CASE WHEN distance_km > 0 THEN price / distance_km ELSE NULL END) as max_price_km'),
                DB::raw('SUM(weight) as total_volume'),
                DB::raw('AVG(distance_km) as avg_distance')
            )
            ->first();

        // Count active vehicle offers for this route
        $vehicleCount = VehicleOffer::where('status', 'active')
            ->where('origin_country', $originCountry)
            ->where('destination_country', $destCountry)
            ->count();

        // Vehicle type breakdown
        $vehicleTypes = VehicleOffer::where('status', 'active')
            ->where('origin_country', $originCountry)
            ->where('destination_country', $destCountry)
            ->select('vehicle_type', DB::raw('COUNT(*) as count'))
            ->groupBy('vehicle_type')
            ->pluck('count', 'vehicle_type')
            ->toArray();

        // Cargo type breakdown
        $cargoTypes = FreightOffer::where('status', 'active')
            ->where('origin_country', $originCountry)
            ->where('destination_country', $destCountry)
            ->whereNotNull('cargo_type')
            ->select('cargo_type', DB::raw('COUNT(*) as count'))
            ->groupBy('cargo_type')
            ->pluck('count', 'cargo_type')
            ->toArray();

        $ratio = $vehicleCount > 0
            ? round($freightStats->count / $vehicleCount, 2)
            : ($freightStats->count > 0 ? 999.0 : 0.0);

        return BarometerSnapshot::updateOrCreate(
            [
                'origin_country' => $originCountry,
                'destination_country' => $destCountry,
                'snapshot_date' => $date,
                'period_type' => $periodType,
            ],
            [
                'freight_offer_count' => $freightStats->count,
                'vehicle_offer_count' => $vehicleCount,
                'supply_demand_ratio' => $ratio,
                'avg_price_per_km' => round($freightStats->avg_price_km ?? 0, 2),
                'min_price_per_km' => round($freightStats->min_price_km ?? 0, 2),
                'max_price_per_km' => round($freightStats->max_price_km ?? 0, 2),
                'total_volume' => (int) ($freightStats->total_volume ?? 0),
                'avg_distance_km' => round($freightStats->avg_distance ?? 0, 0),
                'vehicle_type_breakdown' => $vehicleTypes,
                'cargo_type_breakdown' => $cargoTypes,
            ]
        );
    }
}
