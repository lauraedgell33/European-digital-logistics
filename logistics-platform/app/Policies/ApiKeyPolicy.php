<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ApiKey;

/**
 * Admin-only policy for sensitive API key administration.
 */
class ApiKeyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, ApiKey $record): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, ApiKey $record): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, ApiKey $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, ApiKey $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, ApiKey $record): bool
    {
        return $user->role === 'admin';
    }
}
