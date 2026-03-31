<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Party;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get the simplified Dashboard KPIs and Charts.
     */
    public function index()
    {
        // 1. Total Sales (Lifetime or Monthly? Let's take lifetime for total)
        $totalSales = Invoice::sum('final_amount');

        // 2. Receivables (Positive current_balance for customers and suppliers that owe us)
        $receivables = Party::where('current_balance', '>', 0)->sum('current_balance');

        // 3. Payables (Negative current_balance for parties we owe)
        $payables = Party::where('current_balance', '<', 0)->sum('current_balance');

        // 4. Profit (Simplified)
        // Profit = Sum of (Sales - Purchase Cost of sold items)
        $profit = InvoiceItem::join('products', 'invoice_items.product_id', '=', 'products.id')
            ->select(DB::raw('SUM(invoice_items.subtotal - (products.purchase_price * invoice_items.quantity)) as total_profit'))
            ->first()
            ->total_profit ?? 0;

        // --- Charts ---

        // 5. Sales Trends (Last 6 months)
        $salesTrends = Invoice::select(
                DB::raw("DATE_FORMAT(date, '%Y-%m') as sort_key"),
                DB::raw("DATE_FORMAT(date, '%b %Y') as month"),
                DB::raw('SUM(final_amount) as total')
            )
            ->where('date', '>=', Carbon::now()->subMonths(6))
            ->groupBy('sort_key', 'month')
            ->orderBy('sort_key', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'total' => (float)$item->total
                ];
            });

        // 6. Category Performance (Sales by product category)
        $categoryPerformance = InvoiceItem::join('products', 'invoice_items.product_id', '=', 'products.id')
            ->select(
                'products.category',
                DB::raw('SUM(invoice_items.subtotal) as value')
            )
            ->groupBy('products.category')
            ->get();

        return response()->json([
            'kpis' => [
                'total_sales' => round($totalSales, 2),
                'receivables' => round($receivables, 2),
                'payables' => round(abs($payables), 2),
                'profit' => round($profit, 2),
            ],
            'charts' => [
                'trends' => $salesTrends,
                'categories' => $categoryPerformance,
            ],
            'smart_feed' => [
                'total_reconciled' => \App\Models\BankTransaction::where('is_reconciled', true)->count(),
                'recent_actions' => \App\Models\BankTransaction::where('is_reconciled', true)
                    ->orderBy('updated_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($t) {
                        return [
                            'id' => $t->id,
                            'description' => $t->description,
                            'amount' => $t->amount,
                            'date' => $t->updated_at->diffForHumans(),
                        ];
                    })
            ]
        ]);
    }
}
