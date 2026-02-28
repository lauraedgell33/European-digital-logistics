<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DebtCollection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DebtCollectionController extends Controller
{
    /**
     * Create a new debt collection case.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'debtor_company_id' => 'required|exists:companies,id',
            'transport_order_id' => 'nullable|exists:transport_orders,id',
            'debtor_name' => 'required|string|max:255',
            'debtor_email' => 'nullable|email',
            'debtor_phone' => 'nullable|string|max:50',
            'debtor_address' => 'nullable|string|max:500',
            'debtor_vat_number' => 'nullable|string|max:50',
            'invoice_number' => 'required|string|max:100',
            'invoice_date' => 'required|date',
            'invoice_due_date' => 'required|date',
            'invoice_amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'description' => 'nullable|string|max:2000',
        ]);

        $data['creditor_company_id'] = $request->user()->company_id;
        $data['status'] = 'new';
        $data['currency'] = $data['currency'] ?? 'EUR';

        // Calculate collection fee
        $feeData = DebtCollection::calculateFee($data['invoice_amount']);
        $data['collection_fee'] = $feeData['total_fee'];

        $case = DebtCollection::create($data);

        return response()->json([
            'message' => 'Debt collection case created.',
            'data' => $case,
            'fee_breakdown' => $feeData,
        ], 201);
    }

    /**
     * List my debt collection cases.
     */
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $query = DebtCollection::where('creditor_company_id', $companyId)
            ->with(['debtorCompany', 'transportOrder']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $cases = $query->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($cases);
    }

    /**
     * Show case details.
     */
    public function show(Request $request, DebtCollection $debtCollection): JsonResponse
    {
        if ($debtCollection->creditor_company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $debtCollection->load(['debtorCompany', 'creditorCompany', 'transportOrder']);

        return response()->json([
            'data' => $debtCollection,
            'days_overdue' => $debtCollection->daysOverdue(),
        ]);
    }

    /**
     * Send reminder to debtor.
     */
    public function sendReminder(Request $request, DebtCollection $debtCollection): JsonResponse
    {
        if ($debtCollection->creditor_company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (in_array($debtCollection->status, ['paid', 'cancelled', 'written_off'])) {
            return response()->json(['message' => 'Case is closed.'], 422);
        }

        $reminderCount = $debtCollection->reminder_count + 1;
        $status = $debtCollection->status;

        // Progress status based on reminder count
        if ($reminderCount === 1 && $status === 'new') {
            $status = 'reminder_sent';
        } elseif ($reminderCount === 2) {
            $status = 'second_reminder';
        } elseif ($reminderCount >= 3 && !in_array($status, ['legal_action', 'collection_agency'])) {
            $status = 'final_notice';
        }

        $debtCollection->update([
            'reminder_count' => $reminderCount,
            'last_reminder_at' => now(),
            'status' => $status,
        ]);

        // TODO: Send actual email/notification to debtor

        return response()->json([
            'message' => "Reminder #{$reminderCount} sent.",
            'data' => $debtCollection->fresh(),
        ]);
    }

    /**
     * Escalate to collection agency.
     */
    public function escalate(Request $request, DebtCollection $debtCollection): JsonResponse
    {
        if ($debtCollection->creditor_company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($debtCollection->reminder_count < 2) {
            return response()->json(['message' => 'At least 2 reminders must be sent before escalation.'], 422);
        }

        $debtCollection->update(['status' => 'collection_agency']);

        return response()->json([
            'message' => 'Case escalated to collection agency.',
            'data' => $debtCollection->fresh(),
        ]);
    }

    /**
     * Mark as paid (partial or full).
     */
    public function markPaid(Request $request, DebtCollection $debtCollection): JsonResponse
    {
        if ($debtCollection->creditor_company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $newCollected = $debtCollection->collected_amount + $request->amount;
        $isPaid = $newCollected >= $debtCollection->invoice_amount;

        $debtCollection->update([
            'collected_amount' => min($newCollected, $debtCollection->invoice_amount),
            'status' => $isPaid ? 'paid' : $debtCollection->status,
        ]);

        return response()->json([
            'message' => $isPaid ? 'Debt fully paid.' : 'Partial payment recorded.',
            'data' => $debtCollection->fresh(),
        ]);
    }

    /**
     * Cancel / write-off case.
     */
    public function cancel(Request $request, DebtCollection $debtCollection): JsonResponse
    {
        if ($debtCollection->creditor_company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'action' => 'required|in:cancel,write_off',
        ]);

        $debtCollection->update([
            'status' => $request->action === 'cancel' ? 'cancelled' : 'written_off',
        ]);

        return response()->json(['message' => 'Case ' . $request->action . 'led.']);
    }

    /**
     * Dashboard statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $stats = DebtCollection::where('creditor_company_id', $companyId)
            ->select(
                DB::raw('COUNT(*) as total_cases'),
                DB::raw("SUM(CASE WHEN status NOT IN ('paid','cancelled','written_off') THEN 1 ELSE 0 END) as active_cases"),
                DB::raw('SUM(invoice_amount) as total_owed'),
                DB::raw('SUM(collected_amount) as total_collected'),
                DB::raw("SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_cases"),
                DB::raw("SUM(CASE WHEN status = 'written_off' THEN 1 ELSE 0 END) as written_off_cases")
            )
            ->first();

        $stats->recovery_rate = $stats->total_owed > 0
            ? round(($stats->total_collected / $stats->total_owed) * 100, 1)
            : 0;

        return response()->json(['data' => $stats]);
    }

    /**
     * Fee calculator.
     */
    public function calculateFee(Request $request): JsonResponse
    {
        $request->validate(['amount' => 'required|numeric|min:0.01']);

        return response()->json([
            'data' => DebtCollection::calculateFee($request->amount),
        ]);
    }
}
