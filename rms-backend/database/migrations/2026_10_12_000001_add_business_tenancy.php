<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tenantTables = [
        'roles',
        'employees',
        'restaurant_tables',
        'menu_items',
        'orders',
        'order_items',
        'kitchen_orders',
        'kitchen_order_items',
        'customers',
        'attendance_logs',
        'expenses',
        'supplies',
        'supply_logs',
    ];

    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_demo')->default(false)->index();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('businesses')->insert([
            'name' => 'RIMS Shared Demo',
            'slug' => 'rims-shared-demo',
            'is_demo' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $existingBusinessId = DB::table('businesses')->insertGetId([
            'name' => 'Migrated RIMS Workspace',
            'slug' => 'migrated-rims-workspace',
            'is_demo' => false,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($this->tenantTables as $tenantTable) {
            Schema::table($tenantTable, function (Blueprint $table) use ($tenantTable) {
                $table->foreignId('business_id')->nullable()->after('id')->constrained('businesses')->nullOnDelete();

                if ($tenantTable === 'restaurant_tables') {
                    $table->unsignedInteger('table_number')->nullable();
                } elseif ($tenantTable === 'roles') {
                    $table->dropUnique('roles_name_unique');
                } elseif ($tenantTable === 'orders') {
                    $table->dropUnique('orders_code_unique');
                } elseif ($tenantTable === 'kitchen_orders') {
                    $table->dropUnique('kitchen_orders_code_unique');
                } elseif ($tenantTable === 'customers') {
                    $table->dropUnique('customers_phone_unique');
                }
            });

            DB::table($tenantTable)->whereNull('business_id')->update(['business_id' => $existingBusinessId]);
        }

        Schema::table('roles', function (Blueprint $table) {
            $table->unique(['business_id', 'name']);
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->unique(['business_id', 'code']);
        });
        Schema::table('kitchen_orders', function (Blueprint $table) {
            $table->unique(['business_id', 'code']);
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->unique(['business_id', 'phone']);
        });
        Schema::table('restaurant_tables', function (Blueprint $table) {
            $table->unique(['business_id', 'table_number']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('username')->nullable()->unique();
            $table->boolean('is_super_admin')->default(false);
            $table->boolean('is_demo_user')->default(false);
        });

        Schema::create('demo_visitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('demo_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demo_visitor_id')->constrained()->cascadeOnDelete();
            $table->string('method', 10);
            $table->string('path');
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_activity_logs');
        Schema::dropIfExists('demo_visitors');

        Schema::table('employees', function (Blueprint $table) {
            $table->unique('email');
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'is_super_admin', 'is_demo_user']);
        });

        Schema::table('roles', fn (Blueprint $table) => $table->dropUnique('roles_business_id_name_unique'));
        Schema::table('orders', fn (Blueprint $table) => $table->dropUnique('orders_business_id_code_unique'));
        Schema::table('kitchen_orders', fn (Blueprint $table) => $table->dropUnique('kitchen_orders_business_id_code_unique'));
        Schema::table('customers', fn (Blueprint $table) => $table->dropUnique('customers_business_id_phone_unique'));
        Schema::table('restaurant_tables', function (Blueprint $table) {
            $table->dropUnique('restaurant_tables_business_id_table_number_unique');
            $table->dropColumn('table_number');
        });

        foreach (array_reverse($this->tenantTables) as $tenantTable) {
            Schema::table($tenantTable, function (Blueprint $table) {
                $table->dropConstrainedForeignId('business_id');
            });
        }

        Schema::table('roles', function (Blueprint $table) {
            $table->unique('name');
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->unique('code');
        });
        Schema::table('kitchen_orders', function (Blueprint $table) {
            $table->unique('code');
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->unique('phone');
        });

        Schema::dropIfExists('businesses');
    }
};
