<?php

namespace App\Filament\Resources\PartnerNetworkResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class MembersRelationManager extends RelationManager
{
    protected static string $relationship = 'members';

    protected static ?string $title = 'Network Members';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('country_code')->label('Country')->sortable(),
                Tables\Columns\TextColumn::make('pivot.role')->label('Role')->badge()->color(fn (string $state): string => match ($state) {
                    'owner' => 'danger', 'admin' => 'warning', 'member' => 'primary', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('pivot.status')->label('Status')->badge()->color(fn (string $state): string => match ($state) {
                    'active' => 'success', 'invited' => 'info', 'removed' => 'danger',
                    'suspended' => 'warning', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('pivot.joined_at')->label('Joined At')->dateTime('d M Y'),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('name');
    }
}
