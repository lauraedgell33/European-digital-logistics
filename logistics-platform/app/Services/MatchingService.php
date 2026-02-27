<?php

namespace App\Services;

use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use Illuminate\Support\Collection;

class MatchingService
{
    /**
     * Find matching vehicles for a freight offer.
     */
    public function findMatchingVehicles(FreightOffer $freight, int $limit = 20): Collection
    {
        $query = VehicleOffer::available()
            ->where('capacity_kg', '>=', $freight->weight)
            ->where('available_from', '<=', $freight->loading_date);

        // Match vehicle type
        if ($freight->vehicle_type) {
            $query->where('vehicle_type', $freight->vehicle_type);
        }

        // ADR requirement
        if ($freight->is_hazardous) {
            $query->where('has_adr', true);
        }

        // Temperature control
        if ($freight->requires_temperature_control) {
            $query->where('has_temperature_control', true);
        }

        // Volume match
        if ($freight->volume) {
            $query->where('capacity_m3', '>=', $freight->volume);
        }

        // Get results
        $vehicles = $query->with('company:id,name,country_code,rating')
            ->limit($limit * 2) // Get extra to filter by score
            ->get();

        // Score and rank matches
        return $vehicles->map(function ($vehicle) use ($freight) {
            $vehicle->match_score = $this->calculateMatchScore($freight, $vehicle);
            return $vehicle;
        })
        ->sortByDesc('match_score')
        ->take($limit)
        ->values();
    }

    /**
     * Find matching freight for a vehicle offer.
     */
    public function findMatchingFreight(VehicleOffer $vehicle, int $limit = 20): Collection
    {
        $query = FreightOffer::active()
            ->where('weight', '<=', $vehicle->capacity_kg)
            ->where('loading_date', '>=', $vehicle->available_from);

        // Match vehicle type
        $query->where('vehicle_type', $vehicle->vehicle_type);

        // Volume
        if ($vehicle->capacity_m3) {
            $query->where(function ($q) use ($vehicle) {
                $q->whereNull('volume')->orWhere('volume', '<=', $vehicle->capacity_m3);
            });
        }

        // ADR capability
        if (!$vehicle->has_adr) {
            $query->where('is_hazardous', false);
        }

        // Temperature control
        if (!$vehicle->has_temperature_control) {
            $query->where('requires_temperature_control', false);
        }

        $freights = $query->with('company:id,name,country_code,rating')
            ->limit($limit * 2)
            ->get();

        return $freights->map(function ($freight) use ($vehicle) {
            $freight->match_score = $this->calculateMatchScore($freight, $vehicle);
            return $freight;
        })
        ->sortByDesc('match_score')
        ->take($limit)
        ->values();
    }

    /**
     * Calculate match score between freight and vehicle (0-100).
     */
    private function calculateMatchScore(FreightOffer $freight, VehicleOffer $vehicle): float
    {
        $score = 0;
        $maxScore = 0;

        // Location proximity (25 points max)
        $maxScore += 25;
        if ($freight->origin_lat && $vehicle->current_lat) {
            $trackingService = new TrackingService();
            $distance = $trackingService->calculateDistance(
                $freight->origin_lat, $freight->origin_lng,
                $vehicle->current_lat, $vehicle->current_lng
            );
            // Closer = higher score, max points within 50km
            $score += max(0, 25 - ($distance / 20));
        }

        // Capacity utilization (20 points max) - prefer vehicles close to full capacity
        $maxScore += 20;
        $utilization = $freight->weight / $vehicle->capacity_kg;
        if ($utilization >= 0.7 && $utilization <= 1.0) {
            $score += 20;
        } elseif ($utilization >= 0.5) {
            $score += 15;
        } elseif ($utilization >= 0.3) {
            $score += 10;
        } else {
            $score += 5;
        }

        // Date match (15 points max) - vehicle available close to loading date
        $maxScore += 15;
        $daysDifference = $vehicle->available_from->diffInDays($freight->loading_date, false);
        if ($daysDifference >= 0 && $daysDifference <= 1) {
            $score += 15;
        } elseif ($daysDifference <= 3) {
            $score += 10;
        } elseif ($daysDifference <= 7) {
            $score += 5;
        }

        // Company rating (15 points max)
        $maxScore += 15;
        $score += ($vehicle->company->rating ?? 0) * 3;

        // Vehicle type exact match (10 points)
        $maxScore += 10;
        if ($freight->vehicle_type === $vehicle->vehicle_type) {
            $score += 10;
        }

        // Equipment match (10 points)
        $maxScore += 10;
        if ($freight->required_equipment && $vehicle->equipment) {
            $required = collect($freight->required_equipment);
            $available = collect($vehicle->equipment);
            $matched = $required->intersect($available)->count();
            $total = $required->count();
            $score += $total > 0 ? (($matched / $total) * 10) : 10;
        } else {
            $score += 10;
        }

        // Destination match (5 points)
        $maxScore += 5;
        if ($vehicle->destination_country && $vehicle->destination_country === $freight->destination_country) {
            $score += 3;
            if ($vehicle->destination_city && strtolower($vehicle->destination_city) === strtolower($freight->destination_city)) {
                $score += 2;
            }
        }

        return round(($score / $maxScore) * 100, 1);
    }

    /**
     * Auto-match: find best matches across all active offers and vehicles.
     */
    public function runAutoMatching(): array
    {
        $suggestions = [];

        $activeFreights = FreightOffer::active()
            ->where('created_at', '>=', now()->subHours(24))
            ->limit(100)
            ->get();

        foreach ($activeFreights as $freight) {
            $matches = $this->findMatchingVehicles($freight, 3);

            if ($matches->isNotEmpty() && $matches->first()->match_score >= 60) {
                $suggestions[] = [
                    'freight_id' => $freight->id,
                    'freight_route' => $freight->getFullOrigin() . ' → ' . $freight->getFullDestination(),
                    'best_match' => [
                        'vehicle_id' => $matches->first()->id,
                        'company' => $matches->first()->company->name,
                        'score' => $matches->first()->match_score,
                    ],
                    'total_matches' => $matches->count(),
                ];
            }
        }

        return $suggestions;
    }
}
