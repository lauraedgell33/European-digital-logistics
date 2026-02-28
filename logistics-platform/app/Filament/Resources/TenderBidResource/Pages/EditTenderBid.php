<?php

namespace App\Filament\Resources\TenderBidResource\Pages;

use App\Filament\Resources\TenderBidResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTenderBid extends EditRecord
{
    protected static string $resource = TenderBidResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
