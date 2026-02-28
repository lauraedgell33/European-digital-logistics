<?php

namespace App\Filament\Resources\VatRecordResource\Pages;

use App\Filament\Resources\VatRecordResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVatRecord extends EditRecord
{
    protected static string $resource = VatRecordResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
