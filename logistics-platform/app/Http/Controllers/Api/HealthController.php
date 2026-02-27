<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Queue;

class HealthController extends Controller
{
    /**
     * Basic health check for load balancers.
     * GET /api/health
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status'    => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Detailed health check (requires API key).
     * GET /api/health/detailed
     */
    public function detailed(Request $request): JsonResponse
    {
        $apiKey = config('services.health_check.api_key', env('HEALTH_CHECK_API_KEY'));

        if (!$apiKey || $request->header('X-Health-API-Key') !== $apiKey) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized',
            ], 401);
        }

        $checks = [
            'database'   => $this->checkDatabase(),
            'redis'      => $this->checkRedis(),
            'queue'      => $this->checkQueue(),
            'disk_space' => $this->checkDiskSpace(),
        ];

        $allPassed = collect($checks)->every(fn($check) => $check['status'] === 'ok');

        return response()->json([
            'status'    => $allPassed ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'checks'    => $checks,
        ], $allPassed ? 200 : 503);
    }

    /**
     * Check database connectivity.
     */
    protected function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            $version = DB::selectOne('SELECT VERSION() as version')->version ?? 'unknown';

            return [
                'status'       => 'ok',
                'response_ms'  => $this->measureMs(fn() => DB::selectOne('SELECT 1')),
                'version'      => $version,
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check Redis connectivity.
     */
    protected function checkRedis(): array
    {
        try {
            $ms = $this->measureMs(fn() => Redis::connection()->ping());

            return [
                'status'      => 'ok',
                'response_ms' => $ms,
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check queue driver.
     */
    protected function checkQueue(): array
    {
        try {
            $driver    = config('queue.default');
            $queueName = config("queue.connections.{$driver}.queue", 'default');
            $size      = Queue::size($queueName);

            return [
                'status'  => 'ok',
                'driver'  => $driver,
                'pending' => $size,
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Queue check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check available disk space.
     */
    protected function checkDiskSpace(): array
    {
        try {
            $freeBytes = disk_free_space(storage_path());
            $freeGB    = round($freeBytes / (1024 ** 3), 2);

            return [
                'status'  => $freeGB >= 1 ? 'ok' : 'fail',
                'free_gb' => $freeGB,
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Disk check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Measure execution time in milliseconds.
     */
    protected function measureMs(callable $callback): float
    {
        $start = microtime(true);
        $callback();

        return round((microtime(true) - $start) * 1000, 2);
    }
}
