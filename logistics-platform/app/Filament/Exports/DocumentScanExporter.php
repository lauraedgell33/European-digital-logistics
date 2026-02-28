<?php

namespace App\Filament\Exports;

use App\Models\DocumentScan;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class DocumentScanExporter extends Exporter
{
    protected static ?string $model = DocumentScan::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('document_name')->label('Document Name'),
            ExportColumn::make('document_type')->label('Document Type'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your document scans export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
