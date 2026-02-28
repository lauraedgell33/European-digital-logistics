<?php

namespace App\Filament\Resources\DebtCollectionResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * Shows the transport order linked to this debt collection case.
 * The DebtCollection model has no dedicated child "payments" table;
 * payment tracking is handled via the original invoice & PaymentTransaction.
 * This relation manager surfaces the underlying transport order for context.
 */
class TransportOrderRelationManager extends RelationManager
{
    protected static string $relationship = 'transportOrder';

    protected static ?string $title = 'Related Transport Order';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('order_number')
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->searchable(),
                Tables\Columns\TextColumn::make('shipper.name')->label('Shipper'),
                Tables\Columns\TextColumn::make('carrier.name')->label('Carrier'),
                Tables\Columns\TextColumn::make('total_price')->money('eur'),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'completed' => 'success', 'cancelled' => 'danger', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('payment_status')->badge()->color(fn (string $state): string => match ($state) {
                    'paid' => 'success', 'overdue' => 'danger', default => 'warning',
                }),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([]);
    }
}
