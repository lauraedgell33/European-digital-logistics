<?php

namespace App\Filament\Resources\TransportOrderResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ShipmentRelationManager extends RelationManager
{
    protected static string $relationship = 'shipment';

    protected static ?string $title = 'Shipment';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('tracking_code')
            ->columns([
                Tables\Columns\TextColumn::make('tracking_code')->copyable()->searchable()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'warning', 'in_transit' => 'info', 'delivered' => 'success',
                    'delayed' => 'danger', 'cancelled' => 'gray', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('current_location_name')->label('Location'),
                Tables\Columns\TextColumn::make('speed_kmh')->label('Speed (km/h)')->numeric(1),
                Tables\Columns\TextColumn::make('eta')->dateTime('d M Y H:i')->label('ETA'),
                Tables\Columns\TextColumn::make('last_update')->dateTime('d M Y H:i')->sortable(),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([]);
    }
}
