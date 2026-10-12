<?php

namespace App\Http\Middleware;

use App\Models\DemoVisitor;
use App\Models\Business;
use App\Models\Employee;
use App\Services\DemoWorkspaceCloner;
use App\Support\BusinessContext;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                if ($user instanceof DemoVisitor && $business->template_business_id && ! $business->demo_data_initialized_at) {
                    DB::transaction(function () use ($business): void {
                        $lockedBusiness = Business::query()->lockForUpdate()->find($business->id);
                        if ($lockedBusiness && ! $lockedBusiness->demo_data_initialized_at && $lockedBusiness->template_business_id) {
                            app(DemoWorkspaceCloner::class)->clone($lockedBusiness->template_business_id, $lockedBusiness->id);
                            $lockedBusiness->update(['demo_data_initialized_at' => now()]);
                        }
                    });
                }

                return $next($request);
            }

            return response()->json(['message' => 'This business account is disabled.'], 403);
        }

        return response()->json(['message' => 'A business account is required.'], 403);
    }
}
