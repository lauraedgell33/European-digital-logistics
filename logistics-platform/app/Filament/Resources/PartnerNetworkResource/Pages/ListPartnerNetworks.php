<?php

namespace App\Filament\Resources\PartnerNetworkResource\Pages;

use App\Filament\Resources\PartnerNetworkResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions;

class ListPartnerNetworks extends ListRecords
{
    protected static string $resource = PartnerNetworkResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
