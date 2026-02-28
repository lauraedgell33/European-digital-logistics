<?php

namespace App\Filament\Resources\DigitalIdentityResource\Pages;

use App\Filament\Resources\DigitalIdentityResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDigitalIdentity extends EditRecord
{
    protected static string $resource = DigitalIdentityResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
