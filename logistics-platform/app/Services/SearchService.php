<?php

namespace App\Services;

use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\Company;
use App\Models\LexiconArticle;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Laravel\Scout\Builder as ScoutBuilder;

class SearchService
{
    /**
     * Unified search across all searchable models.
     *
     * @param string       $query    Search term
     * @param array        $types    Model types to search: freight, vehicles, companies, articles
     * @param array        $filters  Additional filters per type
     * @param int          $perPage  Results per page per type
     * @param int          $page     Current page
     * @return array<string, mixed>
     */
    public function search(
        string $query,
        array $types = ['freight', 'vehicles', 'companies', 'articles'],
        array $filters = [],
        int $perPage = 15,
        int $page = 1
    ): array {
        $results = [];

        if (in_array('freight', $types)) {
            $results['freight'] = $this->searchFreight($query, $filters['freight'] ?? [], $perPage, $page);
        }

        if (in_array('vehicles', $types)) {
            $results['vehicles'] = $this->searchVehicles($query, $filters['vehicles'] ?? [], $perPage, $page);
        }

        if (in_array('companies', $types)) {
            $results['companies'] = $this->searchCompanies($query, $filters['companies'] ?? [], $perPage, $page);
        }

        if (in_array('articles', $types)) {
            $results['articles'] = $this->searchArticles($query, $filters['articles'] ?? [], $perPage, $page);
        }

        return [
            'query' => $query,
            'types' => $types,
            'results' => $results,
            'total' => collect($results)->sum(fn ($r) => $r['total'] ?? 0),
        ];
    }

    /**
     * Search freight offers with geo-distance support.
     */
    public function searchFreight(string $query, array $filters = [], int $perPage = 15, int $page = 1): array
    {
        $builder = FreightOffer::search($query)
            ->query(fn ($q) => $q->with(['company:id,name,country_code,rating']));

        // Apply Scout filters
        $this->applyFreightFilters($builder, $filters);

        $results = $builder->paginate($perPage, 'page', $page);

        return $this->formatPaginatedResults($results, 'freight_offers');
    }

    /**
     * Search vehicle offers with geo-distance support.
     */
    public function searchVehicles(string $query, array $filters = [], int $perPage = 15, int $page = 1): array
    {
        $builder = VehicleOffer::search($query)
            ->query(fn ($q) => $q->with(['company:id,name,country_code,rating']));

        $this->applyVehicleFilters($builder, $filters);

        $results = $builder->paginate($perPage, 'page', $page);

        return $this->formatPaginatedResults($results, 'vehicle_offers');
    }

    /**
     * Search companies.
     */
    public function searchCompanies(string $query, array $filters = [], int $perPage = 15, int $page = 1): array
    {
        $builder = Company::search($query);

        if (!empty($filters['type'])) {
            $builder->where('type', $filters['type']);
        }
        if (!empty($filters['country_code'])) {
            $builder->where('country_code', $filters['country_code']);
        }
        if (isset($filters['is_active'])) {
            $builder->where('is_active', (bool) $filters['is_active']);
        }
        if (!empty($filters['verification_status'])) {
            $builder->where('verification_status', $filters['verification_status']);
        }

        $results = $builder->paginate($perPage, 'page', $page);

        return $this->formatPaginatedResults($results, 'companies');
    }

    /**
     * Search lexicon articles.
     */
    public function searchArticles(string $query, array $filters = [], int $perPage = 15, int $page = 1): array
    {
        $builder = LexiconArticle::search($query);

        if (!empty($filters['category'])) {
            $builder->where('category', $filters['category']);
        }
        if (!empty($filters['language'])) {
            $builder->where('language', $filters['language']);
        }
        if (!isset($filters['include_unpublished']) || !$filters['include_unpublished']) {
            $builder->where('is_published', true);
        }

        $results = $builder->paginate($perPage, 'page', $page);

        return $this->formatPaginatedResults($results, 'lexicon_articles');
    }

