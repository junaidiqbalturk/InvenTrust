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
        Schema::table('accounts', function (Blueprint $table) {
            if (!Schema::hasColumn('accounts', 'parent_id')) {
                $table->foreignId('parent_id')->nullable()->after('type')->constrained('accounts')->onDelete('cascade');
            }
            if (!Schema::hasColumn('accounts', 'description')) {
                $table->text('description')->nullable()->after('parent_id');
            }
            if (!Schema::hasColumn('accounts', 'is_system')) {
                $table->boolean('is_system')->default(false)->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'description', 'is_system']);
        });
    }
};
