<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransportOrder;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $overview = $this->getOverview($companyId);

        return response()->json([
            'data' => [
                'active_freight' => $overview['active_freight_offers'],
                'available_vehicles' => $overview['active_vehicle_offers'],
                'active_orders' => $overview['active_orders'],
                'shipments_in_transit' => $overview['active_shipments'],
                'monthly_revenue' => $overview['monthly_revenue'],
                'monthly_orders' => $overview['monthly_orders'],
                'pending_orders' => $overview['pending_orders'],
                'recent_orders' => $this->getRecentOrders($companyId),
                'active_shipments' => $this->getActiveShipments($companyId),
            ],
        ]);
    }

    private function getOverview(int $companyId): array
    {
        return [
            'active_freight_offers' => FreightOffer::where('company_id', $companyId)->active()->count(),
            'active_vehicle_offers' => VehicleOffer::where('company_id', $companyId)->available()->count(),
            'pending_orders' => TransportOrder::forCompany($companyId)->pending()->count(),
            'active_orders' => TransportOrder::forCompany($companyId)->active()->count(),
            'active_shipments' => Shipment::whereHas('transportOrder', function ($q) use ($companyId) {
                $q->where(function ($sub) use ($companyId) {
                    $sub->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
                });
            })->whereNotIn('status', ['delivered'])->count(),
            'monthly_revenue' => TransportOrder::where('shipper_id', $companyId)
                ->whereMonth('created_at', now()->month)
                ->whereIn('status', ['completed', 'delivered'])
                ->sum('total_price'),
            'monthly_orders' => TransportOrder::forCompany($companyId)
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];
    }

    private function getRecentOrders(int $companyId)
    {
        return TransportOrder::forCompany($companyId)
            ->with(['shipper:id,name', 'carrier:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    private function getActiveShipments(int $companyId)
    {
        return Shipment::whereHas('transportOrder', function ($q) use ($companyId) {
                $q->where(function ($sub) use ($companyId) {
                    $sub->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
                });
            })
            ->whereNotIn('status', ['delivered'])
            ->with('transportOrder:id,order_number,pickup_city,delivery_city')
            ->orderBy('last_update', 'desc')
            ->limit(10)
            ->get();
    }

    private function getActiveOffers(int $companyId)
    {
        $freight = FreightOffer::where('company_id', $companyId)
            ->active()
            ->orderBy('loading_date')
            ->limit(5)
            ->get();

        $vehicles = VehicleOffer::where('company_id', $companyId)
            ->available()
            ->orderBy('available_from')
            ->limit(5)
            ->get();

        return [
            'freight' => $freight,
            'vehicles' => $vehicles,
        ];
    }

    /**
     * Monthly analytics data for charts.
     */
    public function analytics(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $months = (int) $request->input('months', $request->input('period', 6));
        if ($months < 1 || $months > 24) $months = 6;

        $monthlyOrders = TransportOrder::forCompany($companyId)
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $topRoutes = TransportOrder::forCompany($companyId)
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                'pickup_country', 'pickup_city',
                'delivery_country', 'delivery_city',
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('AVG(total_price) as avg_price')
            )
            ->groupBy('pickup_country', 'pickup_city', 'delivery_country', 'delivery_city')
            ->orderBy('total_orders', 'desc')
            ->limit(10)
            ->get();

        // Aggregate summary for the period
        $summary = TransportOrder::forCompany($companyId)
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                DB::raw('SUM(total_price) as total_revenue'),
                DB::raw('SUM(CASE WHEN status IN ("completed","delivered") THEN 1 ELSE 0 END) as completed_orders'),
                DB::raw('AVG(total_price) as avg_order_value')
            )
            ->first();

        return response()->json([
            'data' => [
                'monthly_orders' => $monthlyOrders,
                'top_routes' => $topRoutes,
                'total_revenue' => (float) ($summary->total_revenue ?? 0),
                'completed_orders' => (int) ($summary->completed_orders ?? 0),
                'avg_order_value' => (float) ($summary->avg_order_value ?? 0),
            ],
        ]);
    }
}
