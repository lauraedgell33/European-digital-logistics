<?php

namespace App\Filament\Exports;

use App\Models\VehicleOffer;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class VehicleOfferExporter extends Exporter
{
    protected static ?string $model = VehicleOffer::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('title')->label('Title'),
            ExportColumn::make('company.name')->label('Company'),
            ExportColumn::make('vehicle_type')->label('Vehicle Type'),
            ExportColumn::make('current_city')->label('Current City'),
            ExportColumn::make('current_country')->label('Current Country'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your vehicle offers export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
