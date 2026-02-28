<?php

namespace App\Filament\Pages;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\TransportOrder;
use App\Models\Shipment;
use Filament\Pages\Page;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsDashboard extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static ?string $navigationGroup = 'AI & Analytics';
    protected static ?int $navigationSort = 0;
    protected static ?string $title = 'Analytics Dashboard';
    protected static string $view = 'filament.pages.analytics-dashboard';

    public function getViewData(): array
    {
        return Cache::remember('analytics-dashboard', 300, function () {
            $thisMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();

            return [
                'kpis' => [
                    'gmv' => Invoice::where('status', 'paid')->sum('total_amount'),
                    'orderVolume' => TransportOrder::count(),
                    'monthlyOrders' => TransportOrder::where('created_at', '>=', $thisMonth)->count(),
                    'lastMonthOrders' => TransportOrder::whereBetween('created_at', [$lastMonth, $thisMonth])->count(),
                    'avgDeliveryDays' => round(TransportOrder::whereNotNull('delivered_at')->whereNotNull('pickup_date')->avg(DB::raw('DATEDIFF(delivered_at, pickup_date)')), 1),
                    'activeCompanies' => Company::active()->count(),
                    'activeShipments' => Shipment::whereIn('status', ['in_transit', 'at_pickup'])->count(),
                    'completionRate' => TransportOrder::count() > 0 ? round(TransportOrder::where('status', 'completed')->count() / TransportOrder::count() * 100, 1) : 0,
                ],
                'topRoutes' => TransportOrder::select('pickup_country', 'delivery_country', DB::raw('count(*) as total'), DB::raw('sum(total_price) as revenue'))
                    ->groupBy('pickup_country', 'delivery_country')
                    ->orderByDesc('total')
                    ->limit(10)
                    ->get(),
                'monthlyTrend' => collect(range(5, 0))->map(fn ($i) => [
                    'month' => Carbon::now()->subMonths($i)->format('M Y'),
                    'orders' => TransportOrder::whereYear('created_at', Carbon::now()->subMonths($i)->year)->whereMonth('created_at', Carbon::now()->subMonths($i)->month)->count(),
                    'revenue' => Invoice::where('status', 'paid')->whereYear('paid_at', Carbon::now()->subMonths($i)->year)->whereMonth('paid_at', Carbon::now()->subMonths($i)->month)->sum('total_amount'),
                ]),
            ];
        });
    }
}
