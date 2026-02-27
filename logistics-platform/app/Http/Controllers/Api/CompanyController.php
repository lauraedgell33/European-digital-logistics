<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    /**
     * Company directory — list verified companies.
     */
    public function index(Request $request): JsonResponse
    {
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

        $companies = $query->orderBy('name')->paginate(24);

        return CompanyResource::collection($companies)->response();
    }

    /**
     * Company profile detail.
     */
    public function show(Company $company): JsonResponse
    {
        $company->loadCount(['freightOffers', 'vehicleOffers', 'users']);
        $company->load('users:id,name,company_id');

        return (new CompanyResource($company))->response();
    }
}
