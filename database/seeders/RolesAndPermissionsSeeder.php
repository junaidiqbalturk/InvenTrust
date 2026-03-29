<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Define Permissions
        $permissions = [
            ['name' => 'view_clients', 'module' => 'clients'],
            ['name' => 'create_clients', 'module' => 'clients'],
            ['name' => 'edit_clients', 'module' => 'clients'],
            ['name' => 'delete_clients', 'module' => 'clients'],
            ['name' => 'view_invoices', 'module' => 'invoices'],
            ['name' => 'create_invoices', 'module' => 'invoices'],
            ['name' => 'edit_invoices', 'module' => 'invoices'],
            ['name' => 'delete_invoices', 'module' => 'invoices'],
            ['name' => 'approve_invoices', 'module' => 'invoices'],
            ['name' => 'view_vouchers', 'module' => 'vouchers'],
            ['name' => 'create_vouchers', 'module' => 'vouchers'],
            ['name' => 'edit_vouchers', 'module' => 'vouchers'],
            ['name' => 'delete_vouchers', 'module' => 'vouchers'],
            ['name' => 'approve_vouchers', 'module' => 'vouchers'],
            ['name' => 'view_inventory', 'module' => 'inventory'],
            ['name' => 'update_inventory', 'module' => 'inventory'],
            ['name' => 'view_pos', 'module' => 'procurement'],
            ['name' => 'create_pos', 'module' => 'procurement'],
            ['name' => 'approve_pos', 'module' => 'procurement'],
            ['name' => 'manage_roles', 'module' => 'admin'],
            ['name' => 'manage_users', 'module' => 'admin'],
            ['name' => 'view_documents', 'module' => 'documents'],
            ['name' => 'create_documents', 'module' => 'documents'],
            ['name' => 'manage_documents', 'module' => 'documents'],
            ['name' => 'delete_documents', 'module' => 'documents'],
        ];

        foreach ($permissions as $p) {
            Permission::updateOrCreate(['name' => $p['name']], $p);
        }

        // 2. Define Roles
        $roles = [
            'Admin' => ['description' => 'Full system access', 'permissions' => Permission::all()->pluck('name')->toArray()],
            'Accountant' => [
                'description' => 'Accounting and finance management', 
                'permissions' => ['view_vouchers', 'create_vouchers', 'view_invoices', 'create_invoices', 'view_clients', 'approve_vouchers', 'approve_invoices']
            ],
            'Viewer' => [
                'description' => 'Read-only access',
                'permissions' => ['view_clients', 'view_invoices', 'view_vouchers', 'view_inventory', 'view_pos']
            ],
        ];

        foreach ($roles as $roleName => $data) {
            $role = Role::updateOrCreate(['name' => $roleName], ['description' => $data['description']]);
            $permissionIds = Permission::whereIn('name', $data['permissions'])->pluck('id');
            $role->permissions()->sync($permissionIds);
        }

        // 3. Create Default Admin User
        $adminRole = Role::where('name', 'Admin')->first();
        User::updateOrCreate(
            ['email' => 'admin@inventrust.com'],
            [
                'name' => 'InvenTrust Admin',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'company_id' => 1,
                'has_completed_onboarding' => 1
            ]
        );
    }
}
