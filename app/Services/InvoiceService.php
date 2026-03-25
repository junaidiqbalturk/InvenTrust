<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    /**
     * Create a new invoice and update stock and ledgers.
     *
     * @param array $data
     * @return Invoice
     */
    public function createInvoice(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $invoice = Invoice::create([
                'client_id' => $data['client_id'],
                'type' => $data['type'],
                'subtotal' => $data['subtotal'],
                'tax_amount' => $data['tax_amount'],
                'total' => $data['total'],
                'status' => 'unpaid'
            ]);

            foreach ($data['items'] as $itemData) {
                $invoice->items()->create([
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'tax_amount' => $itemData['tax_amount'],
                    'total' => ($itemData['quantity'] * $itemData['unit_price']) + $itemData['tax_amount'],
                ]);

                $quantityChange = $data['type'] === 'sale' ? -$itemData['quantity'] : $itemData['quantity'];
                
                $product = Product::find($itemData['product_id']);
                $product->stockMovements()->create([
                    'type' => $data['type'] === 'sale' ? 'out' : 'in',
                    'quantity' => $itemData['quantity'],
                    'reference_id' => $invoice->id,
                    'reference_type' => Invoice::class,
                ]);
                $product->increment('stock_quantity', $quantityChange);
            }

            $amount = $data['total'];
            if ($data['type'] === 'sale') {
                $ledgerType = 'debit';
                $clientBalanceChange = $amount;
            } else {
                $ledgerType = 'credit';
                $clientBalanceChange = -$amount;
            }
            
            $invoice->ledgerEntries()->create([
                'client_id' => $data['client_id'],
                'type' => $ledgerType,
                'amount' => $amount,
                'description' => ucfirst($data['type']) . ' Invoice #' . $invoice->id,
            ]);

            $client = Client::find($data['client_id']);
            $client->balance += $clientBalanceChange;
            $client->save();

            return $invoice;
        });
    }
}
