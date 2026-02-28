<?php
namespace App\Filament\Resources\TransportOrderResource\Pages;

use App\Filament\Resources\TransportOrderResource;
use App\Filament\Exports\TransportOrderExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;

class ListTransportOrders extends ListRecords
{
    protected static string $resource = TransportOrderResource::class;
    protected function getHeaderActions(): array { return [ExportAction::make()->exporter(TransportOrderExporter::class), Actions\CreateAction::make()]; }
}
