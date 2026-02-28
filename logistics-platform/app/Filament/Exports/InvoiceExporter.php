<?php

namespace App\Filament\Exports;

use App\Models\Invoice;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class InvoiceExporter extends Exporter
{
    protected static ?string $model = Invoice::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('invoice_number')->label('Invoice Number'),
            ExportColumn::make('company.name')->label('Company'),
            ExportColumn::make('customerCompany.name')->label('Customer Company'),
            ExportColumn::make('customer_name')->label('Customer Name'),
            ExportColumn::make('total_amount')->label('Total Amount'),
            ExportColumn::make('paid_amount')->label('Paid Amount'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('issue_date')->label('Issue Date'),
            ExportColumn::make('due_date')->label('Due Date'),
            ExportColumn::make('currency')->label('Currency'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your invoices export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
