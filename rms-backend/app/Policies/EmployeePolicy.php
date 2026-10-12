<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\DemoVisitor;

class EmployeePolicy
{
    public function viewAny(Employee|DemoVisitor $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    public function view(Employee|DemoVisitor $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    public function create(Employee|DemoVisitor $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    public function update(Employee|DemoVisitor $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    public function delete(Employee|DemoVisitor $employee): bool
    {
        return $this->canManageSettings($employee);
    }

    private function canManageSettings(Employee|DemoVisitor $employee): bool
    {
        if ($employee instanceof Employee && $employee->is_super_admin) {
            return true;
        }
        if ($employee instanceof DemoVisitor) {
            return true;
        }

        return in_array('/settings', $employee->role?->permissions ?? []);
    }
}
