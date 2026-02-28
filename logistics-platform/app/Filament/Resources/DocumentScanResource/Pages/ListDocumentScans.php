<?php

namespace App\Filament\Resources\DocumentScanResource\Pages;

use App\Filament\Resources\DocumentScanResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDocumentScans extends ListRecords
{
    protected static string $resource = DocumentScanResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
