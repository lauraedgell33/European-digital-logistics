<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MultimodalBooking;
use App\Models\IntermodalPlan;
use App\Services\MultimodalService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MultimodalController extends Controller
{
    public function __construct(
        private readonly MultimodalService $multimodalService
    ) {}

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'origin_country' => 'required|string|size:2',
            'destination_country' => 'required|string|size:2',
            'transport_mode' => 'nullable|in:rail,sea,air,barge',
            'departure_date' => 'nullable|date',
            'weight_kg' => 'nullable|numeric',
        ]);

        $results = $this->multimodalService->searchOptions($request->all());
        return response()->json(['data' => $results]);
    }

    public function book(Request $request): JsonResponse
    {
        $request->validate([
            'transport_mode' => 'required|in:rail,sea,air,barge',
            'carrier_name' => 'nullable|string',
            'origin_terminal' => 'required|string',
            'origin_country' => 'required|string|size:2',
            'destination_terminal' => 'required|string',
            'destination_country' => 'required|string|size:2',
            'departure_date' => 'required|date',
            'weight_kg' => 'nullable|numeric',
            'price' => 'nullable|numeric',
        ]);

        $booking = MultimodalBooking::create(array_merge($request->all(), [
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
            'booking_reference' => MultimodalBooking::generateReference(),
            'status' => 'booked',
            'estimated_arrival' => now()->addDays(rand(2, 8)),
        ]));

        return response()->json(['message' => 'Booking created.', 'data' => $booking], 201);
    }

    public function bookings(Request $request): JsonResponse
    {
        $bookings = MultimodalBooking::where('company_id', $request->user()->company_id)
            ->with('transportOrder:id,order_number')
            ->when($request->input('mode'), fn($q, $m) => $q->where('transport_mode', $m))
            ->when($request->input('status'), fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($bookings);
    }

    public function showBooking(MultimodalBooking $booking): JsonResponse
    {
        return response()->json(['data' => $booking]);
    }

    public function createPlan(Request $request): JsonResponse
    {
        $request->validate([
            'origin' => 'required|array',
            'origin.country' => 'required|string|size:2',
            'origin.city' => 'required|string',
            'destination' => 'required|array',
            'destination.country' => 'required|string|size:2',
            'destination.city' => 'required|string',
            'optimization_priority' => 'nullable|in:cost,speed,co2,balanced',
            'weight_kg' => 'nullable|numeric',
            'volume_m3' => 'nullable|numeric',
        ]);

        $plan = $this->multimodalService->createIntermodalPlan(
            $request->all(),
            $request->user()->company_id,
            $request->user()->id
        );

        return response()->json(['message' => 'Intermodal plan created.', 'data' => $plan], 201);
    }

    public function plans(Request $request): JsonResponse
    {
        $plans = IntermodalPlan::where('company_id', $request->user()->company_id)
            ->with('transportOrder:id,order_number')
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($plans);
    }

    public function showPlan(IntermodalPlan $plan): JsonResponse
    {
        return response()->json(['data' => $plan]);
    }

    public function statistics(Request $request): JsonResponse
    {
        $stats = $this->multimodalService->getStatistics($request->user()->company_id);
        return response()->json(['data' => $stats]);
    }
}
