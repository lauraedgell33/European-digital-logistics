<?php

namespace App\Observers;

use App\Models\Company;

class CompanyObserver
{
    public function updated(Company $company): void
    {
        // When company gets verified, update verified_at if not set
        if ($company->isDirty('verification_status')) {
            $newStatus = is_string($company->verification_status) ? $company->verification_status : $company->verification_status->value;
            if ($newStatus === 'verified' && !$company->verified_at) {
                $company->withoutEvents(function () use ($company) {
                    $company->update(['verified_at' => now()]);
                });
            }
        }

        // When company is deactivated, deactivate all users
        if ($company->isDirty('is_active') && !$company->is_active) {
            $company->users()->update(['is_active' => false]);
        }
    }
}
