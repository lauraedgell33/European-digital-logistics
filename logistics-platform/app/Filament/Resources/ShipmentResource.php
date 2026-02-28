<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ShipmentResource\Pages;
use App\Filament\Resources\ShipmentResource\RelationManagers;
use App\Models\Shipment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Notifications\Notification;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ShipmentResource extends Resource
{
    protected static ?string $model = Shipment::class;
    protected static ?string $navigationIcon = 'heroicon-o-map-pin';
    protected static ?string $navigationGroup = 'Operations';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'tracking_code';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Shipment')->schema([
                Forms\Components\Tabs\Tab::make('Tracking')
                    ->icon('heroicon-o-signal')
                    ->schema([
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
                Forms\Components\Tabs\Tab::make('Position')
                    ->icon('heroicon-o-map-pin')
                    ->schema([
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
                Forms\Components\Tabs\Tab::make('Route')
                    ->icon('heroicon-o-map')
                    ->schema([
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
                Forms\Components\Tabs\Tab::make('Notes')
                    ->icon('heroicon-o-chat-bubble-left-ellipsis')
                    ->schema([
                        Forms\Components\Textarea::make('notes')->columnSpanFull(),
                    ]),
            ])->columnSpanFull(),
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
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'gray',
                    'at_pickup' => 'warning',
                    'in_transit' => 'primary',
                    'at_delivery' => 'info',
                    'delivered' => 'success',
                    'exception' => 'danger',
                    default => 'gray',
                }),
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
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('updatePosition')
                    ->icon('heroicon-o-map-pin')
                    ->color('primary')
                    ->form([
                        Forms\Components\TextInput::make('current_lat')->numeric()->required()->label('Latitude'),
                        Forms\Components\TextInput::make('current_lng')->numeric()->required()->label('Longitude'),
                        Forms\Components\TextInput::make('current_location_name')->required()->label('Location'),
                    ])
                    ->action(function (Shipment $record, array $data) {
                        $record->update($data);
                        Notification::make()->title('Position Updated')->success()->send();
                    }),
                Tables\Actions\Action::make('addEvent')
                    ->icon('heroicon-o-plus-circle')
                    ->color('info')
                    ->form([
                        Forms\Components\Select::make('event_type')->options([
                            'pickup' => 'Pickup', 'delivery' => 'Delivery', 'checkpoint' => 'Checkpoint',
                            'delay' => 'Delay', 'exception' => 'Exception', 'customs' => 'Customs',
                        ])->required(),
                        Forms\Components\Textarea::make('description')->required(),
                    ])
                    ->action(function (Shipment $record, array $data) {
                        $record->addEvent($data['event_type'], $data['description']);
                        Notification::make()->title('Event Added')->success()->send();
                    }),
                Tables\Actions\Action::make('markDelivered')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Shipment $record) => $record->status !== 'delivered')
                    ->action(function (Shipment $record) {
                        $record->update(['status' => 'delivered']);
                        $record->addEvent('delivery', 'Shipment delivered');
                        Notification::make()->title('Shipment Delivered')->success()->send();
                    }),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No active shipments')
            ->emptyStateDescription('Shipments will appear when transport orders are fulfilled.')
            ->emptyStateIcon('heroicon-o-map')
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['transportOrder']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('Shipment')->schema([
                Infolists\Components\Tabs\Tab::make('Tracking')->icon('heroicon-o-signal')->schema([
                    Infolists\Components\TextEntry::make('tracking_code')->label('Tracking Code')->copyable(),
                    Infolists\Components\TextEntry::make('transportOrder.order_number')->label('Transport Order'),
                    Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray', 'at_pickup' => 'warning', 'in_transit' => 'primary',
                        'at_delivery' => 'info', 'delivered' => 'success', 'exception' => 'danger', default => 'gray',
                    }),
                    Infolists\Components\TextEntry::make('tracking_device_id')->label('Tracking Device'),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Position')->icon('heroicon-o-map-pin')->schema([
                    Infolists\Components\TextEntry::make('current_lat')->label('Latitude'),
                    Infolists\Components\TextEntry::make('current_lng')->label('Longitude'),
                    Infolists\Components\TextEntry::make('current_location_name')->label('Location Name'),
                    Infolists\Components\TextEntry::make('speed_kmh')->suffix(' km/h')->label('Speed'),
                    Infolists\Components\TextEntry::make('heading')->suffix('°')->label('Heading'),
                    Infolists\Components\TextEntry::make('temperature')->suffix(' °C')->label('Temperature'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Route')->icon('heroicon-o-map')->schema([
                    Infolists\Components\TextEntry::make('total_distance_km')->suffix(' km')->label('Total Distance'),
                    Infolists\Components\TextEntry::make('remaining_distance_km')->suffix(' km')->label('Remaining Distance'),
                    Infolists\Components\TextEntry::make('eta')->dateTime()->label('ETA'),
                    Infolists\Components\TextEntry::make('battery_level')->suffix('%')->label('Battery Level'),
                    Infolists\Components\TextEntry::make('last_update')->dateTime()->label('Last Update'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Notes')->icon('heroicon-o-chat-bubble-left-ellipsis')->schema([
                    Infolists\Components\TextEntry::make('notes')->columnSpanFull(),
                ]),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['tracking_code', 'current_location_name', 'status'];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        return [
            'Order' => $record->transportOrder?->order_number ?? '-',
            'Status' => $record->status ?? '-',
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\EventsRelationManager::class,
            RelationManagers\PositionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListShipments::route('/'),
            'create' => Pages\CreateShipment::route('/create'),
            'view' => Pages\ViewShipment::route('/{record}'),
            'edit' => Pages\EditShipment::route('/{record}/edit'),
        ];
    }
}
