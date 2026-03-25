<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LedgerTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_creation_updates_ledger_and_balance()
    {
        $user = User::factory()->create();
        $client = Client::create(['name' => 'Test Client', 'type' => 'customer']);
        $product = Product::create(['name' => 'Item', 'price' => 100, 'stock_quantity' => 10]);

        $response = $this->actingAs($user)->post(route('invoices.store'), [
            'client_id' => $client->id,
            'type' => 'sale',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2, 'unit_price' => 100, 'tax_amount' => 0]
            ],
            'subtotal' => 200,
            'tax_amount' => 0,
            'total' => 200,
        ]);

        $response->assertRedirect(route('invoices.index'));
        
        $client->refresh();
        $this->assertEquals(200, $client->balance);
        $this->assertDatabaseHas('ledger_entries', [
            'client_id' => $client->id,
            'amount' => 200,
            'type' => 'debit'
        ]);
        
        $product->refresh();
        $this->assertEquals(8, $product->stock_quantity);
    }

    public function test_purchase_invoice_updates_ledger_and_stock()
    {
        $user = User::factory()->create();
        $vendor = Client::create(['name' => 'Test Vendor', 'type' => 'vendor']);
        $product = Product::create(['name' => 'Item', 'price' => 50, 'stock_quantity' => 0]);

        $response = $this->actingAs($user)->post(route('invoices.store'), [
            'client_id' => $vendor->id,
            'type' => 'purchase',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 10, 'unit_price' => 45, 'tax_amount' => 0]
            ],
            'subtotal' => 450,
            'tax_amount' => 0,
            'total' => 450,
        ]);

        $response->assertRedirect(route('invoices.index'));
        
        $vendor->refresh();
        $this->assertEquals(-450, $vendor->balance); 
        
        $product->refresh();
        $this->assertEquals(10, $product->stock_quantity);
    }
}
