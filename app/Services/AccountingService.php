<?php

namespace App\Services;

use App\Models\Account;
use App\Models\LedgerEntry;
use App\Models\JournalTransaction;
use App\Models\Party;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AccountingService
{
    /**
     * Post a double-entry transaction to the General Ledger.
     * 
     * @param string $description
     * @param string|Carbon $date
     * @param array $entries Array of [account_code, debit, credit, party_id]
     * @param Model|null $reference
     */
    public static function postTransaction(
        string $description,
        $date,
        array $entries,
        ?Model $reference = null
    ) {
        $companyId = auth()->user()->company_id ?? $reference->company_id ?? null;

        if (!$companyId) {
            throw new \Exception("Company ID not found for accounting transaction.");
        }

        return DB::transaction(function () use ($description, $date, $entries, $reference, $companyId) {
            // 1. Validate Balance (Total Debits must equal Total Credits)
            $totalDebit = collect($entries)->sum('debit');
            $totalCredit = collect($entries)->sum('credit');

            // Use a small epsilon for float comparison if necessary, but here we expect exact matches
            if (abs($totalDebit - $totalCredit) > 0.001) {
                Log::error("Unbalanced transaction attempt", [
                    'description' => $description,
                    'total_debit' => $totalDebit,
                    'total_credit' => $totalCredit,
                    'entries' => $entries
                ]);
                throw new \Exception("Accounting transaction is unbalanced. Total Debit: {$totalDebit}, Total Credit: {$totalCredit}");
            }

            // 2. Create Journal Transaction record
            $journal = JournalTransaction::create([
                'company_id' => $companyId,
                'date' => $date,
                'description' => $description,
                'referenceable_id' => $reference ? $reference->id : null,
                'referenceable_type' => $reference ? get_class($reference) : null,
                'created_by' => auth()->id(),
            ]);

            // 3. Process each entry
            foreach ($entries as $entry) {
                $account = Account::where('code', $entry['account_code'])
                    ->where('company_id', $companyId)
                    ->first();
                
                if (!$account) {
                    throw new \Exception("Account with code {$entry['account_code']} not found for this company.");
                }

                $debit = (float)($entry['debit'] ?? 0);
                $credit = (float)($entry['credit'] ?? 0);
                $partyId = $entry['party_id'] ?? null;

                // Calculate Running Balance
                // Assets & Expenses: Balance = Debit - Credit
                // Liabilities, Equity, Revenue: Balance = Credit - Debit
                $lastEntry = LedgerEntry::where('account_id', $account->id)
                    ->orderBy('date', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();
                
                $previousBalance = $lastEntry ? (float)$lastEntry->running_balance : 0;

                // Asset: +Debit, -Credit
                // Expense: +Debit, -Credit
                // Liability: +Credit, -Debit
                // Equity: +Credit, -Debit
                // Income/Revenue: +Credit, -Debit (Wait, Income is usually a credit normal balance)

                if (in_array($account->type, ['asset', 'expense'])) {
                    $newBalance = $previousBalance + ($debit - $credit);
                } elseif (in_array($account->type, ['liability', 'equity', 'income', 'revenue'])) {
                    $newBalance = $previousBalance + ($credit - $debit);
                } else {
                    // Default to Asset behavior or throw error? Let's default to Debit-Credit for unknown
                    $newBalance = $previousBalance + ($debit - $credit);
                }

                LedgerEntry::create([

                    'company_id' => $companyId,
                    'account_id' => $account->id,
                    'transaction_id' => $journal->id,
                    'party_id' => $partyId,
                    'date' => $date,
                    'debit' => $debit,
                    'credit' => $credit,
                    'amount' => $debit > 0 ? $debit : $credit,
                    'running_balance' => $newBalance,
                    'referenceable_id' => $reference ? $reference->id : null,
                    'referenceable_type' => $reference ? get_class($reference) : null,
                    'description' => $description,
                ]);

                // 4. Update Party balance if applicable
                if ($partyId) {
                    $party = Party::find($partyId);
                    if ($party) {
                        $party->updateBalance();
                    }
                }
            }

            return $journal;
        });
    }

    /**
     * Helper to get common account codes.
     */
    public static function getAccountCode(string $name): string
    {
        $map = [
            'Cash' => '1001',
            'Accounts Receivable' => '1200',
            'Inventory' => '1300',
            'Accounts Payable' => '2100',
            'Sales Revenue' => '4000',
            'COGS' => '5000',
            'Sales Tax' => '2200',
        ];

        return $map[$name] ?? '';
    }
}

