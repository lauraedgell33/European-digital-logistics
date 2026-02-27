<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ShipmentResource\Pages;
use App\Models\Shipment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ShipmentResource extends Resource
{
    protected static ?string $model = Shipment::class;
    protected static ?string $navigationIcon = 'heroicon-o-map-pin';
    protected static ?string $navigationGroup = 'Operations';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Shipment Details')->schema([
                Forms\Components\TextInput::make('tracking_code')
                    ->disabled()->dehydrated(false),
                Forms\Components\Select::make('transport_order_id')
                    ->relationship('transportOrder', 'order_number')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'at_pickup' => 'At Pickup',
                        'in_transit' => 'In Transit',
                        'at_delivery' => 'At Delivery',
                        'delivered' => 'Delivered',
                        'exception' => 'Exception',
                    ])->required(),
                Forms\Components\TextInput::make('tracking_device_id')
                    ->maxLength(50),
            ])->columns(2),

            Forms\Components\Section::make('Current Position')->schema([
                Forms\Components\TextInput::make('current_lat')
                    ->numeric()->label('Latitude'),
                Forms\Components\TextInput::make('current_lng')
                    ->numeric()->label('Longitude'),
                Forms\Components\TextInput::make('current_location_name')
                    ->maxLength(200)->label('Location Name'),
                Forms\Components\TextInput::make('speed_kmh')
                    ->numeric()->suffix('km/h'),
                Forms\Components\TextInput::make('heading')
                    ->numeric()->suffix('°'),
                Forms\Components\TextInput::make('temperature')
                    ->numeric()->suffix('°C'),
            ])->columns(3),

            Forms\Components\Section::make('Distance & ETA')->schema([
                Forms\Components\TextInput::make('total_distance_km')
                    ->numeric()->suffix('km'),
                Forms\Components\TextInput::make('remaining_distance_km')
                    ->numeric()->suffix('km'),
                Forms\Components\DateTimePicker::make('eta')
                    ->label('ETA'),
                Forms\Components\TextInput::make('battery_level')
                    ->numeric()->suffix('%'),
                Forms\Components\DateTimePicker::make('last_update'),
            ])->columns(3),

            Forms\Components\Section::make('Notes')->schema([
                Forms\Components\Textarea::make('notes')->columnSpanFull(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('tracking_code')
                    ->searchable()->sortable()->copyable(),
                Tables\Columns\TextColumn::make('transportOrder.order_number')
                    ->searchable()->sortable()->label('Order'),
                Tables\Columns\TextColumn::make('current_location_name')
                    ->limit(30)->label('Location'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'gray' => 'pending',
                        'warning' => 'at_pickup',
                        'primary' => 'in_transit',
                        'info' => 'at_delivery',
                        'success' => 'delivered',
                        'danger' => 'exception',
                    ]),
                Tables\Columns\TextColumn::make('speed_kmh')
                    ->suffix(' km/h')->sortable()->label('Speed'),
                Tables\Columns\TextColumn::make('eta')
                    ->dateTime()->sortable()->label('ETA'),
                Tables\Columns\TextColumn::make('remaining_distance_km')
                    ->suffix(' km')->sortable()->label('Remaining'),
                Tables\Columns\TextColumn::make('battery_level')
                    ->suffix('%')->label('Battery')
                    ->color(fn ($state) => $state < 20 ? 'danger' : ($state < 50 ? 'warning' : 'success')),
                Tables\Columns\TextColumn::make('last_update')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('last_update', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'at_pickup' => 'At Pickup',
                        'in_transit' => 'In Transit',
                        'at_delivery' => 'At Delivery',
                        'delivered' => 'Delivered',
                        'exception' => 'Exception',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListShipments::route('/'),
            'create' => Pages\CreateShipment::route('/create'),
            'edit' => Pages\EditShipment::route('/{record}/edit'),
        ];
    }
}
