<?php

namespace App\Services;

use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\AiMatchResult;
use App\Models\TransportOrder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AiMatchingService
{
    private const MODEL_VERSION = 'v2.0';

    /** Default weights — overridden by learned weights from feedback. */
    private array $defaultWeights = [
        'distance'       => 0.22,
        'capacity'       => 0.18,
        'timing'         => 0.14,
        'reliability'    => 0.14,
        'price'          => 0.12,
        'carbon'         => 0.08,
        'route_compat'   => 0.07,
        'history'        => 0.05,
    ];

    // ───────────────────────────────────────────────
    //  Smart Match  (enhanced v2)
    // ───────────────────────────────────────────────
    public function smartMatch(FreightOffer $freight, int $limit = 20): Collection
    {
        $weights = $this->getLearnedWeights();

        $vehicles = VehicleOffer::where('status', 'available')
            ->where('capacity_kg', '>=', $freight->weight ?? 0)
            ->when($freight->vehicle_type, fn ($q) => $q->where('vehicle_type', $freight->vehicle_type))
            ->when($freight->is_hazardous, fn ($q) => $q->where('has_adr', true))
            ->when($freight->requires_temperature_control, fn ($q) => $q->where('has_temperature_control', true))
            ->with('company:id,name,country_code,rating')
            ->limit($limit * 4)
            ->get();

        $scored = $vehicles->map(function ($vehicle) use ($freight, $weights) {
            $scores = $this->calculateMultiFactorScore($freight, $vehicle, $weights);
            $vehicle->ai_scores     = $scores;
            $vehicle->ai_score      = $scores['total'];
            $vehicle->confidence    = $scores['confidence'];
            $vehicle->match_tier    = $scores['tier'];
            return $vehicle;
        })->sortByDesc('ai_score')->take($limit)->values();

        // Persist top results
        foreach ($scored->take(10) as $vehicle) {
            AiMatchResult::updateOrCreate(
                ['freight_offer_id' => $freight->id, 'vehicle_offer_id' => $vehicle->id],
                [
                    'company_id'        => $vehicle->company_id,
                    'ai_score'          => $vehicle->ai_score,
                    'distance_score'    => $vehicle->ai_scores['distance'],
                    'capacity_score'    => $vehicle->ai_scores['capacity'],
                    'timing_score'      => $vehicle->ai_scores['timing'],
                    'reliability_score' => $vehicle->ai_scores['reliability'],
                    'price_score'       => $vehicle->ai_scores['price'],
                    'carbon_score'      => $vehicle->ai_scores['carbon'],
                    'feature_weights'   => $vehicle->ai_scores['weights_used'],
                    'explanation'       => $vehicle->ai_scores['explanation'],
                    'model_version'     => self::MODEL_VERSION,
                    'status'            => 'suggested',
                ]
            );
        }

        return $scored;
    }

    // ───────────────────────────────────────────────
    //  Batch Match — process multiple freights at once
    // ───────────────────────────────────────────────
    public function batchMatch(int $hoursBack = 6, int $limitPerFreight = 5): array
    {
        $freights = FreightOffer::where('status', 'active')
            ->where('created_at', '>=', now()->subHours($hoursBack))
            ->limit(200)
            ->get();

        $results = [];
        foreach ($freights as $freight) {
            $matches = $this->smartMatch($freight, $limitPerFreight);
            if ($matches->isNotEmpty() && $matches->first()->ai_score >= 65) {
                $results[] = [
                    'freight_id'   => $freight->id,
                    'route'        => ($freight->origin_city ?? $freight->origin_country) . ' → ' . ($freight->destination_city ?? $freight->destination_country),
                    'matches'      => $matches->take(3)->map(fn ($v) => [
                        'vehicle_id' => $v->id,
                        'company'    => $v->company->name ?? 'N/A',
                        'score'      => $v->ai_score,
                        'tier'       => $v->match_tier,
                    ])->values(),
                ];
            }
        }

        Log::info('BatchAiMatching completed', ['freights' => $freights->count(), 'matched' => count($results)]);

        return $results;
    }

    // ───────────────────────────────────────────────
    //  Enhanced multi-factor scoring  (v2)
    // ───────────────────────────────────────────────
    private function calculateMultiFactorScore(FreightOffer $freight, VehicleOffer $vehicle, array $weights): array
    {
        // ── Distance score ──
        $distanceScore = 50;
        $distanceKm = null;
        if ($freight->origin_lat && $vehicle->current_lat) {
            $distanceKm = $this->haversine($freight->origin_lat, $freight->origin_lng, $vehicle->current_lat, $vehicle->current_lng);
            $distanceScore = max(0, min(100, 100 - ($distanceKm / 5)));
        }

        // ── Capacity utilization ──
        $utilization   = ($freight->weight ?? 0) / max(1, $vehicle->capacity_kg ?? 1);
        $capacityScore = match (true) {
            $utilization >= 0.8 && $utilization <= 1.0 => 100,
            $utilization >= 0.7                        => 90,
            $utilization >= 0.5                        => 75,
            $utilization >= 0.3                        => 55,
            default                                    => 35,
        };

        // ── Timing score ──
        $timingScore = 50;
        if ($vehicle->available_from && $freight->loading_date) {
            $daysDiff = \Carbon\Carbon::parse($vehicle->available_from)
                ->diffInDays(\Carbon\Carbon::parse($freight->loading_date), false);
            $timingScore = match (true) {
                $daysDiff >= 0 && $daysDiff <= 1 => 100,
                $daysDiff <= 2                   => 90,
                $daysDiff <= 3                   => 75,
                $daysDiff <= 5                   => 55,
                $daysDiff <= 7                   => 35,
                default                          => 15,
            };
        }

        // ── Reliability score (company rating + historical completion) ──
        $companyRating = $vehicle->company->rating ?? 3;
        $completionRate = $this->getCompanyCompletionRate($vehicle->company_id);
        $reliabilityScore = ($companyRating * 12) + ($completionRate * 40);

        // ── Price competitiveness ──
        $priceScore = 65;
        if ($vehicle->price_per_km && $freight->price && $freight->distance_km) {
            $expectedPrice = $vehicle->price_per_km * $freight->distance_km;
            $ratio = $expectedPrice / max(1, $freight->price);
            $priceScore = match (true) {
                $ratio <= 0.85 => 100,
                $ratio <= 0.95 => 90,
                $ratio <= 1.05 => 80,
                $ratio <= 1.15 => 60,
                $ratio <= 1.30 => 40,
                default        => 20,
            };
        }

        // ── Carbon efficiency ──
        $carbonScore = match ($vehicle->vehicle_type ?? 'standard') {
            'electric', 'hydrogen' => 100,
            'hybrid'               => 90,
            'lng', 'cng'           => 75,
            'euro6'                => 65,
            'euro5'                => 50,
            default                => 40,
        };

        // ── Route compatibility (NEW) — does the vehicle's destination overlap? ──
        $routeCompatScore = 50;
        if ($vehicle->destination_country && $freight->destination_country) {
            $routeCompatScore = $vehicle->destination_country === $freight->destination_country ? 100 : 40;
            if ($vehicle->destination_city && $freight->destination_city
                && strtolower($vehicle->destination_city) === strtolower($freight->destination_city)) {
                $routeCompatScore = 100;
            }
        }

        // ── Historical match success (NEW) — past accept rate between these companies ──
        $historyScore = $this->getHistoricalSuccessScore($freight->company_id, $vehicle->company_id);

        // ── Weighted total ──
        $total = round(
            $distanceScore     * $weights['distance'] +
            $capacityScore     * $weights['capacity'] +
            $timingScore       * $weights['timing'] +
            $reliabilityScore  * $weights['reliability'] +
            $priceScore        * $weights['price'] +
            $carbonScore       * $weights['carbon'] +
            $routeCompatScore  * $weights['route_compat'] +
            $historyScore      * $weights['history'],
            1
        );

        // Confidence & tier
        $confidence = $this->calculateConfidence($distanceScore, $capacityScore, $timingScore, $reliabilityScore);
        $tier = match (true) {
            $total >= 85 => 'excellent',
            $total >= 70 => 'good',
            $total >= 55 => 'fair',
            default      => 'low',
        };

        return [
            'total'         => $total,
            'distance'      => round($distanceScore, 1),
            'capacity'      => round($capacityScore, 1),
            'timing'        => round($timingScore, 1),
            'reliability'   => round($reliabilityScore, 1),
            'price'         => round($priceScore, 1),
            'carbon'        => round($carbonScore, 1),
            'route_compat'  => round($routeCompatScore, 1),
            'history'       => round($historyScore, 1),
            'confidence'    => $confidence,
            'tier'          => $tier,
            'weights_used'  => $weights,
            'explanation'   => [
                'distance'     => 'Vehicle is ' . ($distanceKm !== null ? round($distanceKm) . 'km' : 'unknown distance') . ' from pickup',
                'capacity'     => round($utilization * 100) . '% capacity utilization',
                'timing'       => 'Vehicle available ' . ($vehicle->available_from ?? 'now'),
                'reliability'  => 'Rating: ' . $companyRating . '/5, completion: ' . round($completionRate * 100) . '%',
                'price'        => "Price competitiveness: {$priceScore}/100",
                'carbon'       => 'Vehicle type: ' . ($vehicle->vehicle_type ?? 'standard'),
                'route_compat' => 'Route compatibility: ' . round($routeCompatScore) . '/100',
                'history'      => 'Historical success: ' . round($historyScore) . '/100',
                'confidence'   => "Confidence: {$confidence}%",
                'tier'         => "Match tier: {$tier}",
            ],
        ];
    }

    // ───────────────────────────────────────────────
    //  Learned weights from accept/reject feedback
    // ───────────────────────────────────────────────
    public function getLearnedWeights(): array
    {
        return Cache::remember('ai:learned_weights', 3600, function () {
            $accepted = AiMatchResult::where('status', 'accepted')->count();
            if ($accepted < 30) {
                return $this->defaultWeights;       // Not enough data — use defaults
            }

            // Analyse which scores correlate most with acceptance
            $avgAccepted = AiMatchResult::where('status', 'accepted')
                ->selectRaw('AVG(distance_score) as d, AVG(capacity_score) as c, AVG(timing_score) as t, AVG(reliability_score) as r, AVG(price_score) as p, AVG(carbon_score) as co')
                ->first();

            $avgRejected = AiMatchResult::where('status', 'rejected')
                ->selectRaw('AVG(distance_score) as d, AVG(capacity_score) as c, AVG(timing_score) as t, AVG(reliability_score) as r, AVG(price_score) as p, AVG(carbon_score) as co')
                ->first();

            if (!$avgRejected || !$avgRejected->d) {
                return $this->defaultWeights;
            }

            // Factors where accepted >> rejected get higher weight
            $diffs = [
                'distance'     => max(0.01, ($avgAccepted->d ?? 50) - ($avgRejected->d ?? 50)),
                'capacity'     => max(0.01, ($avgAccepted->c ?? 50) - ($avgRejected->c ?? 50)),
                'timing'       => max(0.01, ($avgAccepted->t ?? 50) - ($avgRejected->t ?? 50)),
                'reliability'  => max(0.01, ($avgAccepted->r ?? 50) - ($avgRejected->r ?? 50)),
                'price'        => max(0.01, ($avgAccepted->p ?? 50) - ($avgRejected->p ?? 50)),
                'carbon'       => max(0.01, ($avgAccepted->co ?? 50) - ($avgRejected->co ?? 50)),
            ];
            $diffSum = array_sum($diffs);

            $learned = [];
            foreach ($diffs as $k => $v) {
                $learned[$k] = round($v / $diffSum * 0.88, 4);   // 88% for the 6 core factors
            }
            $learned['route_compat'] = 0.07;
            $learned['history']      = 0.05;

            return $learned;
        });
    }

    /** Recalibrate weights (call after significant new feedback). */
    public function recalibrateWeights(): array
    {
        Cache::forget('ai:learned_weights');
        return $this->getLearnedWeights();
    }

    // ───────────────────────────────────────────────
    //  Analytics — model performance metrics
    // ───────────────────────────────────────────────
    public function getAnalytics(): array
    {
        return Cache::remember('ai:analytics', 600, function () {
            $total     = AiMatchResult::count();
            $accepted  = AiMatchResult::where('status', 'accepted')->count();
            $rejected  = AiMatchResult::where('status', 'rejected')->count();
            $suggested = AiMatchResult::where('status', 'suggested')->count();
            $rate      = $total > 0 ? round($accepted / max(1, $accepted + $rejected) * 100, 1) : 0;

            $avgScoreAccepted = AiMatchResult::where('status', 'accepted')->avg('ai_score');
            $avgScoreRejected = AiMatchResult::where('status', 'rejected')->avg('ai_score');

            $byTier = AiMatchResult::selectRaw("
                CASE
                    WHEN ai_score >= 85 THEN 'excellent'
                    WHEN ai_score >= 70 THEN 'good'
                    WHEN ai_score >= 55 THEN 'fair'
                    ELSE 'low'
                END as tier,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted
            ")->groupBy('tier')->get();

            return [
                'total_matches'        => $total,
                'accepted'             => $accepted,
                'rejected'             => $rejected,
                'pending'              => $suggested,
                'acceptance_rate'      => $rate,
                'avg_score_accepted'   => round($avgScoreAccepted ?? 0, 1),
                'avg_score_rejected'   => round($avgScoreRejected ?? 0, 1),
                'model_version'        => self::MODEL_VERSION,
                'current_weights'      => $this->getLearnedWeights(),
                'tier_breakdown'       => $byTier,
            ];
        });
    }

    // ───────────────────────────────────────────────
    //  Dashboard suggestions
    // ───────────────────────────────────────────────
    public function getDashboardSuggestions(int $companyId, int $limit = 10): Collection
    {
        return AiMatchResult::with(['freightOffer', 'vehicleOffer.company'])
            ->where(function ($q) use ($companyId) {
                $q->whereHas('freightOffer', fn ($q2) => $q2->where('company_id', $companyId))
                    ->orWhereHas('vehicleOffer', fn ($q2) => $q2->where('company_id', $companyId));
            })
            ->where('status', 'suggested')
            ->where('ai_score', '>=', 55)
            ->orderByDesc('ai_score')
            ->limit($limit)
            ->get();
    }

    // ───────────────────────────────────────────────
    //  Respond to suggestion (with feedback learning)
    // ───────────────────────────────────────────────
    public function respondToSuggestion(AiMatchResult $match, string $action, ?string $reason = null): AiMatchResult
    {
        $match->update([
            'status'           => $action === 'accept' ? 'accepted' : 'rejected',
            $action === 'accept' ? 'accepted_at' : 'rejected_at' => now(),
            'rejection_reason' => $action === 'reject' ? $reason : null,
        ]);

        // Auto-recalibrate after every 50 new feedback entries
        $feedbackCount = AiMatchResult::whereIn('status', ['accepted', 'rejected'])
            ->where('updated_at', '>=', now()->subDay())->count();
        if ($feedbackCount % 50 === 0) {
            $this->recalibrateWeights();
        }

        Cache::forget('ai:analytics');

        return $match;
    }

    // ───────────────────────────────────────────────
    //  Helper: company completion rate
    // ───────────────────────────────────────────────
    private function getCompanyCompletionRate(int $companyId): float
    {
        return Cache::remember("company:completion:{$companyId}", 3600, function () use ($companyId) {
            $total = TransportOrder::where('carrier_id', $companyId)
                ->whereIn('status', ['completed', 'cancelled', 'failed'])
                ->count();
            if ($total < 5) return 0.7;   // Default for new companies
            $completed = TransportOrder::where('carrier_id', $companyId)
                ->where('status', 'completed')->count();
            return round($completed / $total, 3);
        });
    }

    // ───────────────────────────────────────────────
    //  Helper: historical success between two companies
    // ───────────────────────────────────────────────
    private function getHistoricalSuccessScore(int $shipperCompanyId, int $carrierCompanyId): float
    {
        $key = "ai:history:{$shipperCompanyId}:{$carrierCompanyId}";
        return Cache::remember($key, 1800, function () use ($shipperCompanyId, $carrierCompanyId) {
            $pastMatches = AiMatchResult::whereHas('freightOffer', fn ($q) => $q->where('company_id', $shipperCompanyId))
                ->whereHas('vehicleOffer', fn ($q) => $q->where('company_id', $carrierCompanyId))
                ->whereIn('status', ['accepted', 'rejected'])
                ->get();

            if ($pastMatches->count() < 3) return 50;  // Neutral for no history

            $accepted = $pastMatches->where('status', 'accepted')->count();
            return round($accepted / $pastMatches->count() * 100, 1);
        });
    }

    // ───────────────────────────────────────────────
    //  Helper: confidence level
    // ───────────────────────────────────────────────
    private function calculateConfidence(float $dist, float $cap, float $time, float $rel): float
    {
        // High confidence when all key factors score well together
        $scores = [$dist, $cap, $time, $rel];
        $avg    = array_sum($scores) / 4;
        $variance = array_sum(array_map(fn ($s) => ($s - $avg) ** 2, $scores)) / 4;
        $stdDev = sqrt($variance);

        // Low variance = high confidence
        return round(max(30, min(99, $avg - ($stdDev * 0.4))), 0);
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
