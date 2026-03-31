<?php

namespace App\Services;

use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ReportingService
{
    /**
     * Get Trial Balance for a given period.
     */
    public static function getTrialBalance($startDate = null, $endDate = null)
    {
        $companyId = auth()->user()->company_id;
        $endDate = $endDate ?: Carbon::now()->endOfDay();

        $accounts = Account::where('company_id', $companyId)->get();

        $trialBalance = $accounts->map(function ($account) use ($startDate, $endDate) {
            $query = LedgerEntry::where('account_id', $account->id)
                ->where('date', '<=', $endDate);

            if ($startDate) {
                $query->where('date', '>=', $startDate);
            }

            $debit = $query->sum('debit');
            $credit = $query->sum('credit');

            // Normal balance calculation based on account type
            $balance = 0;
            if (in_array($account->type, ['asset', 'expense'])) {
                $balance = $debit - $credit;
            } else {
                $balance = $credit - $debit;
            }

            return [
                'account_id' => $account->id,
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $balance
            ];
        });

        return [
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'data' => $trialBalance,
            'totals' => [
                'debit' => $trialBalance->sum('debit'),
                'credit' => $trialBalance->sum('credit')
            ]
        ];
    }

    /**
     * Get Profit and Loss (Income Statement).
     */
    public static function getProfitAndLoss($startDate = null, $endDate = null)
    {
        $companyId = auth()->user()->company_id;
        $startDate = $startDate ?: Carbon::now()->startOfMonth();
        $endDate = $endDate ?: Carbon::now()->endOfDay();

        // 1. Revenue (Codes starting with 4xxx or type 'income'/'revenue')
        $revenueAccounts = Account::where('company_id', $companyId)
            ->whereIn('type', ['income', 'revenue'])
            ->get();

        $revenue = $revenueAccounts->map(function ($acc) use ($startDate, $endDate) {
            $val = LedgerEntry::where('account_id', $acc->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->selectRaw('SUM(credit) - SUM(debit) as balance')
                ->first()->balance ?? 0;
            return ['name' => $acc->name, 'code' => $acc->code, 'balance' => (float)$val];
        });

        // 2. COGS (Code 5000)
        $cogsAccount = Account::where('company_id', $companyId)
            ->where('code', '5000')
            ->first();
        
        $cogsValue = LedgerEntry::where('account_id', $cogsAccount->id ?? 0)
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('SUM(debit) - SUM(credit) as balance')
            ->first()->balance ?? 0;

        // 3. Operating Expenses (Other 5xxx accounts)
        $expenseAccounts = Account::where('company_id', $companyId)
            ->where('type', 'expense')
            ->where('code', '!=', '5000')
            ->get();

        $expenses = $expenseAccounts->map(function ($acc) use ($startDate, $endDate) {
            $val = LedgerEntry::where('account_id', $acc->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->selectRaw('SUM(debit) - SUM(credit) as balance')
                ->first()->balance ?? 0;
            return ['name' => $acc->name, 'code' => $acc->code, 'balance' => (float)$val];
        });

        $totalRevenue = $revenue->sum('balance');
        $totalExpenses = $expenses->sum('balance');
        $grossProfit = $totalRevenue - $cogsValue;
        $netIncome = $grossProfit - $totalExpenses;

        return [
            'period' => ['start' => $startDate, 'end' => $endDate],
            'revenue' => $revenue,
            'cogs' => (float)$cogsValue,
            'expenses' => $expenses,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'gross_profit' => $grossProfit,
                'total_operating_expenses' => $totalExpenses,
                'net_income' => $netIncome
            ]
        ];
    }

    /**
     * Get Balance Sheet.
     */
    public static function getBalanceSheet($date = null)
    {
        $companyId = auth()->user()->company_id;
        $date = $date ?: Carbon::now()->endOfDay();

        // Assets (1xxx)
        $assetAccounts = Account::where('company_id', $companyId)
            ->where('type', 'asset')
            ->get();

        $assets = $assetAccounts->map(function ($acc) use ($date) {
            $val = LedgerEntry::where('account_id', $acc->id)
                ->where('date', '<=', $date)
                ->selectRaw('SUM(debit) - SUM(credit) as balance')
                ->first()->balance ?? 0;
            return ['name' => $acc->name, 'code' => $acc->code, 'balance' => (float)$val];
        });

        // Liabilities (2xxx)
        $liabilityAccounts = Account::where('company_id', $companyId)
            ->where('type', 'liability')
            ->get();

        $liabilities = $liabilityAccounts->map(function ($acc) use ($date) {
            $val = LedgerEntry::where('account_id', $acc->id)
                ->where('date', '<=', $date)
                ->selectRaw('SUM(credit) - SUM(debit) as balance')
                ->first()->balance ?? 0;
            return ['name' => $acc->name, 'balance' => (float)$val];
        });

        // Equity (3xxx)
        $equityAccounts = Account::where('company_id', $companyId)
            ->where('type', 'equity')
            ->get();

        $equities = $equityAccounts->map(function ($acc) use ($date) {
            $val = LedgerEntry::where('account_id', $acc->id)
                ->where('date', '<=', $date)
                ->selectRaw('SUM(credit) - SUM(debit) as balance')
                ->first()->balance ?? 0;
            return ['name' => $acc->name, 'balance' => (float)$val];
        });

        // Add Net Income to Retained Earnings (Equity)
        $pl = self::getProfitAndLoss(null, $date);
        $retainedEarnings = $pl['summary']['net_income'];

        $totalAssets = $assets->sum('balance');
        $totalLiabilities = $liabilities->sum('balance');
        $totalEquity = $equities->sum('balance') + $retainedEarnings;

        return [
            'date' => $date,
            'assets' => $assets,
            'liabilities' => $liabilities,
            'equity' => $equities,
            'retained_earnings' => $retainedEarnings,
            'summary' => [
                'total_assets' => $totalAssets,
                'total_liabilities' => $totalLiabilities,
                'total_equity' => $totalEquity,
                'total_liabilities_equity' => $totalLiabilities + $totalEquity
            ]
        ];
    }
}
