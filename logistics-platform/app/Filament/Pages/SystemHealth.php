<?php

namespace App\Filament\Pages;

use App\Models\Company;
use App\Models\FreightOffer;
use App\Models\Invoice;
use App\Models\Shipment;
use App\Models\TransportOrder;
use App\Models\User;
use App\Models\VehicleOffer;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class SystemHealth extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-heart';

    public static function canAccess(): bool
    {
        return auth()->user()?->role === 'admin';
    }
    protected static ?string $navigationGroup = 'Administration';
    protected static ?int $navigationSort = 10;
    protected static ?string $title = 'System Health';
    protected static string $view = 'filament.pages.system-health';

    public function getViewData(): array
    {
        return [
            'checks' => $this->runHealthChecks(),
            'systemInfo' => $this->getSystemInfo(),
            'modelCounts' => $this->getModelCounts(),
        ];
    }

    protected function runHealthChecks(): array
    {
        $checks = [];

        // Database check
        try {
            DB::connection()->getPdo();
            $checks['database'] = ['status' => 'ok', 'message' => 'MySQL connected (' . DB::connection()->getDatabaseName() . ')'];
        } catch (\Exception $e) {
            $checks['database'] = ['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()];
        }

        // Redis check
        try {
            $ping = Redis::ping();
            $checks['redis'] = ['status' => 'ok', 'message' => 'Redis connected (PONG)'];
        } catch (\Exception $e) {
            $checks['redis'] = ['status' => 'error', 'message' => 'Redis error: ' . $e->getMessage()];
        }

        // Storage check
        $storagePath = storage_path('app');
        $checks['storage'] = is_writable($storagePath)
            ? ['status' => 'ok', 'message' => 'Storage writable']
            : ['status' => 'error', 'message' => 'Storage not writable'];

        // Cache check
        try {
            Cache::put('health_check', 'ok', 10);
            $val = Cache::get('health_check');
            $checks['cache'] = $val === 'ok'
                ? ['status' => 'ok', 'message' => 'Cache working (driver: ' . config('cache.default') . ')']
                : ['status' => 'error', 'message' => 'Cache read/write failed'];
        } catch (\Exception $e) {
            $checks['cache'] = ['status' => 'error', 'message' => 'Cache error: ' . $e->getMessage()];
        }

        // Queue check
        $checks['queue'] = ['status' => 'ok', 'message' => 'Queue driver: ' . config('queue.default')];

        // Disk space
        $freeSpace = disk_free_space('/');
        $totalSpace = disk_total_space('/');
        $usedPct = round((1 - $freeSpace / $totalSpace) * 100, 1);
        $checks['disk'] = [
            'status' => $usedPct > 90 ? 'error' : ($usedPct > 75 ? 'warning' : 'ok'),
            'message' => "Disk: {$usedPct}% used (" . round($freeSpace / 1024 / 1024 / 1024, 1) . " GB free)",
        ];

        return $checks;
    }

    protected function getSystemInfo(): array
    {
        return [
            'PHP Version' => PHP_VERSION,
            'Laravel Version' => app()->version(),
            'Server' => php_uname('s') . ' ' . php_uname('r'),
            'Environment' => config('app.env'),
            'Debug Mode' => config('app.debug') ? 'Enabled' : 'Disabled',
            'Timezone' => config('app.timezone'),
            'Memory Limit' => ini_get('memory_limit'),
            'Max Execution Time' => ini_get('max_execution_time') . 's',
            'Upload Max Filesize' => ini_get('upload_max_filesize'),
        ];
    }

    protected function getModelCounts(): array
    {
        return [
            'Users' => User::count(),
            'Companies' => Company::count(),
            'Transport Orders' => TransportOrder::count(),
            'Shipments' => Shipment::count(),
            'Freight Offers' => FreightOffer::count(),
            'Vehicle Offers' => VehicleOffer::count(),
            'Invoices' => Invoice::count(),
        ];
    }
}
