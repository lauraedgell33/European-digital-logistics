<?php

namespace App\Filament\Widgets;

use App\Models\Invoice;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class FinancialSummaryWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 2;

    protected function getStats(): array
    {
        return Cache::remember('financial-summary', 300, function () {
            $thisMonth = Carbon::now()->startOfMonth();
            $totalRevenue = Invoice::where('status', 'paid')->sum('total_amount');
            $monthlyRevenue = Invoice::where('status', 'paid')->where('paid_at', '>=', $thisMonth)->sum('total_amount');
            $outstanding = Invoice::whereNotIn('status', ['paid', 'cancelled'])->sum('total_amount') - Invoice::whereNotIn('status', ['paid', 'cancelled'])->sum('paid_amount');
            $overdue = Invoice::where('status', 'overdue')->sum('total_amount') - Invoice::where('status', 'overdue')->sum('paid_amount');

            return [
                Stat::make('Total Revenue', '€' . number_format($totalRevenue, 2))
                    ->icon('heroicon-o-currency-euro')
                    ->color('success')
                    ->description('All time'),
                Stat::make('This Month', '€' . number_format($monthlyRevenue, 2))
                    ->icon('heroicon-o-arrow-trending-up')
                    ->color('primary')
                    ->chart([4, 6, 3, 8, 5, 9, 7]),
                Stat::make('Outstanding', '€' . number_format($outstanding, 2))
                    ->icon('heroicon-o-clock')
                    ->color('warning'),
                Stat::make('Overdue', '€' . number_format($overdue, 2))
                    ->icon('heroicon-o-exclamation-triangle')
                    ->color('danger'),
            ];
        });
    }
}
