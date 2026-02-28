<?php

namespace App\Filament\Resources\EdiMessageResource\Pages;

use App\Filament\Resources\EdiMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEdiMessages extends ListRecords
{
    protected static string $resource = EdiMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
