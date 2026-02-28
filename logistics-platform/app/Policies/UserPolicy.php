<?php

namespace App\Policies;

use App\Models\User;

/**
 * User policy: admin-only for create/update/delete.
 * Cannot delete yourself. Cannot modify permanent admin unless you are one.
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, User $record): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, User $record): bool
    {
        if ($record->isPermanentAdmin() && !$user->isPermanentAdmin()) {
            return false;
        }

        return $user->role === 'admin';
    }

    public function delete(User $user, User $record): bool
    {
        if ($record->isPermanentAdmin()) {
            return false;
        }

        if ($user->id === $record->id) {
            return false;
        }

        return $user->role === 'admin';
    }

    public function restore(User $user, User $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, User $record): bool
    {
        if ($record->isPermanentAdmin()) {
            return false;
        }

        if ($user->id === $record->id) {
            return false;
        }

        return $user->role === 'admin';
    }
}
