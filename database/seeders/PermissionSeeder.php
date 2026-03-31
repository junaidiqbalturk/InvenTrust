<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Inventory
            ['name' => 'view_inventory', 'description' => 'Can view product list and stock levels'],
            ['name' => 'manage_inventory', 'description' => 'Can add, edit, and delete products'],
            
            // Sales
            ['name' => 'view_sales', 'description' => 'Can view invoices and sales reports'],
            ['name' => 'create_sales', 'description' => 'Can generate new tax invoices'],
            ['name' => 'pay_invoice', 'description' => 'Can record payments for invoices'],
            
            // Purchases
            ['name' => 'view_purchases', 'description' => 'Can view purchase orders and history'],
            ['name' => 'create_purchases', 'description' => 'Can record new purchases from suppliers'],
            ['name' => 'pay_purchase', 'description' => 'Can record payments for purchases'],
            
            // Financials
            ['name' => 'view_ledger', 'description' => 'Can view general ledger and account details'],
            ['name' => 'view_reports', 'description' => 'Can access P&L, Trial Balance, and Balance Sheet'],
            ['name' => 'reconcile_bank', 'description' => 'Can access bank reconciliation and matching engine'],
            
            // Admin
            ['name' => 'manage_users', 'description' => 'Can create and manage team members'],
            ['name' => 'manage_roles', 'description' => 'Can define roles and assign permissions'],
            ['name' => 'manage_company', 'description' => 'Can update company branding and settings'],
        ];

        foreach ($permissions as $permission) {
            \App\Models\Permission::updateOrCreate(['name' => $permission['name']], $permission);
        }

        // Assign all permissions to the 'Admin' role
        $adminRole = \App\Models\Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $permissionIds = \App\Models\Permission::pluck('id')->toArray();
            $adminRole->permissions()->sync($permissionIds);
        }
    }
}
