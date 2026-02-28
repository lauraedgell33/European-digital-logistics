<?php

namespace App\Filament\Resources\EdiMessageResource\Pages;

use App\Filament\Resources\EdiMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditEdiMessage extends EditRecord
{
    protected static string $resource = EdiMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
