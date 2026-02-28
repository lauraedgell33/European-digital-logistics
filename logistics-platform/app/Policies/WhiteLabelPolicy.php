<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WhiteLabel;

/**
 * Admin-only policy for sensitive white-label administration.
 */
class WhiteLabelPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, WhiteLabel $record): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, WhiteLabel $record): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, WhiteLabel $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, WhiteLabel $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, WhiteLabel $record): bool
    {
        return $user->role === 'admin';
    }
}
