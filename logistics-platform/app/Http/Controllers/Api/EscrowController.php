<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EscrowPayment;
use App\Models\TransportOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EscrowController extends Controller
{
    /**
     * Create an escrow payment for a transport order.
     */
    public function create(Request $request, TransportOrder $order): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'nullable|string|size:3',
        ]);

        // Check if escrow already exists
        $existing = EscrowPayment::where('transport_order_id', $order->id)
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Escrow already exists for this order.', 'data' => $existing], 422);
        }

        $companyId = $request->user()->company_id;

        $escrow = EscrowPayment::create([
            'transport_order_id' => $order->id,
            'payer_company_id' => $companyId,
            'payee_company_id' => $order->carrier_company_id ?? $order->freightOffer?->company_id,
            'amount' => $request->amount,
            'currency' => $request->input('currency', 'EUR'),
            'status' => 'pending',
            'payment_reference' => 'ESC-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 12)),
        ]);

        return response()->json([
            'message' => 'Escrow payment created. Fund the escrow to proceed.',
            'data' => $escrow,
        ], 201);
    }

    /**
     * Fund the escrow (simulate payment deposit).
     */
    public function fund(Request $request, EscrowPayment $escrow): JsonResponse
    {
        if ($escrow->payer_company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'payment_method' => 'nullable|string',
        ]);

        try {
            $escrow->fund($request->payment_method);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Escrow funded. Funds held securely until delivery confirmation.',
            'data' => $escrow->fresh(),
        ]);
    }

    /**
     * Release escrow funds to payee (after delivery confirmation).
     */
    public function release(Request $request, EscrowPayment $escrow): JsonResponse
    {
        if ($escrow->payer_company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Only the payer can release funds.'], 403);
        }

        try {
            $escrow->release();
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Funds released to carrier.',
            'data' => $escrow->fresh(),
        ]);
    }

    /**
     * Dispute the escrow.
     */
    public function dispute(Request $request, EscrowPayment $escrow): JsonResponse
    {
        $companyId = $request->user()->company_id;
        if ($escrow->payer_company_id !== $companyId && $escrow->payee_company_id !== $companyId) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        try {
            $escrow->dispute($request->reason);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Escrow disputed. Our mediation team will review.',
            'data' => $escrow->fresh(),
        ]);
    }

    /**
     * Refund escrow to payer (admin action or after dispute resolution).
     */
    public function refund(Request $request, EscrowPayment $escrow): JsonResponse
    {
        // Only admin or payer can refund disputed escrow
        if (!$request->user()->hasRole('admin') && $escrow->payer_company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $escrow->refund();
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Escrow refunded.',
            'data' => $escrow->fresh(),
        ]);
    }

    /**
     * Cancel pending (unfunded) escrow.
     */
    public function cancel(Request $request, EscrowPayment $escrow): JsonResponse
    {
        $companyId = $request->user()->company_id;
        if ($escrow->payer_company_id !== $companyId) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($escrow->status !== 'pending') {
            return response()->json(['message' => 'Only pending escrow can be cancelled.'], 422);
        }

        $escrow->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Escrow cancelled.']);
    }

    /**
     * List escrows for the current user's company.
     */
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $query = EscrowPayment::where(function ($q) use ($companyId) {
            $q->where('payer_company_id', $companyId)
                ->orWhere('payee_company_id', $companyId);
        })->with(['transportOrder', 'payerCompany', 'payeeCompany']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $escrows = $query->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($escrows);
    }

    /**
     * Get escrow for a specific transport order.
     */
    public function forOrder(Request $request, TransportOrder $order): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $escrow = EscrowPayment::where('transport_order_id', $order->id)
            ->where(function ($q) use ($companyId) {
                $q->where('payer_company_id', $companyId)
                    ->orWhere('payee_company_id', $companyId);
            })
            ->first();

        if (!$escrow) {
            return response()->json(['message' => 'No escrow found for this order.'], 404);
        }

        return response()->json(['data' => $escrow]);
    }
}
