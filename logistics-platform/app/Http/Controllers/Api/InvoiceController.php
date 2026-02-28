<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceFactoring;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $invoices = Invoice::where('company_id', $request->user()->company_id)
            ->when($request->input('status'), fn($q, $s) => $q->where('status', $s))
            ->with(['customerCompany:id,name', 'transportOrder:id,order_number'])
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($invoices);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_company_id' => 'nullable|exists:companies,id',
            'transport_order_id' => 'nullable|exists:transport_orders,id',
            'due_date' => 'required|date|after:today',
            'line_items' => 'required|array|min:1',
            'line_items.*.description' => 'required|string',
            'line_items.*.quantity' => 'required|numeric|min:1',
            'line_items.*.unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|size:3',
            'notes' => 'nullable|string',
            'payment_terms' => 'nullable|string',
        ]);

        $lineItems = $request->input('line_items');
        $subtotal = collect($lineItems)->sum(fn($item) => $item['quantity'] * $item['unit_price']);
        $taxRate = $request->input('tax_rate', 0);
        $taxAmount = round($subtotal * $taxRate / 100, 2);

        $invoice = Invoice::create([
            'invoice_number' => Invoice::generateNumber($request->user()->company_id),
            'company_id' => $request->user()->company_id,
            'customer_company_id' => $request->input('customer_company_id'),
            'transport_order_id' => $request->input('transport_order_id'),
            'created_by' => $request->user()->id,
            'customer_name' => $request->input('customer_name'),
            'customer_address' => $request->input('customer_address'),
            'customer_vat_number' => $request->input('customer_vat_number'),
            'customer_country' => $request->input('customer_country'),
            'issue_date' => now()->toDateString(),
            'due_date' => $request->input('due_date'),
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'total_amount' => $subtotal + $taxAmount,
            'currency' => $request->input('currency', 'EUR'),
            'line_items' => $lineItems,
            'notes' => $request->input('notes'),
            'payment_terms' => $request->input('payment_terms'),
            'bank_iban' => $request->input('bank_iban'),
            'bank_bic' => $request->input('bank_bic'),
            'status' => 'draft',
        ]);

        return response()->json(['message' => 'Invoice created.', 'data' => $invoice], 201);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json(['data' => $invoice->load(['customerCompany', 'transportOrder', 'payments', 'factoring'])]);
    }

    public function send(Invoice $invoice): JsonResponse
    {
        $invoice->update(['status' => 'sent', 'sent_at' => now()]);
        return response()->json(['message' => 'Invoice sent.', 'data' => $invoice]);
    }

    public function markPaid(Request $request, Invoice $invoice): JsonResponse
    {
        $request->validate(['amount' => 'nullable|numeric|min:0']);
        $amount = $request->input('amount', $invoice->balance_due);

        $invoice->update([
            'paid_amount' => $invoice->paid_amount + $amount,
            'status' => ($invoice->paid_amount + $amount) >= $invoice->total_amount ? 'paid' : 'partially_paid',
            'paid_at' => ($invoice->paid_amount + $amount) >= $invoice->total_amount ? now() : null,
        ]);

        return response()->json(['message' => 'Payment recorded.', 'data' => $invoice->fresh()]);
    }

    public function requestFactoring(Request $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->factoring) {
            return response()->json(['message' => 'Factoring already requested.'], 422);
        }

        $calc = InvoiceFactoring::calculateFactoring(
            (float) $invoice->total_amount,
            $request->input('advance_rate', 85),
            $request->input('fee_pct', 2.5)
        );

        $factoring = InvoiceFactoring::create(array_merge($calc, [
            'invoice_id' => $invoice->id,
            'company_id' => $invoice->company_id,
            'currency' => $invoice->currency,
            'status' => 'requested',
            'days_to_maturity' => now()->diffInDays($invoice->due_date),
        ]));

        return response()->json(['message' => 'Factoring requested.', 'data' => $factoring], 201);
    }

    public function stats(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        return response()->json([
            'data' => [
                'total_invoices' => Invoice::where('company_id', $companyId)->count(),
                'total_revenue' => round(Invoice::where('company_id', $companyId)->where('status', 'paid')->sum('total_amount'), 2),
                'outstanding' => round(Invoice::where('company_id', $companyId)->unpaid()->sum('total_amount'), 2),
                'overdue_count' => Invoice::where('company_id', $companyId)->overdue()->count(),
                'overdue_amount' => round(Invoice::where('company_id', $companyId)->overdue()->sum('total_amount'), 2),
                'avg_payment_days' => round(Invoice::where('company_id', $companyId)
                    ->where('status', 'paid')
                    ->whereNotNull('paid_at')
                    ->get()
                    ->avg(function ($invoice) {
                        return \Carbon\Carbon::parse($invoice->issue_date)
                            ->diffInDays(\Carbon\Carbon::parse($invoice->paid_at));
                    }) ?? 0),
            ],
        ]);
    }
}
