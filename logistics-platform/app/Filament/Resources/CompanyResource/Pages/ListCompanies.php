<?php

namespace App\Filament\Resources\CompanyResource\Pages;

use App\Filament\Resources\CompanyResource;
use App\Filament\Exports\CompanyExporter;
use App\Filament\Imports\CompanyImporter;
use Filament\Actions;
use Filament\Actions\ExportAction;
use Filament\Actions\ImportAction;
use Filament\Resources\Pages\ListRecords;

class ListCompanies extends ListRecords
{
    protected static string $resource = CompanyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ImportAction::make()->importer(CompanyImporter::class),
            ExportAction::make()->exporter(CompanyExporter::class),
            Actions\CreateAction::make(),
        ];
    }
}
