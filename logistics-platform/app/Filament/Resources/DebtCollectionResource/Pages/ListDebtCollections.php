<?php
namespace App\Filament\Resources\DebtCollectionResource\Pages;
use App\Filament\Resources\DebtCollectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListDebtCollections extends ListRecords
{
    protected static string $resource = DebtCollectionResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
