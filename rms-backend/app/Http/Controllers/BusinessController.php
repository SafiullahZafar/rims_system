<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Employee;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BusinessController extends Controller
{
    public const MODULES = [
        'dashboard.view', 'tables.view', 'orders.create', 'kitchen.view', 'payments.process',
        'reservations.manage', 'menu.manage', 'customers.view', 'supplies.view', 'employees.view',
        'employees.create', 'attendance.view', 'geofencing.view', 'reports.view', 'history.view',
        'roles.manage', 'table_setup.manage', 'business_settings.manage',
    ];

    public function index(): JsonResponse
    {
        return response()->json(
            Business::query()
                ->where('is_demo', false)
                ->with(['employees' => fn ($query) => $query
                    ->withoutGlobalScopes()
                    ->where('is_super_admin', false)
                    ->where('is_demo_user', false)
                    ->orderBy('id')])
                ->orderBy('name')
                ->get()
                ->map(fn (Business $business) => [
                    'id' => $business->id,
                    'name' => $business->name,
                    'slug' => $business->slug,
                    'is_active' => $business->is_active,
                    'module_permissions' => $business->module_permissions ?? self::MODULES,
                    'users' => $business->employees->map(fn (Employee $employee) => [
                        'id' => $employee->id,
                        'name' => $employee->name,
                        'email' => $employee->email,
                    ])->values(),
                    'created_at' => $business->created_at,
                ])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('employees', 'email'),
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'module_permissions' => ['sometimes', 'array'],
            'module_permissions.*' => ['string', Rule::in(self::MODULES)],
        ]);

        $email = strtolower(trim($data['email']));
        $password = $data['password'];

        $modules = array_values(array_unique($data['module_permissions'] ?? self::MODULES));

        $business = DB::transaction(function () use ($data, $email, $password, $modules): Business {
            $business = Business::create([
                'name' => $data['business_name'],
                'slug' => Str::slug($data['business_name']).'-'.Str::lower(Str::random(6)),
                'is_demo' => false,
                'is_active' => true,
                'module_permissions' => $modules,
            ]);
            $role = Role::create([
                'business_id' => $business->id,
                'name' => 'Owner',
                'permissions' => ['/settings'],
            ]);

            Employee::create([
                'business_id' => $business->id,
                'name' => $data['owner_name'],
                'username' => null,
                'email' => $email,
                'password' => Hash::make($password),
                'role_id' => $role->id,
                'is_active' => true,
            ]);

            return $business;
        });

        $owner = Employee::query()->withoutGlobalScopes()->where('business_id', $business->id)->where('is_super_admin', false)->first();

        return response()->json([
            'message' => 'Business and owner account created.',
            'business' => $business->only(['id', 'name', 'slug']),
            'owner' => $owner?->only(['name', 'email']),
            'credentials' => [
                'email' => $email,
                'password' => $password,
            ],
        ], 201);
    }

    public function updateStatus(Request $request, Business $business): JsonResponse
    {
        abort_if($business->is_demo, 404);

        $data = $request->validate(['is_active' => ['required', 'boolean']]);
        $business->update($data);

        return response()->json([
            'message' => $business->is_active ? 'Business enabled.' : 'Business disabled.',
            'is_active' => $business->is_active,
        ]);
    }

    public function updateModules(Request $request, Business $business): JsonResponse
    {
        abort_if($business->is_demo, 404);

        $data = $request->validate([
            'module_permissions' => ['required', 'array'],
            'module_permissions.*' => ['string', Rule::in(self::MODULES)],
        ]);
        $modules = array_values(array_unique($data['module_permissions']));
        $business->update(['module_permissions' => $modules]);

        return response()->json([
            'message' => 'Business module access updated.',
            'module_permissions' => $modules,
        ]);
    }
}
