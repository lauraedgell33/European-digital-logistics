<?php

namespace App\Filament\Resources\AiPredictionResource\Pages;

use App\Filament\Resources\AiPredictionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAiPredictions extends ListRecords
{
    protected static string $resource = AiPredictionResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
