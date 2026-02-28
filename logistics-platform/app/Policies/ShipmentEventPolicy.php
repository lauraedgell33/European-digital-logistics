<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ShipmentEvent;

/**
 * Shipment event policy: read-only for everyone (auto-generated data).
 * Admin can delete.
 */
class ShipmentEventPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ShipmentEvent $record): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, ShipmentEvent $record): bool
    {
        return false;
    }

    public function delete(User $user, ShipmentEvent $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, ShipmentEvent $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, ShipmentEvent $record): bool
    {
        return $user->role === 'admin';
    }
}
