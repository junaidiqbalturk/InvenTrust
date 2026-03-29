<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Model;

class StockService
{
    /**
     * Record a stock movement and update the product's quantity.
     * 
     * @param Product $product
     * @param float $quantity Positive for increase, negative for decrease
     * @param string $type The type of movement (in/out/adjustment)
     * @param Model|null $reference The referencing model (e.g., Invoice, Purchase)
     * @param string|null $description Optional description
     * @param int|null $warehouseId Optional warehouse ID
     * @return StockMovement
     */
    public static function recordMovement(
        Product $product, 
        float $quantity, 
        string $type, 
        ?Model $reference = null, 
        ?string $description = null,
        ?int $warehouseId = null
    ): StockMovement {
        $user = auth()->user();
        $company = $user ? $user->company : null;
        
        // Determine warehouse
        if (!$warehouseId && $company) {
            $warehouseId = $company->settings['default_warehouse_id'] ?? null;
        }

        if (!$warehouseId) {
             // Fallback to first warehouse if none provided and no default
             $warehouseId = \App\Models\Warehouse::where('company_id', $product->company_id)->first()?->id;
        }

        // Update Warehouse Specific Stock
        if ($warehouseId) {
            $warehouseProduct = \App\Models\WarehouseProduct::firstOrCreate(
                ['warehouse_id' => $warehouseId, 'product_id' => $product->id],
                ['stock_quantity' => 0]
            );
            $warehouseProduct->increment('stock_quantity', $quantity);
        }

        // Calculate new TOTAL stock
        $newStock = $product->stock_quantity + $quantity;

        // Create the movement record
        $movement = StockMovement::create([
            'company_id' => $product->company_id, // Ensure company_id is set
            'product_id' => $product->id,
            'warehouse_id' => $warehouseId,
            'type' => $type,
            'quantity' => abs($quantity),
            'new_stock' => $newStock,
            'referenceable_id' => $reference ? $reference->id : null,
            'referenceable_type' => $reference ? get_class($reference) : null,
            'description' => $description,
        ]);

        // Update product TOTAL stock balance (cache)
        $product->update(['stock_quantity' => $newStock]);

        // Post to Accounting Ledger if it's a manual adjustment (no reference provided)
        if (!$reference && $product->purchase_price > 0) {
            $value = abs($quantity) * $product->purchase_price;
            if ($value > 0) {
                $ledgerDescription = $description ?: "Stock {$type} adjustment for {$product->name}";
                $inventoryCode = AccountingService::getAccountCode('Inventory');
                $equityCode = AccountingService::getAccountCode('Opening Balance Equity');
                
                $entries = [];
                if ($quantity > 0) {
                    // Stock In: Debit Inventory, Credit Equity
                    $entries[] = ['account_code' => $inventoryCode, 'debit' => $value, 'credit' => 0];
                    $entries[] = ['account_code' => $equityCode, 'debit' => 0, 'credit' => $value];
                } else {
                    // Stock Out: Credit Inventory, Debit Equity (or Loss account)
                    $entries[] = ['account_code' => $inventoryCode, 'debit' => 0, 'credit' => $value];
                    $entries[] = ['account_code' => $equityCode, 'debit' => $value, 'credit' => 0];
                }
                
                AccountingService::postTransaction($ledgerDescription, now(), $entries, $movement);
            }
        }

        return $movement;
    }

    /**
     * Helper to record an adjustment (Centralized point for manual edits)
     */
    public static function recordAdjustment(Product $product, float $quantity, string $description = 'Stock adjustment', ?int $warehouseId = null)
    {
        $type = $quantity >= 0 ? 'in' : 'out'; 
        return self::recordMovement($product, $quantity, $type, null, $description, $warehouseId);
    }

    /**
     * Helper to record a purchase (Stock In)
     */
    public static function recordPurchase(Product $product, float $quantity, Model $purchase, ?int $warehouseId = null)
    {
        return self::recordMovement($product, $quantity, 'in', $purchase, 'Stock purchased', $warehouseId);
    }

    /**
     * Helper to record a sale (Stock Out)
     */
    public static function recordSale(Product $product, float $quantity, Model $invoice, ?int $warehouseId = null)
    {
        return self::recordMovement($product, -$quantity, 'out', $invoice, 'Stock sold', $warehouseId);
    }

    /**
     * Get the inventory valuation report.
     */
    public static function getValuationReport()
    {
        $companyId = auth()->user()->company_id;
        
        // 1. Calculate Valuation from Product Table (Physical)
        $products = Product::where('company_id', $companyId)
            ->where('stock_quantity', '>', 0)
            ->get();
            
        $valuationData = $products->map(function ($product) {
            $value = $product->stock_quantity * $product->purchase_price;
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'quantity' => $product->stock_quantity,
                'unit_price' => $product->purchase_price,
                'valuation' => $value
            ];
        });
        
        $totalPhysicalValuation = $valuationData->sum('valuation');
        
        // 2. Get Ledger Balance for Inventory Account (1300)
        $inventoryAccount = \App\Models\Account::where('company_id', $companyId)
            ->where('code', '1300')
            ->first();
            
        $ledgerBalance = 0;
        if ($inventoryAccount) {
            $lastEntry = \App\Models\LedgerEntry::where('account_id', $inventoryAccount->id)
                ->orderBy('date', 'desc')
                ->orderBy('id', 'desc')
                ->first();
            $ledgerBalance = $lastEntry ? (float)$lastEntry->running_balance : 0;
        }
        
        return [
            'as_of' => now(),
            'products' => $valuationData,
            'summary' => [
                'total_physical_valuation' => $totalPhysicalValuation,
                'ledger_balance' => $ledgerBalance,
                'discrepancy' => $totalPhysicalValuation - $ledgerBalance
            ]
        ];
    }
}

