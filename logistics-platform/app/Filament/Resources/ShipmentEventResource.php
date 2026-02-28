<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ShipmentEventResource\Pages;
use App\Models\ShipmentEvent;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ShipmentEventResource extends Resource
{
    protected static ?string $model = ShipmentEvent::class;
    protected static ?string $navigationIcon = 'heroicon-o-bell-alert';
    protected static ?string $navigationGroup = 'Tracking & Logistics';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Event Details')->schema([
                Forms\Components\Select::make('shipment_id')
                    ->relationship('shipment', 'tracking_code')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('event_type')
                    ->options([
                        'pickup' => 'Pickup',
                        'in_transit' => 'In Transit',
                        'border_crossing' => 'Border Crossing',
                        'customs' => 'Customs',
                        'delay' => 'Delay',
                        'delivery' => 'Delivery',
                        'exception' => 'Exception',
                        'note' => 'Note',
                    ])->required(),
                Forms\Components\Textarea::make('description')
                    ->rows(3)->columnSpanFull(),
            ])->columns(2),

            Forms\Components\Section::make('Location')->schema([
                Forms\Components\TextInput::make('lat')
                    ->numeric()->label('Latitude'),
                Forms\Components\TextInput::make('lng')
                    ->numeric()->label('Longitude'),
                Forms\Components\TextInput::make('location_name')
                    ->maxLength(255),
            ])->columns(3),

            Forms\Components\Section::make('Timing & Metadata')->schema([
                Forms\Components\DateTimePicker::make('occurred_at')
                    ->required(),
                Forms\Components\Hidden::make('metadata'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('shipment.tracking_code')
                    ->searchable()->sortable()->label('Shipment'),
                Tables\Columns\BadgeColumn::make('event_type')
                    ->colors([
                        'success' => 'pickup',
                        'primary' => 'in_transit',
                        'info' => 'border_crossing',
                        'warning' => 'customs',
                        'danger' => 'delay',
                        'success' => 'delivery',
                        'danger' => 'exception',
                        'gray' => 'note',
                    ]),
                Tables\Columns\TextColumn::make('description')
                    ->limit(40),
                Tables\Columns\TextColumn::make('location_name')
                    ->searchable()->label('Location'),
                Tables\Columns\TextColumn::make('occurred_at')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('occurred_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('event_type')
                    ->options([
                        'pickup' => 'Pickup',
                        'in_transit' => 'In Transit',
                        'border_crossing' => 'Border Crossing',
                        'customs' => 'Customs',
                        'delay' => 'Delay',
                        'delivery' => 'Delivery',
                        'exception' => 'Exception',
                        'note' => 'Note',
                    ]),
                Tables\Filters\SelectFilter::make('shipment_id')
                    ->relationship('shipment', 'tracking_code')
                    ->searchable()->preload()->label('Shipment'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListShipmentEvents::route('/'),
            'create' => Pages\CreateShipmentEvent::route('/create'),
            'edit' => Pages\EditShipmentEvent::route('/{record}/edit'),
        ];
    }
}
