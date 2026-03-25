<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Product;
use App\Models\TaxRule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@inventrust.com',
            'password' => Hash::make('password'),
        ]);

        // Create Tax Rules
        $vat15 = TaxRule::create([
            'name' => 'VAT 15%',
            'rate_percentage' => 15.00,
            'is_active' => true,
            'description' => 'Standard Value Added Tax'
        ]);

        $gst10 = TaxRule::create([
            'name' => 'GST 10%',
            'rate_percentage' => 10.00,
            'is_active' => true,
            'description' => 'Goods and Services Tax'
        ]);

        // Create Clients
        Client::create([
            'name' => 'Global Electronics Ltd',
            'type' => 'vendor',
            'email' => 'contact@globalelec.com',
            'phone' => '+123456789',
            'address' => '123 Tech Park, Silicon Valley',
            'balance' => 0
        ]);

        Client::create([
            'name' => 'Retail Solutions Inc',
            'type' => 'customer',
            'email' => 'info@retailsol.com',
            'phone' => '+987654321',
            'address' => '456 Main St, New York',
            'balance' => 0
        ]);

        // Create Products
        Product::create([
            'name' => 'SuperTab Pro 12',
            'sku' => 'TAB-PRO-12',
            'price' => 899.99,
            'stock_quantity' => 25,
            'tax_rule_id' => $vat15->id
        ]);

        Product::create([
            'name' => 'Wireless Headphones X5',
            'sku' => 'HP-X5-WRL',
            'price' => 149.50,
            'stock_quantity' => 50,
            'tax_rule_id' => $gst10->id
        ]);

        Product::create([
            'name' => 'Smart Watch Series 3',
            'sku' => 'SW-S3-BLK',
            'price' => 299.00,
            'stock_quantity' => 5, // Low stock alert trigger
            'tax_rule_id' => $vat15->id
        ]);
    }
}
