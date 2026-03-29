<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Company;
use App\Models\Account;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create GLOBAL Admin Role Template
        $adminTemplate = Role::create([
            'name' => 'Admin',
            'description' => 'Full system access',
            'company_id' => null, // Explicitly global
        ]);

        $permissions = [
            'view_inventory', 'manage_inventory',
            'view_invoices', 'manage_sales',
            'view_pos', 'manage_purchases',
            'view_clients', 'manage_ledger',
            'view_vouchers', 'manage_payments',
            'manage_roles', 'manage_users'
        ];

        foreach ($permissions as $p) {
            $permission = \App\Models\Permission::create(['name' => $p]);
            $adminTemplate->permissions()->attach($permission->id);
        }

        // 2. Create Default Company
        $company = Company::create([
            'company_name' => 'InvenTrust Demo',
            'email' => 'admin@inventrust.com',
            'industry' => 'Electronics',
            'settings' => [
                'enable_multi_warehouse' => false,
                'default_warehouse_id' => null,
            ]
        ]);

        // 3. Clone Admin Role for the Demo Company using the RoleService
        $roleService = new \App\Services\RoleService();
        $companyAdminRole = $roleService->cloneTemplatesForCompany($company);
        // 4. Create Default Warehouse
        $warehouse = Warehouse::create([
            'name' => 'Main Warehouse',
            'location' => 'Headquarters',
            'company_id' => $company->id,
            'is_active' => true,
        ]);

        // Update company with default warehouse
        $company->update([
            'settings' => array_merge($company->settings, [
                'default_warehouse_id' => $warehouse->id
            ])
        ]);

        // 5. Create Default User with the COMPANY-SPECIFIC Role
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@inventrust.com',
            'password' => Hash::make('password'),
            'company_id' => $company->id,
            'role_id' => $companyAdminRole->id,
            'has_completed_onboarding' => 1,
        ]);

        // 4. Create Standard Chart of Accounts
        $accounts = [
            ['name' => 'Cash', 'code' => '1001', 'type' => 'asset'],
            ['name' => 'Accounts Receivable', 'code' => '1200', 'type' => 'asset'],
            ['name' => 'Inventory', 'code' => '1300', 'type' => 'asset'],
            ['name' => 'Accounts Payable', 'code' => '2100', 'type' => 'liability'],
            ['name' => 'Opening Balance Equity', 'code' => '3000', 'type' => 'equity'],
            ['name' => 'Sales Revenue', 'code' => '4000', 'type' => 'income'],
            ['name' => 'Cost of Goods Sold', 'code' => '5000', 'type' => 'expense'],
            ['name' => 'Operating Expenses', 'code' => '6000', 'type' => 'expense'],
        ];

        foreach ($accounts as $accountData) {
            Account::create(array_merge($accountData, [
                'company_id' => $company->id
            ]));
        }
    }
}
