<?php

namespace App\Traits;

use App\Models\Account;

trait AccountingHelper
{
    /**
     * Generate a code based on typical accounting ranges:
     * Assets: 1000s, Liabilities: 2000s, Equity: 3000s, Income: 4000s, Expenses: 5000s
     */
    protected function generateRecommendedCode($type)
    {
        $ranges = [
            'asset' => 1000,
            'liability' => 2000,
            'equity' => 3000,
            'income' => 4000,
            'expense' => 5000,
        ];

        $base = $ranges[$type];
        
        // Find the maximum numeric code in this range for the current company
        $maxCode = Account::where('type', $type)
            ->where('code', 'REGEXP', '^[0-9]+$')
            ->whereBetween('code', [$base, $base + 999])
            ->max('code');

        return $maxCode ? (int)$maxCode + 1 : $base;
    }
}
