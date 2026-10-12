<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Employee::with('role')
            ->where('business_id', $request->user()->business_id)
            ->where('is_demo_user', false)
            ->where('is_super_admin', false)
            ->orderBy('name')
            ->get());
    }

    public function store(Request $request): JsonResponse
    {
        $employee = Employee::create($this->validated($request));

        return response()->json($employee, 201);
    }

    public function show(Request $request, string $employee): JsonResponse
    {
        return response()->json($this->findInBusiness($request, $employee));
    }

    public function update(Request $request, string $employee): JsonResponse
    {
        $employee = $this->findInBusiness($request, $employee);
        $employee->update($this->validated($request, $employee));

        return response()->json($employee->fresh());
    }

    public function destroy(Request $request, string $employee): JsonResponse
    {
        $employee = $this->findInBusiness($request, $employee);
        $employee->delete();

        return response()->json(['message' => 'Employee deleted.']);
    }

    private function findInBusiness(Request $request, string $id): Employee
    {
        return Employee::query()
            ->where('business_id', $request->user()->business_id)
            ->where('is_super_admin', false)
            ->where('is_demo_user', false)
            ->findOrFail($id);
    }

    private function validated(Request $request, ?Employee $employee = null): array
    {
        $emailRule = Rule::unique('employees', 'email')->where('business_id', $request->user()->business_id);

        if ($employee !== null) {
            $emailRule->ignore($employee->id);
        }

        return $request->validate([
            'name'              => [$employee ? 'sometimes' : 'required', 'string', 'max:255'],
            'email'             => ['nullable', 'email', 'max:255', $emailRule],
            'phone'             => ['nullable', 'string', 'max:50'],
            'role_id'           => [
                $employee ? 'sometimes' : 'required',
                Rule::exists('roles', 'id')->where('business_id', $request->user()->business_id),
            ],
            'pin'               => ['nullable', 'string', 'max:20'],
            'is_active'         => ['sometimes', 'boolean'],
            'extra_permissions' => ['sometimes', 'nullable', 'array'],
            'extra_permissions.*' => ['string'],
        ]);
    }
}
