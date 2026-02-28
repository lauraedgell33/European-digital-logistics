<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    public function __construct(
        protected RateLimiter $limiter
    ) {}

    /**
     * Handle an incoming request with custom rate limiting.
     *
     * Limits:
     *  - Login: 5 attempts/minute per IP
     *  - Authenticated API: 60 requests/minute
     *  - Guest API: 30 requests/minute
     */
    public function handle(Request $request, Closure $next, string $type = 'api'): Response
    {
        $key = $this->resolveKey($request, $type);
        $maxAttempts = $this->resolveMaxAttempts($request, $type);
        $decaySeconds = 60;

        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = $this->limiter->availableIn($key);

            return response()->json([
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $retryAfter,
            ], Response::HTTP_TOO_MANY_REQUESTS)
                ->header('Retry-After', $retryAfter)
                ->header('X-RateLimit-Limit', $maxAttempts)
                ->header('X-RateLimit-Remaining', 0);
        }

        $this->limiter->hit($key, $decaySeconds);

        $response = $next($request);

        return $this->addRateLimitHeaders(
            $response,
            $maxAttempts,
            $this->limiter->remaining($key, $maxAttempts)
        );
    }

    /**
     * Build a unique cache key based on request type.
     */
    protected function resolveKey(Request $request, string $type): string
    {
        if ($type === 'login') {
            return 'rate_limit:login:' . $request->ip();
        }

        $userId = $request->user()?->id ?? 'guest';

        return 'rate_limit:api:' . $userId . ':' . $request->ip();
    }

    /**
     * Determine the maximum number of allowed attempts.
     */
    protected function resolveMaxAttempts(Request $request, string $type): int
    {
        if ($type === 'login') {
            return (int) config('app.rate_limit_login', 5);
        }

        if ($request->user()) {
            return (int) config('app.rate_limit_api_authenticated', 60);
        }

        return (int) config('app.rate_limit_api_guest', 30);
    }

    /**
     * Attach rate-limit headers to the response.
     */
    protected function addRateLimitHeaders(Response $response, int $maxAttempts, int $remaining): Response
    {
        $response->headers->set('X-RateLimit-Limit', (string) $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', (string) max(0, $remaining));

        return $response;
    }
}
