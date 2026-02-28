<?php

namespace App\Filament\Resources\SmartContractResource\Pages;

use App\Filament\Resources\SmartContractResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewSmartContract extends ViewRecord
{
    protected static string $resource = SmartContractResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
