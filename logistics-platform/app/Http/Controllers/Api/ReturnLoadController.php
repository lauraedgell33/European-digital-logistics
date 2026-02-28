<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Services\MatchingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReturnLoadController extends Controller
{
    /**
     * Suggest return loads for a vehicle that is arriving or has arrived at a destination.
     */
    public function suggest(Request $request): JsonResponse
    {
        $request->validate([
            'current_country' => 'required|string|size:2',
            'current_city' => 'nullable|string',
            'current_lat' => 'nullable|numeric',
            'current_lng' => 'nullable|numeric',
            'destination_country' => 'nullable|string|size:2',
            'destination_city' => 'nullable|string',
            'vehicle_type' => 'nullable|string',
            'max_weight_kg' => 'nullable|numeric|min:0',
            'available_from' => 'nullable|date',
            'available_to' => 'nullable|date',
            'max_radius_km' => 'nullable|integer|min:10|max:500',
        ]);

        $radius = $request->input('max_radius_km', 100);

        $query = FreightOffer::where('status', 'active')
            ->where('origin_country', $request->current_country);

        // City-based filtering
        if ($request->current_city) {
            $query->where(function ($q) use ($request, $radius) {
                $q->where('origin_city', 'LIKE', '%' . $request->current_city . '%');

                // Also add geo-radius if lat/lng provided
                if ($request->current_lat && $request->current_lng) {
                    $q->orWhereRaw("
                        (6371 * acos(cos(radians(?)) * cos(radians(origin_lat)) * cos(radians(origin_lng) - radians(?)) + sin(radians(?)) * sin(radians(origin_lat)))) <= ?
                    ", [$request->current_lat, $request->current_lng, $request->current_lat, $radius]);
                }
            });
        }

        // Filter by preferred destination
        if ($request->destination_country) {
            $query->where('destination_country', $request->destination_country);
        }
        if ($request->destination_city) {
            $query->where('destination_city', 'LIKE', '%' . $request->destination_city . '%');
        }

        // Filter by vehicle type compatibility
        if ($request->vehicle_type) {
            $query->where(function ($q) use ($request) {
                $q->where('vehicle_type', $request->vehicle_type)
                    ->orWhereNull('vehicle_type');
            });
        }

        // Filter by weight
        if ($request->max_weight_kg) {
            $query->where(function ($q) use ($request) {
                $q->where('weight', '<=', $request->max_weight_kg)
                    ->orWhereNull('weight');
            });
        }

        // Date availability
        if ($request->available_from) {
            $query->where('loading_date', '>=', $request->available_from);
        }
        if ($request->available_to) {
            $query->where('loading_date', '<=', $request->available_to);
        }

        $freights = $query->with('company')
            ->orderBy('loading_date')
            ->limit(50)
            ->get();

        // Score each result for relevance
        $scored = $freights->map(function ($freight) use ($request) {
            $score = 0;

            // Distance score (closer = better)
            if ($request->current_lat && $request->current_lng && $freight->origin_lat && $freight->origin_lng) {
                $distance = $this->haversine(
                    $request->current_lat, $request->current_lng,
                    $freight->origin_lat, $freight->origin_lng
                );
                $score += max(0, 100 - $distance); // max 100 for 0km distance
            } else {
                $score += 50; // default
            }

            // Date proximity score (sooner = better, max 30 points)
            if ($freight->loading_date) {
                $daysUntil = now()->diffInDays($freight->loading_date, false);
                if ($daysUntil >= 0 && $daysUntil <= 7) {
                    $score += max(0, 30 - ($daysUntil * 4));
                }
            }

            // Destination alignment score
            if ($request->destination_country && $freight->destination_country === $request->destination_country) {
                $score += 40;
            }

            // Price attractiveness (higher = better)
            if ($freight->price && $freight->distance_km) {
                $pricePerKm = $freight->price / $freight->distance_km;
                $score += min(30, $pricePerKm * 20);
            }

            $freight->relevance_score = round($score, 1);
            return $freight;
        })
        ->sortByDesc('relevance_score')
        ->values();

        return response()->json([
            'data' => $scored,
            'meta' => [
                'total' => $scored->count(),
                'search_origin' => [
                    'country' => $request->current_country,
                    'city' => $request->current_city,
                ],
                'radius_km' => $radius,
            ],
        ]);
    }

    /**
     * Auto-suggest return loads based on an existing transport order.
     * Given an order with known destination, find freight going back.
     */
    public function forOrder(Request $request, $orderId): JsonResponse
    {
        $order = \App\Models\TransportOrder::with('freightOffer')->findOrFail($orderId);
        $freight = $order->freightOffer;

        if (!$freight) {
            return response()->json(['message' => 'No freight offer linked to this order.'], 422);
        }

        // The "return" means: loads originating near the destination of this order
        $request->merge([
            'current_country' => $freight->destination_country,
            'current_city' => $freight->destination_city,
            'current_lat' => $freight->destination_lat,
            'current_lng' => $freight->destination_lng,
            'destination_country' => $freight->origin_country, // prefer going back
            'vehicle_type' => $freight->vehicle_type,
        ]);

        return $this->suggest($request);
    }

    /**
     * Market empty-legs overview: routes with lots of empty return vehicles.
     */
    public function emptyLegs(Request $request): JsonResponse
    {
        // Find routes where there are more vehicle offers than freight offers
        $vehicleSupply = VehicleOffer::where('status', 'active')
            ->select('origin_country', 'destination_country', DB::raw('COUNT(*) as vehicle_count'))
            ->groupBy('origin_country', 'destination_country')
            ->get()
            ->keyBy(fn($v) => $v->origin_country . '-' . $v->destination_country);

        $freightDemand = FreightOffer::where('status', 'active')
            ->select('origin_country', 'destination_country', DB::raw('COUNT(*) as freight_count'))
            ->groupBy('origin_country', 'destination_country')
            ->get()
            ->keyBy(fn($f) => $f->origin_country . '-' . $f->destination_country);

        $emptyLegs = [];
        foreach ($vehicleSupply as $key => $vs) {
            $freightCount = $freightDemand->get($key)?->freight_count ?? 0;
            $surplus = $vs->vehicle_count - $freightCount;
            if ($surplus > 0) {
                $emptyLegs[] = [
                    'origin_country' => $vs->origin_country,
                    'destination_country' => $vs->destination_country,
                    'available_vehicles' => $vs->vehicle_count,
                    'freight_demand' => $freightCount,
                    'surplus_vehicles' => $surplus,
                    'fill_rate_pct' => $vs->vehicle_count > 0
                        ? round(($freightCount / $vs->vehicle_count) * 100, 1) : 0,
                ];
            }
        }

        // Sort by surplus descending
        usort($emptyLegs, fn($a, $b) => $b['surplus_vehicles'] - $a['surplus_vehicles']);

        return response()->json(['data' => array_slice($emptyLegs, 0, 50)]);
    }

    private function haversine($lat1, $lon1, $lat2, $lon2): float
    {
        $R = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $R * $c;
    }
}
