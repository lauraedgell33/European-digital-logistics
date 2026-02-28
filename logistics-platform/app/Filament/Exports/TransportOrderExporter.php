<?php

namespace App\Filament\Exports;

use App\Models\TransportOrder;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class TransportOrderExporter extends Exporter
{
    protected static ?string $model = TransportOrder::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('order_number')->label('Order Number'),
            ExportColumn::make('shipper.name')->label('Shipper'),
            ExportColumn::make('carrier.name')->label('Carrier'),
            ExportColumn::make('pickup_country')->label('Pickup Country'),
            ExportColumn::make('pickup_city')->label('Pickup City'),
            ExportColumn::make('pickup_address')->label('Pickup Address'),
            ExportColumn::make('pickup_date')->label('Pickup Date'),
            ExportColumn::make('delivery_country')->label('Delivery Country'),
            ExportColumn::make('delivery_city')->label('Delivery City'),
            ExportColumn::make('delivery_address')->label('Delivery Address'),
            ExportColumn::make('delivery_date')->label('Delivery Date'),
            ExportColumn::make('cargo_type')->label('Cargo Type'),
            ExportColumn::make('weight')->label('Weight (kg)'),
            ExportColumn::make('total_price')->label('Total Price (€)'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('payment_status')->label('Payment Status'),
            ExportColumn::make('payment_terms')->label('Payment Terms'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your transport orders export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
