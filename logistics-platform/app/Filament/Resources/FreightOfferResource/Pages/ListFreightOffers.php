<?php
namespace App\Filament\Resources\FreightOfferResource\Pages;

use App\Filament\Resources\FreightOfferResource;
use App\Filament\Exports\FreightOfferExporter;
use App\Filament\Imports\FreightOfferImporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Actions\ImportAction;
use Filament\Resources\Pages\ListRecords;

class ListFreightOffers extends ListRecords
{
    protected static string $resource = FreightOfferResource::class;
    protected function getHeaderActions(): array { return [ImportAction::make()->importer(FreightOfferImporter::class), ExportAction::make()->exporter(FreightOfferExporter::class), Actions\CreateAction::make()]; }
}
