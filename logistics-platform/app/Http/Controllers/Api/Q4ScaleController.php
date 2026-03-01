<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MultiTenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class Q4ScaleController extends Controller
{
    // ═══════════════════════════════════════════════════════════════
    // MULTI-TENANT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    public function provisionTenant(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer|exists:companies,id',
            'plan' => 'required|in:starter,professional,enterprise',
            'subdomain' => 'nullable|string|max:63|regex:/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/',
            'custom_domain' => 'nullable|string|max:255',
        ]);

        $service = new MultiTenantService();
        $tenant = $service->provision(
            $request->input('company_id'),
            $request->input('plan'),
            $request->only(['subdomain', 'custom_domain'])
        );

        return response()->json([
            'status' => 'provisioned',
            'tenant' => $tenant,
        ], 201);
    }

    public function deprovisionTenant(Request $request, int $tenantId): JsonResponse
    {
        $service = new MultiTenantService();
        $service->deprovision($tenantId);

        return response()->json(['status' => 'deprovisioned']);
    }

    public function changePlan(Request $request, int $tenantId): JsonResponse
    {
        $request->validate([
            'plan' => 'required|in:starter,professional,enterprise',
        ]);

        $service = new MultiTenantService();
        $result = $service->changePlan($tenantId, $request->input('plan'));

        return response()->json($result);
    }

    public function tenantUsage(int $tenantId): JsonResponse
    {
        $service = new MultiTenantService();
        $dashboard = $service->getUsageDashboard($tenantId);

        return response()->json($dashboard);
    }

    public function listTenants(Request $request): JsonResponse
    {
        $service = new MultiTenantService();
        $tenants = $service->listTenants($request->query());

        return response()->json($tenants);
    }

    public function tenantBranding(int $tenantId): JsonResponse
    {
        $service = new MultiTenantService();
        $branding = $service->getBranding($tenantId);

        return response()->json($branding);
    }

    public function updateBranding(Request $request, int $tenantId): JsonResponse
    {
        $request->validate([
            'brand_name' => 'nullable|string|max:255',
            'logo_url' => 'nullable|url|max:500',
            'favicon_url' => 'nullable|url|max:500',
            'brand_colors' => 'nullable|array',
            'brand_colors.primary' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'brand_colors.secondary' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'brand_colors.accent' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'support_email' => 'nullable|email|max:255',
        ]);

        $service = new MultiTenantService();
        $branding = $service->updateBranding($tenantId, $request->all());

        return response()->json($branding);
    }

    // ═══════════════════════════════════════════════════════════════
    // DATABASE READ REPLICAS — ANALYTICS QUERIES
    // ═══════════════════════════════════════════════════════════════

    public function replicaStatus(): JsonResponse
    {
        $status = [
            'primary' => [
                'connection' => 'mysql',
                'status' => 'active',
                'lag_ms' => 0,
            ],
            'replicas' => [],
        ];

        // Check each configured read replica
        $replicas = config('database.connections.mysql.read', []);
        if (!empty($replicas)) {
            foreach ($replicas as $index => $replica) {
                try {
                    $host = $replica['host'] ?? 'unknown';
                    $lagResult = DB::connection('mysql_read')
                        ->select("SHOW SLAVE STATUS");

                    $lagSeconds = !empty($lagResult) ? ($lagResult[0]->Seconds_Behind_Master ?? 0) : 0;

                    $status['replicas'][] = [
                        'host' => $host,
                        'index' => $index,
                        'status' => 'active',
                        'lag_seconds' => $lagSeconds,
                        'lag_acceptable' => $lagSeconds < 5,
                    ];
                } catch (\Throwable $e) {
                    $status['replicas'][] = [
                        'host' => $replica['host'] ?? 'unknown',
                        'index' => $index,
                        'status' => 'error',
                        'error' => $e->getMessage(),
                    ];
                }
            }
        }

        $status['read_write_splitting'] = !empty($replicas);
        $status['sticky_sessions'] = config('database.connections.mysql.sticky', false);

        return response()->json($status);
    }

    public function analyticsQuery(Request $request): JsonResponse
    {
        $request->validate([
            'query_type' => 'required|in:revenue,orders,performance,routes,carriers',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'group_by' => 'nullable|in:day,week,month,quarter',
        ]);

        $dateFrom = $request->input('date_from', now()->subMonths(3)->toDateString());
        $dateTo = $request->input('date_to', now()->toDateString());
        $groupBy = $request->input('group_by', 'month');
        $connection = config('database.connections.mysql_read') ? 'mysql_read' : 'mysql';

        $result = match ($request->input('query_type')) {
            'revenue' => $this->revenueAnalytics($connection, $dateFrom, $dateTo, $groupBy),
            'orders' => $this->orderAnalytics($connection, $dateFrom, $dateTo, $groupBy),
            'performance' => $this->performanceAnalytics($connection, $dateFrom, $dateTo),
            'routes' => $this->routeAnalytics($connection, $dateFrom, $dateTo),
            'carriers' => $this->carrierAnalytics($connection, $dateFrom, $dateTo),
        };

        return response()->json([
            'query_type' => $request->input('query_type'),
            'connection' => $connection,
            'date_range' => compact('dateFrom', 'dateTo'),
            'group_by' => $groupBy,
            'data' => $result,
        ]);
    }

    private function revenueAnalytics(string $conn, string $from, string $to, string $groupBy): array
    {
        $groupExpr = match ($groupBy) {
            'day' => "DATE(created_at)",
            'week' => "YEARWEEK(created_at, 1)",
            'month' => "DATE_FORMAT(created_at, '%Y-%m')",
            'quarter' => "CONCAT(YEAR(created_at), '-Q', QUARTER(created_at))",
        };

        return DB::connection($conn)
            ->table('orders')
            ->selectRaw("{$groupExpr} as period, SUM(price) as revenue, COUNT(*) as order_count, AVG(price) as avg_order_value")
            ->whereBetween('created_at', [$from, $to])
            ->where('status', '!=', 'cancelled')
            ->groupByRaw($groupExpr)
            ->orderByRaw($groupExpr)
            ->get()
            ->toArray();
    }

    private function orderAnalytics(string $conn, string $from, string $to, string $groupBy): array
    {
        $groupExpr = match ($groupBy) {
            'day' => "DATE(created_at)",
            'week' => "YEARWEEK(created_at, 1)",
            'month' => "DATE_FORMAT(created_at, '%Y-%m')",
            'quarter' => "CONCAT(YEAR(created_at), '-Q', QUARTER(created_at))",
        };

        return DB::connection($conn)
            ->table('orders')
            ->selectRaw("{$groupExpr} as period, status, COUNT(*) as count")
            ->whereBetween('created_at', [$from, $to])
            ->groupByRaw("{$groupExpr}, status")
            ->orderByRaw($groupExpr)
            ->get()
            ->toArray();
    }

    private function performanceAnalytics(string $conn, string $from, string $to): array
    {
        return DB::connection($conn)
            ->table('orders')
            ->selectRaw("
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)), 1) as avg_processing_hours,
                ROUND(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as delivery_rate
            ")
            ->whereBetween('created_at', [$from, $to])
            ->first()
            ? [(array) DB::connection($conn)
                ->table('orders')
                ->selectRaw("
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)), 1) as avg_processing_hours,
                    ROUND(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as delivery_rate
                ")
                ->whereBetween('created_at', [$from, $to])
                ->first()]
            : [];
    }

    private function routeAnalytics(string $conn, string $from, string $to): array
    {
        return DB::connection($conn)
            ->table('orders')
            ->selectRaw("pickup_country, delivery_country, COUNT(*) as shipments, ROUND(AVG(price), 2) as avg_price, ROUND(SUM(price), 2) as total_revenue")
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('pickup_country', 'delivery_country')
            ->orderByDesc('shipments')
            ->limit(20)
            ->get()
            ->toArray();
    }

    private function carrierAnalytics(string $conn, string $from, string $to): array
    {
        return DB::connection($conn)
            ->table('orders')
            ->join('companies', 'orders.carrier_id', '=', 'companies.id')
            ->selectRaw("companies.name as carrier_name, COUNT(*) as total_orders, ROUND(AVG(orders.price), 2) as avg_price, SUM(CASE WHEN orders.status = 'delivered' THEN 1 ELSE 0 END) as completed")
            ->whereBetween('orders.created_at', [$from, $to])
            ->groupBy('companies.id', 'companies.name')
            ->orderByDesc('total_orders')
            ->limit(20)
            ->get()
            ->toArray();
    }

    // ═══════════════════════════════════════════════════════════════
    // WEBSOCKET CLUSTER STATUS
    // ═══════════════════════════════════════════════════════════════

    public function websocketClusterStatus(): JsonResponse
    {
        $nodes = [];

        try {
            $redisInfo = Redis::info();
            $pubsubChannels = Redis::pubsub('channels', 'reverb:*');

            $nodes[] = [
                'node_id' => gethostname(),
                'status' => 'active',
                'connections' => $redisInfo['connected_clients'] ?? 0,
                'memory_used_mb' => round(($redisInfo['used_memory'] ?? 0) / 1024 / 1024, 2),
                'pubsub_channels' => count($pubsubChannels),
                'uptime_seconds' => $redisInfo['uptime_in_seconds'] ?? 0,
            ];
        } catch (\Throwable $e) {
            $nodes[] = [
                'node_id' => gethostname(),
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }

        return response()->json([
            'cluster' => [
                'adapter' => 'redis',
                'driver' => config('broadcasting.default'),
                'redis_host' => config('database.redis.default.host'),
                'nodes' => $nodes,
                'total_connections' => array_sum(array_column($nodes, 'connections')),
            ],
            'channels' => [
                'active' => count($pubsubChannels ?? []),
                'patterns' => ['reverb:*', 'private-*', 'presence-*'],
            ],
        ]);
    }

    public function broadcastTest(Request $request): JsonResponse
    {
        $channel = $request->input('channel', 'test-channel');
        $message = $request->input('message', 'ping');

        try {
            Redis::publish("reverb:{$channel}", json_encode([
                'event' => 'cluster.test',
                'data' => [
                    'message' => $message,
                    'node' => gethostname(),
                    'timestamp' => now()->toIso8601String(),
                ],
            ]));

            return response()->json([
                'status' => 'published',
                'channel' => $channel,
                'node' => gethostname(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CDN & INFRASTRUCTURE STATUS
    // ═══════════════════════════════════════════════════════════════

    public function cdnStatus(): JsonResponse
    {
        return response()->json([
            'cdn' => [
                'provider' => config('cdn.provider', 'cloudfront'),
                'distribution_id' => config('cdn.distribution_id'),
                'domain' => config('cdn.domain'),
                'enabled' => config('cdn.enabled', false),
                'ssl' => true,
                'http2' => true,
                'compression' => ['gzip', 'brotli'],
            ],
            'cache_policy' => [
                'static_assets' => [
                    'max_age' => 31536000,
                    'immutable' => true,
                    'extensions' => ['js', 'css', 'png', 'jpg', 'webp', 'avif', 'woff2', 'svg'],
                ],
                'api_responses' => [
                    'max_age' => 0,
                    'no_cache' => true,
                    'stale_while_revalidate' => 60,
                ],
                'html' => [
                    'max_age' => 300,
                    's_maxage' => 600,
                    'stale_while_revalidate' => 86400,
                ],
            ],
            'origins' => [
                ['name' => 'frontend', 'type' => 'next.js', 'path' => '/*'],
                ['name' => 'api', 'type' => 'laravel', 'path' => '/api/*'],
                ['name' => 'static', 'type' => 's3', 'path' => '/_next/static/*'],
                ['name' => 'uploads', 'type' => 's3', 'path' => '/uploads/*'],
            ],
        ]);
    }

    public function infrastructureHealth(): JsonResponse
    {
        $checks = [];

        // MySQL primary
        try {
            DB::connection('mysql')->select('SELECT 1');
            $checks['mysql_primary'] = ['status' => 'healthy', 'latency_ms' => 0];
        } catch (\Throwable $e) {
            $checks['mysql_primary'] = ['status' => 'unhealthy', 'error' => $e->getMessage()];
        }

        // MySQL read replica
        try {
            if (config('database.connections.mysql_read')) {
                DB::connection('mysql_read')->select('SELECT 1');
                $checks['mysql_replica'] = ['status' => 'healthy'];
            } else {
                $checks['mysql_replica'] = ['status' => 'not_configured'];
            }
        } catch (\Throwable $e) {
            $checks['mysql_replica'] = ['status' => 'unhealthy', 'error' => $e->getMessage()];
        }

        // Redis
        try {
            Redis::ping();
            $checks['redis'] = ['status' => 'healthy'];
        } catch (\Throwable $e) {
            $checks['redis'] = ['status' => 'unhealthy', 'error' => $e->getMessage()];
        }

        // Cache
        try {
            Cache::put('health_check', true, 10);
            $checks['cache'] = ['status' => Cache::get('health_check') ? 'healthy' : 'unhealthy'];
        } catch (\Throwable $e) {
            $checks['cache'] = ['status' => 'unhealthy', 'error' => $e->getMessage()];
        }

        // Queue
        try {
            $queueSize = Redis::lLen('queues:default') ?? 0;
            $checks['queue'] = ['status' => 'healthy', 'pending_jobs' => $queueSize];
        } catch (\Throwable $e) {
            $checks['queue'] = ['status' => 'unhealthy', 'error' => $e->getMessage()];
        }

        $allHealthy = collect($checks)->every(fn($c) => $c['status'] === 'healthy' || $c['status'] === 'not_configured');

        return response()->json([
            'status' => $allHealthy ? 'healthy' : 'degraded',
            'checks' => $checks,
            'kubernetes' => [
                'namespace' => env('K8S_NAMESPACE', 'logimarket-production'),
                'pod' => gethostname(),
                'node' => env('K8S_NODE_NAME', 'unknown'),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
