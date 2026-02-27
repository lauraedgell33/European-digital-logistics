<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Freight\StoreFreightOfferRequest;
use App\Http\Requests\Freight\UpdateFreightOfferRequest;
use App\Http\Requests\Freight\SearchFreightOfferRequest;
use App\Http\Resources\FreightOfferResource;
use App\Models\FreightOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class FreightController extends Controller
{
    /**
     * List freight offers with filtering, sorting and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        $query = QueryBuilder::for(FreightOffer::class)
            ->allowedFilters([
                AllowedFilter::exact('origin_country'),
                AllowedFilter::exact('destination_country'),
                AllowedFilter::partial('origin_city'),
                AllowedFilter::partial('destination_city'),
                AllowedFilter::exact('vehicle_type'),
                AllowedFilter::exact('status'),
                AllowedFilter::exact('cargo_type'),
                AllowedFilter::scope('loading_between', 'loadingBetween'),
                AllowedFilter::scope('max_weight', 'maxWeight'),
            ])
            ->allowedSorts(['loading_date', 'price', 'weight', 'created_at', 'distance_km'])
            ->allowedIncludes(['company', 'user'])
            ->where(function ($q) use ($company) {
                $q->where('is_public', true)
                    ->orWhere('company_id', $company->id)
                    ->orWhereIn('network_id', $company->networks()->pluck('partner_networks.id'));
            })
            ->where('status', 'active')
            ->with('company:id,name,country_code,rating,verification_status');

        $perPage = min($request->input('per_page', 20), 100);

        return FreightOfferResource::collection($query->paginate($perPage))->response();
    }

    /**
     * Create a new freight offer.
     */
    public function store(StoreFreightOfferRequest $request): JsonResponse
    {
        $freight = FreightOffer::create(array_merge($request->validated(), [
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
        ]));

        return (new FreightOfferResource($freight->load('company')))
            ->additional(['message' => 'Freight offer created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a specific freight offer.
     */
    public function show(FreightOffer $freight): JsonResponse
    {
        return (new FreightOfferResource($freight->load(['company', 'user:id,name,phone,email'])))->response();
    }

    /**
     * Update a freight offer.
     */
    public function update(UpdateFreightOfferRequest $request, FreightOffer $freight): JsonResponse
    {
        $freight->update($request->validated());

        return (new FreightOfferResource($freight->fresh()->load('company')))
            ->additional(['message' => 'Freight offer updated.'])
            ->response();
    }

    /**
     * Delete (cancel) a freight offer.
     */
    public function destroy(Request $request, FreightOffer $freight): JsonResponse
    {
        $this->authorize('delete', $freight);

        $freight->update(['status' => 'cancelled']);
        $freight->delete();

        return response()->json(['message' => 'Freight offer cancelled.']);
    }

    /**
     * Search freight offers with advanced filters.
     */
    public function search(SearchFreightOfferRequest $request): JsonResponse
    {

        $query = FreightOffer::active()->with('company:id,name,country_code,rating');

        if ($request->origin_country) {
            $query->where('origin_country', $request->origin_country);
        }
        if ($request->origin_city) {
            $query->where('origin_city', 'LIKE', "%{$request->origin_city}%");
        }
        if ($request->destination_country) {
            $query->where('destination_country', $request->destination_country);
        }
        if ($request->destination_city) {
            $query->where('destination_city', 'LIKE', "%{$request->destination_city}%");
        }
        if ($request->loading_date_from) {
            $query->where('loading_date', '>=', $request->loading_date_from);
        }
        if ($request->loading_date_to) {
            $query->where('loading_date', '<=', $request->loading_date_to);
        }
        if ($request->vehicle_type) {
            $query->where('vehicle_type', $request->vehicle_type);
        }
        if ($request->max_weight) {
            $query->where('weight', '<=', $request->max_weight);
        }
        if ($request->min_weight) {
            $query->where('weight', '>=', $request->min_weight);
        }
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        // Radius search using Haversine formula
        if ($request->origin_lat && $request->origin_lng && $request->radius_km) {
            $lat = $request->origin_lat;
            $lng = $request->origin_lng;
            $radius = $request->radius_km;

            $query->whereRaw("
                (6371 * acos(cos(radians(?)) * cos(radians(origin_lat))
                * cos(radians(origin_lng) - radians(?))
                + sin(radians(?)) * sin(radians(origin_lat)))) <= ?
            ", [$lat, $lng, $lat, $radius]);
        }

        $results = $query->orderBy('loading_date')
            ->paginate($request->input('per_page', 20));

        return FreightOfferResource::collection($results)->response();
    }

    /**
     * Get my company's freight offers.
     */
    public function myOffers(Request $request): JsonResponse
    {
        $offers = FreightOffer::where('company_id', $request->user()->company_id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return FreightOfferResource::collection($offers)->response();
    }
}
