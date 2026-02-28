<?php

namespace App\Filament\Resources\WhiteLabelResource\Pages;

use App\Filament\Resources\WhiteLabelResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListWhiteLabels extends ListRecords
{
    protected static string $resource = WhiteLabelResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
