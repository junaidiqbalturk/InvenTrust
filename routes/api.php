<?php

use App\Http\Controllers\Api\ClientApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\InvoiceApiController;
use App\Http\Controllers\Api\ProductApiController;
use App\Http\Controllers\Api\StockMovementApiController;
use App\Http\Controllers\Api\TaxRuleApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Feature-Based API Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardApiController::class, 'index']);
    
    Route::apiResource('clients', ClientApiController::class);
    Route::apiResource('products', ProductApiController::class);
    Route::apiResource('invoices', InvoiceApiController::class)->only(['index', 'store']);
    Route::apiResource('tax-rules', TaxRuleApiController::class);
    
    Route::get('/inventory/movements', [StockMovementApiController::class, 'index']);
});
