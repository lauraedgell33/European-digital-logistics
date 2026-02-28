<?php

namespace App\Filament\Resources\ShipmentEventResource\Pages;

use App\Filament\Resources\ShipmentEventResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditShipmentEvent extends EditRecord
{
    protected static string $resource = ShipmentEventResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
