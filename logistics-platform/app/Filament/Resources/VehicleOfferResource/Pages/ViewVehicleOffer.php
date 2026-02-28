<?php

namespace App\Filament\Resources\VehicleOfferResource\Pages;

use App\Filament\Resources\VehicleOfferResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewVehicleOffer extends ViewRecord
{
    protected static string $resource = VehicleOfferResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
