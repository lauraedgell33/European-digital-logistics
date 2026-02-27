<?php

namespace App\Filament\Resources\VehicleOfferResource\Pages;

use App\Filament\Resources\VehicleOfferResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions;

class ListVehicleOffers extends ListRecords
{
    protected static string $resource = VehicleOfferResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
