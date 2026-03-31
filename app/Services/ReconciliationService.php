<?php

namespace App\Services;

use App\Models\BankTransaction;
use App\Models\LedgerEntry;
use Carbon\Carbon;

class ReconciliationService
{
    /**
     * Find potential ledger matches for a bank transaction.
     */
    public static function findMatches(BankTransaction $bankTransaction)
    {
        $amount = abs($bankTransaction->amount);
        $date = Carbon::parse($bankTransaction->date);
        $type = $bankTransaction->type; // 'debit' or 'credit'
        
        $query = LedgerEntry::where('is_reconciled', false)
            ->whereBetween('date', [
                $date->copy()->subDays(5)->toDateString(),
                $date->copy()->addDays(5)->toDateString()
            ]);

        // If bank credit (money in), look for system debits (Cash/Bank increase)
        // If bank debit (money out), look for system credits (Cash/Bank decrease)
        if ($type === 'credit') {
            $query->where('debit', $amount);
        } else {
            $query->where('credit', $amount);
        }

        $results = $query->with(['account', 'party', 'referenceable'])->get();

        return $results->map(function ($entry) use ($bankTransaction) {
            $score = 0;
            
            // Amount is already exact due to query
            $score += 50;

            // Date proximity
            $daysDiff = abs(Carbon::parse($entry->date)->diffInDays(Carbon::parse($bankTransaction->date)));
            $score += max(0, 30 - ($daysDiff * 5));

            // Description/Reference keyword matching
            $descMatch = false;
            $bankDesc = strtolower($bankTransaction->description);
            $sysDesc = strtolower($entry->description);
            
            if (str_contains($bankDesc, $sysDesc) || str_contains($sysDesc, $bankDesc)) {
                $score += 20;
            }

            return [
                'ledger_entry' => $entry,
                'score' => $score,
                'match_type' => $score >= 80 ? 'exact' : ($score >= 50 ? 'partial' : 'low'),
            ];
        })->sortByDesc('score')->values();
    }

    /**
     * Process automated reconciliation for a statement.
     */
    public static function processAutomation(\App\Models\BankStatement $statement)
    {
        $transactions = $statement->transactions()->where('is_reconciled', false)->get();
        $automatedCount = 0;

        foreach ($transactions as $transaction) {
            $matches = self::findMatches($transaction);
            
            // Auto-reconcile ONLY 100% matches
            $exactMatch = $matches->firstWhere('score', 80); // 50 (amount) + 30 (exact date)
            
            if ($exactMatch) {
                $ledgerEntry = $exactMatch['ledger_entry'];
                
                \Illuminate\Support\Facades\DB::transaction(function () use ($transaction, $ledgerEntry) {
                    $transaction->update([
                        'is_reconciled' => true,
                        'ledger_entry_id' => $ledgerEntry->id
                    ]);

                    $ledgerEntry->update([
                        'is_reconciled' => true,
                        'bank_transaction_id' => $transaction->id
                    ]);
                });
                
                $automatedCount++;
            }
        }

        return $automatedCount;
    }
}
