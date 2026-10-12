<?php

namespace App\Http\Middleware;

use App\Models\DemoActivityLog;
use App\Models\DemoVisitor;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogDemoActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $visitor = Auth::guard('sanctum')->user();

        if ($visitor instanceof DemoVisitor) {
            DemoActivityLog::create([
                'demo_visitor_id' => $visitor->id,
                'method' => $request->method(),
                'path' => $request->path(),
                'ip_address' => $request->ip(),
            ]);
        }

        return $response;
    }
}
