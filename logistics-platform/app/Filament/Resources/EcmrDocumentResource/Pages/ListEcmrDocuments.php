<?php
namespace App\Filament\Resources\EcmrDocumentResource\Pages;
use App\Filament\Resources\EcmrDocumentResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListEcmrDocuments extends ListRecords
{
    protected static string $resource = EcmrDocumentResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
