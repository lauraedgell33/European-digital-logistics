<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

/**
 * Exposes Prometheus-compatible metrics endpoint.
 * GET /api/metrics
 */
class MetricsController extends Controller
{
    private const APM_PREFIX = 'apm:';

    public function __invoke(Request $request): Response
    {
        $apiKey = config('services.health_check.api_key', env('HEALTH_CHECK_API_KEY'));
        if ($apiKey && $request->header('X-Health-API-Key') !== $apiKey) {
            return response('Unauthorized', 401);
        }

        $lines = [];

        // ── Application Request Metrics ─────────────────────
        $metrics = Redis::hgetall(self::APM_PREFIX . 'requests') ?: [];

        // Total request count
        $total = $metrics['count_total'] ?? 0;
        $lines[] = '# HELP http_requests_total Total number of HTTP requests';
        $lines[] = '# TYPE http_requests_total counter';
        $lines[] = "http_requests_total {$total}";

        // Requests by status group
        foreach (['2xx', '3xx', '4xx', '5xx'] as $group) {
            $count = $metrics["count_{$group}"] ?? 0;
            $lines[] = "http_requests_total{status_group=\"{$group}\"} {$count}";
        }

        // Request duration histogram
        $buckets = [50, 100, 250, 500, 1000, 2500, 5000, 10000];
        $lines[] = '';
        $lines[] = '# HELP http_request_duration_milliseconds HTTP request duration in milliseconds';
        $lines[] = '# TYPE http_request_duration_milliseconds histogram';
        foreach ($buckets as $bucket) {
            $count = $metrics["duration_bucket:{$bucket}"] ?? 0;
            $lines[] = "http_request_duration_milliseconds_bucket{le=\"{$bucket}\"} {$count}";
        }
        $infCount = $metrics['duration_bucket:+Inf'] ?? 0;
        $lines[] = "http_request_duration_milliseconds_bucket{le=\"+Inf\"} {$infCount}";

        // Slow requests
        $slowCount = $metrics['slow_requests'] ?? 0;
        $lines[] = '';
        $lines[] = '# HELP http_slow_requests_total Requests slower than 1000ms';
        $lines[] = '# TYPE http_slow_requests_total counter';
        $lines[] = "http_slow_requests_total {$slowCount}";

        // Active requests
        $active = Redis::get(self::APM_PREFIX . 'active_requests') ?? 0;
        $lines[] = '';
        $lines[] = '# HELP http_active_requests Currently processing requests';
        $lines[] = '# TYPE http_active_requests gauge';
        $lines[] = "http_active_requests {$active}";

        // ── Per-Route Metrics ───────────────────────────────
        $lines[] = '';
        $lines[] = '# HELP http_request_duration_avg_ms Average request duration per route';
        $lines[] = '# TYPE http_request_duration_avg_ms gauge';

        foreach ($metrics as $key => $value) {
            if (str_starts_with($key, 'duration_sum:')) {
                $routeKey = substr($key, 13); // Remove "duration_sum:"
                $countKey = "duration_count:{$routeKey}";
                $count = $metrics[$countKey] ?? 1;
                $avg = round((float) $value / max((int) $count, 1), 2);
                [$method, $path] = explode(':', $routeKey, 2) + ['', ''];
                $lines[] = "http_request_duration_avg_ms{method=\"{$method}\",path=\"{$path}\"} {$avg}";
            }
        }

        // ── Database Metrics ────────────────────────────────
        $lines[] = '';
        $lines[] = '# HELP mysql_connections_active Active MySQL connections';
        $lines[] = '# TYPE mysql_connections_active gauge';
        try {
            $connections = DB::selectOne("SHOW STATUS WHERE Variable_name = 'Threads_connected'");
            $lines[] = "mysql_connections_active " . ($connections->Value ?? 0);
        } catch (\Exception $e) {
            $lines[] = "mysql_connections_active 0";
        }

        // ── Queue Metrics ───────────────────────────────────
        $lines[] = '';
        $lines[] = '# HELP laravel_queue_size Current queue size';
        $lines[] = '# TYPE laravel_queue_size gauge';
        try {
            $queueSize = Redis::llen('queues:default') ?? 0;
            $lines[] = "laravel_queue_size{queue=\"default\"} {$queueSize}";
        } catch (\Exception $e) {
            $lines[] = "laravel_queue_size{queue=\"default\"} 0";
        }

        // ── Application Info ────────────────────────────────
        $lines[] = '';
        $lines[] = '# HELP laravel_app_info Application information';
        $lines[] = '# TYPE laravel_app_info gauge';
        $version = config('app.version', '1.0.0');
        $env = config('app.env', 'production');
        $lines[] = "laravel_app_info{version=\"{$version}\",environment=\"{$env}\",php_version=\"" . PHP_VERSION . "\"} 1";

        return response(implode("\n", $lines), 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
    }
}
