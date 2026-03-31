<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bank_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->string('filename');
            $table->date('upload_date');
            $table->string('status')->default('pending'); // pending, processing, completed
            $table->timestamps();
        });

        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('bank_statement_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['debit', 'credit']);
            $table->boolean('is_reconciled')->default(false);
            $table->foreignId('ledger_entry_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });

        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->boolean('is_reconciled')->default(false);
            $table->foreignId('bank_transaction_id')->nullable()->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->dropColumn(['is_reconciled', 'bank_transaction_id']);
        });
        Schema::dropIfExists('bank_transactions');
        Schema::dropIfExists('bank_statements');
    }
};
