<?php

namespace App\Filament\Resources\CompanyResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class VehicleOffersRelationManager extends RelationManager
{
    protected static string $relationship = 'vehicleOffers';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('vehicle_type')
            ->columns([
                Tables\Columns\TextColumn::make('vehicle_type')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('current_city')->label('Current City')->searchable(),
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
