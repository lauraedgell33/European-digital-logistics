<?php
namespace App\Filament\Resources\CarbonFootprintResource\Pages;
use App\Filament\Resources\CarbonFootprintResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListCarbonFootprints extends ListRecords
{
    protected static string $resource = CarbonFootprintResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
