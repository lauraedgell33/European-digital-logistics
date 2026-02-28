<?php

namespace App\Filament\Resources\RouteOptimizationResource\Pages;

use App\Filament\Resources\RouteOptimizationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditRouteOptimization extends EditRecord
{
    protected static string $resource = RouteOptimizationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
