<?php

namespace App\Filament\Resources\DynamicPriceResource\Pages;

use App\Filament\Resources\DynamicPriceResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDynamicPrice extends EditRecord
{
    protected static string $resource = DynamicPriceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
