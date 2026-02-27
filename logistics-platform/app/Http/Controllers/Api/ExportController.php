<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransportOrder;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Exports\OrdersExport;
use App\Exports\FreightExport;
use App\Exports\VehicleExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    /**
     * Export transport orders as PDF.
     */
    public function ordersPdf(Request $request)
    {
        $query = TransportOrder::with(['shipper', 'carrier'])
            ->where(function ($q) use ($request) {
                $q->where('shipper_id', $request->user()->company_id)
                  ->orWhere('carrier_id', $request->user()->company_id);
            });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $orders = $query->orderBy('created_at', 'desc')->limit(500)->get();

        $pdf = Pdf::loadView('exports.orders-pdf', [
            'orders' => $orders,
            'company' => $request->user()->company,
            'generatedAt' => now()->format('d.m.Y H:i'),
            'filters' => $request->only(['status', 'from', 'to']),
        ]);

        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('transport-orders-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export transport orders as CSV/Excel.
     */
    public function ordersCsv(Request $request)
    {
        $format = $request->query('format', 'csv');
        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';
        $writerType = $format === 'xlsx' ? \Maatwebsite\Excel\Excel::XLSX : \Maatwebsite\Excel\Excel::CSV;

        return Excel::download(
            new OrdersExport($request),
            'transport-orders-' . now()->format('Y-m-d') . '.' . $extension,
            $writerType
        );
    }

    /**
     * Export freight offers as CSV.
     */
    public function freightCsv(Request $request)
    {
        $format = $request->query('format', 'csv');
        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';
        $writerType = $format === 'xlsx' ? \Maatwebsite\Excel\Excel::XLSX : \Maatwebsite\Excel\Excel::CSV;

        return Excel::download(
            new FreightExport($request),
            'freight-offers-' . now()->format('Y-m-d') . '.' . $extension,
            $writerType
        );
    }

    /**
     * Export vehicle offers as CSV.
     */
    public function vehiclesCsv(Request $request)
    {
        $format = $request->query('format', 'csv');
        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';
        $writerType = $format === 'xlsx' ? \Maatwebsite\Excel\Excel::XLSX : \Maatwebsite\Excel\Excel::CSV;

        return Excel::download(
            new VehicleExport($request),
            'vehicle-offers-' . now()->format('Y-m-d') . '.' . $extension,
            $writerType
        );
    }

    /**
     * Export a single order as PDF (for printing / CMR).
     */
    public function orderDetailPdf(Request $request, TransportOrder $order)
    {
        // Authorization: only shipper/carrier
        if ($order->shipper_id !== $request->user()->company_id
            && $order->carrier_id !== $request->user()->company_id
            && !$request->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $order->load(['shipper', 'carrier', 'freightOffer', 'vehicleOffer']);

        $pdf = Pdf::loadView('exports.order-detail-pdf', [
            'order' => $order,
            'generatedAt' => now()->format('d.m.Y H:i'),
        ]);

        return $pdf->download('order-' . $order->order_number . '.pdf');
    }

    /**
     * Export analytics summary as PDF.
     */
    public function analyticsPdf(Request $request)
    {
        $companyId = $request->user()->company_id;

        $orders = TransportOrder::where(function ($q) use ($companyId) {
            $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
        });

        $totalOrders = (clone $orders)->count();
        $completedOrders = (clone $orders)->where('status', 'completed')->count();
        $totalRevenue = (clone $orders)->where('status', 'completed')->sum('total_price');
        $avgValue = $completedOrders > 0 ? round($totalRevenue / $completedOrders, 2) : 0;

        // Monthly breakdown
        $monthly = (clone $orders)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status = "completed" THEN total_price ELSE 0 END) as revenue')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        $pdf = Pdf::loadView('exports.analytics-pdf', [
            'company' => $request->user()->company,
            'totalOrders' => $totalOrders,
            'completedOrders' => $completedOrders,
            'totalRevenue' => $totalRevenue,
            'avgValue' => $avgValue,
            'monthly' => $monthly,
            'generatedAt' => now()->format('d.m.Y H:i'),
        ]);

        return $pdf->download('analytics-report-' . now()->format('Y-m-d') . '.pdf');
    }
}
