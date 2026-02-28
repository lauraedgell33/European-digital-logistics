<?php

namespace App\Filament\Resources\SmartContractResource\Pages;

use App\Filament\Resources\SmartContractResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSmartContract extends EditRecord
{
    protected static string $resource = SmartContractResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
