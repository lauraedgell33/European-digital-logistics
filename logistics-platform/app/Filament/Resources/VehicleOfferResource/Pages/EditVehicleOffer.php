<?php

namespace App\Filament\Resources\VehicleOfferResource\Pages;

use App\Filament\Resources\VehicleOfferResource;
use Filament\Resources\Pages\EditRecord;
use Filament\Actions;

class EditVehicleOffer extends EditRecord
{
    protected static string $resource = VehicleOfferResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
