<?php

namespace App\Http\Middleware;

use App\Models\DemoVisitor;
use App\Models\Business;
use App\Models\Employee;
use App\Support\BusinessContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof Employee && $user->is_super_admin) {
            $businessId = BusinessContext::id();
            $business = $businessId
                ? Business::query()->whereKey($businessId)->where('is_active', true)->where('is_demo', false)->first()
                : null;

            if (! $business) {
                return response()->json(['message' => 'Select an active business workspace to use its modules.'], 422);
            }

            return $next($request);
        }

        if (($user instanceof Employee && ! $user->is_super_admin && $user->business_id)
            || ($user instanceof DemoVisitor && $user->business_id)) {
            $business = Business::query()->whereKey($user->business_id)->where('is_active', true)->first();
            if ($business) {
                return $next($request);
            }

            return response()->json(['message' => 'This business account is disabled.'], 403);
        }

        return response()->json(['message' => 'A business account is required.'], 403);
    }
}
