<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PriceInsightResource\Pages;
use App\Models\PriceInsight;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PriceInsightResource extends Resource
{
    protected static ?string $model = PriceInsight::class;

    protected static ?string $navigationIcon = 'heroicon-o-currency-euro';

    protected static ?string $navigationGroup = 'AI & Analytics';

    protected static ?int $navigationSort = 6;
    protected static ?string $recordTitleAttribute = 'id';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('origin_country'),
                Forms\Components\TextInput::make('origin_city'),
                Forms\Components\TextInput::make('destination_country'),
                Forms\Components\TextInput::make('destination_city'),
                Forms\Components\Select::make('vehicle_type')
                    ->options([
                        'standard_truck' => 'Standard Truck',
                        'mega_trailer' => 'Mega Trailer',
                        'refrigerated' => 'Refrigerated',
                        'tanker' => 'Tanker',
                        'flatbed' => 'Flatbed',
                        'container' => 'Container',
                        'curtainsider' => 'Curtainsider',
                    ]),
                Forms\Components\DatePicker::make('period_date'),
                Forms\Components\Select::make('period_type')
                    ->options([
                        'weekly' => 'Weekly',
                        'monthly' => 'Monthly',
                    ]),
                Forms\Components\TextInput::make('sample_count')
                    ->numeric(),
                Forms\Components\TextInput::make('avg_price')
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\TextInput::make('min_price')
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\TextInput::make('max_price')
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\TextInput::make('median_price')
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\TextInput::make('avg_price_per_km')
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\TextInput::make('avg_distance_km')
                    ->numeric()
                    ->suffix('km'),
                Forms\Components\Select::make('currency')
                    ->options([
                        'EUR' => 'EUR',
                        'USD' => 'USD',
                        'GBP' => 'GBP',
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('origin')
                    ->formatStateUsing(fn ($record) => $record->origin_city . ', ' . $record->origin_country),
                Tables\Columns\TextColumn::make('destination')
                    ->formatStateUsing(fn ($record) => $record->destination_city . ', ' . $record->destination_country),
                Tables\Columns\TextColumn::make('vehicle_type'),
                Tables\Columns\TextColumn::make('period_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('avg_price')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('min_price')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('max_price')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('avg_price_per_km')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('sample_count'),
                Tables\Columns\TextColumn::make('period_type')
                    ->badge(),
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
                Tables\Filters\SelectFilter::make('period_type')
                    ->options([
                        'weekly' => 'Weekly',
                        'monthly' => 'Monthly',
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
        return ['origin_country', 'destination_country'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPriceInsights::route('/'),
            'create' => Pages\CreatePriceInsight::route('/create'),
            'edit' => Pages\EditPriceInsight::route('/{record}/edit'),
        ];
    }
}
