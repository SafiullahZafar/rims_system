<?php

namespace App\Support;

use App\Models\Employee;
use App\Models\Business;
use Illuminate\Support\Facades\Auth;

class BusinessContext
{
    public static function id(): ?int
    {
        $user = Auth::user();
        if (! $user) {
            return null;
        }

        if ($user instanceof Employee && $user->is_super_admin) {
            $configuredUsername = strtolower(trim((string) config('rims.super_admin')));
            $storedUsername = strtolower(trim((string) ($user->username ?: $user->name)));
            if ($configuredUsername === '' || ! hash_equals($configuredUsername, $storedUsername)) {
                return null;
            }
            $businessId = request()->header('X-Business-Id');
            if (! is_numeric($businessId) || (int) $businessId < 1) {
                return null;
            }

            return Business::query()->whereKey((int) $businessId)->where('is_active', true)->where('is_demo', false)->value('id');
        }

        return $user->business_id ? (int) $user->business_id : null;
    }
}
