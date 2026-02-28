<?php

namespace App\Filament\Resources\ErpIntegrationResource\Pages;

use App\Filament\Resources\ErpIntegrationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListErpIntegrations extends ListRecords
{
    protected static string $resource = ErpIntegrationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
