<?php
namespace App\Filament\Resources\DebtCollectionResource\Pages;
use App\Filament\Resources\DebtCollectionResource;
use App\Filament\Exports\DebtCollectionExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;
class ListDebtCollections extends ListRecords
{
    protected static string $resource = DebtCollectionResource::class;
    protected function getHeaderActions(): array { return [ExportAction::make()->exporter(DebtCollectionExporter::class), Actions\CreateAction::make()]; }
}
