<?php

namespace App\Services;

use App\Models\TransportOrder;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\Invoice;
use App\Models\CarbonFootprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Advanced reporting service — revenue, orders, routes, carriers, carbon.
 * Provides chart-ready datasets and exportable summaries.
 */
class ReportingService
{
    /**
     * Revenue report — monthly breakdown, trends, forecasts.
     */
    public function revenueReport(int $companyId, int $months = 12, ?string $currency = 'EUR'): array
    {
        $cacheKey = "report:revenue:{$companyId}:{$months}";

        return Cache::remember($cacheKey, 600, function () use ($companyId, $months, $currency) {
            $driver = config('database.default');
            $monthExpr = $driver === 'sqlite'
                ? "strftime('%Y-%m', created_at)"
                : "DATE_FORMAT(created_at, '%Y-%m')";

            $monthly = TransportOrder::where(function ($q) use ($companyId) {
                    $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
                })
                ->where('status', 'completed')
                ->where('created_at', '>=', now()->subMonths($months))
                ->selectRaw("$monthExpr as month, 
                    COUNT(*) as orders, 
                    SUM(total_price) as revenue, 
                    AVG(total_price) as avg_order_value,
                    MIN(total_price) as min_order,
                    MAX(total_price) as max_order")
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $totalRevenue = $monthly->sum('revenue');
            $totalOrders  = $monthly->sum('orders');
            $avgMonthly   = $monthly->count() > 0 ? round($totalRevenue / $monthly->count(), 2) : 0;

            // YoY growth
            $thisYear = $monthly->filter(fn ($m) => str_starts_with($m->month, now()->format('Y')))->sum('revenue');
            $lastYear = $monthly->filter(fn ($m) => str_starts_with($m->month, now()->subYear()->format('Y')))->sum('revenue');
            $yoyGrowth = $lastYear > 0 ? round(($thisYear - $lastYear) / $lastYear * 100, 1) : 0;

            return [
                'summary' => [
                    'total_revenue'    => round($totalRevenue, 2),
                    'total_orders'     => $totalOrders,
                    'avg_monthly'      => $avgMonthly,
                    'avg_order_value'  => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
                    'yoy_growth_pct'   => $yoyGrowth,
                    'currency'         => $currency,
                ],
                'chart_data' => $monthly->map(fn ($m) => [
                    'month'           => $m->month,
                    'revenue'         => round((float) $m->revenue, 2),
                    'orders'          => (int) $m->orders,
                    'avg_order_value' => round((float) $m->avg_order_value, 2),
                ])->values(),
            ];
        });
    }

    /**
     * Orders report — status breakdown, completion rate, trends.
     */
    public function ordersReport(int $companyId, int $months = 6): array
    {
        $cacheKey = "report:orders:{$companyId}:{$months}";

        return Cache::remember($cacheKey, 600, function () use ($companyId, $months) {
            $base = TransportOrder::where(function ($q) use ($companyId) {
                $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
            })->where('created_at', '>=', now()->subMonths($months));

            $statusBreakdown = (clone $base)
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $total      = $statusBreakdown->sum();
            $completed  = $statusBreakdown->get('completed', 0);
            $cancelled  = $statusBreakdown->get('cancelled', 0);
            $inProgress = $statusBreakdown->get('in_transit', 0) + $statusBreakdown->get('loading', 0);

            // Monthly status chart
            $driver = config('database.default');
            $monthExpr = $driver === 'sqlite'
                ? "strftime('%Y-%m', created_at)"
                : "DATE_FORMAT(created_at, '%Y-%m')";

            $monthlyStatus = (clone $base)
                ->selectRaw("$monthExpr as month, status, COUNT(*) as total")
                ->groupBy('month', 'status')
                ->orderBy('month')
                ->get()
                ->groupBy('month')
                ->map(fn ($group) => $group->pluck('total', 'status'));

            return [
                'summary' => [
                    'total'            => $total,
                    'completed'        => $completed,
                    'cancelled'        => $cancelled,
                    'in_progress'      => $inProgress,
                    'completion_rate'  => $total > 0 ? round($completed / $total * 100, 1) : 0,
                    'cancellation_rate'=> $total > 0 ? round($cancelled / $total * 100, 1) : 0,
                ],
                'status_breakdown' => $statusBreakdown,
                'monthly_chart'    => $monthlyStatus,
            ];
        });
    }

    /**
     * Top routes report — most popular origin/destination pairs.
     */
    public function routesReport(int $companyId, int $limit = 20): array
    {
        $cacheKey = "report:routes:{$companyId}:{$limit}";

        return Cache::remember($cacheKey, 600, function () use ($companyId, $limit) {
            $topRoutes = TransportOrder::where(function ($q) use ($companyId) {
                    $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
                })
                ->whereNotNull('pickup_country')
                ->whereNotNull('delivery_country')
                ->selectRaw('pickup_country, delivery_country, 
                    COUNT(*) as total_orders, 
                    SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
                    AVG(total_price) as avg_price,
                    SUM(total_price) as total_revenue')
                ->groupBy('pickup_country', 'delivery_country')
                ->orderByDesc('total_orders')
                ->limit($limit)
                ->get();

            return [
                'total_routes' => $topRoutes->count(),
                'routes'       => $topRoutes->map(fn ($r) => [
                    'origin'        => $r->pickup_country,
                    'destination'   => $r->delivery_country,
                    'route'         => "{$r->pickup_country} → {$r->delivery_country}",
                    'total_orders'  => (int) $r->total_orders,
                    'completed'     => (int) $r->completed,
                    'avg_price'     => round((float) $r->avg_price, 2),
                    'total_revenue' => round((float) $r->total_revenue, 2),
                ])->values(),
            ];
        });
    }

    /**
     * Carrier performance report.
     */
    public function carriersReport(int $companyId, int $limit = 20): array
    {
        $cacheKey = "report:carriers:{$companyId}:{$limit}";

        return Cache::remember($cacheKey, 600, function () use ($companyId, $limit) {
            $carriers = TransportOrder::where('shipper_id', $companyId)
                ->whereNotNull('carrier_id')
                ->join('companies', 'transport_orders.carrier_id', '=', 'companies.id')
                ->selectRaw('companies.id as carrier_id, companies.name as carrier_name, companies.rating,
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN transport_orders.status = "completed" THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN transport_orders.status = "cancelled" THEN 1 ELSE 0 END) as cancelled,
                    AVG(transport_orders.total_price) as avg_price,
                    SUM(transport_orders.total_price) as total_spent')
                ->groupBy('companies.id', 'companies.name', 'companies.rating')
                ->orderByDesc('total_orders')
                ->limit($limit)
                ->get();

            return [
                'total_carriers' => $carriers->count(),
                'carriers'       => $carriers->map(fn ($c) => [
                    'carrier_id'      => $c->carrier_id,
                    'carrier_name'    => $c->carrier_name,
                    'rating'          => (float) ($c->rating ?? 0),
                    'total_orders'    => (int) $c->total_orders,
                    'completed'       => (int) $c->completed,
                    'cancelled'       => (int) $c->cancelled,
                    'completion_rate' => $c->total_orders > 0 ? round($c->completed / $c->total_orders * 100, 1) : 0,
                    'avg_price'       => round((float) $c->avg_price, 2),
                    'total_spent'     => round((float) $c->total_spent, 2),
                ])->values(),
            ];
        });
    }

    /**
     * Carbon emissions report.
     */
    public function carbonReport(int $companyId, int $months = 12): array
    {
        $cacheKey = "report:carbon:{$companyId}:{$months}";

        return Cache::remember($cacheKey, 600, function () use ($companyId, $months) {
            $driver = config('database.default');
            $monthExpr = $driver === 'sqlite'
                ? "strftime('%Y-%m', created_at)"
                : "DATE_FORMAT(created_at, '%Y-%m')";

            $hasTable = \Illuminate\Support\Facades\Schema::hasTable('carbon_footprints');

            if (!$hasTable) {
                return [
                    'summary' => [
                        'total_co2_kg'     => 0,
                        'avg_co2_per_order' => 0,
                        'offset_purchased'  => 0,
                    ],
                    'monthly_chart' => [],
                ];
            }

            $monthly = CarbonFootprint::where('company_id', $companyId)
                ->where('created_at', '>=', now()->subMonths($months))
                ->selectRaw("$monthExpr as month,
                    SUM(total_co2_kg) as co2,
                    COUNT(*) as shipments,
                    AVG(total_co2_kg) as avg_co2,
                    SUM(CASE WHEN offset_purchased = 1 THEN total_co2_kg ELSE 0 END) as offset_co2")
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $totalCo2    = round($monthly->sum('co2'), 2);
            $totalOffset = round($monthly->sum('offset_co2'), 2);

            return [
                'summary' => [
                    'total_co2_kg'        => $totalCo2,
                    'total_offset_kg'     => $totalOffset,
                    'net_co2_kg'          => round($totalCo2 - $totalOffset, 2),
                    'avg_co2_per_shipment'=> $monthly->sum('shipments') > 0 ? round($totalCo2 / $monthly->sum('shipments'), 2) : 0,
                    'offset_rate_pct'     => $totalCo2 > 0 ? round($totalOffset / $totalCo2 * 100, 1) : 0,
                ],
                'monthly_chart' => $monthly->map(fn ($m) => [
                    'month'      => $m->month,
                    'co2_kg'     => round((float) $m->co2, 2),
                    'shipments'  => (int) $m->shipments,
                    'avg_co2'    => round((float) $m->avg_co2, 2),
                    'offset_kg'  => round((float) $m->offset_co2, 2),
                ])->values(),
            ];
        });
    }

    /**
     * Executive summary combining key KPIs.
     */
    public function executiveSummary(int $companyId): array
    {
        $cacheKey = "report:summary:{$companyId}";

        return Cache::remember($cacheKey, 300, function () use ($companyId) {
            $base = TransportOrder::where(function ($q) use ($companyId) {
                $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
            });

            $thisMonth = (clone $base)->where('created_at', '>=', now()->startOfMonth());
            $lastMonth = (clone $base)->whereBetween('created_at', [now()->subMonth()->startOfMonth(), now()->startOfMonth()]);

            $ordersThisMonth = (clone $thisMonth)->count();
            $ordersLastMonth = (clone $lastMonth)->count();
            $revenueThisMonth = (clone $thisMonth)->where('status', 'completed')->sum('total_price');
            $revenueLastMonth = (clone $lastMonth)->where('status', 'completed')->sum('total_price');

            $activeFreight   = FreightOffer::where('company_id', $companyId)->where('status', 'active')->count();
            $activeVehicles  = VehicleOffer::where('company_id', $companyId)->where('status', 'available')->count();
            $pendingInvoices = Invoice::where('company_id', $companyId)->whereIn('status', ['draft', 'sent'])->sum('total_amount');

            return [
                'orders' => [
                    'this_month' => $ordersThisMonth,
                    'last_month' => $ordersLastMonth,
                    'change_pct' => $ordersLastMonth > 0 ? round(($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth * 100, 1) : 0,
                ],
                'revenue' => [
                    'this_month'   => round($revenueThisMonth, 2),
                    'last_month'   => round($revenueLastMonth, 2),
                    'change_pct'   => $revenueLastMonth > 0 ? round(($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth * 100, 1) : 0,
                    'currency'     => 'EUR',
                ],
                'active_listings' => [
                    'freight'  => $activeFreight,
                    'vehicles' => $activeVehicles,
                ],
                'financials' => [
                    'pending_invoices_amount' => round($pendingInvoices, 2),
                    'currency'                => 'EUR',
                ],
            ];
        });
    }
}
