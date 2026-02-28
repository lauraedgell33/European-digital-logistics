<?php

namespace App\Filament\Resources\IntermodalPlanResource\Pages;

use App\Filament\Resources\IntermodalPlanResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditIntermodalPlan extends EditRecord
{
    protected static string $resource = IntermodalPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