    /**
     * Suggest autocomplete terms.
     */
    public function suggest(string $query, string $type = 'all', int $limit = 10): array
    {
        $suggestions = [];

        if (in_array($type, ['all', 'freight'])) {
            $suggestions['freight'] = FreightOffer::search($query)
                ->take($limit)
                ->get()
                ->map(fn ($f) => [
                    'id' => $f->id,
                    'text' => "{$f->origin_city} → {$f->destination_city}",
                    'type' => 'freight',
                    'meta' => "{$f->cargo_type} · {$f->weight}t",
                ]);
        }

        if (in_array($type, ['all', 'vehicles'])) {
            $suggestions['vehicles'] = VehicleOffer::search($query)
                ->take($limit)
                ->get()
                ->map(fn ($v) => [
                    'id' => $v->id,
                    'text' => "{$v->vehicle_type} in {$v->current_city}",
                    'type' => 'vehicle',
                    'meta' => "{$v->capacity_kg}kg",
                ]);
        }

        if (in_array($type, ['all', 'companies'])) {
            $suggestions['companies'] = Company::search($query)
                ->take($limit)
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'text' => $c->name,
                    'type' => 'company',
                    'meta' => "{$c->city}, {$c->country_code}",
                ]);
        }

        return $suggestions;
    }

    // ── Private helpers ─────────────────────────────────

    private function applyFreightFilters(ScoutBuilder $builder, array $filters): void
    {
        if (!empty($filters['origin_country'])) {
            $builder->where('origin_country', $filters['origin_country']);
        }
        if (!empty($filters['destination_country'])) {
            $builder->where('destination_country', $filters['destination_country']);
        }
        if (!empty($filters['vehicle_type'])) {
            $builder->where('vehicle_type', $filters['vehicle_type']);
        }
        if (!empty($filters['cargo_type'])) {
            $builder->where('cargo_type', $filters['cargo_type']);
        }
        if (isset($filters['is_hazardous'])) {
            $builder->where('is_hazardous', (bool) $filters['is_hazardous']);
        }
        if (!empty($filters['status'])) {
            $builder->where('status', $filters['status']);
        } else {
            $builder->where('status', 'active');
        }
        if (isset($filters['is_public'])) {
            $builder->where('is_public', (bool) $filters['is_public']);
        }
        if (!empty($filters['loading_date_from'])) {
            $builder->where('loading_date', '>=', $filters['loading_date_from']);
        }
        if (!empty($filters['loading_date_to'])) {
            $builder->where('loading_date', '<=', $filters['loading_date_to']);
        }
        if (!empty($filters['max_weight'])) {
            $builder->where('weight', '<=', (float) $filters['max_weight']);
        }
    }

    private function applyVehicleFilters(ScoutBuilder $builder, array $filters): void
    {
        if (!empty($filters['current_country'])) {
            $builder->where('current_country', $filters['current_country']);
        }
        if (!empty($filters['vehicle_type'])) {
            $builder->where('vehicle_type', $filters['vehicle_type']);
        }
        if (isset($filters['has_adr'])) {
            $builder->where('has_adr', (bool) $filters['has_adr']);
        }
        if (isset($filters['has_temperature_control'])) {
            $builder->where('has_temperature_control', (bool) $filters['has_temperature_control']);
        }
        if (!empty($filters['status'])) {
            $builder->where('status', $filters['status']);
        } else {
            $builder->where('status', 'available');
        }
        if (!empty($filters['available_from'])) {
            $builder->where('available_from', '<=', $filters['available_from']);
        }
        if (!empty($filters['min_capacity_kg'])) {
            $builder->where('capacity_kg', '>=', (float) $filters['min_capacity_kg']);
        }
    }

    private function formatPaginatedResults(LengthAwarePaginator $paginator, string $type): array
    {
        return [
            'data' => $paginator->items(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'type' => $type,
        ];
    }
}
