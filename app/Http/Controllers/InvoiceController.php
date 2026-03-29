<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\Party;
use App\Models\LedgerEntry;
use App\Services\StockService;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        return Invoice::with('party')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'party_id' => 'required|exists:parties,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $discount = $validated['discount'] ?? 0;
            $tax = $validated['tax'] ?? 0;
            $finalAmount = $totalAmount - $discount + $tax;
            $paidAmount = $validated['paid_amount'] ?? 0;
            $dueAmount = $finalAmount - $paidAmount;

            $invoice = Invoice::create([
                'invoice_no' => 'INV-' . mt_rand(100000, 999999),
                'party_id' => $validated['party_id'],
                'date' => $validated['date'],
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'tax' => $tax,
                'final_amount' => $finalAmount,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'status' => ($dueAmount <= 0) ? 'paid' : (($paidAmount > 0) ? 'partial' : 'unpaid'),
            ]);

            foreach ($validated['items'] as $itemData) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['quantity'] * $itemData['unit_price'],
                ]);

            // Update Stock & Ledger (Double Entry)
            $totalCogs = 0;
            foreach ($validated['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                StockService::recordSale($product, $itemData['quantity'], $invoice, $validated['warehouse_id'] ?? null);
                $totalCogs += $product->purchase_price * $itemData['quantity'];
            }

            // Post to General Ledger
            $entries = [
                // 1. Debit Accounts Receivable (Customer owes us)
                [
                    'account_code' => '1200', 
                    'debit' => $finalAmount, 
                    'party_id' => $invoice->party_id
                ],
                // 2. Credit Sales Revenue (Income earned)
                [
                    'account_code' => '4000', 
                    'credit' => $finalAmount
                ],
                // 3. Debit COGS (Expense of goods sold)
                [
                    'account_code' => '5000', 
                    'debit' => $totalCogs
                ],
                // 4. Credit Inventory (Asset leaving stock)
                [
                    'account_code' => '1300', 
                    'credit' => $totalCogs
                ]
            ];

            AccountingService::postTransaction(
                'Invoice entry: ' . $invoice->invoice_no,
                $invoice->date,
                $entries,
                $invoice
            );

            // Handle immediate payment
            if ($paidAmount > 0) {
                AccountingService::postTransaction(
                    'Direct payment for: ' . $invoice->invoice_no,
                    $invoice->date,
                    [
                        // Debit Cash (Asset increases)
                        ['account_code' => '1001', 'debit' => $paidAmount],
                        // Credit AR (Asset decreases as debt is paid)
                        ['account_code' => '1200', 'credit' => $paidAmount, 'party_id' => $invoice->party_id]
                    ],
                    $invoice
                );
            }

            return $invoice->load(['party', 'items.product']);
        });
    }

    public function show(Invoice $invoice)
    {
        return $invoice->load(['party', 'items.product', 'ledgerEntries']);
    }

    public function destroy(Invoice $invoice)
    {
        return DB::transaction(function () use ($invoice) {
            // Restore product stock (Record adjustment)
            foreach ($invoice->items as $item) {
                $product = Product::find($item->product_id);
                // Get warehouse_id from first related movement if possible, or fallback
                $warehouseId = $invoice->stockMovements()->first()?->warehouse_id;
                StockService::recordMovement($product, $item->quantity, 'adjustment', $invoice, 'Stock restored from deleted invoice', $warehouseId);
            }

            // GL entries are deleted on cascade if configured, 
            // but we need to manually adjust party balance if not using a query-based balance
            $invoice->party->decrement('current_balance', $invoice->due_amount);
            
            // Delete associated ledger entries and payments (cascade handled if set)
            $invoice->delete();
            return response()->noContent();
        });
    }
}
