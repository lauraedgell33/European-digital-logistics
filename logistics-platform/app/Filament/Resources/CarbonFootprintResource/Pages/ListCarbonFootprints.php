<?php
namespace App\Filament\Resources\CarbonFootprintResource\Pages;
use App\Filament\Resources\CarbonFootprintResource;
use App\Filament\Exports\CarbonFootprintExporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Resources\Pages\ListRecords;
class ListCarbonFootprints extends ListRecords
{
    protected static string $resource = CarbonFootprintResource::class;
    protected function getHeaderActions(): array { return [ExportAction::make()->exporter(CarbonFootprintExporter::class), Actions\CreateAction::make()]; }
}
