<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ApiUsageLog;

/**
 * Admin-only policy for sensitive API usage log administration.
 */
class ApiUsageLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, ApiUsageLog $record): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, ApiUsageLog $record): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, ApiUsageLog $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, ApiUsageLog $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, ApiUsageLog $record): bool
    {
        return $user->role === 'admin';
    }
}
