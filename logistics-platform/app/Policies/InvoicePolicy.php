<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Invoice;

/**
 * Invoice policy: admin + manager can view/create/update. Only admin can delete.
 */
class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function view(User $user, Invoice $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, Invoice $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, Invoice $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Invoice $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Invoice $record): bool
    {
        return $user->role === 'admin';
    }
}
