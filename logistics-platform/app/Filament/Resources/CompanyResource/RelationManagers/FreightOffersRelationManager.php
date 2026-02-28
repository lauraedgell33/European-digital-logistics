<?php

namespace App\Filament\Resources\CompanyResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class FreightOffersRelationManager extends RelationManager
{
    protected static string $relationship = 'freightOffers';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('cargo_type')
            ->columns([
                Tables\Columns\TextColumn::make('cargo_type')->label('Title')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('origin_city')->searchable(),
                Tables\Columns\TextColumn::make('destination_city')->searchable(),
                Tables\Columns\TextColumn::make('price')->money('eur')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'active' => 'success', 'expired' => 'gray', 'matched' => 'info',
                    'cancelled' => 'danger', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('created_at')->dateTime('d M Y')->sortable(),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }
}
