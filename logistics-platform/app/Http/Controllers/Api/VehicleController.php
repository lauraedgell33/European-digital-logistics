<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\StoreVehicleOfferRequest;
use App\Http\Requests\Vehicle\UpdateVehicleOfferRequest;
use App\Http\Resources\VehicleOfferResource;
use App\Models\VehicleOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        $query = QueryBuilder::for(VehicleOffer::class)
            ->allowedFilters([
                AllowedFilter::exact('current_country'),
                AllowedFilter::partial('current_city'),
                AllowedFilter::exact('vehicle_type'),
                AllowedFilter::exact('status'),
                AllowedFilter::scope('with_min_capacity', 'withMinCapacity'),
                AllowedFilter::scope('with_adr', 'withAdr'),
                AllowedFilter::scope('with_temperature_control', 'withTemperatureControl'),
            ])
            ->allowedSorts(['available_from', 'capacity_kg', 'price_per_km', 'created_at'])
            ->where(function ($q) use ($company) {
                $q->where('is_public', true)
                    ->orWhere('company_id', $company->id)
                    ->orWhereIn('network_id', $company->networks()->pluck('partner_networks.id'));
            })
            ->where('status', 'available')
            ->with('company:id,name,country_code,rating,verification_status');

        return VehicleOfferResource::collection($query->paginate($request->input('per_page', 20)))->response();
    }

    public function store(StoreVehicleOfferRequest $request): JsonResponse
    {
        $vehicle = VehicleOffer::create(array_merge($request->validated(), [
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
        ]));

        return (new VehicleOfferResource($vehicle->load('company')))
            ->additional(['message' => 'Vehicle offer created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(VehicleOffer $vehicle): JsonResponse
    {
        return (new VehicleOfferResource($vehicle->load(['company', 'user:id,name,phone'])))->response();
    }

    public function update(UpdateVehicleOfferRequest $request, VehicleOffer $vehicle): JsonResponse
    {
        $vehicle->update($request->validated());

        return (new VehicleOfferResource($vehicle->fresh()->load('company')))
            ->additional(['message' => 'Vehicle offer updated.'])
            ->response();
    }

    public function destroy(Request $request, VehicleOffer $vehicle): JsonResponse
    {
        $this->authorize('delete', $vehicle);

        $vehicle->update(['status' => 'unavailable']);
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle offer removed.']);
    }

    public function search(Request $request): JsonResponse
    {
        $query = VehicleOffer::available()->with('company:id,name,country_code,rating');

        if ($request->current_country) {
            $query->where('current_country', $request->current_country);
        }
        if ($request->current_city) {
            $query->where('current_city', 'LIKE', "%{$request->current_city}%");
        }
        if ($request->vehicle_type) {
            $query->where('vehicle_type', $request->vehicle_type);
        }
        if ($request->min_capacity) {
            $query->where('capacity_kg', '>=', $request->min_capacity);
        }
        if ($request->available_date) {
            $query->where('available_from', '<=', $request->available_date);
        }
        if ($request->has_adr) {
            $query->where('has_adr', true);
        }
        if ($request->has_temperature_control) {
            $query->where('has_temperature_control', true);
        }

        return VehicleOfferResource::collection(
            $query->orderBy('available_from')->paginate($request->input('per_page', 20))
        )->response();
    }

    public function myOffers(Request $request): JsonResponse
    {
        $offers = VehicleOffer::where('company_id', $request->user()->company_id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return VehicleOfferResource::collection($offers)->response();
    }
}
