<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TrackingPosition;

/**
 * Tracking position policy: read-only for everyone (auto-generated data).
 * Admin can delete.
 */
class TrackingPositionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TrackingPosition $record): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, TrackingPosition $record): bool
    {
        return false;
    }

    public function delete(User $user, TrackingPosition $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, TrackingPosition $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, TrackingPosition $record): bool
    {
        return $user->role === 'admin';
    }
}
