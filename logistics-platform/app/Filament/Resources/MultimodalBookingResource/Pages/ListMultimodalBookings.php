<?php

namespace App\Filament\Resources\MultimodalBookingResource\Pages;

use App\Filament\Resources\MultimodalBookingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMultimodalBookings extends ListRecords
{
    protected static string $resource = MultimodalBookingResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
