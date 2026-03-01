<?php

namespace App\Filament\Pages;

use App\Models\Invoice;
use App\Models\PaymentTransaction;
use Filament\Pages\Page;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialReports extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-document-chart-bar';

    public static function canAccess(): bool
    {
        return auth()->user()?->role === 'admin';
    }
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 8;
    protected static ?string $title = 'Financial Reports';
    protected static string $view = 'filament.pages.financial-reports';

    public function getViewData(): array
    {
        $thisMonth = Carbon::now()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        return [
            'monthly' => [
                'revenue' => Invoice::where('status', 'paid')->where('paid_at', '>=', $thisMonth)->sum('total_amount'),
                'invoiced' => Invoice::where('created_at', '>=', $thisMonth)->sum('total_amount'),
                'collected' => PaymentTransaction::where('status', 'completed')->where('completed_at', '>=', $thisMonth)->sum('amount'),
                'outstanding' => Invoice::whereNotIn('status', ['paid', 'cancelled'])->where('created_at', '>=', $thisMonth)->sum('total_amount'),
            ],
            'yearly' => [
                'revenue' => Invoice::where('status', 'paid')->where('paid_at', '>=', $thisYear)->sum('total_amount'),
                'taxCollected' => Invoice::where('status', 'paid')->where('paid_at', '>=', $thisYear)->sum('tax_amount'),
            ],
            'aging' => [
                'current' => Invoice::whereNotIn('status', ['paid', 'cancelled'])->where('due_date', '>=', now())->sum('total_amount'),
                'overdue_30' => Invoice::whereNotIn('status', ['paid', 'cancelled'])->whereBetween('due_date', [now()->subDays(30), now()])->sum('total_amount'),
                'overdue_60' => Invoice::whereNotIn('status', ['paid', 'cancelled'])->whereBetween('due_date', [now()->subDays(60), now()->subDays(30)])->sum('total_amount'),
                'overdue_90' => Invoice::whereNotIn('status', ['paid', 'cancelled'])->where('due_date', '<', now()->subDays(60))->sum('total_amount'),
            ],
            'byMonth' => Invoice::where('status', 'paid')->where('paid_at', '>=', $thisYear)
                ->select(DB::raw('MONTH(paid_at) as month'), DB::raw('SUM(total_amount) as revenue'), DB::raw('SUM(tax_amount) as tax'))
                ->groupBy('month')->orderBy('month')->get(),
        ];
    }
}
