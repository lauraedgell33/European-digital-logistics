<?php

namespace App\Filament\Resources\EcmrDocumentResource\Pages;

use App\Filament\Resources\EcmrDocumentResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewEcmrDocument extends ViewRecord
{
    protected static string $resource = EcmrDocumentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
