<?php

namespace App\Filament\Widgets;

use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class FreightVolumeChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Freight vs Vehicle Offers (30 days)';
    protected static ?int $sort = 8;
    protected static ?string $maxHeight = '280px';
    protected static bool $isLazy = true;

    protected function getData(): array
    {
        return Cache::remember('freight-volume-chart', 300, function () {
            return $this->computeData();
        });
    }

    protected function computeData(): array
    {
        $days = collect(range(29, 0))->map(fn ($i) => now()->subDays($i)->format('Y-m-d'));

        $freightData = FreightOffer::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->pluck('count', 'date');

        $vehicleData = VehicleOffer::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->pluck('count', 'date');

        return [
            'datasets' => [
                [
                    'label' => 'Freight Offers',
                    'data' => $days->map(fn ($d) => $freightData->get($d, 0))->toArray(),
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Vehicle Offers',
                    'data' => $days->map(fn ($d) => $vehicleData->get($d, 0))->toArray(),
                    'borderColor' => 'rgb(16, 185, 129)',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
            ],
            'labels' => $days->map(fn ($d) => Carbon::parse($d)->format('d M'))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
