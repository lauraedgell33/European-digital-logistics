<?php

namespace App\Filament\Resources\EscrowPaymentResource\Pages;

use App\Filament\Resources\EscrowPaymentResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewEscrowPayment extends ViewRecord
{
    protected static string $resource = EscrowPaymentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
