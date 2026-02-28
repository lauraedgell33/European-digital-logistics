<?php
namespace App\Filament\Resources\CarbonFootprintResource\Pages;
use App\Filament\Resources\CarbonFootprintResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditCarbonFootprint extends EditRecord
{
    protected static string $resource = CarbonFootprintResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
