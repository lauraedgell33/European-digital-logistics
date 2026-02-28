<?php

namespace App\Filament\Widgets;

use App\Models\TransportOrder;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class GeographicDistributionWidget extends ChartWidget
{
    protected static ?string $heading = 'Orders by Country';
    protected static ?int $sort = 10;
    protected static ?string $maxHeight = '300px';
    protected static bool $isLazy = true;

    protected function getData(): array
    {
        return Cache::remember('geographic-distribution', 300, function () {
            $data = TransportOrder::select('pickup_country', DB::raw('count(*) as total'))
                ->groupBy('pickup_country')
                ->orderByDesc('total')
                ->limit(8)
                ->get();

            $colors = ['#0070f3', '#45a557', '#f5a623', '#e5484d', '#7c3aed', '#06b6d4', '#f97316', '#8b5cf6'];

            return [
                'datasets' => [[
                    'data' => $data->pluck('total')->toArray(),
                    'backgroundColor' => array_slice($colors, 0, $data->count()),
                ]],
                'labels' => $data->pluck('pickup_country')->toArray(),
            ];
        });
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
