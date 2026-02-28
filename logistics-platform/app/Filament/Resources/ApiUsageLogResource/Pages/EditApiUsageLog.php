<?php

namespace App\Filament\Resources\ApiUsageLogResource\Pages;

use App\Filament\Resources\ApiUsageLogResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditApiUsageLog extends EditRecord
{
    protected static string $resource = ApiUsageLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
