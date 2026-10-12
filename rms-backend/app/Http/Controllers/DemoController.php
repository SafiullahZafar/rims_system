<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\DemoActivityLog;
use App\Models\DemoVisitor;
use App\Services\DemoWorkspaceCloner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DemoController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $visitor = DB::transaction(function () use ($request): DemoVisitor {
            $seedBusiness = Business::query()
                ->where('slug', 'rims-shared-demo')
                ->where('is_demo', true)
                ->where('is_active', true)
                ->firstOrFail();

            $sessionBusiness = Business::query()->create([
                'name' => 'Demo visitor workspace',
                'slug' => 'demo-visit-'.Str::lower((string) Str::uuid()),
                'is_demo' => true,
                'is_active' => true,
                'template_business_id' => $seedBusiness->id,
            ]);

            app(DemoWorkspaceCloner::class)->clone($seedBusiness->id, $sessionBusiness->id);
            $sessionBusiness->update(['demo_data_initialized_at' => now()]);

            $visitor = DemoVisitor::query()->create([
                'business_id' => $sessionBusiness->id,
                'name' => 'demouser_pending',
                'ip_address' => $request->ip(),
            ]);
            $visitor->update(['name' => 'demouser_'.$visitor->id]);

            DemoActivityLog::create([
                'demo_visitor_id' => $visitor->id,
                'method' => 'POST',
                'path' => 'api/demo/login',
                'ip_address' => $request->ip(),
            ]);

            return $visitor;
        });

        return response()->json([
            'message' => 'Demo access started.',
            'token' => $visitor->createToken('demo_session')->plainTextToken,
            'name' => $visitor->name,
            'role_name' => 'Demo User',
            'role' => 'demo',
            'account_type' => 'demo',
            'is_demo' => true,
            'is_super_admin' => false,
            'screen' => 'dashboard',
            'permissions' => array_values(array_unique(array_merge(['/admin', '/settings'], BusinessController::MODULES))),
        ], 201);
    }

    public function activity(): JsonResponse
    {
        return response()->json(
            DemoVisitor::query()
                ->withCount('activityLogs')
                ->withMax('activityLogs', 'created_at')
                ->with(['activityLogs' => fn ($query) => $query->latest()->limit(100)])
                ->latest()
                ->limit(200)
                ->get()
                ->map(fn (DemoVisitor $visitor) => [
                    'id' => $visitor->id,
                    'name' => $visitor->name,
                    'ip_address' => $visitor->ip_address,
                    'started_at' => $visitor->created_at,
                    'last_seen_at' => $visitor->activity_logs_max_created_at ?? $visitor->created_at,
                    'logs_count' => $visitor->activity_logs_count,
                    'logs' => $visitor->activityLogs->map(fn (DemoActivityLog $log) => [
                        'id' => $log->id,
                        'method' => $log->method,
                        'path' => $log->path,
                        'ip_address' => $log->ip_address,
                        'created_at' => $log->created_at,
                    ])->values(),
                ])
        );
    }
}
