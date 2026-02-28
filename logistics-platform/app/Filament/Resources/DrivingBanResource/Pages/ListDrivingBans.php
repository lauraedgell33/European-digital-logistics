<?php
namespace App\Filament\Resources\DrivingBanResource\Pages;
use App\Filament\Resources\DrivingBanResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListDrivingBans extends ListRecords
{
    protected static string $resource = DrivingBanResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
