<?php
namespace App\Filament\Resources\EscrowPaymentResource\Pages;
use App\Filament\Resources\EscrowPaymentResource;
use App\Filament\Exports\EscrowPaymentExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;
class ListEscrowPayments extends ListRecords
{
    protected static string $resource = EscrowPaymentResource::class;
    protected function getHeaderActions(): array { return [ExportAction::make()->exporter(EscrowPaymentExporter::class), Actions\CreateAction::make()]; }
}
