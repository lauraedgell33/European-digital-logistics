<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(
        private readonly SearchService $searchService
    ) {}

    /**
     * Unified search across freight offers, vehicle offers, companies, and articles.
     *
     * GET /api/v1/search?q=Berlin&types[]=freight&types[]=vehicles
     *      &freight[origin_country]=DE&freight[vehicle_type]=tautliner
     *      &per_page=20&page=1
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:200',
            'types' => 'sometimes|array',
            'types.*' => 'string|in:freight,vehicles,companies,articles',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'page' => 'sometimes|integer|min:1',
            'freight' => 'sometimes|array',
            'vehicles' => 'sometimes|array',
            'companies' => 'sometimes|array',
            'articles' => 'sometimes|array',
        ]);

        $query = $request->input('q');
        $types = $request->input('types', ['freight', 'vehicles', 'companies', 'articles']);
        $perPage = $request->integer('per_page', 15);
        $page = $request->integer('page', 1);

        $filters = [
            'freight' => $request->input('freight', []),
            'vehicles' => $request->input('vehicles', []),
            'companies' => $request->input('companies', []),
            'articles' => $request->input('articles', []),
        ];

        $results = $this->searchService->search($query, $types, $filters, $perPage, $page);

        return response()->json($results);
    }

    /**
     * Autocomplete suggestions.
     *
     * GET /api/v1/search/suggest?q=Berl&type=freight&limit=5
     */
    public function suggest(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
            'type' => 'sometimes|string|in:all,freight,vehicles,companies',
            'limit' => 'sometimes|integer|min:1|max:20',
        ]);

        $suggestions = $this->searchService->suggest(
            $request->input('q'),
            $request->input('type', 'all'),
            $request->integer('limit', 10)
        );

        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * Search only freight offers (used by FreightController).
     *
     * GET /api/v1/search/freight?q=Hamburg&origin_country=DE&vehicle_type=tautliner
     */
    public function freight(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:200',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        $filters = $request->except(['q', 'per_page', 'page']);

        $results = $this->searchService->searchFreight(
            $request->input('q'),
            $filters,
            $request->integer('per_page', 15),
            $request->integer('page', 1)
        );

        return response()->json($results);
    }

    /**
     * Search only vehicle offers.
     *
     * GET /api/v1/search/vehicles?q=Curtainsider&current_country=PL
     */
    public function vehicles(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:200',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        $filters = $request->except(['q', 'per_page', 'page']);

        $results = $this->searchService->searchVehicles(
            $request->input('q'),
            $filters,
            $request->integer('per_page', 15),
            $request->integer('page', 1)
        );

        return response()->json($results);
    }

    /**
     * Search only companies.
     *
     * GET /api/v1/search/companies?q=TransLog&type=carrier
     */
    public function companies(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:200',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        $filters = $request->except(['q', 'per_page', 'page']);

        $results = $this->searchService->searchCompanies(
            $request->input('q'),
            $filters,
            $request->integer('per_page', 15),
            $request->integer('page', 1)
        );

        return response()->json($results);
    }
}
