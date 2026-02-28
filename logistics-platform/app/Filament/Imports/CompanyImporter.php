<?php

namespace App\Filament\Imports;

use App\Models\Company;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class CompanyImporter extends Importer
{
    protected static ?string $model = Company::class;

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('name')
                ->requiredMapping()
                ->rules(['required', 'string', 'max:255']),
            ImportColumn::make('vat_number')
                ->requiredMapping()
                ->rules(['required', 'string', 'max:50']),
            ImportColumn::make('type')
                ->rules(['nullable', 'string']),
            ImportColumn::make('country_code')
                ->rules(['nullable', 'string', 'max:2']),
            ImportColumn::make('city')
                ->rules(['nullable', 'string', 'max:255']),
            ImportColumn::make('address')
                ->rules(['nullable', 'string']),
            ImportColumn::make('phone')
                ->rules(['nullable', 'string']),
            ImportColumn::make('email')
                ->rules(['nullable', 'email']),
        ];
    }

    public function resolveRecord(): ?Company
    {
        return Company::firstOrNew(['vat_number' => $this->data['vat_number']]);
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        return 'Company import completed. ' . number_format($import->successful_rows) . ' rows imported.';
    }
}
