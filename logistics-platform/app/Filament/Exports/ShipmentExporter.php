<?php

namespace App\Filament\Exports;

use App\Models\Shipment;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class ShipmentExporter extends Exporter
{
    protected static ?string $model = Shipment::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('tracking_code')->label('Tracking Code'),
            ExportColumn::make('transportOrder.order_number')->label('Transport Order'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('current_location_name')->label('Current Location'),
            ExportColumn::make('current_lat')->label('Latitude'),
            ExportColumn::make('current_lng')->label('Longitude'),
            ExportColumn::make('speed_kmh')->label('Speed (km/h)'),
            ExportColumn::make('eta')->label('ETA'),
            ExportColumn::make('last_update')->label('Last Update'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your shipments export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
