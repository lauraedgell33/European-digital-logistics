<?php

namespace App\Filament\Widgets;

use App\Models\TransportOrder;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class LatestOrdersWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 4;

    protected function getStats(): array
    {
        return Cache::remember('latest-orders-widget', 300, function () {
            $today = TransportOrder::whereDate('created_at', today())->count();
            $pending = TransportOrder::where('status', 'pending')->count();
            $inTransit = TransportOrder::where('status', 'in_transit')->count();
            $overdue = TransportOrder::where('status', '!=', 'completed')
                ->where('status', '!=', 'cancelled')
                ->whereNotNull('estimated_delivery')
                ->where('estimated_delivery', '<', now())
                ->count();

            return [
                Stat::make('Today\'s Orders', $today)
                    ->description('New orders created today')
                    ->descriptionIcon('heroicon-m-arrow-trending-up')
                    ->color('primary')
                    ->chart([3, 5, 4, 7, 6, 8, $today]),
                Stat::make('Pending', $pending)
                    ->description('Awaiting confirmation')
                    ->descriptionIcon('heroicon-m-clock')
                    ->color('warning')
                    ->chart([5, 4, 6, 3, 7, 4, $pending]),
                Stat::make('In Transit', $inTransit)
                    ->description('Currently being transported')
                    ->descriptionIcon('heroicon-m-truck')
                    ->color('info')
                    ->chart([4, 6, 5, 8, 7, 5, $inTransit]),
                Stat::make('Overdue', $overdue)
                    ->description('Past estimated delivery')
                    ->descriptionIcon('heroicon-m-exclamation-triangle')
                    ->color('danger')
                    ->chart([2, 1, 3, 2, 4, 3, $overdue]),
            ];
        });
    }
}
