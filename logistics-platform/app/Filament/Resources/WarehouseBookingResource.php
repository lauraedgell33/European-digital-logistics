<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WarehouseBookingResource\Pages;
use App\Models\WarehouseBooking;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WarehouseBookingResource extends Resource
{
    protected static ?string $model = WarehouseBooking::class;
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationGroup = 'Operations';
    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Booking Details')->schema([
                Forms\Components\Select::make('warehouse_id')
                    ->relationship('warehouse', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('tenant_company_id')
                    ->relationship('tenant', 'name')
                    ->searchable()->preload()->required()->label('Tenant Company'),
                Forms\Components\Select::make('created_by')
                    ->relationship('user', 'name')
                    ->searchable()->preload()->required()->label('Created By'),
            ])->columns(3),

            Forms\Components\Section::make('Space & Duration')->schema([
                Forms\Components\TextInput::make('booked_area_m2')
                    ->numeric()->suffix('m²')->label('Booked Area'),
                Forms\Components\TextInput::make('booked_pallet_spaces')
                    ->numeric()->label('Pallet Spaces'),
                Forms\Components\DatePicker::make('start_date')
                    ->required(),
                Forms\Components\DatePicker::make('end_date')
                    ->required(),
            ])->columns(2),

            Forms\Components\Section::make('Pricing')->schema([
                Forms\Components\TextInput::make('agreed_price')
                    ->numeric()->prefix('€')->required(),
                Forms\Components\Select::make('currency')
                    ->options([
                        'EUR' => 'EUR',
                        'USD' => 'USD',
                        'GBP' => 'GBP',
                        'PLN' => 'PLN',
                        'RON' => 'RON',
                    ])->default('EUR')->required(),
                Forms\Components\Select::make('price_period')
                    ->options([
                        'daily' => 'Daily',
                        'weekly' => 'Weekly',
                        'monthly' => 'Monthly',
                    ])->required(),
            ])->columns(3),

            Forms\Components\Section::make('Status')->schema([
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'active' => 'Active',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ])->required()->default('pending'),
                Forms\Components\DateTimePicker::make('confirmed_at')
                    ->disabled(),
                Forms\Components\DateTimePicker::make('cancelled_at')
                    ->disabled(),
                Forms\Components\Textarea::make('cancellation_reason')
                    ->rows(2)->columnSpanFull(),
            ])->columns(3),

            Forms\Components\Section::make('Additional Information')->schema([
                Forms\Components\Textarea::make('special_requirements')
                    ->rows(3),
                Forms\Components\Textarea::make('notes')
                    ->rows(3),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('warehouse.name')
                    ->searchable()->sortable()->label('Warehouse'),
                Tables\Columns\TextColumn::make('tenant.name')
                    ->searchable()->sortable()->label('Tenant'),
                Tables\Columns\TextColumn::make('booked_area_m2')
                    ->suffix(' m²')->sortable()->label('Area'),
                Tables\Columns\TextColumn::make('start_date')
                    ->date()->sortable(),
                Tables\Columns\TextColumn::make('end_date')
                    ->date()->sortable(),
                Tables\Columns\TextColumn::make('agreed_price')
                    ->money('EUR')->sortable()->label('Price'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'gray' => 'pending',
                        'info' => 'confirmed',
                        'success' => 'active',
                        'primary' => 'completed',
                        'danger' => 'cancelled',
                    ]),
                Tables\Columns\TextColumn::make('confirmed_at')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'active' => 'Active',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('warehouse_id')
                    ->relationship('warehouse', 'name')
                    ->searchable()->preload()->label('Warehouse'),
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
            'index' => Pages\ListWarehouseBookings::route('/'),
            'create' => Pages\CreateWarehouseBooking::route('/create'),
            'edit' => Pages\EditWarehouseBooking::route('/{record}/edit'),
        ];
    }
}
