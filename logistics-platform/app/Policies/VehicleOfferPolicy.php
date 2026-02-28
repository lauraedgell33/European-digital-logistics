<?php

namespace App\Policies;

use App\Models\VehicleOffer;
use App\Models\User;

class VehicleOfferPolicy
{
    /**
     * Anyone authenticated can list vehicle offers.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Anyone authenticated can view a vehicle offer.
     */
    public function view(User $user, VehicleOffer $vehicle): bool
    {
        return true;
    }

    /**
     * Any authenticated user can create vehicle offers.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('create');
    }

    /**
     * Only the owning company can update.
     */
    public function update(User $user, VehicleOffer $vehicle): bool
    {
        return $user->company_id === $vehicle->company_id
            && $user->hasPermission('edit');
    }

    /**
     * Only the owning company can delete.
     */
    public function delete(User $user, VehicleOffer $vehicle): bool
    {
        return $user->company_id === $vehicle->company_id
            && $user->hasPermission('edit');
    }

    public function restore(User $user, VehicleOffer $vehicle): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, VehicleOffer $vehicle): bool
    {
        return $user->role === 'admin';
    }
}
