<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalTransaction;
use App\Models\LedgerEntry;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AutoFixService
{
    /**
     * Fix Inventory Discrepancy by aligning GL with Physical Stock.
     */
    public static function fixInventoryDiscrepancy()
    {
        $companyId = auth()->user()->company_id;
        
        return DB::transaction(function () use ($companyId) {
            // 1. Get Physical Valuation
            $products = Product::where('company_id', $companyId)->get();
            $physicalValue = $products->sum(function($p) {
                return $p->stock_quantity * $p->purchase_price;
            });

            // 2. Get GL Inventory Balance (Account 1300)
            $inventoryAccount = Account::where('company_id', $companyId)
                ->where('code', '1300')
                ->firstOrFail();
            
            $glBalance = (float) LedgerEntry::where('account_id', $inventoryAccount->id)
                ->sum(DB::raw('debit - credit'));

            $variance = $physicalValue - $glBalance;

            if (abs($variance) < 0.01) {
                return [
                    'status' => 'info',
                    'message' => 'No discrepancy found. Inventory is already in balance.',
                    'steps' => [
                        'Scanning physical inventory: Complete',
                        'Auditing GL Account 1300: Complete',
                        'Variance check: $0.00'
                    ]
                ];
            }

            // 3. Create Adjustment Transaction using AccountingService
            $entries = [];
            if ($variance > 0) {
                // Physical > GL: Need to Increase Inventory (Debit 1300)
                $entries[] = ['account_code' => '1300', 'debit' => $variance, 'credit' => 0];
                $entries[] = ['account_code' => '3000', 'debit' => 0, 'credit' => $variance];
            } else {
                // GL > Physical: Need to Decrease Inventory (Credit 1300)
                $amount = abs($variance);
                $entries[] = ['account_code' => '1300', 'debit' => 0, 'credit' => $amount];
                $entries[] = ['account_code' => '3000', 'debit' => $amount, 'credit' => 0];
            }

            $transaction = AccountingService::postTransaction(
                "System Auto-Fix: Inventory Reconciliation Adjustment",
                Carbon::now(),
                $entries
            );

            return [
                'status' => 'success',
                'message' => 'Inventory discrepancy resolved successfully.',
                'variance' => $variance,
                'transaction_id' => $transaction->id,
                'steps' => [
                    "Physical valuation calculated: $" . number_format($physicalValue, 2),
                    "GL Account 1300 balance verified: $" . number_format($glBalance, 2),
                    "Variance identified: $" . number_format($variance, 2),
                    "Corrective journal transaction " . $transaction->id . " posted to Ledger."
                ]
            ];
        });
    }
}
