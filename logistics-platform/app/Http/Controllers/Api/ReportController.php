<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportingService;
use App\Exports\OrdersExport;
use App\Exports\FreightExport;
use App\Exports\VehicleExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportingService $reporting
    ) {}

    /**
     * Revenue report with monthly chart data.
     */
    public function revenue(Request $request): JsonResponse
    {
        $request->validate(['months' => 'nullable|integer|min:1|max:36']);

        $report = $this->reporting->revenueReport(
            $request->user()->company_id,
            $request->input('months', 12)
        );

        return response()->json(['data' => $report]);
    }

    /**
     * Orders report — status breakdown, completion metrics.
     */
    public function orders(Request $request): JsonResponse
    {
        $request->validate(['months' => 'nullable|integer|min:1|max:24']);

        $report = $this->reporting->ordersReport(
            $request->user()->company_id,
            $request->input('months', 6)
        );

        return response()->json(['data' => $report]);
    }

    /**
     * Top routes report.
     */
    public function routes(Request $request): JsonResponse
    {
        $report = $this->reporting->routesReport(
            $request->user()->company_id,
            $request->input('limit', 20)
        );

        return response()->json(['data' => $report]);
    }

    /**
     * Carrier performance report.
     */
    public function carriers(Request $request): JsonResponse
    {
        $report = $this->reporting->carriersReport(
            $request->user()->company_id,
            $request->input('limit', 20)
        );

        return response()->json(['data' => $report]);
    }

    /**
     * Carbon emissions report.
     */
    public function carbon(Request $request): JsonResponse
    {
        $request->validate(['months' => 'nullable|integer|min:1|max:36']);

        $report = $this->reporting->carbonReport(
            $request->user()->company_id,
            $request->input('months', 12)
        );

        return response()->json(['data' => $report]);
    }

    /**
     * Executive summary KPIs.
     */
    public function summary(Request $request): JsonResponse
    {
        $report = $this->reporting->executiveSummary($request->user()->company_id);
        return response()->json(['data' => $report]);
    }

    /**
     * Export a report as PDF or CSV/Excel.
     */
    public function export(Request $request, string $type)
    {
        $request->validate([
            'format' => 'nullable|in:pdf,csv,xlsx',
            'months' => 'nullable|integer|min:1|max:36',
        ]);

        $format    = $request->input('format', 'pdf');
        $companyId = $request->user()->company_id;
        $months    = $request->input('months', 12);

        if ($format === 'pdf') {
            $reportData = match ($type) {
                'revenue'  => $this->reporting->revenueReport($companyId, $months),
                'orders'   => $this->reporting->ordersReport($companyId, $months > 24 ? 24 : $months),
                'routes'   => $this->reporting->routesReport($companyId),
                'carriers' => $this->reporting->carriersReport($companyId),
                'carbon'   => $this->reporting->carbonReport($companyId, $months),
                'summary'  => $this->reporting->executiveSummary($companyId),
                default    => abort(404, 'Unknown report type'),
            };

            $pdf = Pdf::loadView('exports.report-pdf', [
                'type'        => $type,
                'data'        => $reportData,
                'company'     => $request->user()->company,
                'generatedAt' => now()->format('d.m.Y H:i'),
            ])->setPaper('a4', 'landscape');

            return $pdf->download("report-{$type}-" . now()->format('Y-m-d') . '.pdf');
        }

        // CSV/Excel export — delegate to existing exports
        $writerType = $format === 'xlsx' ? \Maatwebsite\Excel\Excel::XLSX : \Maatwebsite\Excel\Excel::CSV;

        return match ($type) {
            'orders'   => Excel::download(new OrdersExport($request), "orders-report.{$format}", $writerType),
            'freight'  => Excel::download(new FreightExport($request), "freight-report.{$format}", $writerType),
            'vehicles' => Excel::download(new VehicleExport($request), "vehicles-report.{$format}", $writerType),
            default    => response()->json(['error' => "Export not available for: {$type}"], 422),
        };
    }
}
