<?php

namespace App\Filament\Exports;

use App\Models\CarbonFootprint;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class CarbonFootprintExporter extends Exporter
{
    protected static ?string $model = CarbonFootprint::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('company.name')->label('Company'),
            ExportColumn::make('vehicle_type')->label('Vehicle Type'),
            ExportColumn::make('distance_km')->label('Distance (km)'),
            ExportColumn::make('co2_kg')->label('CO₂ (kg)'),
            ExportColumn::make('co2_per_ton_km')->label('CO₂ per Ton-km'),
            ExportColumn::make('is_carbon_neutral')->label('Is Carbon Neutral'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your carbon footprints export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
