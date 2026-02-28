<?php

namespace App\Filament\Resources\PriceInsightResource\Pages;

use App\Filament\Resources\PriceInsightResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListPriceInsights extends ListRecords
{
    protected static string $resource = PriceInsightResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
