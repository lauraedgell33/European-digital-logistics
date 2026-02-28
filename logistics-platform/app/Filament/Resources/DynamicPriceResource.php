<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DynamicPriceResource\Pages;
use App\Models\DynamicPrice;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DynamicPriceResource extends Resource
{
    protected static ?string $model = DynamicPrice::class;

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar-square';

    protected static ?string $navigationGroup = 'AI & Analytics';

    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'id';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('origin_country')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('origin_city')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('destination_country')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('destination_city')
                    ->required()
                    ->maxLength(255),

                Forms\Components\Select::make('vehicle_type')
                    ->options([
                        'standard_truck' => 'Standard Truck',
                        'mega_trailer' => 'Mega Trailer',
                        'refrigerated' => 'Refrigerated',
                        'tanker' => 'Tanker',
                        'flatbed' => 'Flatbed',
                        'container' => 'Container',
                        'curtainsider' => 'Curtainsider',
                    ])
                    ->required(),

                Forms\Components\TextInput::make('base_price_per_km')
                    ->required()
                    ->numeric()
                    ->prefix('€'),

                Forms\Components\TextInput::make('dynamic_price_per_km')
                    ->required()
                    ->numeric()
                    ->prefix('€'),

                Forms\Components\TextInput::make('surge_multiplier')
                    ->numeric()
                    ->default(1.00),

                Forms\Components\TextInput::make('demand_index')
                    ->numeric(),

                Forms\Components\TextInput::make('supply_index')
                    ->numeric(),

                Forms\Components\TextInput::make('fuel_surcharge_pct')
                    ->numeric()
                    ->suffix('%'),

                Forms\Components\TextInput::make('seasonal_factor')
                    ->numeric()
                    ->default(1.00),

                Forms\Components\TextInput::make('weather_factor')
                    ->numeric()
                    ->default(1.00),

                Forms\Components\Select::make('currency')
                    ->options([
                        'EUR' => 'EUR',
                        'USD' => 'USD',
                        'GBP' => 'GBP',
                    ])
                    ->default('EUR')
                    ->required(),

                Forms\Components\DateTimePicker::make('valid_from')
                    ->required(),

                Forms\Components\DateTimePicker::make('valid_until'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('valid_from', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),

                Tables\Columns\TextColumn::make('origin_city')
                    ->label('Origin')
                    ->formatStateUsing(fn ($record) => $record->origin_city . ', ' . $record->origin_country)
                    ->searchable(),

                Tables\Columns\TextColumn::make('destination_city')
                    ->label('Destination')
                    ->formatStateUsing(fn ($record) => $record->destination_city . ', ' . $record->destination_country)
                    ->searchable(),

                Tables\Columns\TextColumn::make('vehicle_type')
                    ->searchable(),

                Tables\Columns\TextColumn::make('base_price_per_km')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('dynamic_price_per_km')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('surge_multiplier')
                    ->numeric(decimalPlaces: 2)
                    ->sortable(),

                Tables\Columns\TextColumn::make('valid_from')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('valid_until')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('vehicle_type')
                    ->options([
                        'standard_truck' => 'Standard Truck',
                        'mega_trailer' => 'Mega Trailer',
                        'refrigerated' => 'Refrigerated',
                        'tanker' => 'Tanker',
                        'flatbed' => 'Flatbed',
                        'container' => 'Container',
                        'curtainsider' => 'Curtainsider',
                    ]),

                Tables\Filters\SelectFilter::make('currency')
                    ->options([
                        'EUR' => 'EUR',
                        'USD' => 'USD',
                        'GBP' => 'GBP',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['origin_city', 'destination_city'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDynamicPrices::route('/'),
            'create' => Pages\CreateDynamicPrice::route('/create'),
            'edit' => Pages\EditDynamicPrice::route('/{record}/edit'),
        ];
    }
}
