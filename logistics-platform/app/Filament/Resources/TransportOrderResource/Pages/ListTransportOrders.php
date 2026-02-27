<?php
namespace App\Filament\Resources\TransportOrderResource\Pages;

use App\Filament\Resources\TransportOrderResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions;

class ListTransportOrders extends ListRecords
{
    protected static string $resource = TransportOrderResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
