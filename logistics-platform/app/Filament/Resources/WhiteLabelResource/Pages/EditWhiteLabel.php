<?php

namespace App\Filament\Resources\WhiteLabelResource\Pages;

use App\Filament\Resources\WhiteLabelResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditWhiteLabel extends EditRecord
{
    protected static string $resource = WhiteLabelResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
