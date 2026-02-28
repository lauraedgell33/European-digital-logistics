<?php
namespace App\Filament\Resources\DebtCollectionResource\Pages;
use App\Filament\Resources\DebtCollectionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditDebtCollection extends EditRecord
{
    protected static string $resource = DebtCollectionResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
