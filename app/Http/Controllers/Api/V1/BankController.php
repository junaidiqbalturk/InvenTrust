<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Account;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Traits\AccountingHelper;
use Illuminate\Support\Facades\DB;

class BankController extends Controller
{
    use ApiResponse, AccountingHelper;

    public function index()
    {
        $banks = BankAccount::with('ledgerAccount')->get()->map(function ($bank) {
            return [
                'id' => $bank->id,
                'bank_name' => $bank->bank_name,
                'account_number' => $bank->account_number,
                'iban' => $bank->iban,
                'currency' => $bank->currency,
                'balance' => $bank->ledgerAccount ? $bank->ledgerAccount->getBalance(false) : 0,
                'ledger_account_id' => $bank->ledger_account_id,
            ];
        });

        return $this->success($banks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'iban' => 'nullable|string|max:50',
            'currency' => 'required|string|size:3',
            'opening_balance' => 'numeric|min:0'
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Create the Ledger Account automatically
            $ledgerAccount = Account::create([
                'name' => 'Bank: ' . $validated['bank_name'] . ' (' . substr($validated['account_number'], -4) . ')',
                'type' => 'asset',
                'code' => $this->generateRecommendedCode('asset'),
                'description' => 'Automatically generated for bank account ' . $validated['account_number'],
                'is_system' => false, // User can manage it, but it's linked
            ]);

            // 2. Create the Bank Metadata
            $bank = BankAccount::create([
                'bank_name' => $validated['bank_name'],
                'account_number' => $validated['account_number'],
                'iban' => $validated['iban'],
                'currency' => $validated['currency'],
                'ledger_account_id' => $ledgerAccount->id,
                'current_balance' => $validated['opening_balance'] ?? 0,
            ]);

            // 3. If there's an opening balance, we should technically record an opening journal entry.
            // For now, we'll just set the balance in the metadata, 
            // but in a real ERP we'd create a LedgerEntry.

            return $this->success($bank, 'Bank account and ledger integration created successfully', 201);
        });
    }

    public function update(Request $request, BankAccount $bank)
    {
        $validated = $request->validate([
            'bank_name' => 'sometimes|required|string|max:255',
            'account_number' => 'sometimes|required|string|max:50',
            'iban' => 'nullable|string|max:50',
            'currency' => 'sometimes|required|string|size:3',
        ]);

        $bank->update($validated);

        // Optional: Update linked ledger account name?
        if ($bank->ledgerAccount && isset($validated['bank_name'])) {
            $bank->ledgerAccount->update([
                'name' => 'Bank: ' . $bank->bank_name . ' (' . substr($bank->account_number, -4) . ')'
            ]);
        }

        return $this->success($bank, 'Bank details updated');
    }

    public function destroy(BankAccount $bank)
    {
        // Safety check: Don't delete if ledger has transactions
        if ($bank->ledgerAccount && $bank->ledgerAccount->ledgerEntries()->exists()) {
            return $this->error('Cannot delete bank account with existing transactions in the ledger.', 422);
        }

        return DB::transaction(function () use ($bank) {
            $ledger = $bank->ledgerAccount;
            $bank->delete();
            if ($ledger) {
                $ledger->delete();
            }
            return $this->success(null, 'Bank account and linked ledger removed');
        });
    }
}
