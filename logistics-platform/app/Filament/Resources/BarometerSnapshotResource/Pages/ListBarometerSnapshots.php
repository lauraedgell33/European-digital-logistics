<?php

namespace App\Filament\Resources\BarometerSnapshotResource\Pages;

use App\Filament\Resources\BarometerSnapshotResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBarometerSnapshots extends ListRecords
{
    protected static string $resource = BarometerSnapshotResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
