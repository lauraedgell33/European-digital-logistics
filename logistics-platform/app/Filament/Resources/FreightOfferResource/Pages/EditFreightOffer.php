<?php
namespace App\Filament\Resources\FreightOfferResource\Pages;

use App\Filament\Resources\FreightOfferResource;
use Filament\Resources\Pages\EditRecord;
use Filament\Actions;

class EditFreightOffer extends EditRecord
{
    protected static string $resource = FreightOfferResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
