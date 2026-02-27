<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransportOrderResource\Pages;
use App\Models\TransportOrder;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TransportOrderResource extends Resource
{
    protected static ?string $model = TransportOrder::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Operations';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Order Details')->schema([
                Forms\Components\TextInput::make('order_number')->disabled(),
                Forms\Components\Select::make('shipper_id')
                    ->relationship('shipper', 'name')->required(),
                Forms\Components\Select::make('carrier_id')
                    ->relationship('carrier', 'name')->required(),
                Forms\Components\Select::make('status')->options([
                    'draft' => 'Draft', 'pending' => 'Pending', 'accepted' => 'Accepted',
                    'rejected' => 'Rejected', 'picked_up' => 'Picked Up', 'in_transit' => 'In Transit',
                    'delivered' => 'Delivered', 'completed' => 'Completed', 'cancelled' => 'Cancelled',
                ])->required(),
            ])->columns(2),

            Forms\Components\Section::make('Pickup')->schema([
                Forms\Components\TextInput::make('pickup_country')->required()->maxLength(2),
                Forms\Components\TextInput::make('pickup_city')->required(),
                Forms\Components\Textarea::make('pickup_address')->required(),
                Forms\Components\DateTimePicker::make('pickup_date')->required(),
            ])->columns(2),

            Forms\Components\Section::make('Delivery')->schema([
                Forms\Components\TextInput::make('delivery_country')->required()->maxLength(2),
                Forms\Components\TextInput::make('delivery_city')->required(),
                Forms\Components\Textarea::make('delivery_address')->required(),
                Forms\Components\DateTimePicker::make('delivery_date')->required(),
            ])->columns(2),

            Forms\Components\Section::make('Cargo & Price')->schema([
                Forms\Components\TextInput::make('cargo_type')->required(),
                Forms\Components\TextInput::make('weight')->numeric()->suffix('kg'),
                Forms\Components\TextInput::make('total_price')->numeric()->prefix('€')->required(),
                Forms\Components\Select::make('payment_terms')->options([
                    'prepaid' => 'Prepaid', '30_days' => '30 Days',
                    '60_days' => '60 Days', '90_days' => '90 Days',
                ]),
                Forms\Components\Select::make('payment_status')->options([
                    'pending' => 'Pending', 'invoiced' => 'Invoiced',
                    'paid' => 'Paid', 'overdue' => 'Overdue',
                ]),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('shipper.name')->limit(15),
                Tables\Columns\TextColumn::make('carrier.name')->limit(15),
                Tables\Columns\TextColumn::make('pickup_city')
                    ->formatStateUsing(fn($record) => "{$record->pickup_city}, {$record->pickup_country}"),
                Tables\Columns\TextColumn::make('delivery_city')
                    ->formatStateUsing(fn($record) => "{$record->delivery_city}, {$record->delivery_country}"),
                Tables\Columns\TextColumn::make('pickup_date')->dateTime('d M Y'),
                Tables\Columns\TextColumn::make('total_price')->money('eur')->sortable(),
                Tables\Columns\BadgeColumn::make('status')->colors([
                    'gray' => 'draft', 'warning' => 'pending', 'success' => 'accepted',
                    'danger' => 'rejected', 'info' => 'in_transit', 'primary' => 'delivered',
                ]),
                Tables\Columns\BadgeColumn::make('payment_status')->colors([
                    'warning' => 'pending', 'info' => 'invoiced',
                    'success' => 'paid', 'danger' => 'overdue',
                ]),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending', 'accepted' => 'Accepted',
                        'in_transit' => 'In Transit', 'delivered' => 'Delivered',
                        'completed' => 'Completed', 'cancelled' => 'Cancelled',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTransportOrders::route('/'),
            'create' => Pages\CreateTransportOrder::route('/create'),
            'edit' => Pages\EditTransportOrder::route('/{record}/edit'),
        ];
    }
}
