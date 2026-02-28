<?php

namespace App\Filament\Resources\DocumentScanResource\Pages;

use App\Filament\Resources\DocumentScanResource;
use App\Filament\Exports\DocumentScanExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;

class ListDocumentScans extends ListRecords
{
    protected static string $resource = DocumentScanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ExportAction::make()->exporter(DocumentScanExporter::class),
            Actions\CreateAction::make(),
        ];
    }
}
