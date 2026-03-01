<?php

namespace App\Http\Middleware;

use App\Services\MultiTenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Checks if the current tenant has a specific feature enabled.
 * Usage: ->middleware('tenant.feature:route_optimization')
 */
class CheckTenantFeature
{
    public function __construct(private MultiTenantService $tenantService) {}

    public function handle(Request $request, Closure $next, string $feature): Response
    {
        if (!$this->tenantService->hasFeature($feature)) {
            return response()->json([
                'message' => 'This feature is not available on your current plan.',
                'feature' => $feature,
                'upgrade_url' => '/settings/billing',
            ], 403);
        }

        return $next($request);
    }
}
