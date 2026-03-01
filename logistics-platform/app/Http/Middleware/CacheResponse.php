<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cache GET API responses in Redis with per-user or public keys.
 *
 * Usage in routes:
 *   ->middleware('cache.response:300')       // 5 min, per-user
 *   ->middleware('cache.response:3600,public') // 1 hour, shared across users
 */
class CacheResponse
{
    public function handle(Request $request, Closure $next, int $ttl = 300, string $scope = 'user'): Response
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Skip caching when explicitly requested
        if ($request->header('Cache-Control') === 'no-cache') {
            return $next($request);
        }

        $cacheKey = $this->buildCacheKey($request, $scope);

        $cached = Cache::store('redis')->get($cacheKey);

        if ($cached !== null) {
            $response = response($cached['body'], $cached['status'])
                ->withHeaders($cached['headers'] ?? []);
            $response->headers->set('X-Cache', 'HIT');
            $response->headers->set('X-Cache-TTL', (string) $ttl);
            return $response;
        }

        /** @var Response $response */
        $response = $next($request);

        // Only cache successful JSON responses
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            $data = [
                'body' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => [
                    'Content-Type' => $response->headers->get('Content-Type'),
                ],
            ];

            Cache::store('redis')->put($cacheKey, $data, $ttl);

            $response->headers->set('X-Cache', 'MISS');
            $response->headers->set('X-Cache-TTL', (string) $ttl);
        }

        return $response;
    }

    private function buildCacheKey(Request $request, string $scope): string
    {
        $path = $request->path();
        $query = $request->query();
        ksort($query);
        $queryString = http_build_query($query);

        $parts = ['api_cache', $path];

        if ($scope === 'user' && $request->user()) {
            $parts[] = 'u' . $request->user()->id;
            $parts[] = 'c' . $request->user()->company_id;
        }

        if ($queryString) {
            $parts[] = md5($queryString);
        }

        return implode(':', $parts);
    }
}
