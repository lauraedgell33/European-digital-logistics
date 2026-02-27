<?php
namespace App\Filament\Resources\TransportOrderResource\Pages;

use App\Filament\Resources\TransportOrderResource;
use Filament\Resources\Pages\EditRecord;
use Filament\Actions;

class EditTransportOrder extends EditRecord
{
    protected static string $resource = TransportOrderResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
