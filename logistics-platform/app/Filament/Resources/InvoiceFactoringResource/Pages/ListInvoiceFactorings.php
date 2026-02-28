<?php

namespace App\Filament\Resources\InvoiceFactoringResource\Pages;

use App\Filament\Resources\InvoiceFactoringResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListInvoiceFactorings extends ListRecords
{
    protected static string $resource = InvoiceFactoringResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
