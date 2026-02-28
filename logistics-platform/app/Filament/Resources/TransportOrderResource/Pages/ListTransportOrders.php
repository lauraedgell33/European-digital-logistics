<?php
namespace App\Filament\Resources\TransportOrderResource\Pages;

use App\Filament\Resources\TransportOrderResource;
use App\Filament\Exports\TransportOrderExporter;
use App\Filament\Imports\TransportOrderImporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Actions\ImportAction;
use Filament\Resources\Pages\ListRecords;

class ListTransportOrders extends ListRecords
{
    protected static string $resource = TransportOrderResource::class;
    protected function getHeaderActions(): array { return [ImportAction::make()->importer(TransportOrderImporter::class), ExportAction::make()->exporter(TransportOrderExporter::class), Actions\CreateAction::make()]; }
}
