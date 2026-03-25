<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardApiController extends Controller
{
    public function index(): JsonResponse
    {
        $totalSales = Invoice::where('type', 'sale')->sum('total');
        $outstandingBalances = Client::sum('balance');
        $lowStockProducts = Product::where('stock_quantity', '<=', 10)->get();

        return response()->json([
            'totalSales' => (float)$totalSales,
            'outstandingBalances' => (float)$outstandingBalances,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }
}
