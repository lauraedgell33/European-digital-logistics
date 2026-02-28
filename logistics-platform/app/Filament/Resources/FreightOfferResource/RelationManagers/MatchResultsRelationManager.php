<?php

namespace App\Filament\Resources\FreightOfferResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class MatchResultsRelationManager extends RelationManager
{
    protected static string $relationship = 'matchResults';

    protected static ?string $title = 'AI Match Results';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                Tables\Columns\TextColumn::make('vehicleOffer.vehicle_type')->label('Vehicle Offer')->sortable(),
                Tables\Columns\TextColumn::make('ai_score')->label('AI Score')->numeric(1)->sortable()
                    ->color(fn ($state): string => $state >= 80 ? 'success' : ($state >= 50 ? 'warning' : 'danger')),
                Tables\Columns\TextColumn::make('distance_score')->label('Distance')->numeric(1),
                Tables\Columns\TextColumn::make('capacity_score')->label('Capacity')->numeric(1),
                Tables\Columns\TextColumn::make('timing_score')->label('Timing')->numeric(1),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'suggested' => 'info', 'accepted' => 'success', 'rejected' => 'danger',
                    'expired' => 'gray', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('created_at')->dateTime('d M Y H:i')->sortable(),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('ai_score', 'desc');
    }
}
