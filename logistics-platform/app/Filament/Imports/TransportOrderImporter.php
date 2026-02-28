<?php

namespace App\Filament\Imports;

use App\Models\TransportOrder;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class TransportOrderImporter extends Importer
{
    protected static ?string $model = TransportOrder::class;

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('pickup_country')
                ->requiredMapping()
                ->rules(['required', 'string', 'max:2']),
            ImportColumn::make('pickup_city')
                ->requiredMapping()
                ->rules(['required', 'string']),
            ImportColumn::make('pickup_address')
                ->rules(['nullable', 'string']),
            ImportColumn::make('pickup_date')
                ->rules(['nullable', 'date']),
            ImportColumn::make('delivery_country')
                ->requiredMapping()
                ->rules(['required', 'string', 'max:2']),
            ImportColumn::make('delivery_city')
                ->requiredMapping()
                ->rules(['required', 'string']),
            ImportColumn::make('delivery_address')
                ->rules(['nullable', 'string']),
            ImportColumn::make('delivery_date')
                ->rules(['nullable', 'date']),
            ImportColumn::make('cargo_type')
                ->rules(['nullable', 'string']),
            ImportColumn::make('weight')
                ->numeric()
                ->rules(['nullable', 'numeric']),
            ImportColumn::make('total_price')
                ->numeric()
                ->rules(['nullable', 'numeric']),
        ];
    }

    public function resolveRecord(): ?TransportOrder
    {
        $order = new TransportOrder();
        $order->status = 'draft';
        $order->created_by = auth()->id();
        return $order;
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        return 'Transport order import completed. ' . number_format($import->successful_rows) . ' rows imported.';
    }
}
