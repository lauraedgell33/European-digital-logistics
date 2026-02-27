<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Company;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class EnsureAdminUser extends Command
{
    protected $signature = 'admin:ensure';

    protected $description = 'Ensure the permanent admin user exists (safe to run on every deploy)';

    public function handle(): int
    {
        $company = Company::first();

        if (! $company) {
            $company = Company::create([
                'name'                => 'Platform Administration',
                'type'                => 'carrier',
                'vat_number'          => 'ADMIN000000',
                'country_code'        => 'DE',
                'address'             => 'Admin HQ',
                'city'                => 'Hamburg',
                'postal_code'         => '20457',
                'verification_status' => 'verified',
            ]);
            $this->info('Created default company for admin user.');
        }

        $admin = User::withTrashed()->updateOrCreate(
            ['email' => User::ADMIN_EMAIL],
            [
                'company_id'        => $company->id,
                'name'              => 'Admin User',
                'password'          => Hash::make('Admin@2026!'),
                'role'              => 'admin',
                'phone'             => '+49 40 1234567',
                'language'          => 'en',
                'is_active'         => true,
                'email_verified_at' => now(),
                'deleted_at'        => null, // restore if soft-deleted
            ]
        );

        // Assign Spatie admin role if it exists
        $adminRole = Role::where('name', 'admin')->where('guard_name', 'sanctum')->first();
        if ($adminRole && ! $admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        $this->info("Permanent admin user ensured: {$admin->email} (ID: {$admin->id})");

        return self::SUCCESS;
    }
}
