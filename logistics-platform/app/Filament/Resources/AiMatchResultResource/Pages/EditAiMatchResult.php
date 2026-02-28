<?php

namespace App\Filament\Resources\AiMatchResultResource\Pages;

use App\Filament\Resources\AiMatchResultResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAiMatchResult extends EditRecord
{
    protected static string $resource = AiMatchResultResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
