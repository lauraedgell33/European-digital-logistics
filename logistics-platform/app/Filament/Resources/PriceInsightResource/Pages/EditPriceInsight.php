<?php

namespace App\Filament\Resources\PriceInsightResource\Pages;

use App\Filament\Resources\PriceInsightResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPriceInsight extends EditRecord
{
    protected static string $resource = PriceInsightResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
