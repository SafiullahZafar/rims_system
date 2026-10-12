<?php

namespace App\Http\Middleware;

use App\Models\Employee;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $configuredUsername = config('rims.super_admin');

        if ($user instanceof Employee
            && $user->is_super_admin
            && $configuredUsername
            && hash_equals(strtolower($configuredUsername), strtolower((string) $user->username))) {
            return $next($request);
        }

        return response()->json(['message' => 'Super administrator access is required.'], 403);
    }
}
