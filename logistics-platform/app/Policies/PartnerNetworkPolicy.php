<?php

namespace App\Policies;

use App\Models\PartnerNetwork;
use App\Models\User;

class PartnerNetworkPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PartnerNetwork $network): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create');
    }

    /**
     * Only the network owner can invite members.
     */
    public function invite(User $user, PartnerNetwork $network): bool
    {
        return $user->company_id === $network->owner_company_id;
    }

    /**
     * Only the network owner can remove members.
     */
    public function removeMember(User $user, PartnerNetwork $network): bool
    {
        return $user->company_id === $network->owner_company_id;
    }

    /**
     * Any member (except owner) can leave.
     */
    public function leave(User $user, PartnerNetwork $network): bool
    {
        return $user->company_id !== $network->owner_company_id
            && $network->isMember($user->company);
    }
}
