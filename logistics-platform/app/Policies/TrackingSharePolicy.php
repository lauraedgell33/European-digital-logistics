<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TrackingShare;

class TrackingSharePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function view(User $user, TrackingShare $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, TrackingShare $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, TrackingShare $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, TrackingShare $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, TrackingShare $record): bool
    {
        return $user->role === 'admin';
    }
}
