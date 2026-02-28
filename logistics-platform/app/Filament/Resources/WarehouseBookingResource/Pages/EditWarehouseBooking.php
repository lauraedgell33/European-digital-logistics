<?php

namespace App\Filament\Resources\WarehouseBookingResource\Pages;

use App\Filament\Resources\WarehouseBookingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditWarehouseBooking extends EditRecord
{
    protected static string $resource = WarehouseBookingResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
