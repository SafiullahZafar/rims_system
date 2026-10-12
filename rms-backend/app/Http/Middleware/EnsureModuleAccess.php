<?php

namespace App\Http\Middleware;

use App\Models\Business;
use App\Models\DemoVisitor;
use App\Models\Employee;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleAccess
{
    private const ROUTE_MODULES = [
        'menu-items' => 'menu.manage',
        'tables' => 'tables.view',
        'orders' => 'orders.create',
        'kitchen-orders' => 'kitchen.view',
        'roles' => 'roles.manage',
        'employees' => 'employees.view',
        'customers' => 'customers.view',
        'attendance' => 'attendance.view',
        'expenses' => 'reports.view',
        'supplies' => 'supplies.view',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user instanceof Employee && ! $user instanceof DemoVisitor) {
            return $next($request);
        }

        $route = $request->segment(2);
        $module = self::ROUTE_MODULES[$route] ?? null;
        if ($route === 'employees' && $request->isMethod('post')) {
            $module = 'employees.create';
        }
        if ($module === null || $user instanceof DemoVisitor) {
            return $next($request);
        }

        $business = Business::query()->find($user->business_id);
        $enabledModules = $business?->module_permissions;

        // Null preserves access for workspaces created before module-level controls existed.
        if ($enabledModules !== null && ! in_array($module, $enabledModules, true)) {
            return response()->json(['message' => 'Your business does not have access to this module.'], 403);
        }

        return $next($request);
    }
}
