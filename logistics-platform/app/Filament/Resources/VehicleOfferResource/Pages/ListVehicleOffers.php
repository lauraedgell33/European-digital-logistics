<?php

namespace App\Filament\Resources\VehicleOfferResource\Pages;

use App\Filament\Resources\VehicleOfferResource;
use App\Filament\Exports\VehicleOfferExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;

class ListVehicleOffers extends ListRecords
{
    protected static string $resource = VehicleOfferResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ExportAction::make()->exporter(VehicleOfferExporter::class),
            Actions\CreateAction::make(),
        ];
    }
}
