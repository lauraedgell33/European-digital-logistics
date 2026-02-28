<?php

namespace App\Policies;

use App\Models\User;
use App\Models\DynamicPrice;

class DynamicPricePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function view(User $user, DynamicPrice $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, DynamicPrice $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, DynamicPrice $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, DynamicPrice $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, DynamicPrice $record): bool
    {
        return $user->role === 'admin';
    }
}
