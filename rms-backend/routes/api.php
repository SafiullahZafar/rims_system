<?php

use App\Http\Controllers\AttendanceLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\KitchenOrderController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RestaurantTableController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupplyController;
use App\Http\Middleware\EnsureBusinessUser;
use App\Http\Middleware\EnsureModuleAccess;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\LogDemoActivity;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/demo/login', [DemoController::class, 'login'])->middleware('throttle:12,1');

Route::middleware(['auth:sanctum', EnsureBusinessUser::class, EnsureModuleAccess::class, LogDemoActivity::class])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('menu-items', MenuItemController::class);
    Route::apiResource('roles', RoleController::class)->middleware('can:viewAny,App\Models\Role');
    Route::apiResource('employees', EmployeeController::class)->middleware('can:viewAny,App\Models\Employee');
    Route::apiResource('tables', RestaurantTableController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('kitchen-orders', KitchenOrderController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::apiResource('customers', CustomerController::class)->except(['show']);
    Route::apiResource('attendance', AttendanceLogController::class)->except(['show']);
    Route::apiResource('expenses', ExpenseController::class)->except(['show']);

    // Supplies
    Route::apiResource('supplies', SupplyController::class)->except(['show']);
    Route::get('supplies/{supply}/logs', [SupplyController::class, 'logs']);
    Route::post('supplies/{supply}/logs', [SupplyController::class, 'addLog']);
    Route::delete('supplies/{supply}/logs/{log}', [SupplyController::class, 'deleteLog']);
});

Route::middleware(['auth:sanctum', EnsureSuperAdmin::class])->prefix('super-admin')->group(function () {
    Route::get('businesses', [BusinessController::class, 'index']);
    Route::post('businesses', [BusinessController::class, 'store']);
    Route::patch('businesses/{business}', [BusinessController::class, 'updateStatus']);
    Route::put('businesses/{business}/modules', [BusinessController::class, 'updateModules']);
    Route::get('demo-activity', [DemoController::class, 'activity']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
