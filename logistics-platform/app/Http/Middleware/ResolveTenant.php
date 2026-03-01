<?php

namespace App\Http\Middleware;

use App\Services\MultiTenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the current tenant from subdomain, custom domain, or X-Tenant-ID header.
 * Sets tenant context for the request lifecycle.
 */
class ResolveTenant
{
    public function __construct(private MultiTenantService $tenantService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->tenantService->resolveFromRequest($request);

        if ($tenant) {
            $this->tenantService->setTenant($tenant);

            // Attach tenant info to response headers (for debugging / frontend)
            $response = $next($request);

            if ($response instanceof \Illuminate\Http\JsonResponse || method_exists($response, 'header')) {
                $response->header('X-Tenant', $tenant->subdomain);
                $response->header('X-Tenant-Plan', $tenant->plan);
            }

            return $response;
        }

        // No tenant found — continue as platform (non-white-label)
        return $next($request);
    }
}
