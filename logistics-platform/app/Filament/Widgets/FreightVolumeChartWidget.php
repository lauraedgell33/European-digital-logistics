<?php

namespace App\Filament\Widgets;

use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class FreightVolumeChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Freight vs Vehicle Offers (30 days)';
    protected static ?int $sort = 5;
    protected static ?string $maxHeight = '280px';

    protected function getData(): array
    {
        $days = collect(range(29, 0))->map(fn ($i) => Carbon::now()->subDays($i));

        $freightData = $days->map(fn ($day) =>
            FreightOffer::whereDate('created_at', $day->toDateString())->count()
        );

        $vehicleData = $days->map(fn ($day) =>
            VehicleOffer::whereDate('created_at', $day->toDateString())->count()
        );

        return [
            'datasets' => [
                [
                    'label' => 'Freight Offers',
                    'data' => $freightData->toArray(),
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Vehicle Offers',
                    'data' => $vehicleData->toArray(),
                    'borderColor' => 'rgb(16, 185, 129)',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
            ],
            'labels' => $days->map(fn ($d) => $d->format('d M'))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
