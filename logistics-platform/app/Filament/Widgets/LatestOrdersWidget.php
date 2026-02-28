<?php

namespace App\Filament\Widgets;

use App\Models\TransportOrder;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class LatestOrdersWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 4;

    protected function getStats(): array
    {
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
                ->color('primary'),
            Stat::make('Pending', $pending)
                ->description('Awaiting confirmation')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),
            Stat::make('In Transit', $inTransit)
                ->description('Currently being transported')
                ->descriptionIcon('heroicon-m-truck')
                ->color('info'),
            Stat::make('Overdue', $overdue)
                ->description('Past estimated delivery')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color('danger'),
        ];
    }
}
