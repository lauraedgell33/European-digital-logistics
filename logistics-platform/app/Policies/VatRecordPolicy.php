<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VatRecord;

class VatRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function view(User $user, VatRecord $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, VatRecord $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, VatRecord $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, VatRecord $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, VatRecord $record): bool
    {
        return $user->role === 'admin';
    }
}
