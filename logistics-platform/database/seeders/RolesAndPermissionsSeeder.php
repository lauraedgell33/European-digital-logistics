<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ── Permissions ──────────────────────────────────────
        $permissions = [
            // General
            'view',
            'create',
            'edit',
            'delete',

            // Freight & Vehicle
            'freight.view',
            'freight.create',
            'freight.edit',
            'freight.delete',
            'vehicle.view',
            'vehicle.create',
            'vehicle.edit',
            'vehicle.delete',

            // Orders
            'order.view',
            'order.create',
            'order.accept',
            'order.reject',
            'order.cancel',
            'manage_orders',

            // Tenders
            'tender.view',
            'tender.create',
            'tender.edit',
            'tender.bid',
            'tender.award',

            // Tracking
            'tracking.view',
            'tracking.update_position',

            // Messaging
            'message.view',
            'message.send',

            // Company management
            'company.update',
            'manage_users',

            // Integrations
            'integration.import',
            'integration.export',
            'integration.webhook',

            // Analytics
            'analytics.view',

            // Network
            'network.create',
            'network.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        // ── Roles ────────────────────────────────────────────

        // Admin — full access
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $admin->syncPermissions(Permission::where('guard_name', 'sanctum')->get());

        // Manager — everything except company settings and user management is restricted
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'sanctum']);
        $manager->syncPermissions([
            'view', 'create', 'edit',
            'freight.view', 'freight.create', 'freight.edit', 'freight.delete',
            'vehicle.view', 'vehicle.create', 'vehicle.edit', 'vehicle.delete',
            'order.view', 'order.create', 'order.accept', 'order.reject', 'order.cancel',
            'manage_orders',
            'tender.view', 'tender.create', 'tender.edit', 'tender.bid', 'tender.award',
            'tracking.view', 'tracking.update_position',
            'message.view', 'message.send',
            'manage_users',
            'integration.import', 'integration.export',
            'analytics.view',
            'network.create', 'network.manage',
        ]);

        // Operator — day-to-day operations
        $operator = Role::firstOrCreate(['name' => 'operator', 'guard_name' => 'sanctum']);
        $operator->syncPermissions([
            'view', 'create', 'edit',
            'freight.view', 'freight.create', 'freight.edit',
            'vehicle.view', 'vehicle.create', 'vehicle.edit',
            'order.view', 'order.create',
            'tender.view', 'tender.bid',
            'tracking.view',
            'message.view', 'message.send',
            'analytics.view',
        ]);

        // Driver — limited to tracking and viewing
        $driver = Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'sanctum']);
        $driver->syncPermissions([
            'view',
            'order.view',
            'tracking.view', 'tracking.update_position',
            'message.view', 'message.send',
        ]);

        // ── Assign roles to existing users based on their role column ────
        User::chunk(100, function ($users) {
            foreach ($users as $user) {
                $roleName = $user->role ?? 'operator';
                if (Role::where('name', $roleName)->where('guard_name', 'sanctum')->exists()) {
                    $user->syncRoles([$roleName]);
                }
            }
        });
    }
}
