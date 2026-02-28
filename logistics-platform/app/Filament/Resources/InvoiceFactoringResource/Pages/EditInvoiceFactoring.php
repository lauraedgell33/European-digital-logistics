<?php

namespace App\Filament\Resources\InvoiceFactoringResource\Pages;

use App\Filament\Resources\InvoiceFactoringResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditInvoiceFactoring extends EditRecord
{
    protected static string $resource = InvoiceFactoringResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
