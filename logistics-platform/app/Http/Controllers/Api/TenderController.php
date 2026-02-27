<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tender\StoreTenderRequest;
use App\Http\Requests\Tender\UpdateTenderRequest;
use App\Http\Requests\Tender\SubmitTenderBidRequest;
use App\Http\Resources\TenderResource;
use App\Http\Resources\TenderBidResource;
use App\Models\Tender;
use App\Models\TenderBid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        $query = Tender::where(function ($q) use ($company) {
                $q->where('is_public', true)
                    ->orWhere('company_id', $company->id)
                    ->orWhereIn('network_id', $company->networks()->pluck('partner_networks.id'));
            })
            ->with('company:id,name,country_code,rating')
            ->withCount('bids');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return TenderResource::collection(
            $query->orderBy('submission_deadline')->paginate($request->input('per_page', 20))
        )->response();
    }

    public function store(StoreTenderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $tender = Tender::create(array_merge($validated, [
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
            'status' => $validated['status'] ?? 'draft',
        ]));

        return (new TenderResource($tender->load('company')))
            ->additional(['message' => 'Tender created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Tender $tender): JsonResponse
    {
        $tender->load(['company', 'user:id,name']);

        if (request()->user()->company_id === $tender->company_id) {
            $tender->load('bids.company:id,name,country_code,rating');
        }

        return (new TenderResource($tender))->response();
    }

    public function update(UpdateTenderRequest $request, Tender $tender): JsonResponse
    {
        if (!in_array($tender->status, ['draft', 'open'])) {
            return response()->json(['message' => 'Tender cannot be edited in current status.'], 422);
        }

        $tender->update($request->validated());

        return (new TenderResource($tender->fresh()))
            ->additional(['message' => 'Tender updated.'])
            ->response();
    }

    public function submitBid(SubmitTenderBidRequest $request, Tender $tender): JsonResponse
    {
        $company = $request->user()->company;

        if (!$tender->canBid($company)) {
            return response()->json(['message' => 'You cannot bid on this tender.'], 422);
        }

        $bid = TenderBid::create(array_merge($request->validated(), [
            'tender_id' => $tender->id,
            'company_id' => $company->id,
            'user_id' => $request->user()->id,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]));

        return (new TenderBidResource($bid))
            ->additional(['message' => 'Bid submitted successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function awardBid(Request $request, Tender $tender, TenderBid $bid): JsonResponse
    {
        $this->authorize('awardBid', $tender);

        if ($bid->tender_id !== $tender->id) {
            return response()->json(['message' => 'Bid does not belong to this tender.'], 422);
        }

        $tender->award($bid);

        return (new TenderResource($tender->fresh()->load('bids.company:id,name')))
            ->additional(['message' => 'Tender awarded.'])
            ->response();
    }

    public function myTenders(Request $request): JsonResponse
    {
        $tenders = Tender::where('company_id', $request->user()->company_id)
            ->withCount('bids')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return TenderResource::collection($tenders)->response();
    }

    public function myBids(Request $request): JsonResponse
    {
        $bids = TenderBid::where('company_id', $request->user()->company_id)
            ->with('tender:id,title,status,submission_deadline,company_id', 'tender.company:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return TenderBidResource::collection($bids)->response();
    }
}
