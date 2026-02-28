<?php

namespace App\Filament\Resources\InvoiceResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class VatRecordsRelationManager extends RelationManager
{
    protected static string $relationship = 'vatRecords';

    protected static ?string $title = 'VAT Records';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('origin_country')
            ->columns([
                Tables\Columns\TextColumn::make('origin_country')->sortable(),
                Tables\Columns\TextColumn::make('destination_country')->sortable(),
                Tables\Columns\TextColumn::make('taxable_amount')->money('eur')->sortable(),
                Tables\Columns\TextColumn::make('vat_rate')->numeric(2)->suffix('%'),
                Tables\Columns\TextColumn::make('vat_amount')->money('eur')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'warning', 'filed' => 'info', 'paid' => 'success',
                    'exempt' => 'gray', default => 'gray',
                }),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }
}
