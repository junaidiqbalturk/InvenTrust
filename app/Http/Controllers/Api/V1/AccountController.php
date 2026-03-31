<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class AccountController extends Controller
{
    use ApiResponse;

    /**
     * Get the ledger entries for a specific account code.
     * Used for auditing and reconciliation.
     */
    public function ledger(Request $request, $code)
    {
        $account = Account::where('code', $code)->firstOrFail();

        $query = LedgerEntry::where('account_id', $account->id)
            ->with(['transaction', 'party', 'referenceable'])
            ->orderBy('date', 'asc')
            ->orderBy('id', 'asc');

        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        $entries = $query->get();

        return response()->json([
            'account' => $account,
            'entries' => $entries,
            'summary' => [
                'total_debit' => $entries->sum('debit'),
                'total_credit' => $entries->sum('credit'),
                'closing_balance' => $entries->last()?->running_balance ?? 0
            ]
        ]);
    }
}
