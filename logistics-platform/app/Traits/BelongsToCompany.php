<?php

namespace App\Traits;

use App\Models\Company;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Multi-tenancy trait — scopes queries to the authenticated user's company.
 *
 * Usage:
 *   1. Add `use BelongsToCompany;` to any model with a `company_id` column.
 *   2. The global scope automatically filters queries by the logged-in user's company.
 *   3. Admins bypass the scope (see isAdmin check).
 *   4. new records automatically get `company_id` set on creation.
 */
trait BelongsToCompany
{
    /**
     * Boot the trait — register the global scope.
     */
    public static function bootBelongsToCompany(): void
    {
        static::addGlobalScope('company', function (Builder $builder) {
            $user = auth()->user();

            if ($user && $user->company_id && $user->role !== 'admin') {
                $builder->where(
                    $builder->getModel()->getTable() . '.company_id',
                    $user->company_id
                );
            }
        });

        // Auto-assign company_id on creation
        static::creating(function ($model) {
            $user = auth()->user();

            if ($user && $user->company_id && empty($model->company_id)) {
                $model->company_id = $user->company_id;
            }
        });
    }

    /**
     * Relationship to the owning company.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Scope: query without company filter (for admin use).
     */
    public function scopeWithoutCompanyScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('company');
    }

    /**
     * Scope: filter by specific company.
     */
    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->withoutGlobalScope('company')
            ->where($this->getTable() . '.company_id', $companyId);
    }

    /**
     * Check if the model belongs to the given company.
     */
    public function belongsToCompany(int $companyId): bool
    {
        return $this->company_id === $companyId;
    }

    /**
     * Check if the model belongs to the authenticated user's company.
     */
    public function belongsToCurrentCompany(): bool
    {
        $user = auth()->user();
        return $user && $this->company_id === $user->company_id;
    }
}
