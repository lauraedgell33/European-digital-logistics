<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EcmrDocument;
use App\Models\SmartContract;
use App\Models\DigitalIdentity;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BlockchainController extends Controller
{
    public function __construct(
        private readonly BlockchainService $blockchainService
    ) {}

    // ── eCMR ──────────────────────────────────────

    public function createEcmr(Request $request): JsonResponse
    {
        $request->validate([
            'sender_name' => 'required|string|max:255',
            'sender_address' => 'required|string',
            'sender_country' => 'required|string|size:2',
            'carrier_name' => 'nullable|string|max:255',
            'consignee_name' => 'nullable|string|max:255',
            'place_of_taking_over' => 'required|string',
            'place_of_delivery' => 'required|string',
            'goods_description' => 'required|array',
            'gross_weight_kg' => 'nullable|numeric|min:0',
            'transport_order_id' => 'nullable|exists:transport_orders,id',
        ]);

        $data = $request->all();
        $data['sender_company_id'] = $request->user()->company_id;

        $ecmr = $this->blockchainService->createEcmr($data, $request->user()->id);

        return response()->json([
            'message' => 'eCMR created.',
            'data' => $ecmr,
        ], 201);
    }

    public function listEcmr(Request $request): JsonResponse
    {
        $ecmrs = EcmrDocument::where(function ($q) use ($request) {
            $q->where('sender_company_id', $request->user()->company_id)
                ->orWhere('carrier_company_id', $request->user()->company_id)
                ->orWhere('consignee_company_id', $request->user()->company_id);
        })
            ->with(['senderCompany:id,name', 'carrierCompany:id,name', 'consigneeCompany:id,name'])
            ->when($request->input('status'), fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($ecmrs);
    }

    public function showEcmr(EcmrDocument $ecmr): JsonResponse
    {
        return response()->json(['data' => $ecmr->load(['senderCompany', 'carrierCompany', 'consigneeCompany'])]);
    }

    public function signEcmr(Request $request, EcmrDocument $ecmr): JsonResponse
    {
        $request->validate(['role' => 'required|in:sender,carrier,consignee']);
        $ecmr = $this->blockchainService->signEcmr($ecmr, $request->input('role'), $request->user()->id);

        return response()->json([
            'message' => "eCMR signed as {$request->input('role')}.",
            'data' => $ecmr,
        ]);
    }

    public function verifyEcmr(EcmrDocument $ecmr): JsonResponse
    {
        return response()->json([
            'data' => [
                'ecmr_number' => $ecmr->ecmr_number,
                'is_fully_signed' => $ecmr->isFullySigned(),
                'is_on_blockchain' => $ecmr->isOnBlockchain(),
                'blockchain_tx_hash' => $ecmr->blockchain_tx_hash,
                'ipfs_hash' => $ecmr->ipfs_hash,
                'signatures' => [
                    'sender' => ['signed' => (bool)$ecmr->sender_signature_hash, 'at' => $ecmr->sender_signed_at],
                    'carrier' => ['signed' => (bool)$ecmr->carrier_signature_hash, 'at' => $ecmr->carrier_signed_at],
                    'consignee' => ['signed' => (bool)$ecmr->consignee_signature_hash, 'at' => $ecmr->consignee_signed_at],
                ],
                'status' => $ecmr->status,
            ],
        ]);
    }

    // ── Smart Contracts ──────────────────────────

    public function createContract(Request $request): JsonResponse
    {
        $request->validate([
            'contract_type' => 'required|in:payment_release,insurance_trigger,penalty,milestone',
            'conditions' => 'required|array',
            'actions' => 'required|array',
            'value' => 'nullable|numeric|min:0',
            'party_b_company_id' => 'nullable|exists:companies,id',
            'transport_order_id' => 'nullable|exists:transport_orders,id',
        ]);

        $data = $request->all();
        $data['party_a_company_id'] = $request->user()->company_id;

        $contract = $this->blockchainService->createSmartContract($data);

        return response()->json(['message' => 'Smart contract created.', 'data' => $contract], 201);
    }

    public function listContracts(Request $request): JsonResponse
    {
        $contracts = SmartContract::where(function ($q) use ($request) {
            $q->where('party_a_company_id', $request->user()->company_id)
                ->orWhere('party_b_company_id', $request->user()->company_id);
        })
            ->with(['partyA:id,name', 'partyB:id,name', 'transportOrder:id,order_number'])
            ->when($request->input('status'), fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($contracts);
    }

    public function evaluateContract(SmartContract $contract): JsonResponse
    {
        $contract = $this->blockchainService->evaluateContract($contract);
        return response()->json(['data' => $contract]);
    }

    // ── Digital Identity ─────────────────────────

    public function getIdentity(Request $request): JsonResponse
    {
        $identity = $this->blockchainService->getOrCreateIdentity(
            $request->user()->company_id,
            $request->user()->id
        );

        return response()->json(['data' => $identity]);
    }

    public function verifyIdentity(Request $request): JsonResponse
    {
        $request->validate([
            'level' => 'required|in:basic,enhanced,certified',
            'documents' => 'nullable|array',
        ]);

        $identity = DigitalIdentity::where('company_id', $request->user()->company_id)->firstOrFail();
        $verified = $this->blockchainService->verifyIdentity(
            $identity,
            $request->input('level'),
            $request->input('documents', [])
        );

        return response()->json(['message' => 'Identity verified.', 'data' => $verified]);
    }
}
