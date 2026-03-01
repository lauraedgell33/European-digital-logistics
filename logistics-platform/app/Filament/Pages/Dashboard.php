<?php

namespace App\Filament\Pages;

use App\Filament\Widgets;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-home';
    protected static ?string $title = 'Dashboard';

    public function getWidgets(): array
    {
        return [
            Widgets\DashboardStatsWidget::class,
            Widgets\PendingActionsWidget::class,
            Widgets\FinancialSummaryWidget::class,
            Widgets\RevenueChartWidget::class,
            Widgets\OrderActivityWidget::class,
            Widgets\ShipmentStatusWidget::class,
            Widgets\LatestOrdersWidget::class,
            Widgets\PlatformOverviewWidget::class,
            Widgets\FreightVolumeChartWidget::class,
            Widgets\CompanyGrowthChartWidget::class,
            Widgets\GeographicDistributionWidget::class,
            Widgets\SystemHealthMiniWidget::class,
            Widgets\AiInsightsWidget::class,
            Widgets\TopRoutesWidget::class,
            Widgets\RecentActivityWidget::class,
        ];
    }

    public function getColumns(): int|string|array
    {
        return 2;
    }
}
