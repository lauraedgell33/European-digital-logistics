<?php

namespace App\Filament\Resources\SmartContractResource\Pages;

use App\Filament\Resources\SmartContractResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSmartContracts extends ListRecords
{
    protected static string $resource = SmartContractResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
