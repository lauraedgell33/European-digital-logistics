<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Warehouse;

class WarehousePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function view(User $user, Warehouse $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, Warehouse $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, Warehouse $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Warehouse $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Warehouse $record): bool
    {
        return $user->role === 'admin';
    }
}
