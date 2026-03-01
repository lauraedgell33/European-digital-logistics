<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FreightOffer;
use App\Models\AiMatchResult;
use App\Services\AiMatchingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AiMatchingController extends Controller
{
    public function __construct(
        private readonly AiMatchingService $aiMatchingService
    ) {}

    public function smartMatch(Request $request, FreightOffer $freight): JsonResponse
    {
        $matches = $this->aiMatchingService->smartMatch($freight, $request->input('limit', 20));

        return response()->json([
            'data' => $matches,
            'meta' => [
                'freight_id'    => $freight->id,
                'total_matches' => $matches->count(),
                'model_version' => 'v2.0',
                'tiers'         => $matches->groupBy('match_tier')->map->count(),
            ],
        ]);
    }

    /**
     * Batch-match recent freight offers (admin/cron).
     */
    public function batchMatch(Request $request): JsonResponse
    {
        $results = $this->aiMatchingService->batchMatch(
            $request->input('hours_back', 6),
            $request->input('limit_per_freight', 5)
        );

        return response()->json([
            'message' => count($results) . ' freight offers matched.',
            'data'    => $results,
        ]);
    }

    /**
     * AI model analytics — acceptance rates, weight tuning, tier breakdown.
     */
    public function analytics(): JsonResponse
    {
        return response()->json([
            'data' => $this->aiMatchingService->getAnalytics(),
        ]);
    }

    /**
     * Re-calibrate learned weights from feedback data.
     */
    public function recalibrate(): JsonResponse
    {
        $weights = $this->aiMatchingService->recalibrateWeights();

        return response()->json([
            'message' => 'Weights recalibrated from feedback data.',
            'data'    => $weights,
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $suggestions = $this->aiMatchingService->getDashboardSuggestions($companyId);

        return response()->json(['data' => $suggestions]);
    }

    public function respond(Request $request, AiMatchResult $match): JsonResponse
    {
        $request->validate([
            'action' => 'required|in:accept,reject',
            'reason' => 'nullable|string|max:500',
        ]);

        $result = $this->aiMatchingService->respondToSuggestion(
            $match,
            $request->input('action'),
            $request->input('reason')
        );

        return response()->json([
            'message' => "Match {$request->input('action')}ed.",
            'data' => $result,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $matches = AiMatchResult::with(['freightOffer', 'vehicleOffer'])
            ->where(function ($q) use ($request) {
                $q->whereHas('freightOffer', fn($q2) => $q2->where('company_id', $request->user()->company_id))
                    ->orWhereHas('vehicleOffer', fn($q2) => $q2->where('company_id', $request->user()->company_id));
            })
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 20));

        return response()->json($matches);
    }
}
