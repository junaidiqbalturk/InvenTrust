<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function run(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('box_quantity')->default(1)->after('stock_quantity');
            $table->string('batch_number')->nullable()->after('sku');
            $table->foreignId('warehouse_id')->nullable()->after('tax_rule_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['warehouse_id']);
            $table->dropColumn(['box_quantity', 'batch_number', 'warehouse_id']);
        });
    }
};
