<?php

namespace App\Filament\Exports;

use App\Models\Company;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class CompanyExporter extends Exporter
{
    protected static ?string $model = Company::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('name')->label('Name'),
            ExportColumn::make('vat_number')->label('VAT Number'),
            ExportColumn::make('type')->label('Type'),
            ExportColumn::make('verification_status')->label('Verification Status'),
            ExportColumn::make('country_code')->label('Country Code'),
            ExportColumn::make('city')->label('City'),
            ExportColumn::make('phone')->label('Phone'),
            ExportColumn::make('email')->label('Email'),
            ExportColumn::make('rating')->label('Rating'),
            ExportColumn::make('is_active')->label('Is Active'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your companies export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
