<?php

namespace App\Filament\Exports;

use App\Models\EcmrDocument;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class EcmrDocumentExporter extends Exporter
{
    protected static ?string $model = EcmrDocument::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('document_number')->label('Document Number'),
            ExportColumn::make('shipper_name')->label('Shipper Name'),
            ExportColumn::make('carrier_name')->label('Carrier Name'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your eCMR documents export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
