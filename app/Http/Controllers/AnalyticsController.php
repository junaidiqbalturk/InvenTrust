<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    private function getCompanyId()
    {
        return auth()->user()->company_id;
    }

    public function getRevenueByMonth()
    {
        $companyId = $this->getCompanyId();
        return response()->json(DB::table('invoices')
            ->where('company_id', $companyId)
            ->selectRaw("DATE_FORMAT(date, '%Y-%m') as month, SUM(total_amount) as total_revenue, COUNT(id) as invoice_count")
            ->groupBy('month')
            ->orderBy('month', 'DESC')
            ->get());
    }

    public function getKpis()
    {
        $companyId = $this->getCompanyId();

        $revenueYear = DB::table('invoices')
            ->where('company_id', $companyId)
            ->whereYear('date', date('Y'))
            ->sum('total_amount') ?? 0;

        $receivableStats = DB::table("ledger_entries")
            ->where('company_id', $companyId)
            ->selectRaw("SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit, SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit")
            ->first();
        $outstandingAr = ($receivableStats->total_debit ?? 0) - ($receivableStats->total_credit ?? 0);

        $inventoryValue = DB::table('products')
            ->where('company_id', $companyId)
            ->selectRaw('SUM(stock_quantity * sale_price) as total_value') // Adapted for InvenTrust schema
            ->value('total_value') ?? 0;

        return response()->json([
            'total_revenue_year' => (float)$revenueYear,
            'outstanding_ar' => (float)max($outstandingAr, 0),
            'inventory_value' => (float)$inventoryValue,
            'gross_profit' => (float)($revenueYear * 0.2), // Estimated
        ]);
    }
}
