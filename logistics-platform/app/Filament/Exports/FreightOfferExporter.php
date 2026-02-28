<?php

namespace App\Filament\Exports;

use App\Models\FreightOffer;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class FreightOfferExporter extends Exporter
{
    protected static ?string $model = FreightOffer::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('title')->label('Title'),
            ExportColumn::make('company.name')->label('Company'),
            ExportColumn::make('origin_city')->label('Origin City'),
            ExportColumn::make('origin_country')->label('Origin Country'),
            ExportColumn::make('destination_city')->label('Destination City'),
            ExportColumn::make('destination_country')->label('Destination Country'),
            ExportColumn::make('price')->label('Price'),
            ExportColumn::make('status')->label('Status'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your freight offers export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
