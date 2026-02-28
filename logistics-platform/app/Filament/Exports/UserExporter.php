<?php

namespace App\Filament\Exports;

use App\Models\User;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

class UserExporter extends Exporter
{
    protected static ?string $model = User::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('name')->label('Name'),
            ExportColumn::make('email')->label('Email'),
            ExportColumn::make('role')->label('Role'),
            ExportColumn::make('company.name')->label('Company'),
            ExportColumn::make('phone')->label('Phone'),
            ExportColumn::make('language')->label('Language'),
            ExportColumn::make('is_active')->label('Is Active'),
            ExportColumn::make('last_login_at')->label('Last Login At'),
            ExportColumn::make('created_at')->label('Created At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        return 'Your users export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
