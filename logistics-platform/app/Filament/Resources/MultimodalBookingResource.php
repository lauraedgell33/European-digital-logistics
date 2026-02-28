<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MultimodalBookingResource\Pages;
use App\Models\MultimodalBooking;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class MultimodalBookingResource extends Resource
{
    protected static ?string $model = MultimodalBooking::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrows-right-left';

    protected static ?string $navigationGroup = 'Operations';

    protected static ?int $navigationSort = 5;
    protected static ?string $recordTitleAttribute = 'booking_reference';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Booking Information')
                    ->schema([
                        Forms\Components\Select::make('company_id')
                            ->relationship('company', 'name')
                            ->required()
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->required()
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('transport_order_id')
                            ->relationship('transportOrder', 'order_number')
                            ->searchable()
                            ->preload(),
                        Forms\Components\TextInput::make('booking_reference')
                            ->disabled()
                            ->dehydrated(),
                        Forms\Components\Select::make('transport_mode')
                            ->options([
                                'road' => 'Road',
                                'rail' => 'Rail',
                                'sea' => 'Sea',
                                'air' => 'Air',
                                'barge' => 'Barge',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('carrier_name')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('service_type')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Origin')
                    ->schema([
                        Forms\Components\TextInput::make('origin_terminal')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('origin_country')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('origin_city')
                            ->maxLength(255),
                    ])->columns(3),

                Forms\Components\Section::make('Destination')
                    ->schema([
                        Forms\Components\TextInput::make('destination_terminal')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('destination_country')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('destination_city')
                            ->maxLength(255),
                    ])->columns(3),

                Forms\Components\Section::make('Schedule')
                    ->schema([
                        Forms\Components\DateTimePicker::make('departure_date'),
                        Forms\Components\DateTimePicker::make('estimated_arrival'),
                        Forms\Components\DateTimePicker::make('actual_departure'),
                        Forms\Components\DateTimePicker::make('actual_arrival'),
                        Forms\Components\TextInput::make('transit_time_hours')
                            ->numeric()
                            ->suffix('h'),
                    ])->columns(2),

                Forms\Components\Section::make('Cargo Details')
                    ->schema([
                        Forms\Components\TextInput::make('cargo_type')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('weight_kg')
                            ->numeric()
                            ->suffix('kg'),
                        Forms\Components\TextInput::make('volume_m3')
                            ->numeric()
                            ->suffix('m³'),
                        Forms\Components\TextInput::make('container_count')
                            ->numeric(),
                        Forms\Components\TextInput::make('container_type')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('wagon_type')
                            ->maxLength(255),
                        Forms\Components\Toggle::make('is_hazardous')
                            ->default(false),
                        Forms\Components\Toggle::make('requires_temperature_control')
                            ->default(false),
                    ])->columns(2),

                Forms\Components\Section::make('Pricing & Status')
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->numeric()
                            ->prefix('€'),
                        Forms\Components\Select::make('currency')
                            ->options([
                                'EUR' => 'EUR',
                                'USD' => 'USD',
                                'GBP' => 'GBP',
                            ])
                            ->default('EUR'),
                        Forms\Components\Select::make('status')
                            ->options([
                                'draft' => 'Draft',
                                'confirmed' => 'Confirmed',
                                'in_transit' => 'In Transit',
                                'completed' => 'Completed',
                                'cancelled' => 'Cancelled',
                            ])
                            ->default('draft')
                            ->required(),
                        Forms\Components\Textarea::make('notes')
                            ->columnSpanFull(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('booking_reference')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('company.name')
                    ->sortable(),
                Tables\Columns\TextColumn::make('transport_mode')
                    ->badge(),
                Tables\Columns\TextColumn::make('origin_city')
                    ->label('Origin'),
                Tables\Columns\TextColumn::make('destination_city')
                    ->label('Destination'),
                Tables\Columns\TextColumn::make('departure_date')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'confirmed' => 'info',
                        'in_transit' => 'warning',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'confirmed' => 'Confirmed',
                        'in_transit' => 'In Transit',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('transport_mode')
                    ->options([
                        'road' => 'Road',
                        'rail' => 'Rail',
                        'sea' => 'Sea',
                        'air' => 'Air',
                        'barge' => 'Barge',
                    ]),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['booking_reference', 'status'];
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
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMultimodalBookings::route('/'),
            'create' => Pages\CreateMultimodalBooking::route('/create'),
            'edit' => Pages\EditMultimodalBooking::route('/{record}/edit'),
        ];
    }
}
