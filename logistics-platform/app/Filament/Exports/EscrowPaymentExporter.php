<?php

namespace App\Filament\Exports;

use App\Models\EscrowPayment;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class EscrowPaymentExporter extends Exporter
{
    protected static ?string $model = EscrowPayment::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('transportOrder.order_number')->label('Transport Order'),
            ExportColumn::make('payer.name')->label('Payer'),
            ExportColumn::make('payee.name')->label('Payee'),
            ExportColumn::make('amount')->label('Amount'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('funded_at')->label('Funded At'),
            ExportColumn::make('released_at')->label('Released At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your escrow payments export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
