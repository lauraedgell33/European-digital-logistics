<?php

namespace App\Filament\Resources\TrackingShareResource\Pages;

use App\Filament\Resources\TrackingShareResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTrackingShare extends EditRecord
{
    protected static string $resource = TrackingShareResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
