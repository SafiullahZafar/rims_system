<?php

namespace App\Models;

use Illuminate\Support\Facades\Hash;

class LoginCredential
{
    private const BUSINESS_MODULES = [
        'dashboard.view', 'tables.view', 'orders.create', 'kitchen.view', 'payments.process',
        'reservations.manage', 'menu.manage', 'customers.view', 'supplies.view', 'employees.view',
        'employees.create', 'attendance.view', 'geofencing.view', 'reports.view', 'history.view',
        'roles.manage', 'table_setup.manage', 'business_settings.manage',
    ];

    public static function attempt(array $credentials): ?array
    {
        $type = $credentials['type'];

        if ($type === 'admin') {
            $email = strtolower(trim($credentials['email'] ?? ''));
            $password = $credentials['password'] ?? '';
            $configuredUsername = strtolower(trim((string) config('rims.super_admin')));
            $employee = Employee::query()
                ->withoutGlobalScopes()
                ->with(['role' => fn ($query) => $query->withoutGlobalScopes()])
                ->where('is_active', true)
                ->where('email', $email)
                ->first();

            if (! $employee || ! $employee->password || ! Hash::check($password, $employee->password)) {
                return null;
            }

            $storedSuperAdminName = strtolower(trim((string) ($employee->username ?: $employee->name)));
            $isSuperAdmin = $configuredUsername !== ''
                && hash_equals($configuredUsername, $storedSuperAdminName);
            if ($employee->is_super_admin && ! $isSuperAdmin) {
                return null;
            }
            $empPermissions = $employee->role?->permissions ?? [];
            if (! $isSuperAdmin && ! in_array('/settings', $empPermissions) && ! in_array('/admin', $empPermissions)) {
                return null;
            }
            if (! $isSuperAdmin && ! Business::query()->whereKey($employee->business_id)->where('is_active', true)->exists()) {
                return null;
            }
        } else {
            $pin = $credentials['pin'] ?? '';
            if (empty($pin)) {
                return null;
            }
            $employee = Employee::query()
                ->withoutGlobalScopes()
                ->with(['role' => fn ($query) => $query->withoutGlobalScopes()])
                ->where('pin', $pin)
                ->whereNotNull('pin')
                ->where('is_active', true)
                ->where('is_super_admin', false)
                ->first();

            if (! $employee) {
                return null;
            }

            // Prevent admins from logging in via PIN (only regular employees can use PIN)
            $empPermissions = $employee->role?->permissions ?? [];
            if (in_array('/settings', $empPermissions)) {
                return null;
            }
        }

        $roleName = $employee->is_super_admin ? 'Super Admin' : ($employee->role ? $employee->role->name : 'Employee');
        $rolePermissions  = $employee->role ? ($employee->role->permissions ?? []) : [];
        $extraPermissions = $employee->extra_permissions ?? [];
        // Merge: role permissions PLUS any individual overrides (no duplicates)
        $permissions = array_values(array_unique(array_merge(
            array_values(array_filter(array_merge($rolePermissions, $extraPermissions), fn ($permission) => $permission !== '/admin')),
        )));

        if (! $employee->is_super_admin) {
            $businessModules = Business::query()->find($employee->business_id)?->module_permissions ?? self::BUSINESS_MODULES;
            $isBusinessAdmin = in_array('/settings', $rolePermissions, true) || in_array('/admin', $rolePermissions, true);
            $grantedModules = $isBusinessAdmin
                ? $businessModules
                : array_values(array_intersect($permissions, $businessModules));
            $permissions = array_values(array_unique(array_merge($permissions, $grantedModules)));
        }

        // Determine default screen based on permissions
        $screen = $employee->is_super_admin ? 'super-admin/businesses' : 'tables';
        if ($employee->is_super_admin) {
            $permissions = ['super_admin'];
        } elseif (in_array('/dashboard', $permissions) || in_array('/admin', $permissions)) {
            $screen = 'dashboard';
        } elseif (in_array('/kitchen', $permissions) && ! in_array('/tables', $permissions)) {
            $screen = 'kitchen';
        }

        return [
            'employee'      => $employee,
            'name'          => $employee->name,
            'role_name'     => $roleName,
            'role'          => strtolower($roleName),
            'screen'        => $screen,
            'permissions'   => $permissions,
            'account_type'  => $employee->is_super_admin ? 'super_admin' : 'business',
            'is_super_admin' => (bool) $employee->is_super_admin,
        ];
    }

    public static function failureMessage(string $type): string
    {
        return $type === 'admin'
            ? 'Invalid admin email or password.'
            : 'Invalid PIN entered.';
    }
}
