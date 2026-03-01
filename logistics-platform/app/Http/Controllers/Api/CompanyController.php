<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    /**
     * Company directory — list verified companies.
     * Uses Scout/Elasticsearch when a search term is provided.
     */
    public function index(Request $request): JsonResponse
    {
        $params = $request->only(['search', 'country', 'type', 'page', 'per_page']);
        $cacheKey = CacheService::publicKey('companies:list', $params);

        // If a meaningful search term is provided, use Scout (bypass cache for full-text)
        if ($request->filled('search') && strlen($request->search) >= 2) {
            $builder = Company::search($request->search);

            if ($request->filled('country')) {
                $builder->where('country_code', $request->country);
            }
            if ($request->filled('type')) {
                $builder->where('type', $request->type);
            }
            $builder->where('is_active', true);
            $builder->where('verification_status', 'verified');

            $results = $builder
                ->query(fn ($q) => $q->withCount(['freightOffers', 'vehicleOffers', 'users']))
                ->paginate($request->input('per_page', 24));

            return CompanyResource::collection($results)->response();
        }

        // Cache for 10 minutes — company data changes infrequently
        $companies = CacheService::remember($cacheKey, 600, function () use ($request) {
            $query = Company::query()
                ->verified()
                ->active()
                ->withCount(['freightOffers', 'vehicleOffers', 'users']);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%")
                      ->orWhere('country_code', 'like', "%{$search}%");
                });
            }

            if ($request->filled('country')) {
                $query->where('country_code', $request->country);
            }

            if ($request->filled('type')) {
                $query->ofType($request->type);
            }

            return $query->orderBy('name')->paginate(24);
        }, ['companies']);

        return CompanyResource::collection($companies)->response();
    }

    /**
     * Company profile detail.
     */
    public function show(Company $company): JsonResponse
    {
        $cacheKey = CacheService::publicKey('companies:detail', ['id' => $company->id]);

        $data = CacheService::remember($cacheKey, 600, function () use ($company) {
            $company->loadCount(['freightOffers', 'vehicleOffers', 'users']);
            $company->load('users:id,name,company_id');
            return $company;
        }, ['companies']);

        return (new CompanyResource($data))->response();
    }
}
