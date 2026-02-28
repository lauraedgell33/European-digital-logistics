<?php

namespace App\Policies;

use App\Models\User;
use App\Models\EscrowPayment;

/**
 * Escrow payment policy: admin + manager can view/create/update. Only admin can delete.
 */
class EscrowPaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function view(User $user, EscrowPayment $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, EscrowPayment $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, EscrowPayment $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, EscrowPayment $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, EscrowPayment $record): bool
    {
        return $user->role === 'admin';
    }
}
