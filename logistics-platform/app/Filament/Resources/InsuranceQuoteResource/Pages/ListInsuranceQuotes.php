<?php
namespace App\Filament\Resources\InsuranceQuoteResource\Pages;
use App\Filament\Resources\InsuranceQuoteResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListInsuranceQuotes extends ListRecords
{
    protected static string $resource = InsuranceQuoteResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
