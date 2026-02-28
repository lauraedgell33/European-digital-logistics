<?php

namespace App\Filament\Resources\TenderBidResource\Pages;

use App\Filament\Resources\TenderBidResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTenderBids extends ListRecords
{
    protected static string $resource = TenderBidResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
