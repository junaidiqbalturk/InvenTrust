<?php

namespace App\Services;

use App\Models\Party;
use App\Models\Product;
use App\Models\Invoice;
use App\Models\Company;

class DemoDataService
{
    public function seed(Company $company)
    {
        // 0. Initialize Chart of Accounts for this Company
        $accounts = [
            ['name' => 'Cash', 'code' => '1001', 'type' => 'asset'],
            ['name' => 'Accounts Receivable', 'code' => '1200', 'type' => 'asset'],
            ['name' => 'Inventory', 'code' => '1300', 'type' => 'asset'],
            ['name' => 'Accounts Payable', 'code' => '2100', 'type' => 'liability'],
            ['name' => 'Sales Revenue', 'code' => '4000', 'type' => 'income'],
            ['name' => 'COGS', 'code' => '5000', 'type' => 'expense'],
        ];

        foreach ($accounts as $acc) {
            \App\Models\Account::create(array_merge($acc, ['company_id' => $company->id]));
        }

        // 1. Create a Sample Client (Party)
        $client = Party::create([
            'company_id' => $company->id,
            'name' => 'Global Trade Inc.',
            'email' => 'contact@globaltrade.example.com',
            'phone' => '+1 555-0123',
            'address' => '123 Business Ave, New York, NY',
            'type' => 'customer',
        ]);

        // 2. Create a Sample Vendor (Party)
        $vendor = Party::create([
            'company_id' => $company->id,
            'name' => 'Primary Logistics Co.',
            'email' => 'shipping@primelogistics.example.com',
            'phone' => '+1 555-9876',
            'address' => '456 Port Rd, Los Angeles, CA',
            'type' => 'supplier',
        ]);

        // 3. Create Sample Products
        $product1 = Product::create([
            'company_id' => $company->id,
            'name' => 'Industrial Generator X1',
            'sku' => 'GEN-' . $company->id . '-X1-001',
            'description' => 'High-performance industrial generator for emergency backup.',
            'purchase_price' => 4500.00,
            'sale_price' => 5000.00,
            'unit' => 'pcs',
        ]);

        // 4. Create a Sample Invoice
        Invoice::create([
            'company_id' => $company->id,
            'party_id' => $client->id,
            'invoice_no' => 'INV-' . $company->id . '-' . date('Y') . '-001',
            'date' => now(),
            'total_amount' => 5250.00,
            'final_amount' => 5250.00,
            'paid_amount' => 5250.00,
            'due_amount' => 0.00,
            'status' => 'paid',
        ]);
    }
}
