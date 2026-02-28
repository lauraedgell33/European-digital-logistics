<?php

namespace App\Filament\Resources\ShipmentResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class PositionsRelationManager extends RelationManager
{
    protected static string $relationship = 'positions';

    protected static ?string $title = 'Tracking Positions';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('recorded_at')
            ->columns([
                Tables\Columns\TextColumn::make('lat')->label('Latitude')->numeric(6),
                Tables\Columns\TextColumn::make('lng')->label('Longitude')->numeric(6),
                Tables\Columns\TextColumn::make('speed_kmh')->label('Speed (km/h)')->numeric(1),
                Tables\Columns\TextColumn::make('heading')->label('Heading°')->numeric(0),
                Tables\Columns\TextColumn::make('temperature')->label('Temp °C')->numeric(1),
                Tables\Columns\TextColumn::make('recorded_at')->dateTime('d M Y H:i:s')->sortable(),
            ])
            ->filters([])
            ->actions([])
            ->bulkActions([])
            ->defaultSort('recorded_at', 'desc');
    }
}
