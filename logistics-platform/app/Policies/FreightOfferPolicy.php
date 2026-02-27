<?php

namespace App\Policies;

use App\Models\FreightOffer;
use App\Models\User;

class FreightOfferPolicy
{
    /**
     * Anyone authenticated can list freight offers.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Anyone authenticated can view a freight offer.
     */
    public function view(User $user, FreightOffer $freight): bool
    {
        return true;
    }

    /**
     * Authenticated user with a company can create freight offers.
     */
    public function create(User $user): bool
    {
        return $user->company_id !== null;
    }

    /**
     * Only the owning company can update.
     */
    public function update(User $user, FreightOffer $freight): bool
    {
        return $user->company_id !== null
            && $user->company_id === $freight->company_id;
    }

    /**
     * Only the owning company or an admin can delete.
     */
    public function delete(User $user, FreightOffer $freight): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->company_id !== null
            && $user->company_id === $freight->company_id;
    }
}
