<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    /**
     * Company directory is visible to any authenticated user.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Any authenticated user can view a company profile.
     */
    public function view(User $user, Company $company): bool
    {
        return true;
    }

    /**
     * Only company admins can update their own company.
     */
    public function update(User $user, Company $company): bool
    {
        return $user->company_id === $company->id
            && $user->isAdmin();
    }

    /**
     * Admins and managers can create companies.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    /**
     * Only admins can delete companies.
     */
    public function delete(User $user, Company $company): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Only admins can restore companies.
     */
    public function restore(User $user, Company $company): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Only admins can force-delete companies.
     */
    public function forceDelete(User $user, Company $company): bool
    {
        return $user->role === 'admin';
    }
}
