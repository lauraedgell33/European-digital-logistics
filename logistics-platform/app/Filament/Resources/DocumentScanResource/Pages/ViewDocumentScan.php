<?php

namespace App\Filament\Resources\DocumentScanResource\Pages;

use App\Filament\Resources\DocumentScanResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewDocumentScan extends ViewRecord
{
    protected static string $resource = DocumentScanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
