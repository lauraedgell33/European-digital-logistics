<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use App\Models\VatRecord;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService
    ) {}

    public function processStripe(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'nullable|string|size:3',
            'payment_method' => 'nullable|string',
            'invoice_id' => 'nullable|exists:invoices,id',
            'transport_order_id' => 'nullable|exists:transport_orders,id',
        ]);

        $data = $request->all();
        $data['company_id'] = $request->user()->company_id;

        $transaction = $this->paymentService->processStripePayment($data);

        return response()->json(['message' => 'Payment processed.', 'data' => $transaction], 201);
    }

    public function processSepa(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'iban' => 'required|string|min:15|max:34',
            'bic' => 'nullable|string',
            'invoice_id' => 'nullable|exists:invoices,id',
        ]);

        $data = $request->all();
        $data['company_id'] = $request->user()->company_id;

        $transaction = $this->paymentService->processSepaPayment($data);

        return response()->json(['message' => 'SEPA payment initiated.', 'data' => $transaction], 201);
    }

    public function refund(Request $request, PaymentTransaction $transaction): JsonResponse
    {
        $request->validate(['amount' => 'nullable|numeric|min:0.01']);

        $refund = $this->paymentService->processRefund($transaction, $request->input('amount'));

        return response()->json(['message' => 'Refund processed.', 'data' => $refund]);
    }

    public function history(Request $request): JsonResponse
    {
        $transactions = PaymentTransaction::where('company_id', $request->user()->company_id)
            ->when($request->input('status'), fn($q, $s) => $q->where('status', $s))
            ->when($request->input('provider'), fn($q, $p) => $q->where('payment_provider', $p))
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($transactions);
    }

    public function summary(Request $request): JsonResponse
    {
        $summary = $this->paymentService->getPaymentSummary($request->user()->company_id);
        return response()->json(['data' => $summary]);
    }

    public function exchangeRates(Request $request): JsonResponse
    {
        $rates = $this->paymentService->getExchangeRates($request->input('base', 'EUR'));
        return response()->json(['data' => $rates]);
    }

    // ── VAT ──────────────────────────────────────

    public function vatReport(Request $request): JsonResponse
    {
        $records = VatRecord::where('company_id', $request->user()->company_id)
            ->when($request->input('period'), fn($q, $p) => $q->where('tax_period', $p))
            ->orderByDesc('tax_period')
            ->paginate($request->input('per_page', 15));

        return response()->json($records);
    }

    public function vatRates(): JsonResponse
    {
        $rates = [];
        foreach (['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','NO','CH'] as $code) {
            $rates[] = ['country' => $code, 'rate' => VatRecord::getVatRate($code)];
        }
        return response()->json(['data' => $rates]);
    }

    public function checkReverseCharge(Request $request): JsonResponse
    {
        $request->validate([
            'origin' => 'required|string|size:2',
            'destination' => 'required|string|size:2',
            'is_business' => 'nullable|boolean',
        ]);

        $isRC = VatRecord::isReverseCharge(
            $request->input('origin'),
            $request->input('destination'),
            $request->input('is_business', true)
        );

        return response()->json([
            'data' => [
                'is_reverse_charge' => $isRC,
                'origin_vat_rate' => VatRecord::getVatRate($request->input('origin')),
                'destination_vat_rate' => VatRecord::getVatRate($request->input('destination')),
                'applicable_rate' => $isRC ? 0 : VatRecord::getVatRate($request->input('origin')),
                'explanation' => $isRC
                    ? 'Reverse charge applies — buyer accounts for VAT in destination country'
                    : 'Standard VAT applies at origin country rate',
            ],
        ]);
    }
}
