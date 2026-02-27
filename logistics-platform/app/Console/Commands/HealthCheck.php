<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

class HealthCheck extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'health:check';

    /**
     * The console command description.
     */
    protected $description = 'Run health checks on all critical services and return JSON results';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $checks = [
            'database'      => $this->checkDatabase(),
            'redis'         => $this->checkRedis(),
            'storage'       => $this->checkStorage(),
            'queue'         => $this->checkQueue(),
            'disk_space'    => $this->checkDiskSpace(),
        ];

        $allPassed = collect($checks)->every(fn($check) => $check['status'] === 'ok');

        $result = [
            'status'    => $allPassed ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'checks'    => $checks,
        ];

        $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return $allPassed ? self::SUCCESS : self::FAILURE;
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
                'status'  => 'ok',
                'message' => "Connected (MySQL {$version})",
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check Redis connectivity.
     */
    protected function checkRedis(): array
    {
        try {
            $pong = Redis::connection()->ping();

            if ($pong) {
                return [
                    'status'  => 'ok',
                    'message' => 'Redis is responding',
                ];
            }

            return [
                'status'  => 'fail',
                'message' => 'Redis did not respond to PING',
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Redis connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check that the storage directory is writable.
     */
    protected function checkStorage(): array
    {
        try {
            $testFile = 'health_check_' . uniqid() . '.tmp';
            Storage::disk('local')->put($testFile, 'health-check');
            $content = Storage::disk('local')->get($testFile);
            Storage::disk('local')->delete($testFile);

            if ($content === 'health-check') {
                return [
                    'status'  => 'ok',
                    'message' => 'Storage is writable',
                ];
            }

            return [
                'status'  => 'fail',
                'message' => 'Storage write verification failed',
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Storage check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check that the queue system is working.
     */
    protected function checkQueue(): array
    {
        try {
            $connection = config('queue.default');
            $queueName  = config("queue.connections.{$connection}.queue", 'default');

            // For redis queue, check if we can get the queue size
            if ($connection === 'redis') {
                $size = Queue::size($queueName);

                return [
                    'status'  => 'ok',
                    'message' => "Queue '{$queueName}' accessible (driver: {$connection}, pending: {$size})",
                ];
            }

            // For other drivers, just confirm connection works
            Queue::size($queueName);

            return [
                'status'  => 'ok',
                'message' => "Queue driver '{$connection}' is operational",
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Queue check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check that available disk space is greater than 1GB.
     */
    protected function checkDiskSpace(): array
    {
        try {
            $freeBytes  = disk_free_space(storage_path());
            $freeGB     = round($freeBytes / (1024 ** 3), 2);
            $minGB      = 1;

            if ($freeGB >= $minGB) {
                return [
                    'status'  => 'ok',
                    'message' => "Free disk space: {$freeGB} GB",
                ];
            }

            return [
                'status'  => 'fail',
                'message' => "Low disk space: {$freeGB} GB (minimum: {$minGB} GB)",
            ];
        } catch (\Exception $e) {
            return [
                'status'  => 'fail',
                'message' => 'Disk space check failed: ' . $e->getMessage(),
            ];
        }
    }
}
