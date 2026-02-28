<?php

namespace App\Policies;

use App\Models\User;
use App\Models\EcmrDocument;

/**
 * eCMR document policy: admin + manager + operator can view and create.
 * Only admin/manager can update/delete.
 */
class EcmrDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager' || $user->role === 'operator';
    }

    public function view(User $user, EcmrDocument $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager' || $user->role === 'operator';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager' || $user->role === 'operator';
    }

    public function update(User $user, EcmrDocument $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, EcmrDocument $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function restore(User $user, EcmrDocument $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, EcmrDocument $record): bool
    {
        return $user->role === 'admin';
    }
}
