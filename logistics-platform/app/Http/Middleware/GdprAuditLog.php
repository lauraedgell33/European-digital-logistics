<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GdprAuditLog
{
    /**
     * Log data access for GDPR compliance.
     * Tracks who accessed personal data and when.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log successful GET requests to sensitive endpoints
        if (
            $request->user() &&
            $request->isMethod('GET') &&
            $response->isSuccessful() &&
            $this->isSensitiveEndpoint($request->path())
        ) {
            activity('gdpr_access')
                ->causedBy($request->user())
                ->withProperties([
                    'endpoint' => $request->path(),
                    'method' => $request->method(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'query_params' => $request->query(),
                ])
                ->log("Accessed {$request->path()}");
        }

        return $response;
    }

    protected function isSensitiveEndpoint(string $path): bool
    {
        $sensitivePatterns = [
            'auth/profile',
            'companies/',
            'users/',
            'orders/',
            'export/',
        ];

        foreach ($sensitivePatterns as $pattern) {
            if (str_contains($path, $pattern)) {
                return true;
            }
        }

        return false;
    }
}
