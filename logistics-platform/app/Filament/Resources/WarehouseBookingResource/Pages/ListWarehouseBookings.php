<?php

namespace App\Filament\Resources\WarehouseBookingResource\Pages;

use App\Filament\Resources\WarehouseBookingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListWarehouseBookings extends ListRecords
{
    protected static string $resource = WarehouseBookingResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
