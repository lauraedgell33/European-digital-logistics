<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tracks request performance metrics in Redis for Prometheus scraping.
 *
 * Collected metrics:
 * - request count by method, path pattern, status code
 * - request duration histogram
 * - active request gauge
 * - slow query count
 */
class TrackPerformance
{
    private const METRICS_PREFIX = 'apm:';

    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        // Increment active requests (fail-safe if Redis is unavailable)
        try {
            Redis::incr(self::METRICS_PREFIX . 'active_requests');
        } catch (\Exception $e) {
            // Redis unavailable — skip metrics
        }

        /** @var Response $response */
        $response = $next($request);

        $duration = microtime(true) - $start;
        $method = $request->method();
        $path = $this->normalizeRoutePath($request);
        $status = $response->getStatusCode();
        $statusGroup = intdiv($status, 100) . 'xx';

        try {
            // Decrement active requests
            Redis::decr(self::METRICS_PREFIX . 'active_requests');

            // Store metrics in Redis (atomic pipeline)
            Redis::pipeline(function ($pipe) use ($method, $path, $status, $statusGroup, $duration) {
                $key = self::METRICS_PREFIX . 'requests';

                // Request count
                $pipe->hincrby($key, "count:{$method}:{$path}:{$status}", 1);
                $pipe->hincrby($key, "count_total", 1);
                $pipe->hincrby($key, "count_{$statusGroup}", 1);

                // Duration tracking (for averages, stored as sum + count)
                $durationMs = round($duration * 1000, 2);
                $pipe->hincrbyfloat($key, "duration_sum:{$method}:{$path}", $durationMs);
                $pipe->hincrby($key, "duration_count:{$method}:{$path}", 1);

            // Duration histogram buckets (ms)
            $buckets = [50, 100, 250, 500, 1000, 2500, 5000, 10000];
            foreach ($buckets as $bucket) {
                if ($durationMs <= $bucket) {
                    $pipe->hincrby($key, "duration_bucket:{$bucket}", 1);
                }
            }
            $pipe->hincrby($key, "duration_bucket:+Inf", 1);

            // Track slow requests (>1000ms)
            if ($durationMs > 1000) {
                $pipe->hincrby($key, 'slow_requests', 1);
            }

            // Peak response time tracking
            $pipe->set(self::METRICS_PREFIX . 'last_request_ms', $durationMs);
        });
        } catch (\Exception $e) {
            // Redis unavailable — skip metrics silently
        }

        // Add Server-Timing header for browser DevTools
        $durationMs = round($duration * 1000, 2);
        $response->headers->set('Server-Timing', "app;dur={$durationMs}");

        return $response;
    }

    /**
     * Normalize route path to avoid cardinality explosion.
     * e.g., /api/v1/freight/123 → /api/v1/freight/{id}
     */
    private function normalizeRoutePath(Request $request): string
    {
        $route = $request->route();
        if ($route) {
            return '/' . ltrim($route->uri(), '/');
        }

        // Fallback: replace numeric segments
        $path = $request->path();
        return preg_replace('/\/\d+/', '/{id}', $path) ?? $path;
    }
}
