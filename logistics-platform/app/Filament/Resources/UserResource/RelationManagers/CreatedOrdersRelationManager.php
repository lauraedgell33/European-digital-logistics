<?php

namespace App\Filament\Resources\UserResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class CreatedOrdersRelationManager extends RelationManager
{
    protected static string $relationship = 'createdOrders';

    protected static ?string $title = 'Created Orders';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('order_number')
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'gray', 'pending' => 'warning', 'accepted' => 'success',
                    'rejected' => 'danger', 'in_transit' => 'info', 'delivered' => 'primary',
                    'completed' => 'success', 'cancelled' => 'danger', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('total_price')->money('eur')->sortable(),
                Tables\Columns\TextColumn::make('pickup_city')->searchable(),
                Tables\Columns\TextColumn::make('delivery_city')->searchable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime('d M Y')->sortable(),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }
}
