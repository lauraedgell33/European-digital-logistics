<?php

namespace App\Filament\Resources\PartnerNetworkResource\Pages;

use App\Filament\Resources\PartnerNetworkResource;
use Filament\Resources\Pages\EditRecord;
use Filament\Actions;

class EditPartnerNetwork extends EditRecord
{
    protected static string $resource = PartnerNetworkResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
