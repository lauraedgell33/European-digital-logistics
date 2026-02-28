<?php

namespace App\Filament\Widgets;

use App\Models\Shipment;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;

class ShipmentStatusWidget extends ChartWidget
{
    protected static ?string $heading = 'Shipment Status Distribution';
    protected static ?int $sort = 3;
    protected static ?string $maxHeight = '280px';

    protected function getData(): array
    {
        return Cache::remember('shipment-status-chart', 300, function () {
            $statuses = ['pending', 'at_pickup', 'in_transit', 'at_delivery', 'delivered', 'exception'];
            $counts = collect($statuses)->map(fn ($s) => Shipment::where('status', $s)->count());

            return [
                'datasets' => [
                    [
                        'data' => $counts->toArray(),
                        'backgroundColor' => [
                            '#9ca3af', // pending - gray
                            '#f59e0b', // at_pickup - amber
                            '#3b82f6', // in_transit - blue
                            '#06b6d4', // at_delivery - cyan
                            '#10b981', // delivered - green
                            '#ef4444', // exception - red
                        ],
                    ],
                ],
                'labels' => ['Pending', 'At Pickup', 'In Transit', 'At Delivery', 'Delivered', 'Exception'],
            ];
        });
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
