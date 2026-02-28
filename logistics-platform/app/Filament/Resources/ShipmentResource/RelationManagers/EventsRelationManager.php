<?php

namespace App\Filament\Resources\ShipmentResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class EventsRelationManager extends RelationManager
{
    protected static string $relationship = 'events';

    protected static ?string $title = 'Shipment Events';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('event_type')->options([
                'pickup' => 'Pickup', 'delivery' => 'Delivery', 'checkpoint' => 'Checkpoint',
                'delay' => 'Delay', 'damage' => 'Damage', 'customs' => 'Customs',
                'temperature_alert' => 'Temperature Alert', 'note' => 'Note',
            ])->required(),
            Forms\Components\Textarea::make('description')->maxLength(1000),
            Forms\Components\TextInput::make('location_name')->maxLength(255),
            Forms\Components\DateTimePicker::make('occurred_at')->required()->default(now()),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('event_type')
            ->columns([
                Tables\Columns\TextColumn::make('event_type')->badge()->color(fn (string $state): string => match ($state) {
                    'pickup' => 'success', 'delivery' => 'primary', 'checkpoint' => 'info',
                    'delay' => 'danger', 'damage' => 'danger', 'customs' => 'warning',
                    'temperature_alert' => 'danger', 'note' => 'gray', default => 'gray',
                }),
                Tables\Columns\TextColumn::make('description')->limit(60),
                Tables\Columns\TextColumn::make('location_name'),
                Tables\Columns\TextColumn::make('occurred_at')->dateTime('d M Y H:i')->sortable(),
            ])
            ->filters([])
            ->headerActions([Tables\Actions\CreateAction::make()])
            ->actions([Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('occurred_at', 'desc');
    }
}
