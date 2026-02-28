<?php

namespace App\Filament\Resources\TrackingShareResource\Pages;

use App\Filament\Resources\TrackingShareResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTrackingShares extends ListRecords
{
    protected static string $resource = TrackingShareResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
