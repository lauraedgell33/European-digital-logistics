<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Network\StoreNetworkRequest;
use App\Models\PartnerNetwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NetworkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        $networks = $company->networks()
            ->withCount('activeMembers')
            ->with('owner:id,name')
            ->paginate($request->input('per_page', 20), ['*'], 'networks_page');

        $owned = $company->ownedNetworks()
            ->withCount('activeMembers')
            ->paginate($request->input('per_page', 20), ['*'], 'owned_page');

        return response()->json([
            'member_of' => $networks,
            'owned' => $owned,
        ]);
    }

    public function store(StoreNetworkRequest $request): JsonResponse
    {
        $network = PartnerNetwork::create(array_merge($request->validated(), [
            'owner_company_id' => $request->user()->company_id,
        ]));

        $network->addMember($request->user()->company, 'admin');

        return response()->json([
            'message' => 'Network created.',
            'data' => $network,
            'access_code' => $network->access_code,
        ], 201);
    }

    public function show(PartnerNetwork $network): JsonResponse
    {
        $network->load(['owner:id,name', 'activeMembers:id,name,country_code,type']);

        return response()->json(['data' => $network]);
    }

    public function join(Request $request): JsonResponse
    {
        $request->validate([
            'access_code' => 'required|string',
        ]);

        $network = PartnerNetwork::where('access_code', $request->access_code)->firstOrFail();
        $company = $request->user()->company;

        if ($network->isMember($company)) {
            return response()->json(['message' => 'Already a member.'], 422);
        }

        if ($network->isFull()) {
            return response()->json(['message' => 'Network is full.'], 422);
        }

        $network->addMember($company);

        return response()->json([
            'message' => 'Joined network successfully.',
            'data' => $network,
        ]);
    }

    public function invite(Request $request, PartnerNetwork $network): JsonResponse
    {
        $this->authorize('invite', $network);

        $request->validate([
            'company_id' => 'required|exists:companies,id',
        ]);

        $company = \App\Models\Company::findOrFail($request->company_id);

        if ($network->isMember($company)) {
            return response()->json(['message' => 'Company is already a member.'], 422);
        }

        $network->inviteMember($company, $request->user());

        return response()->json(['message' => 'Invitation sent.']);
    }

    public function removeMember(Request $request, PartnerNetwork $network, int $companyId): JsonResponse
    {
        $this->authorize('removeMember', $network);

        $company = \App\Models\Company::findOrFail($companyId);
        $network->removeMember($company);

        return response()->json(['message' => 'Member removed.']);
    }

    public function leave(Request $request, PartnerNetwork $network): JsonResponse
    {
        $this->authorize('leave', $network);

        $network->removeMember($request->user()->company);

        return response()->json(['message' => 'Left network.']);
    }
}
