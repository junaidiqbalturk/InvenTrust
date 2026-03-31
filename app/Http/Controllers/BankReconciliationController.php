<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\BankStatement;
use App\Models\BankTransaction;
use App\Models\LedgerEntry;
use App\Services\ReconciliationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BankReconciliationController extends Controller
{
    public function index()
    {
        $statements = BankStatement::with('account')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($statements);
    }

    public function show(BankStatement $statement)
    {
        $transactions = $statement->transactions()
            ->with('ledgerEntry.account')
            ->get();
            
        return response()->json([
            'statement' => $statement->load('account'),
            'transactions' => $transactions
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $path = $file->store('bank_statements');

        return DB::transaction(function () use ($request, $path, $file) {
            $statement = BankStatement::create([
                'company_id' => auth()->user()->company_id,
                'account_id' => $request->account_id,
                'filename' => $file->getClientOriginalName(),
                'upload_date' => now()->toDateString(),
                'status' => 'completed',
            ]);

            // Simple CSV parsing
            $handle = fopen(Storage::path($path), 'r');
            $header = fgetcsv($handle); // Skip header

            while (($row = fgetcsv($handle)) !== false) {
                // Assuming format: Date, Description, Amount
                if (count($row) < 3) continue;

                $amount = floatval($row[2]);
                BankTransaction::create([
                    'company_id' => auth()->user()->company_id,
                    'bank_statement_id' => $statement->id,
                    'date' => Carbon::parse($row[0])->toDateString(),
                    'description' => $row[1],
                    'amount' => $amount,
                    'type' => $amount >= 0 ? 'credit' : 'debit',
                ]);
            }
            fclose($handle);

            $autoCount = ReconciliationService::processAutomation($statement);

            return response()->json([
                'statement' => $statement->load('transactions'),
                'auto_reconciled_count' => $autoCount
            ]);
        });
    }

    public function getMatches(BankTransaction $transaction)
    {
        return response()->json(ReconciliationService::findMatches($transaction));
    }

    public function reconcile(Request $request, BankTransaction $transaction)
    {
        $request->validate([
            'ledger_entry_id' => 'required|exists:ledger_entries,id'
        ]);

        $ledgerEntry = LedgerEntry::findOrFail($request->ledger_entry_id);

        if ($ledgerEntry->is_reconciled) {
            return response()->json(['message' => 'Ledger entry is already reconciled'], 422);
        }

        return DB::transaction(function () use ($transaction, $ledgerEntry) {
            $transaction->update([
                'is_reconciled' => true,
                'ledger_entry_id' => $ledgerEntry->id
            ]);

            $ledgerEntry->update([
                'is_reconciled' => true,
                'bank_transaction_id' => $transaction->id
            ]);

            return response()->json($transaction->load('ledgerEntry'));
        });
    }
}
