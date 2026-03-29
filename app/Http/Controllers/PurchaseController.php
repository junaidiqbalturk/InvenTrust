<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Product;
use App\Models\Party;
use App\Models\LedgerEntry;
use App\Services\StockService;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index()
    {
        return Purchase::with('party')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'party_id' => 'required|exists:parties,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'date' => 'required|date',
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

            $paidAmount = $validated['paid_amount'] ?? 0;
            $dueAmount = $totalAmount - $paidAmount;

            $purchase = Purchase::create([
                'purchase_no' => 'PUR-' . mt_rand(100000, 999999),
                'party_id' => $validated['party_id'],
                'date' => $validated['date'],
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'status' => ($dueAmount <= 0) ? 'paid' : (($paidAmount > 0) ? 'partial' : 'unpaid'),
            ]);

            foreach ($validated['items'] as $itemData) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['quantity'] * $itemData['unit_price'],
                ]);

                // Increment Stock & Record Movement
                $product = Product::find($itemData['product_id']);
                StockService::recordPurchase($product, $itemData['quantity'], $purchase, $validated['warehouse_id'] ?? null);
                $product->update(['purchase_price' => $itemData['unit_price']]);
            }

            // Post to General Ledger
            AccountingService::postTransaction(
                'Purchase entry: ' . $purchase->purchase_no,
                $purchase->date,
                [
                    // 1. Debit Inventory (Asset increases)
                    ['account_code' => '1300', 'debit' => $totalAmount],
                    // 2. Credit Accounts Payable (Liability increases)
                    ['account_code' => '2100', 'credit' => $totalAmount, 'party_id' => $purchase->party_id]
                ],
                $purchase
            );

            // Handle immediate payment
            if ($paidAmount > 0) {
                AccountingService::postTransaction(
                    'Direct payment for: ' . $purchase->purchase_no,
                    $purchase->date,
                    [
                        // Debit Accounts Payable (Liability decreases)
                        ['account_code' => '2100', 'debit' => $paidAmount, 'party_id' => $purchase->party_id],
                        // Credit Cash (Asset decreases)
                        ['account_code' => '1001', 'credit' => $paidAmount]
                    ],
                    $purchase
                );
            }

            return $purchase->load(['party', 'items.product']);
        });
    }

    public function show(Purchase $purchase)
    {
        return $purchase->load(['party', 'items.product', 'ledgerEntries']);
    }

    public function destroy(Purchase $purchase)
    {
        return DB::transaction(function () use ($purchase) {
            // Restore product stock (Record adjustment)
            foreach ($purchase->items as $item) {
                $product = Product::find($item->product_id);
                // Get warehouse_id from first related movement if possible, or fallback
                $warehouseId = $purchase->stockMovements()->first()?->warehouse_id;
                StockService::recordMovement($product, -$item->quantity, 'adjustment', $purchase, 'Stock removed from deleted purchase', $warehouseId);
            }

            // Reverse party balance (Debit for removing debt)
            $purchase->party->increment('current_balance', $purchase->due_amount);
            
            $purchase->delete();
            return response()->noContent();
        });
    }
}
