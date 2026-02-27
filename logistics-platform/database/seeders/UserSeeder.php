<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();

        // Admin user (permanent — cannot be deleted)
        User::updateOrCreate(
            ['email' => 'admin@logistics.eu'],
            [
                'company_id' => $companies->first()->id,
                'name' => 'Admin User',
                'password' => Hash::make('Admin@2026!'),
                'role' => 'admin',
                'phone' => '+49 40 1234567',
                'language' => 'en',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Company managers
        foreach ($companies as $company) {
            User::create([
                'company_id' => $company->id,
                'name' => "Manager at {$company->name}",
                'email' => 'manager@' . strtolower(str_replace(' ', '', $company->name)) . '.eu',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'phone' => '+49 123 ' . rand(1000000, 9999999),
                'language' => match ($company->country_code) {
                    'DE' => 'de',
                    'FR' => 'fr',
                    'PL' => 'pl',
                    'IT' => 'it',
                    'ES' => 'es',
                    default => 'en',
                },
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            // Operators (dispatchers)
            for ($i = 1; $i <= 2; $i++) {
                User::create([
                    'company_id' => $company->id,
                    'name' => "Dispatcher {$i} at {$company->name}",
                    'email' => "dispatcher{$i}@" . strtolower(str_replace(' ', '', $company->name)) . '.eu',
                    'password' => Hash::make('password'),
                    'role' => 'operator',
                    'phone' => '+49 123 ' . rand(1000000, 9999999),
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
            }
        }
    }
}
