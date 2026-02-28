<?php

namespace App\Filament\Widgets;

use App\Models\TransportOrder;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\Company;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class DashboardStatsWidget extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return Cache::remember('dashboard-stats-widget', 300, function () {
            return [
                Stat::make('Total Companies', Company::count())
                    ->description('Verified: ' . Company::verified()->count())
                    ->descriptionIcon('heroicon-o-check-badge')
                    ->icon('heroicon-o-building-office')
                    ->color('primary')
                    ->chart([7, 3, 4, 5, 6, 3, 5])
                    ->url(route('filament.admin.resources.companies.index')),
                Stat::make('Active Freight Offers', FreightOffer::active()->count())
                    ->description('Total: ' . FreightOffer::count())
                    ->descriptionIcon('heroicon-o-arrow-trending-up')
                    ->icon('heroicon-o-truck')
                    ->color('success')
                    ->chart([3, 5, 6, 4, 7, 8, 5])
                    ->url(route('filament.admin.resources.freight-offers.index')),
                Stat::make('Available Vehicles', VehicleOffer::available()->count())
                    ->description('Total: ' . VehicleOffer::count())
                    ->descriptionIcon('heroicon-o-arrow-trending-up')
                    ->icon('heroicon-o-map')
                    ->color('info')
                    ->chart([4, 6, 3, 7, 5, 4, 6])
                    ->url(route('filament.admin.resources.vehicle-offers.index')),
                Stat::make('Active Orders', TransportOrder::active()->count())
                    ->description('Pending: ' . TransportOrder::pending()->count())
                    ->descriptionIcon('heroicon-o-clock')
                    ->icon('heroicon-o-document-text')
                    ->color('warning')
                    ->chart([5, 4, 6, 8, 3, 5, 7])
                    ->url(route('filament.admin.resources.transport-orders.index')),
            ];
        });
    }
}
