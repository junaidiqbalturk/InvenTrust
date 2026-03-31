<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LedgerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PartyController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\BankReconciliationController;
use App\Http\Controllers\Api\V1\ReportingController;
use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\WarehouseController;


Route::post('/login', [AuthController::class , 'login']);
Route::post('/register-company', [AuthController::class, 'registerCompany']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load(['role.permissions', 'company']);
    });
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::post('/complete-onboarding', [AuthController::class, 'completeOnboarding']);
    
    // Core ERP API
    Route::get('dashboard', [DashboardController::class , 'index']);
    
    Route::apiResource('users', UserController::class);
    Route::apiResource('products', ProductController::class);
    Route::get('products/low-stock', [ProductController::class, 'lowStock']);
    
    Route::apiResource('parties', PartyController::class);
    Route::apiResource('invoices', InvoiceController::class);
    Route::post('invoices/{invoice}/pay', [InvoiceController::class, 'pay']);
    
    Route::apiResource('purchases', PurchaseController::class);
    // Bank Reconciliation
    Route::prefix('reconciliation')->group(function () {
        Route::get('/', [BankReconciliationController::class, 'index']);
        Route::post('/upload', [BankReconciliationController::class, 'upload']);
        Route::get('/statements/{statement}', [BankReconciliationController::class, 'show']);
        Route::get('/transactions/{transaction}/matches', [BankReconciliationController::class, 'getMatches']);
        Route::post('/transactions/{transaction}/reconcile', [BankReconciliationController::class, 'reconcile']);
    });
    
    Route::get('payments/{payment}/receipt', [PaymentController::class, 'downloadReceipt']);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('warehouses', WarehouseController::class);
    
    Route::get('ledger/{party}', [LedgerController::class, 'show']);
    Route::get('ledger', [LedgerController::class, 'index']);

    // Admin & Settings (Simplified)
    Route::get('roles/permissions', [RoleController::class, 'permissions']);
    Route::apiResource('roles', RoleController::class);
    
    Route::get('/company', [CompanyController::class, 'show']);
    Route::put('/company', [CompanyController::class, 'update']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/count', [NotificationController::class, 'unreadCount']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Reporting & Reconciliation
    Route::prefix('reports')->group(function () {
        Route::get('trial-balance', [ReportingController::class, 'trialBalance']);
        Route::get('profit-loss', [ReportingController::class, 'profitAndLoss']);
        Route::get('balance-sheet', [ReportingController::class, 'balanceSheet']);
        Route::get('inventory-valuation', [ReportingController::class, 'inventoryValuation']);
        Route::post('inventory-valuation/auto-fix', [ReportingController::class, 'autoFixInventory']);
    });

    Route::get('accounts/{code}/ledger', [AccountController::class, 'ledger']);
});

