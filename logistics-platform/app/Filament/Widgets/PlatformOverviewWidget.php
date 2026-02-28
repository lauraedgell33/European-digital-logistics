<?php

namespace App\Filament\Widgets;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\Shipment;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class PlatformOverviewWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 4;

    protected function getStats(): array
    {
        return Cache::remember('platform-overview-widget', 300, function () {
            return $this->computeStats();
        });
    }

    protected function computeStats(): array
    {
        $todayUsers = User::whereDate('created_at', today())->count();
        $weekUsers = User::where('created_at', '>=', now()->subWeek())->count();

        $monthRevenue = Invoice::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('total_amount');

        $lastMonthRevenue = Invoice::where('status', 'paid')
            ->whereMonth('paid_at', now()->subMonth()->month)
            ->whereYear('paid_at', now()->subMonth()->year)
            ->sum('total_amount');

        $revenueChange = $lastMonthRevenue > 0
            ? round((($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        $activeShipments = Shipment::whereIn('status', ['in_transit', 'at_pickup', 'at_delivery'])->count();

        return [
            Stat::make('Total Users', User::count())
                ->description("Today: +{$todayUsers} | This week: +{$weekUsers}")
                ->icon('heroicon-o-users')
                ->chart(User::query()
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->pluck('count')
                    ->toArray()
                )
                ->color('success'),

            Stat::make('Monthly Revenue', '€' . number_format($monthRevenue, 0))
                ->description($revenueChange >= 0 ? "+{$revenueChange}% vs last month" : "{$revenueChange}% vs last month")
                ->descriptionIcon($revenueChange >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->icon('heroicon-o-currency-euro')
                ->color($revenueChange >= 0 ? 'success' : 'danger'),

            Stat::make('Active Shipments', $activeShipments)
                ->description('Delivered today: ' . Shipment::where('status', 'delivered')->whereDate('updated_at', today())->count())
                ->icon('heroicon-o-truck')
                ->color('info'),

            Stat::make('Total Companies', Company::count())
                ->description('Active: ' . Company::where('is_verified', true)->count())
                ->icon('heroicon-o-building-office-2')
                ->chart([4, 5, 6, 5, 7, 8, 6])
                ->color('primary'),
        ];
    }
}
