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

    public function index()
    {
        // Fetch root accounts with all children recursively
        $accounts = Account::isRoot()
            ->with(['allChildren', 'children'])
            ->get();
            
        return $this->success($accounts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:asset,liability,equity,income,expense',
            'parent_id' => 'nullable|exists:accounts,id',
            'description' => 'nullable|string',
            'code' => 'nullable|string|max:20',
            'auto_code' => 'boolean'
        ]);

        // Logic for Recommended Numbering
        if ($request->auto_code || empty($validated['code'])) {
            $validated['code'] = $this->generateRecommendedCode($validated['type']);
        }

        $account = Account::create($validated);

        return $this->success($account, 'Account created successfully', 201);
    }

    public function update(Request $request, Account $account)
    {
        if ($account->is_system) {
            return $this->error('System accounts cannot be modified', 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'parent_id' => 'nullable|exists:accounts,id',
            'description' => 'nullable|string',
            'code' => 'sometimes|required|string|max:20|unique:accounts,code,' . $account->id . ',id,company_id,' . $account->company_id,
        ]);

        $account->update($validated);

        return $this->success($account, 'Account updated successfully');
    }

    public function destroy(Account $account)
    {
        if ($account->is_system) {
            return $this->error('System accounts are protected and cannot be deleted', 403);
        }

        if ($account->children()->exists()) {
            return $this->error('Cannot delete account with sub-accounts. Move or delete children first.', 422);
        }

        $account->delete();

        return $this->success(null, 'Account deleted successfully');
    }

    /**
     * Generate a code based on typical accounting ranges:
     * Assets: 1000s, Liabilities: 2000s, Equity: 3000s, Income: 4000s, Expenses: 5000s
     */
    private function generateRecommendedCode($type)
    {
        $ranges = [
            'asset' => 1000,
            'liability' => 2000,
            'equity' => 3000,
            'income' => 4000,
            'expense' => 5000,
        ];

        $base = $ranges[$type];
        $maxCode = Account::where('type', $type)
            ->where('code', 'REGEXP', '^[0-9]+$')
            ->whereBetween('code', [$base, $base + 999])
            ->max('code');

        return $maxCode ? $maxCode + 1 : $base;
    }

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
