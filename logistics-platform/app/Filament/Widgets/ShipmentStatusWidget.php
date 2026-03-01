<?php

namespace App\Filament\Widgets;

use App\Models\Shipment;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;

class ShipmentStatusWidget extends ChartWidget
{
    protected static ?string $heading = 'Shipment Status Distribution';
    protected static ?int $sort = 5;
    protected static ?string $maxHeight = '280px';
    protected static ?string $pollingInterval = '15s';

    protected function getData(): array
    {
        return Cache::remember('shipment-status-chart', 300, function () {
            $statuses = ['waiting_pickup', 'picked_up', 'in_transit', 'at_customs', 'out_for_delivery', 'delivered', 'delayed', 'exception'];
            $counts = collect($statuses)->map(fn ($s) => Shipment::where('status', $s)->count());

            return [
                'datasets' => [
                    [
                        'data' => $counts->toArray(),
                        'backgroundColor' => [
                            '#9ca3af', // waiting_pickup - gray
                            '#3b82f6', // picked_up - blue
                            '#0ea5e9', // in_transit - sky
                            '#f59e0b', // at_customs - amber
                            '#06b6d4', // out_for_delivery - cyan
                            '#10b981', // delivered - green
                            '#f97316', // delayed - orange
                            '#ef4444', // exception - red
                        ],
                    ],
                ],
                'labels' => ['Waiting Pickup', 'Picked Up', 'In Transit', 'At Customs', 'Out for Delivery', 'Delivered', 'Delayed', 'Exception'],
            ];
        });
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
