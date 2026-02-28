<?php

namespace App\Filament\Resources\ApiUsageLogResource\Pages;

use App\Filament\Resources\ApiUsageLogResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListApiUsageLogs extends ListRecords
{
    protected static string $resource = ApiUsageLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
