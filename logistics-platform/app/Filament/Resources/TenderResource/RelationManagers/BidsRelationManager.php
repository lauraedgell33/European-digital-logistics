<?php

namespace App\Filament\Resources\TenderResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class BidsRelationManager extends RelationManager
{
    protected static string $relationship = 'bids';

    protected static ?string $title = 'Bids';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('company.name')
            ->columns([
                Tables\Columns\TextColumn::make('company.name')->label('Company')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('proposed_price')->money('eur')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'gray', 'submitted' => 'info', 'accepted' => 'success',
                    'rejected' => 'danger', 'withdrawn' => 'warning', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('submitted_at')->dateTime('d M Y H:i')->sortable(),
                Tables\Columns\TextColumn::make('proposal')->label('Notes')->limit(50),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('submitted_at', 'desc');
    }
}
