<?php

namespace App\Filament\Widgets;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\Shipment;
use App\Models\TransportOrder;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class PendingActionsWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 13;
    protected static ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        return Cache::remember('pending-actions-widget', 300, function () {
            return [
                Stat::make('Pending Verifications', Company::where('verification_status', 'pending')->count())
                    ->icon('heroicon-o-shield-check')
                    ->color('warning')
                    ->description('Companies awaiting review')
                    ->url(route('filament.admin.resources.companies.index')),
                Stat::make('Unpaid Invoices', Invoice::whereNotIn('status', ['paid', 'cancelled'])->count())
                    ->icon('heroicon-o-banknotes')
                    ->color('danger')
                    ->description('€' . number_format(Invoice::whereNotIn('status', ['paid', 'cancelled'])->sum('total_amount') - Invoice::whereNotIn('status', ['paid', 'cancelled'])->sum('paid_amount'), 2) . ' outstanding')
                    ->url(route('filament.admin.resources.invoices.index')),
                Stat::make('Pending Orders', TransportOrder::where('status', 'pending')->count())
                    ->icon('heroicon-o-clock')
                    ->color('info')
                    ->description('Awaiting acceptance')
                    ->url(route('filament.admin.resources.transport-orders.index')),
                Stat::make('Active Shipments', Shipment::whereIn('status', ['in_transit', 'waiting_pickup'])->count())
                    ->icon('heroicon-o-truck')
                    ->color('success')
                    ->description('Currently in transit'),
            ];
        });
    }
}
