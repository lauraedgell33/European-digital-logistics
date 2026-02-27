<?php

namespace App\Filament\Widgets;

use App\Models\TransportOrder;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\Company;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DashboardStatsWidget extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Companies', Company::count())
                ->description('Verified: ' . Company::verified()->count())
                ->icon('heroicon-o-building-office')
                ->color('primary'),
            Stat::make('Active Freight Offers', FreightOffer::active()->count())
                ->icon('heroicon-o-truck')
                ->color('success'),
            Stat::make('Available Vehicles', VehicleOffer::available()->count())
                ->icon('heroicon-o-map')
                ->color('info'),
            Stat::make('Active Orders', TransportOrder::active()->count())
                ->description('Pending: ' . TransportOrder::pending()->count())
                ->icon('heroicon-o-document-text')
                ->color('warning'),
        ];
    }
}
