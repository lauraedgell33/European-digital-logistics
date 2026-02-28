<?php

namespace App\Filament\Widgets;

use App\Models\Company;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class CompanyGrowthChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Company Growth (12 Months)';
    protected static ?int $sort = 9;
    protected static ?string $maxHeight = '300px';
    protected static bool $isLazy = true;

    protected function getData(): array
    {
        return Cache::remember('company-growth-chart', 300, function () {
            $months = collect(range(11, 0))->map(fn ($i) => Carbon::now()->subMonths($i));

            return [
                'datasets' => [
                    [
                        'label' => 'New Companies',
                        'data' => $months->map(fn ($month) => Company::whereYear('created_at', $month->year)->whereMonth('created_at', $month->month)->count())->toArray(),
                        'borderColor' => '#0070f3',
                        'backgroundColor' => 'rgba(0, 112, 243, 0.1)',
                        'fill' => true,
                        'tension' => 0.4,
                    ],
                ],
                'labels' => $months->map(fn ($m) => $m->format('M Y'))->toArray(),
            ];
        });
    }

    protected function getType(): string
    {
        return 'line';
    }
}
