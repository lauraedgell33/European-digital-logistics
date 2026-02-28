<?php

namespace App\Filament\Resources\ErpIntegrationResource\Pages;

use App\Filament\Resources\ErpIntegrationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditErpIntegration extends EditRecord
{
    protected static string $resource = ErpIntegrationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
