<?php

namespace App\Filament\Resources\TrackingPositionResource\Pages;

use App\Filament\Resources\TrackingPositionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTrackingPosition extends EditRecord
{
    protected static string $resource = TrackingPositionResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
