<?php

namespace App\Filament\Resources\RouteOptimizationResource\Pages;

use App\Filament\Resources\RouteOptimizationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRouteOptimizations extends ListRecords
{
    protected static string $resource = RouteOptimizationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
