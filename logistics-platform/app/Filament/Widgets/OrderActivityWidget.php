<?php

namespace App\Filament\Widgets;

use App\Models\TransportOrder;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class OrderActivityWidget extends ChartWidget
{
    protected static ?string $heading = 'Order Activity (Last 30 Days)';
    protected static ?int $sort = 4;
    protected static ?string $maxHeight = '300px';

    protected function getData(): array
    {
        return Cache::remember('order-activity-chart', 300, function () {
            return $this->computeData();
        });
    }

    protected function computeData(): array
    {
        $days = collect(range(29, 0))->map(fn ($i) => now()->subDays($i)->format('Y-m-d'));

        $created = TransportOrder::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->pluck('count', 'date');

        $completed = TransportOrder::selectRaw('DATE(updated_at) as date, COUNT(*) as count')
            ->where('status', 'completed')
            ->where('updated_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->pluck('count', 'date');

        return [
            'datasets' => [
                [
                    'label' => 'Created',
                    'data' => $days->map(fn ($d) => $created->get($d, 0))->toArray(),
                    'borderColor' => 'rgb(59, 130, 246)',
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Completed',
                    'data' => $days->map(fn ($d) => $completed->get($d, 0))->toArray(),
                    'borderColor' => 'rgb(16, 185, 129)',
                    'tension' => 0.3,
                ],
            ],
            'labels' => $days->map(fn ($d) => Carbon::parse($d)->format('d/m'))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
