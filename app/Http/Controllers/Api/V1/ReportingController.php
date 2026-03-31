<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportingService;
use App\Services\StockService;
use App\Services\AutoFixService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportingController extends Controller
{
    public function trialBalance(Request $request)
    {
        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : null;
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : Carbon::now()->endOfDay();

        return response()->json(ReportingService::getTrialBalance($startDate, $endDate));
    }

    public function profitAndLoss(Request $request)
    {
        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : Carbon::now()->startOfMonth();
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : Carbon::now()->endOfDay();

        return response()->json(ReportingService::getProfitAndLoss($startDate, $endDate));
    }

    public function balanceSheet(Request $request)
    {
        $date = $request->get('date') ? Carbon::parse($request->get('date')) : Carbon::now()->endOfDay();

        return response()->json(ReportingService::getBalanceSheet($date));
    }

    public function inventoryValuation()
    {
        // Integration with StockService for valuation calculation
        return response()->json(StockService::getValuationReport());
    }

    public function autoFixInventory()
    {
        try {
            $result = AutoFixService::fixInventoryDiscrepancy();
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to perform auto-fix: ' . $e->getMessage()
            ], 500);
        }
    }
}
