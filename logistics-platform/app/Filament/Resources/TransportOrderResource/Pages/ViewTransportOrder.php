<?php

namespace App\Filament\Resources\TransportOrderResource\Pages;

use App\Filament\Resources\TransportOrderResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewTransportOrder extends ViewRecord
{
    protected static string $resource = TransportOrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
