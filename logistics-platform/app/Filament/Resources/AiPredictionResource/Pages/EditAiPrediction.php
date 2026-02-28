<?php

namespace App\Filament\Resources\AiPredictionResource\Pages;

use App\Filament\Resources\AiPredictionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAiPrediction extends EditRecord
{
    protected static string $resource = AiPredictionResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
