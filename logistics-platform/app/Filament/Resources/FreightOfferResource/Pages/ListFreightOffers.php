<?php
namespace App\Filament\Resources\FreightOfferResource\Pages;

use App\Filament\Resources\FreightOfferResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions;

class ListFreightOffers extends ListRecords
{
    protected static string $resource = FreightOfferResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
