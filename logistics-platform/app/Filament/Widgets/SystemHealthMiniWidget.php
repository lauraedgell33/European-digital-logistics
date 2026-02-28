<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class SystemHealthMiniWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 11;

    protected function getStats(): array
    {
        $dbLatency = $this->measureDbLatency();
        $redisOk = $this->checkRedis();
        $diskPct = round((1 - disk_free_space('/') / disk_total_space('/')) * 100, 1);

        return [
            Stat::make('Database', $dbLatency . 'ms')
                ->icon('heroicon-o-circle-stack')
                ->color($dbLatency < 50 ? 'success' : ($dbLatency < 200 ? 'warning' : 'danger'))
                ->description('Query latency'),
            Stat::make('Redis', $redisOk ? 'Connected' : 'Down')
                ->icon('heroicon-o-bolt')
                ->color($redisOk ? 'success' : 'danger'),
            Stat::make('Disk Usage', $diskPct . '%')
                ->icon('heroicon-o-server')
                ->color($diskPct < 70 ? 'success' : ($diskPct < 90 ? 'warning' : 'danger'))
                ->description(round(disk_free_space('/') / 1073741824, 1) . ' GB free'),
            Stat::make('PHP', PHP_VERSION)
                ->icon('heroicon-o-code-bracket')
                ->color('info'),
        ];
    }

    private function measureDbLatency(): float
    {
        $start = microtime(true);
        DB::select('SELECT 1');
        return round((microtime(true) - $start) * 1000, 1);
    }

    private function checkRedis(): bool
    {
        try {
            return Redis::ping() == 'PONG' || Redis::ping() === true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
