<?php

namespace App\Filament\Exports;

use App\Models\DebtCollection;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class DebtCollectionExporter extends Exporter
{
    protected static ?string $model = DebtCollection::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('reference_number')->label('Reference Number'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('amount')->label('Amount'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your debt collections export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
