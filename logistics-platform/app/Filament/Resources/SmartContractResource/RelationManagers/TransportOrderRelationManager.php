<?php

namespace App\Filament\Resources\SmartContractResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * Shows the transport order associated with this smart contract.
 * SmartContract has partyA and partyB as BelongsTo (not HasMany),
 * and has no dedicated "parties" child table. This relation manager
 * shows the linked transport order for quick reference.
 */
class TransportOrderRelationManager extends RelationManager
{
    protected static string $relationship = 'transportOrder';

    protected static ?string $title = 'Transport Order';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('order_number')
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->searchable(),
                Tables\Columns\TextColumn::make('shipper.name')->label('Shipper'),
                Tables\Columns\TextColumn::make('carrier.name')->label('Carrier'),
                Tables\Columns\TextColumn::make('pickup_city'),
                Tables\Columns\TextColumn::make('delivery_city'),
                Tables\Columns\TextColumn::make('total_price')->money('eur'),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'completed' => 'success', 'in_transit' => 'info', default => 'gray',
                }),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([]);
    }
}
