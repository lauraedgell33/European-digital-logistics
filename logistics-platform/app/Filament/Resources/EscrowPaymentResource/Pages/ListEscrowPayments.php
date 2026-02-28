<?php
namespace App\Filament\Resources\EscrowPaymentResource\Pages;
use App\Filament\Resources\EscrowPaymentResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListEscrowPayments extends ListRecords
{
    protected static string $resource = EscrowPaymentResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
