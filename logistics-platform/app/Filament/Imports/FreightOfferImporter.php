<?php

namespace App\Filament\Imports;

use App\Models\FreightOffer;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class FreightOfferImporter extends Importer
{
    protected static ?string $model = FreightOffer::class;

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('title')
                ->requiredMapping()
                ->rules(['required', 'string', 'max:255']),
            ImportColumn::make('origin_city')
                ->requiredMapping()
                ->rules(['required', 'string']),
            ImportColumn::make('origin_country')
                ->requiredMapping()
                ->rules(['required', 'string', 'max:2']),
            ImportColumn::make('destination_city')
                ->requiredMapping()
                ->rules(['required', 'string']),
            ImportColumn::make('destination_country')
                ->requiredMapping()
                ->rules(['required', 'string', 'max:2']),
            ImportColumn::make('price')
                ->numeric()
                ->rules(['nullable', 'numeric']),
            ImportColumn::make('weight')
                ->numeric()
                ->rules(['nullable', 'numeric']),
            ImportColumn::make('cargo_type')
                ->rules(['nullable', 'string']),
        ];
    }

    public function resolveRecord(): ?FreightOffer
    {
        $offer = new FreightOffer();
        $offer->status = 'draft';
        $offer->company_id = auth()->user()->company_id;
        $offer->user_id = auth()->id();
        return $offer;
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        return 'Freight offer import completed. ' . number_format($import->successful_rows) . ' rows imported.';
    }
}
