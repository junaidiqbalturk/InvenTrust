<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Purchase;
use App\Models\Party;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $totalSales = Invoice::sum('final_amount');
        $receivables = Party::where('type', 'customer')->sum('current_balance');
        $payables = Party::where('type', 'supplier')->sum('current_balance');
        
        // Simplified Profit calculation: (Sale Price - Purchase Price) * Quantity Sold
        // Or just Total Sales - Total Purchase (very simplified)
        $totalPurchases = Purchase::sum('total_amount');
        $profit = $totalSales - $totalPurchases; // This is a raw estimate

        // Sales Trends (last 7 days)
        $salesTrends = Invoice::selectRaw('DATE(date) as label, SUM(final_amount) as value')
            ->where('date', '>=', Carbon::now()->subDays(7))
            ->groupBy('label')
            ->get();

        // Category performance
        $categoryStats = Product::withCount(['invoiceItems as sales_count'])
            ->get()
            ->groupBy('category')
            ->map(function ($items, $category) {
                return [
                    'label' => $category ?? 'Uncategorized',
                    'value' => $items->sum('sales_count')
                ];
            })->values();

        return $this->successResponse([
            'kpis' => [
                'total_sales' => $totalSales,
                'receivables' => $receivables,
                'payables' => abs($payables),
                'profit' => $profit,
            ],
            'charts' => [
                'sales_trends' => $salesTrends,
                'category_performance' => $categoryStats,
            ]
        ], 'Dashboard statistics retrieved');
    }
}
