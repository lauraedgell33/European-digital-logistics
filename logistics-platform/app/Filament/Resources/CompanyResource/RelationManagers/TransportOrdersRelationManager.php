<?php

namespace App\Filament\Resources\CompanyResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class TransportOrdersRelationManager extends RelationManager
{
    protected static string $relationship = 'transportOrdersAsShipper';

    protected static ?string $title = 'Transport Orders (as Shipper)';

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
                Tables\Columns\TextColumn::make('pickup_date')->dateTime('d M Y')->sortable(),
                Tables\Columns\TextColumn::make('payment_status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'warning', 'invoiced' => 'info',
                    'paid' => 'success', 'overdue' => 'danger', default => 'gray',
                }),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }
}
