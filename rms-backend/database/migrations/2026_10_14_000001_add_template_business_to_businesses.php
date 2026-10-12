<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->foreignId('template_business_id')->nullable()->after('is_demo')->constrained('businesses')->nullOnDelete();
            $table->timestamp('demo_data_initialized_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('template_business_id');
            $table->dropColumn('demo_data_initialized_at');
        });
    }
};
