<?php

namespace App\Policies;

use App\Models\User;
use App\Models\EdiMessage;

class EdiMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function view(User $user, EdiMessage $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, EdiMessage $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, EdiMessage $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, EdiMessage $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, EdiMessage $record): bool
    {
        return $user->role === 'admin';
    }
}
