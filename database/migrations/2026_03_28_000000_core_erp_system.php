<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Disable foreign key checks for clean drop
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Drop ALL business and system tables to ensure a massive clean slate
        $tables = [
            'personal_access_tokens', 'sessions', 'password_reset_tokens', 
            'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs',
            'ledger_entries', 'payments', 'purchase_items', 'purchases', 
            'invoice_items', 'invoices', 'products', 'parties', 
            'users', 'roles', 'permissions', 'role_permissions', 'companies',
            'notifications', 'stock_movements', 'accounts', 'warehouses', 'warehouse_product'
        ];

        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }

        // --- 1. SYSTEM TABLES (Laravel Defaults) ---

        // Password Resets
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Cache
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        // Jobs
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        // Sanctum Tokens
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // --- 2. CORE ERP TABLES ---

        // Companies
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->string('currency', 3)->default('USD');
            $table->string('industry')->nullable();
            $table->string('logo_path')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        // Roles & Permissions
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $table->timestamps();
        });

        // Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->foreignId('role_id')->nullable()->constrained('roles')->onDelete('set null');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->boolean('has_completed_onboarding')->default(false);
            $table->rememberToken();
            $table->timestamps();
        });

        // Parties
        Schema::create('parties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['customer', 'supplier']);
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->timestamps();
        });

        // Bank Accounts
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('iban')->nullable();
            $table->string('currency')->default('USD');
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->foreignId('ledger_account_id')->nullable()->constrained('accounts')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->timestamps();
        });

        // Products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('sku');
            $table->unique(['company_id', 'sku']);
            $table->string('category')->nullable();
            $table->string('unit')->default('pcs');
            $table->decimal('purchase_price', 15, 2)->default(0);
            $table->decimal('sale_price', 15, 2)->default(0);
            $table->integer('stock_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(10);
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->timestamps();
        });

        // Invoices
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no');
            $table->unique(['company_id', 'invoice_no']);
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('party_id')->constrained('parties')->onDelete('cascade');
            $table->date('date');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('final_amount', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('due_amount', 15, 2)->default(0);
            $table->enum('status', ['paid', 'partial', 'unpaid'])->default('unpaid');
            $table->timestamps();
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });

        // Purchases
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_no');
            $table->unique(['company_id', 'purchase_no']);
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('party_id')->constrained('parties')->onDelete('cascade');
            $table->date('date');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('due_amount', 15, 2)->default(0);
            $table->enum('status', ['paid', 'partial', 'unpaid'])->default('unpaid');
            $table->timestamps();
        });

        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });

        // --- 3. ACCOUNTING TABLES ---

        // Chart of Accounts
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code');
            $table->unique(['company_id', 'code']);
            $table->enum('type', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->timestamps();
        });

        // General Ledger
        Schema::create('journal_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('description');
            $table->nullableMorphs('referenceable');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->nullable()->constrained('journal_transactions')->onDelete('cascade');
            $table->foreignId('account_id')->constrained('accounts')->onDelete('cascade');
            $table->foreignId('party_id')->nullable()->constrained('parties')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->date('date');
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->decimal('amount', 15, 2); // Absolute amount for convenience
            $table->decimal('running_balance', 15, 2);
            $table->nullableMorphs('referenceable');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('party_id')->constrained('parties')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->date('date');
            $table->decimal('amount', 15, 2);
            $table->string('method')->default('cash');
            $table->enum('type', ['incoming', 'outgoing']);
            $table->string('reference')->nullable();
            $table->timestamps();
        });
        
        // Notifications (Laravel Standard)
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // --- 4. WMS TABLES ---

        // Warehouses
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Warehouse Stock
        Schema::create('warehouse_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->decimal('stock_quantity', 15, 2)->default(0);
            $table->timestamps();
        });

        // Stock Movements (Updated with Warehouse)
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->decimal('quantity', 15, 2);
            $table->decimal('new_stock', 15, 2);
            $table->nullableMorphs('referenceable');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        $tables = [
            'personal_access_tokens', 'sessions', 'password_reset_tokens', 
            'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs',
            'payments', 'ledger_entries', 'purchase_items', 'purchases', 
            'invoice_items', 'invoices', 'products', 'parties', 
            'users', 'role_permissions', 'permissions', 'roles', 'companies',
            'notifications', 'stock_movements', 'accounts', 'warehouses', 'warehouse_product'
        ];
        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
