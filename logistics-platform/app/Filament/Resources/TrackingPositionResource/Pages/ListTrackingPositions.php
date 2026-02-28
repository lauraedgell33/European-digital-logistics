<?php

namespace App\Filament\Resources\TrackingPositionResource\Pages;

use App\Filament\Resources\TrackingPositionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTrackingPositions extends ListRecords
{
    protected static string $resource = TrackingPositionResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
