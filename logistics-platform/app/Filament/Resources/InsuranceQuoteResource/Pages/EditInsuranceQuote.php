<?php
namespace App\Filament\Resources\InsuranceQuoteResource\Pages;
use App\Filament\Resources\InsuranceQuoteResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditInsuranceQuote extends EditRecord
{
    protected static string $resource = InsuranceQuoteResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
