<?php

namespace App\Filament\Resources\DebtCollectionResource\Pages;

use App\Filament\Resources\DebtCollectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewDebtCollection extends ViewRecord
{
    protected static string $resource = DebtCollectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
