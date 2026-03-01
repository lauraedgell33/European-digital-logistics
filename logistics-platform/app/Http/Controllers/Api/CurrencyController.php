<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CurrencyController extends Controller
{
    public function __construct(
        private readonly CurrencyService $currencyService
    ) {}

    /**
     * Get current exchange rates.
     */
    public function rates(Request $request): JsonResponse
    {
        $base = strtoupper($request->input('base', 'EUR'));
        $rates = $this->currencyService->getRates($base);

        return response()->json(['data' => $rates]);
    }

    /**
     * Convert an amount between currencies.
     */
    public function convert(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'from'   => 'required|string|size:3',
            'to'     => 'required|string|size:3',
        ]);

        $result = $this->currencyService->convert(
            $request->input('amount'),
            strtoupper($request->input('from')),
            strtoupper($request->input('to'))
        );

        if (isset($result['error'])) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json(['data' => $result]);
    }

    /**
     * List supported currencies.
     */
    public function supported(): JsonResponse
    {
        return response()->json(['data' => $this->currencyService->supported()]);
    }

    /**
     * Exchange rate history for a currency pair.
     */
    public function history(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'required|string|size:3',
            'to'   => 'required|string|size:3',
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $history = $this->currencyService->getHistory(
            strtoupper($request->input('from')),
            strtoupper($request->input('to')),
            $request->input('days', 30)
        );

        return response()->json(['data' => $history]);
    }
}
