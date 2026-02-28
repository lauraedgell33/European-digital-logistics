<?php
namespace App\Filament\Resources\DrivingBanResource\Pages;
use App\Filament\Resources\DrivingBanResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditDrivingBan extends EditRecord
{
    protected static string $resource = DrivingBanResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
