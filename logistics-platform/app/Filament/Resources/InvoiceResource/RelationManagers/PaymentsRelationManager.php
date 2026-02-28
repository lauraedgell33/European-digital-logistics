<?php

namespace App\Filament\Resources\InvoiceResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class PaymentsRelationManager extends RelationManager
{
    protected static string $relationship = 'payments';

    protected static ?string $title = 'Payments';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('transaction_reference')
            ->columns([
                Tables\Columns\TextColumn::make('transaction_reference')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('payment_provider')->sortable(),
                Tables\Columns\TextColumn::make('amount')->money('eur')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'warning', 'processing' => 'info', 'completed' => 'success',
                    'failed' => 'danger', 'refunded' => 'gray', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('completed_at')->dateTime('d M Y H:i')->sortable(),
            ])
            ->filters([])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }
}
