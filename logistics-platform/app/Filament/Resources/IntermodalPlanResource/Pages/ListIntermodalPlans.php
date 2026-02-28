<?php

namespace App\Filament\Resources\IntermodalPlanResource\Pages;

use App\Filament\Resources\IntermodalPlanResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListIntermodalPlans extends ListRecords
{
    protected static string $resource = IntermodalPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
