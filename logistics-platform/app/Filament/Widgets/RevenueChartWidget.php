<?php

namespace App\Filament\Widgets;

use App\Models\Invoice;
use App\Models\PaymentTransaction;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class RevenueChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Monthly Revenue';
    protected static ?int $sort = 3;
    protected static ?string $maxHeight = '300px';
    protected static bool $isLazy = true;

    protected function getData(): array
    {
        return Cache::remember('revenue-chart', 300, function () {
            $months = collect(range(5, 0))->map(fn ($i) => Carbon::now()->subMonths($i));

            $invoiceData = $months->map(function ($month) {
                return Invoice::where('status', 'paid')
                    ->whereYear('paid_at', $month->year)
                    ->whereMonth('paid_at', $month->month)
                    ->sum('total_amount');
            });

            $paymentData = $months->map(function ($month) {
                return PaymentTransaction::where('status', 'completed')
                    ->whereYear('completed_at', $month->year)
                    ->whereMonth('completed_at', $month->month)
                    ->sum('amount');
            });

            return [
                'datasets' => [
                    [
                        'label' => 'Invoiced (€)',
                        'data' => $invoiceData->toArray(),
                        'backgroundColor' => 'rgba(59, 130, 246, 0.2)',
                        'borderColor' => 'rgb(59, 130, 246)',
                    ],
                    [
                        'label' => 'Collected (€)',
                        'data' => $paymentData->toArray(),
                        'backgroundColor' => 'rgba(16, 185, 129, 0.2)',
                        'borderColor' => 'rgb(16, 185, 129)',
                    ],
                ],
                'labels' => $months->map(fn ($m) => $m->format('M Y'))->toArray(),
            ];
        });
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
