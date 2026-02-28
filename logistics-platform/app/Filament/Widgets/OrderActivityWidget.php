<?php

namespace App\Filament\Widgets;

use App\Models\TransportOrder;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class OrderActivityWidget extends ChartWidget
{
    protected static ?string $heading = 'Order Activity (Last 30 Days)';
    protected static ?int $sort = 3;
    protected static ?string $maxHeight = '300px';

    protected function getData(): array
    {
        return Cache::remember('order-activity-chart', 300, function () {
            return $this->computeData();
        });
    }

    protected function computeData(): array
    {
        $days = collect(range(29, 0))->map(fn ($i) => Carbon::now()->subDays($i));

        $created = $days->map(fn ($day) =>
            TransportOrder::whereDate('created_at', $day)->count()
        );

        $completed = $days->map(fn ($day) =>
            TransportOrder::where('status', 'completed')
                ->whereDate('updated_at', $day)->count()
        );

        return [
            'datasets' => [
                [
                    'label' => 'Created',
                    'data' => $created->toArray(),
                    'borderColor' => 'rgb(59, 130, 246)',
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Completed',
                    'data' => $completed->toArray(),
                    'borderColor' => 'rgb(16, 185, 129)',
                    'tension' => 0.3,
                ],
            ],
            'labels' => $days->map(fn ($d) => $d->format('d/m'))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
