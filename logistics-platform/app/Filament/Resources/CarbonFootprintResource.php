<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CarbonFootprintResource\Pages;
use App\Models\CarbonFootprint;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CarbonFootprintResource extends Resource
{
    protected static ?string $model = CarbonFootprint::class;
    protected static ?string $navigationIcon = 'heroicon-o-globe-europe-africa';
    protected static ?string $navigationGroup = 'AI & Analytics';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Transport Details')->schema([
                Forms\Components\Select::make('transport_order_id')
                    ->relationship('transportOrder', 'order_number')->searchable()->preload(),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')->searchable()->preload()->required(),
                Forms\Components\TextInput::make('distance_km')->numeric()->suffix('km')->required(),
                Forms\Components\TextInput::make('weight_kg')->numeric()->suffix('kg'),
                Forms\Components\Select::make('vehicle_type')
                    ->options(['truck' => 'Truck', 'van' => 'Van', 'train' => 'Train', 'ship' => 'Ship', 'aircraft' => 'Aircraft'])
                    ->required(),
                Forms\Components\Select::make('fuel_type')
                    ->options(['diesel' => 'Diesel', 'gasoline' => 'Gasoline', 'electric' => 'Electric', 'lng' => 'LNG', 'hvo' => 'HVO']),
                Forms\Components\Select::make('emission_standard')
                    ->options(['euro3' => 'Euro 3', 'euro4' => 'Euro 4', 'euro5' => 'Euro 5', 'euro6' => 'Euro 6', 'euro6d' => 'Euro 6d']),
                Forms\Components\TextInput::make('load_factor_pct')->numeric()->suffix('%'),
            ])->columns(2),

            Forms\Components\Section::make('Emissions')->schema([
                Forms\Components\TextInput::make('co2_kg')->numeric()->suffix('kg CO₂')->required(),
                Forms\Components\TextInput::make('co2_per_km')->numeric()->suffix('g/km'),
                Forms\Components\TextInput::make('co2_per_ton_km')->numeric()->suffix('g/tkm'),
                Forms\Components\TextInput::make('industry_avg_co2_kg')->numeric()->suffix('kg CO₂'),
                Forms\Components\TextInput::make('savings_vs_avg_pct')->numeric()->suffix('%'),
            ])->columns(3),

            Forms\Components\Section::make('Carbon Offsets')->schema([
                Forms\Components\TextInput::make('offset_purchased_kg')->numeric()->suffix('kg'),
                Forms\Components\TextInput::make('offset_cost')->numeric()->prefix('€'),
                Forms\Components\Select::make('offset_currency')
                    ->options(['EUR' => 'EUR', 'USD' => 'USD'])->default('EUR'),
                Forms\Components\Toggle::make('is_carbon_neutral'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('company.name')->searchable()->label('Company'),
                Tables\Columns\TextColumn::make('transportOrder.order_number')->label('Order'),
                Tables\Columns\TextColumn::make('vehicle_type')->badge(),
                Tables\Columns\TextColumn::make('distance_km')->suffix(' km')->sortable(),
                Tables\Columns\TextColumn::make('co2_kg')->suffix(' kg CO₂')->sortable()
                    ->color(fn ($state) => $state > 100 ? 'danger' : ($state > 50 ? 'warning' : 'success')),
                Tables\Columns\TextColumn::make('co2_per_ton_km')->suffix(' g/tkm'),
                Tables\Columns\TextColumn::make('savings_vs_avg_pct')->suffix('%')->label('vs Avg'),
                Tables\Columns\IconColumn::make('is_carbon_neutral')->boolean()->label('Neutral'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('vehicle_type')
                    ->options(['truck' => 'Truck', 'van' => 'Van', 'train' => 'Train', 'ship' => 'Ship']),
                Tables\Filters\TernaryFilter::make('is_carbon_neutral'),
                Tables\Filters\SelectFilter::make('company')->relationship('company', 'name'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCarbonFootprints::route('/'),
            'create' => Pages\CreateCarbonFootprint::route('/create'),
            'edit' => Pages\EditCarbonFootprint::route('/{record}/edit'),
        ];
    }
}
