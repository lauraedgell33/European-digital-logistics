<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware that ensures the authenticated user can only access
 * resources belonging to their company (multi-tenancy enforcement).
 *
 * For admin users, access is not restricted.
 */
class EnsureCompanyAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Unauthenticated or admin — skip
        if (!$user || $user->role === 'admin') {
            return $next($request);
        }

        // If user has no company, deny access
        if (!$user->company_id) {
            return response()->json([
                'message' => 'Your account is not associated with any company. Please contact support.',
            ], 403);
        }

        // Check route model bindings for company_id mismatch
        foreach ($request->route()->parameters() as $param) {
            if (is_object($param) && property_exists($param, 'company_id')) {
                if ($param->company_id !== $user->company_id) {
                    return response()->json([
                        'message' => 'You do not have access to this resource.',
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
