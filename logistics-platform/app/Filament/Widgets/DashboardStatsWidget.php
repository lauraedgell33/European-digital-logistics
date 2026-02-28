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
    protected static ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        return Cache::remember('dashboard-stats-widget', 300, function () {
            $companySparkline = collect(range(6, 0))->map(fn ($i) => Company::whereDate('created_at', now()->subDays($i))->count())->toArray();
            $freightSparkline = collect(range(6, 0))->map(fn ($i) => FreightOffer::whereDate('created_at', now()->subDays($i))->count())->toArray();
            $vehicleSparkline = collect(range(6, 0))->map(fn ($i) => VehicleOffer::whereDate('created_at', now()->subDays($i))->count())->toArray();
            $orderSparkline = collect(range(6, 0))->map(fn ($i) => TransportOrder::whereDate('created_at', now()->subDays($i))->count())->toArray();

            return [
                Stat::make('Total Companies', Company::count())
                    ->description('Verified: ' . Company::verified()->count())
                    ->descriptionIcon('heroicon-o-check-badge')
                    ->icon('heroicon-o-building-office')
                    ->color('primary')
                    ->chart($companySparkline)
                    ->url(route('filament.admin.resources.companies.index')),
                Stat::make('Active Freight Offers', FreightOffer::active()->count())
                    ->description('Total: ' . FreightOffer::count())
                    ->descriptionIcon('heroicon-o-arrow-trending-up')
                    ->icon('heroicon-o-truck')
                    ->color('success')
                    ->chart($freightSparkline)
                    ->url(route('filament.admin.resources.freight-offers.index')),
                Stat::make('Available Vehicles', VehicleOffer::available()->count())
                    ->description('Total: ' . VehicleOffer::count())
                    ->descriptionIcon('heroicon-o-arrow-trending-up')
                    ->icon('heroicon-o-map')
                    ->color('info')
                    ->chart($vehicleSparkline)
                    ->url(route('filament.admin.resources.vehicle-offers.index')),
                Stat::make('Active Orders', TransportOrder::active()->count())
                    ->description('Pending: ' . TransportOrder::pending()->count())
                    ->descriptionIcon('heroicon-o-clock')
                    ->icon('heroicon-o-document-text')
                    ->color('warning')
                    ->chart($orderSparkline)
                    ->url(route('filament.admin.resources.transport-orders.index')),
            ];
        });
    }
}
