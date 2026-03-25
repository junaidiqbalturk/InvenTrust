<?php
namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\Client;
use App\Models\Product;

class DashboardController extends Controller
{
    public function index()
    {
        $totalSales = Invoice::where('type', 'sale')->sum('total');
        $outstandingBalances = Client::sum('balance');
        $lowStockProducts = Product::where('stock_quantity', '<=', 10)->get();

        return Inertia::render('Dashboard', [
            'totalSales' => (float)$totalSales,
            'outstandingBalances' => (float)$outstandingBalances,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }
}
