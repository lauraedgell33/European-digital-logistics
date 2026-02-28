<?php

namespace App\Policies;

use App\Models\Tender;
use App\Models\User;

class TenderPolicy
{
    /**
     * Anyone authenticated can list tenders.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Anyone authenticated can view a tender.
     */
    public function view(User $user, Tender $tender): bool
    {
        return true;
    }

    /**
     * Authenticated user with a company can create tenders.
     */
    public function create(User $user): bool
    {
        return $user->company_id !== null;
    }

    /**
     * Only the creator's company can update.
     */
    public function update(User $user, Tender $tender): bool
    {
        return $user->company_id !== null
            && $user->company_id === $tender->company_id;
    }

    /**
     * Only the creator's company or an admin can delete.
     */
    public function delete(User $user, Tender $tender): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->company_id !== null
            && $user->company_id === $tender->company_id;
    }

    /**
     * Only the owning company can award a bid.
     */
    public function awardBid(User $user, Tender $tender): bool
    {
        return $user->company_id === $tender->company_id;
    }

    /**
     * Any authenticated user can submit a bid — except the tender creator.
     */
    public function submitBid(User $user, Tender $tender): bool
    {
        return $user->company_id !== null
            && $user->company_id !== $tender->company_id;
    }

    public function restore(User $user, Tender $tender): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Tender $tender): bool
    {
        return $user->role === 'admin';
    }
}
