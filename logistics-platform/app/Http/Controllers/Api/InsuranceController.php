<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InsuranceQuote;
use App\Models\TransportOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InsuranceController extends Controller
{
    /**
     * Get a quote for a transport.
     */
    public function quote(Request $request): JsonResponse
    {
        $request->validate([
            'cargo_value' => 'required|numeric|min:100',
            'coverage_type' => 'required|in:basic,all_risk,extended',
            'distance_km' => 'nullable|numeric|min:1',
            'is_hazardous' => 'nullable|boolean',
            'cargo_type' => 'nullable|string',
        ]);

        $result = InsuranceQuote::calculatePremium(
            $request->cargo_value,
            $request->coverage_type,
            $request->distance_km,
            $request->is_hazardous ?? false,
            $request->cargo_type
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Create and save an insurance quote for a transport order.
     */
    public function createForOrder(Request $request, TransportOrder $order): JsonResponse
    {
        $request->validate([
            'coverage_type' => 'required|in:basic,all_risk,extended',
            'cargo_value' => 'required|numeric|min:100',
            'is_hazardous' => 'nullable|boolean',
            'cargo_type' => 'nullable|string',
        ]);

        $distance = $order->freightOffer?->distance_km ?? 500;

        $premium = InsuranceQuote::calculatePremium(
            $request->cargo_value,
            $request->coverage_type,
            $distance,
            $request->is_hazardous ?? false,
            $request->cargo_type
        );

        $coverageDetails = $this->getCoverageDetails($request->coverage_type);

        $insuranceQuote = InsuranceQuote::create([
            'transport_order_id' => $order->id,
            'company_id' => $request->user()->company_id,
            'provider' => 'LogiMarket Insurance',
            'cargo_value' => $request->cargo_value,
            'premium' => $premium['premium'],
            'currency' => 'EUR',
            'coverage_type' => $request->coverage_type,
            'coverage_details' => $coverageDetails['inclusions'],
            'exclusions' => $coverageDetails['exclusions'],
            'deductible' => $premium['deductible'] ?? 250.0,
            'status' => 'quoted',
            'valid_until' => now()->addDays(7),
        ]);

        return response()->json([
            'message' => 'Insurance quote created.',
            'data' => $insuranceQuote,
        ], 201);
    }

    /**
     * Accept a quote (buy insurance).
     */
    public function accept(Request $request, InsuranceQuote $quote): JsonResponse
    {
        if ($quote->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($quote->status !== 'quoted') {
            return response()->json(['message' => 'Quote cannot be accepted.'], 422);
        }

        if ($quote->valid_until && $quote->valid_until->isPast()) {
            return response()->json(['message' => 'Quote has expired.'], 422);
        }

        $quote->update([
            'status' => 'active',
            'policy_number' => 'LM-INS-' . strtoupper(substr(md5(uniqid()), 0, 10)),
        ]);

        return response()->json([
            'message' => 'Insurance policy activated.',
            'data' => $quote,
        ]);
    }

    /**
     * List my insurance quotes.
     */
    public function myQuotes(Request $request): JsonResponse
    {
        $quotes = InsuranceQuote::where('company_id', $request->user()->company_id)
            ->with('transportOrder')
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($quotes);
    }

    /**
     * File a claim against an insurance policy.
     */
    public function fileClaim(Request $request, InsuranceQuote $quote): JsonResponse
    {
        if ($quote->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($quote->status !== 'active') {
            return response()->json(['message' => 'No active policy found.'], 422);
        }

        $request->validate([
            'claim_description' => 'required|string|max:2000',
            'claim_amount' => 'required|numeric|min:0',
        ]);

        $quote->update([
            'status' => 'claimed',
        ]);

        return response()->json([
            'message' => 'Insurance claim filed. Our team will review it.',
            'data' => [
                'policy_number' => $quote->policy_number,
                'claim_status' => 'under_review',
            ],
        ]);
    }

    /**
     * Coverage type reference.
     */
    public function coverageTypes(): JsonResponse
    {
        return response()->json([
            'data' => [
                $this->getCoverageDetails('basic'),
                $this->getCoverageDetails('all_risk'),
                $this->getCoverageDetails('extended'),
            ],
        ]);
    }

    private function getCoverageDetails(string $type): array
    {
        $coverages = [
            'basic' => [
                'type' => 'basic',
                'name' => 'Basic Coverage',
                'rate_pct' => 0.15,
                'inclusions' => [
                    'Fire and explosion',
                    'Vehicle accident/collision',
                    'Loading/unloading damage',
                    'Theft of entire shipment',
                ],
                'exclusions' => [
                    'Partial theft',
                    'Water damage',
                    'Temperature deviance',
                    'Consequential losses',
                    'War and terrorism',
                ],
            ],
            'all_risk' => [
                'type' => 'all_risk',
                'name' => 'All Risk Coverage',
                'rate_pct' => 0.35,
                'inclusions' => [
                    'All Basic coverage perils',
                    'Partial theft',
                    'Water and weather damage',
                    'Contamination',
                    'Customs rejection',
                    'Handling damage',
                    'Shortage',
                ],
                'exclusions' => [
                    'Temperature deviance',
                    'Inherent vice',
                    'Consequential losses',
                    'War and terrorism',
                ],
            ],
            'extended' => [
                'type' => 'extended',
                'name' => 'Extended Coverage',
                'rate_pct' => 0.55,
                'inclusions' => [
                    'All Risk coverage perils',
                    'Temperature deviance (reefer)',
                    'Delay penalties (up to 25% cargo value)',
                    'Consequential losses (limited)',
                    'Customs duties',
                    'Disposal costs',
                    'Survey/inspection fees',
                ],
                'exclusions' => [
                    'Inherent vice',
                    'War and terrorism',
                    'Nuclear',
                ],
            ],
        ];

        return $coverages[$type] ?? $coverages['basic'];
    }
}
