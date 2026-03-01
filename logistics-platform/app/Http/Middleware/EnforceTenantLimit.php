<?php

namespace App\Http\Middleware;

use App\Services\MultiTenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforces plan-based usage limits for the current tenant.
 * Usage: ->middleware('tenant.limit:freight') or tenant.limit:orders
 */
class EnforceTenantLimit
{
    public function __construct(private MultiTenantService $tenantService) {}

    public function handle(Request $request, Closure $next, string $resource): Response
    {
        $check = $this->tenantService->checkLimit($resource);

        if (!$check['allowed']) {
            return response()->json([
                'message' => "You have reached your plan's limit for {$resource}.",
                'usage' => $check['usage'],
                'limit' => $check['limit'],
                'upgrade_url' => '/settings/billing',
            ], 429);
        }

        return $next($request);
    }
}
