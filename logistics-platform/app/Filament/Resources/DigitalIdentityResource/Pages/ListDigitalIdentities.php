<?php

namespace App\Filament\Resources\DigitalIdentityResource\Pages;

use App\Filament\Resources\DigitalIdentityResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDigitalIdentities extends ListRecords
{
    protected static string $resource = DigitalIdentityResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
