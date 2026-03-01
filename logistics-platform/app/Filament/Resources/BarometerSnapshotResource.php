<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BarometerSnapshotResource\Pages;
use App\Models\BarometerSnapshot;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BarometerSnapshotResource extends Resource
{
    protected static ?string $model = BarometerSnapshot::class;

    protected static ?string $navigationIcon = 'heroicon-o-presentation-chart-line';

    protected static ?string $navigationGroup = 'AI & Analytics';

    protected static ?int $navigationSort = 5;
    protected static ?string $recordTitleAttribute = 'id';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('origin_country')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('destination_country')
                    ->required()
                    ->maxLength(255),
                Forms\Components\DatePicker::make('snapshot_date')
                    ->required(),
                Forms\Components\Select::make('period')
                    ->options([
                        'daily' => 'Daily',
                        'weekly' => 'Weekly',
                        'monthly' => 'Monthly',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('freight_offers_count')
                    ->numeric(),
                Forms\Components\TextInput::make('vehicle_offers_count')
                    ->numeric(),
                Forms\Components\TextInput::make('freight_to_vehicle_ratio')
                    ->numeric()
                    ->step(0.01),
                Forms\Components\TextInput::make('avg_price_per_km')
                    ->numeric()
                    ->prefix('€')
                    ->step(0.01),
                Forms\Components\TextInput::make('min_price_per_km')
                    ->numeric()
                    ->prefix('€')
                    ->step(0.01),
                Forms\Components\TextInput::make('max_price_per_km')
                    ->numeric()
                    ->prefix('€')
                    ->step(0.01),
                Forms\Components\TextInput::make('median_price_per_km')
                    ->numeric()
                    ->prefix('€')
                    ->step(0.01),
                Forms\Components\TextInput::make('avg_weight_kg')
                    ->numeric()
                    ->suffix('kg'),
                Forms\Components\TextInput::make('total_weight_kg')
                    ->numeric()
                    ->suffix('kg'),
                Forms\Components\TextInput::make('completed_orders_count')
                    ->numeric(),
                Forms\Components\TextInput::make('price_change_pct')
                    ->numeric()
                    ->suffix('%')
                    ->step(0.01),
                Forms\Components\TextInput::make('demand_change_pct')
                    ->numeric()
                    ->suffix('%')
                    ->step(0.01),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('origin_country')
                    ->searchable(),
                Tables\Columns\TextColumn::make('destination_country')
                    ->searchable(),
                Tables\Columns\TextColumn::make('snapshot_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('period')
                    ->badge(),
                Tables\Columns\TextColumn::make('freight_offers_count')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('vehicle_offers_count')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('freight_to_vehicle_ratio')
                    ->numeric(decimalPlaces: 2)
                    ->sortable(),
                Tables\Columns\TextColumn::make('avg_price_per_km')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('price_change_pct')
                    ->suffix('%')
                    ->color(fn ($state): string => $state > 0 ? 'success' : ($state < 0 ? 'danger' : 'gray'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('demand_change_pct')
                    ->suffix('%')
                    ->color(fn ($state): string => $state > 0 ? 'success' : ($state < 0 ? 'danger' : 'gray'))
                    ->sortable(),
            ])
            ->defaultSort('snapshot_date', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('period')
                    ->options([
                        'daily' => 'Daily',
                        'weekly' => 'Weekly',
                        'monthly' => 'Monthly',
                    ]),
                Tables\Filters\SelectFilter::make('origin_country'),
                Tables\Filters\SelectFilter::make('destination_country'),
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
            'index' => Pages\ListBarometerSnapshots::route('/'),
            'create' => Pages\CreateBarometerSnapshot::route('/create'),
            'edit' => Pages\EditBarometerSnapshot::route('/{record}/edit'),
        ];
    }
}
