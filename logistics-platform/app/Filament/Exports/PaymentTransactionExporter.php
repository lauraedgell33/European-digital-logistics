<?php

namespace App\Filament\Exports;

use App\Models\PaymentTransaction;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class PaymentTransactionExporter extends Exporter
{
    protected static ?string $model = PaymentTransaction::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('transaction_reference')->label('Transaction Reference'),
            ExportColumn::make('company.name')->label('Company'),
            ExportColumn::make('invoice.invoice_number')->label('Invoice Number'),
            ExportColumn::make('payment_provider')->label('Payment Provider'),
            ExportColumn::make('amount')->label('Amount'),
            ExportColumn::make('fee_amount')->label('Fee Amount'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('completed_at')->label('Completed At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your payment transactions export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
