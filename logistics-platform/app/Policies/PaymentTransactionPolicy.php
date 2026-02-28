<?php

namespace App\Policies;

use App\Models\User;
use App\Models\PaymentTransaction;

/**
 * Payment transaction policy: admin + manager can view/create/update. Only admin can delete.
 */
class PaymentTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function view(User $user, PaymentTransaction $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, PaymentTransaction $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, PaymentTransaction $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, PaymentTransaction $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, PaymentTransaction $record): bool
    {
        return $user->role === 'admin';
    }
}
