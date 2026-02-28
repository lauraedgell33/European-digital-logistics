<?php
namespace App\Filament\Resources\WarehouseResource\Pages;
use App\Filament\Resources\WarehouseResource;
use App\Filament\Exports\WarehouseExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;
class ListWarehouses extends ListRecords
{
    protected static string $resource = WarehouseResource::class;
    protected function getHeaderActions(): array { return [ExportAction::make()->exporter(WarehouseExporter::class), Actions\CreateAction::make()]; }
}
