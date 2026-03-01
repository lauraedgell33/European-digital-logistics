<?php

namespace App\Filament\Resources\EcmrDocumentResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * Shows the transport order associated with this eCMR document as a read-only
 * relation. EcmrDocument does not implement HasMedia and has no child records,
 * so this relation manager surfaces the parent transport order for quick reference.
 *
 * Alternative: a "SignatureTimeline" infolist could be implemented as a custom page tab.
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
                Tables\Columns\TextColumn::make('order_number')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('shipper.name')->label('Shipper'),
                Tables\Columns\TextColumn::make('carrier.name')->label('Carrier'),
                Tables\Columns\TextColumn::make('pickup_city'),
                Tables\Columns\TextColumn::make('delivery_city'),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'gray', 'pending' => 'warning', 'accepted' => 'success',
                    'in_transit' => 'info', 'delivered' => 'primary', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('total_price')->money('eur'),
            ])
            ->filters([])
            ->headerActions([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([]);
    }
}
