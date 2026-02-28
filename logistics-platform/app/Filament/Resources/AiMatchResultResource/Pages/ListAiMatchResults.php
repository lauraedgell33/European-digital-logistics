<?php

namespace App\Filament\Resources\AiMatchResultResource\Pages;

use App\Filament\Resources\AiMatchResultResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAiMatchResults extends ListRecords
{
    protected static string $resource = AiMatchResultResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
