<?php

namespace App\Filament\Exports;

use App\Models\Warehouse;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class WarehouseExporter extends Exporter
{
    protected static ?string $model = Warehouse::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('name')->label('Name'),
            ExportColumn::make('company.name')->label('Company'),
            ExportColumn::make('city')->label('City'),
            ExportColumn::make('country_code')->label('Country Code'),
            ExportColumn::make('total_area_m2')->label('Total Area (m²)'),
            ExportColumn::make('available_area_m2')->label('Available Area (m²)'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('is_public')->label('Is Public'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your warehouses export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
