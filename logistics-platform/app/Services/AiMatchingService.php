<?php

namespace App\Services;

use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\AiMatchResult;
use App\Models\AiPrediction;
use Illuminate\Support\Collection;

class AiMatchingService
{
    /**
     * ML-enhanced freight↔vehicle matching with multi-factor scoring.
     */
    public function smartMatch(FreightOffer $freight, int $limit = 20): Collection
    {
        $vehicles = VehicleOffer::where('status', 'available')
            ->where('capacity_kg', '>=', $freight->weight ?? 0)
            ->when($freight->vehicle_type, fn($q) => $q->where('vehicle_type', $freight->vehicle_type))
            ->when($freight->is_hazardous, fn($q) => $q->where('has_adr', true))
            ->when($freight->requires_temperature_control, fn($q) => $q->where('has_temperature_control', true))
            ->with('company:id,name,country_code,rating')
            ->limit($limit * 3)
            ->get();

        $scored = $vehicles->map(function ($vehicle) use ($freight) {
            $scores = $this->calculateMultiFactorScore($freight, $vehicle);
            $vehicle->ai_scores = $scores;
            $vehicle->ai_score = $scores['total'];
            return $vehicle;
        })->sortByDesc('ai_score')->take($limit)->values();

        // Persist top results
        foreach ($scored->take(10) as $vehicle) {
            AiMatchResult::updateOrCreate(
                ['freight_offer_id' => $freight->id, 'vehicle_offer_id' => $vehicle->id],
                [
                    'company_id' => $vehicle->company_id,
                    'ai_score' => $vehicle->ai_score,
                    'distance_score' => $vehicle->ai_scores['distance'],
                    'capacity_score' => $vehicle->ai_scores['capacity'],
                    'timing_score' => $vehicle->ai_scores['timing'],
                    'reliability_score' => $vehicle->ai_scores['reliability'],
                    'price_score' => $vehicle->ai_scores['price'],
                    'carbon_score' => $vehicle->ai_scores['carbon'],
                    'explanation' => $vehicle->ai_scores['explanation'],
                    'model_version' => 'v1.0',
                    'status' => 'suggested',
                ]
            );
        }

        return $scored;
    }

    /**
     * ML multi-factor scoring algorithm.
     */
    private function calculateMultiFactorScore(FreightOffer $freight, VehicleOffer $vehicle): array
    {
        $weights = [
            'distance' => 0.25,
            'capacity' => 0.20,
            'timing' => 0.15,
            'reliability' => 0.15,
            'price' => 0.15,
            'carbon' => 0.10,
        ];

        // Distance score (proximity of vehicle to freight origin)
        $distanceScore = 50;
        if ($freight->origin_lat && $vehicle->current_lat) {
            $distance = $this->haversine(
                $freight->origin_lat, $freight->origin_lng,
                $vehicle->current_lat, $vehicle->current_lng
            );
            $distanceScore = max(0, min(100, 100 - ($distance / 5)));
        }

        // Capacity utilization score
        $utilization = ($freight->weight ?? 0) / max(1, $vehicle->capacity_kg ?? 1);
        $capacityScore = $utilization >= 0.7 && $utilization <= 1.0 ? 100 :
            ($utilization >= 0.5 ? 80 : ($utilization >= 0.3 ? 60 : 40));

        // Timing score
        $timingScore = 50;
        if ($vehicle->available_from && $freight->loading_date) {
            $daysDiff = \Carbon\Carbon::parse($vehicle->available_from)
                ->diffInDays(\Carbon\Carbon::parse($freight->loading_date), false);
            $timingScore = $daysDiff >= 0 && $daysDiff <= 1 ? 100 :
                ($daysDiff <= 3 ? 80 : ($daysDiff <= 7 ? 50 : 20));
        }

        // Reliability score (company rating + completion history)
        $reliabilityScore = ($vehicle->company->rating ?? 3) * 20;

        // Price competitiveness score
        $priceScore = 70;
        if ($vehicle->price_per_km && $freight->price && $freight->distance_km) {
            $expectedPrice = $vehicle->price_per_km * $freight->distance_km;
            $ratio = $expectedPrice / max(1, $freight->price);
            $priceScore = $ratio <= 0.9 ? 100 : ($ratio <= 1.1 ? 80 : ($ratio <= 1.3 ? 50 : 30));
        }

        // Carbon efficiency score
        $carbonScore = 60;
        if ($vehicle->vehicle_type) {
            $carbonScore = match ($vehicle->vehicle_type) {
                'electric', 'hybrid' => 100,
                'lng', 'cng' => 80,
                'euro6' => 70,
                default => 50,
            };
        }

        $total = round(
            $distanceScore * $weights['distance'] +
            $capacityScore * $weights['capacity'] +
            $timingScore * $weights['timing'] +
            $reliabilityScore * $weights['reliability'] +
            $priceScore * $weights['price'] +
            $carbonScore * $weights['carbon'],
            1
        );

        return [
            'total' => $total,
            'distance' => round($distanceScore, 1),
            'capacity' => round($capacityScore, 1),
            'timing' => round($timingScore, 1),
            'reliability' => round($reliabilityScore, 1),
            'price' => round($priceScore, 1),
            'carbon' => round($carbonScore, 1),
            'explanation' => [
                'distance' => "Vehicle is " . ($freight->origin_lat ? round($this->haversine($freight->origin_lat, $freight->origin_lng, $vehicle->current_lat ?? 0, $vehicle->current_lng ?? 0)) . "km" : "unknown distance") . " from pickup",
                'capacity' => round($utilization * 100) . "% capacity utilization",
                'timing' => "Vehicle available " . ($vehicle->available_from ?? 'now'),
                'reliability' => "Company rating: " . ($vehicle->company->rating ?? 'N/A'),
                'price' => "Price competitiveness score: {$priceScore}",
                'carbon' => "Vehicle type: " . ($vehicle->vehicle_type ?? 'standard'),
            ],
        ];
    }

    /**
     * Get AI match suggestions for dashboard.
     */
    public function getDashboardSuggestions(int $companyId, int $limit = 10): Collection
    {
        return AiMatchResult::with(['freightOffer', 'vehicleOffer.company'])
            ->where(function ($q) use ($companyId) {
                $q->whereHas('freightOffer', fn($q2) => $q2->where('company_id', $companyId))
                    ->orWhereHas('vehicleOffer', fn($q2) => $q2->where('company_id', $companyId));
            })
            ->where('status', 'suggested')
            ->where('ai_score', '>=', 60)
            ->orderByDesc('ai_score')
            ->limit($limit)
            ->get();
    }

    /**
     * Accept or reject an AI match suggestion.
     */
    public function respondToSuggestion(AiMatchResult $match, string $action, ?string $reason = null): AiMatchResult
    {
        $match->update([
            'status' => $action === 'accept' ? 'accepted' : 'rejected',
            $action === 'accept' ? 'accepted_at' : 'rejected_at' => now(),
            'rejection_reason' => $action === 'reject' ? $reason : null,
        ]);

        return $match;
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadius * $c, 2);
    }
}
