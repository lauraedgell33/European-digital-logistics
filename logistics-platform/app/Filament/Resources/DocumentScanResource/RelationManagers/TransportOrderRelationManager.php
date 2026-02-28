<?php

namespace App\Filament\Resources\DocumentScanResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * Shows the transport order associated with this document scan.
 * DocumentScan has no child "results" table — extracted data is stored
 * as JSON in the extracted_data column. This relation manager surfaces
 * the linked transport order for context.
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
