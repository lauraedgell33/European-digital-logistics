<?php
namespace App\Filament\Resources\EcmrDocumentResource\Pages;
use App\Filament\Resources\EcmrDocumentResource;
use App\Filament\Exports\EcmrDocumentExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;
class ListEcmrDocuments extends ListRecords
{
    protected static string $resource = EcmrDocumentResource::class;
    protected function getHeaderActions(): array { return [ExportAction::make()->exporter(EcmrDocumentExporter::class), Actions\CreateAction::make()]; }
}
