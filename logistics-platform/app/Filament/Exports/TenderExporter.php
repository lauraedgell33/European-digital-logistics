<?php

namespace App\Filament\Exports;

use App\Models\Tender;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class TenderExporter extends Exporter
{
    protected static ?string $model = Tender::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('title')->label('Title'),
            ExportColumn::make('reference_number')->label('Reference Number'),
            ExportColumn::make('company.name')->label('Company'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('deadline')->label('Deadline'),
            ExportColumn::make('budget_min')->label('Budget Min'),
            ExportColumn::make('budget_max')->label('Budget Max'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your tenders export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
