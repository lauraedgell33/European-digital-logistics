<?php
namespace App\Filament\Resources\PaymentTransactionResource\Pages;
use App\Filament\Resources\PaymentTransactionResource;
use App\Filament\Exports\PaymentTransactionExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;
class ListPaymentTransactions extends ListRecords
{
    protected static string $resource = PaymentTransactionResource::class;
    protected function getHeaderActions(): array { return [ExportAction::make()->exporter(PaymentTransactionExporter::class), Actions\CreateAction::make()]; }
}
