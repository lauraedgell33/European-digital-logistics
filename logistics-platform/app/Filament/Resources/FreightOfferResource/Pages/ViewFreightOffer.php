<?php

namespace App\Filament\Resources\FreightOfferResource\Pages;

use App\Filament\Resources\FreightOfferResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewFreightOffer extends ViewRecord
{
    protected static string $resource = FreightOfferResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
