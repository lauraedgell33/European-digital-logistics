<?php
namespace App\Filament\Resources\FreightOfferResource\Pages;

use App\Filament\Resources\FreightOfferResource;
use App\Filament\Exports\FreightOfferExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;

class ListFreightOffers extends ListRecords
{
    protected static string $resource = FreightOfferResource::class;
    protected function getHeaderActions(): array { return [ExportAction::make()->exporter(FreightOfferExporter::class), Actions\CreateAction::make()]; }
}
