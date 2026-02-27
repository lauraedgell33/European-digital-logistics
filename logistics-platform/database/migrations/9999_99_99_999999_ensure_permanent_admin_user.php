<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Ensure the permanent admin user always exists after migrations.
     * This runs as a migration so it survives migrate:fresh.
     */
    public function up(): void
    {
        // Only insert if users table exists and admin doesn't already exist
        if (! DB::getSchemaBuilder()->hasTable('users') || ! DB::getSchemaBuilder()->hasTable('companies')) {
            return;
        }

        $company = DB::table('companies')->first();

        if (! $company) {
            $companyId = DB::table('companies')->insertGetId([
                'name'                => 'Platform Administration',
                'type'                => 'carrier',
                'vat_number'          => 'ADMIN000000',
                'country_code'        => 'DE',
                'address'             => 'Admin HQ',
                'city'                => 'Hamburg',
                'postal_code'         => '20457',
                'verification_status' => 'verified',
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);
        } else {
            $companyId = $company->id;
        }

        $exists = DB::table('users')->where('email', 'admin@logistics.eu')->exists();

        if (! $exists) {
            DB::table('users')->insert([
                'company_id'        => $companyId,
                'name'              => 'Admin User',
                'email'             => 'admin@logistics.eu',
                'password'          => Hash::make('Admin@2026!'),
                'role'              => 'admin',
                'phone'             => '+49 40 1234567',
                'language'          => 'en',
                'is_active'         => true,
                'email_verified_at' => now(),
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
        } else {
            // Ensure existing admin has correct role and is active
            DB::table('users')
                ->where('email', 'admin@logistics.eu')
                ->update([
                    'role'       => 'admin',
                    'is_active'  => true,
                    'deleted_at' => null,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // Never delete the admin — intentionally left empty
    }
};
