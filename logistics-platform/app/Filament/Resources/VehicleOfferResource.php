<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VehicleOfferResource\Pages;
use App\Models\VehicleOffer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class VehicleOfferResource extends Resource
{
    protected static ?string $model = VehicleOffer::class;
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $navigationGroup = 'Marketplace';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Vehicle Details')->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('vehicle_type')
                    ->options([
                        'standard_truck' => 'Standard Truck',
                        'mega_trailer' => 'Mega Trailer',
                        'refrigerated' => 'Refrigerated',
                        'tanker' => 'Tanker',
                        'flatbed' => 'Flatbed',
                        'container' => 'Container',
                        'curtainsider' => 'Curtainsider',
                        'box_truck' => 'Box Truck',
                        'van' => 'Van',
                    ])->required(),
                Forms\Components\Select::make('status')
                    ->options([
                        'available' => 'Available',
                        'booked' => 'Booked',
                        'in_transit' => 'In Transit',
                        'maintenance' => 'Maintenance',
                        'expired' => 'Expired',
                    ])->required()->default('available'),
            ])->columns(2),

            Forms\Components\Section::make('Location')->schema([
                Forms\Components\TextInput::make('current_country')
                    ->required()->maxLength(2)->label('Current Country'),
                Forms\Components\TextInput::make('current_city')
                    ->required()->maxLength(100),
                Forms\Components\TextInput::make('destination_country')
                    ->maxLength(2)->label('Dest. Country'),
                Forms\Components\TextInput::make('destination_city')
                    ->maxLength(100),
            ])->columns(4),

            Forms\Components\Section::make('Capacity & Availability')->schema([
                Forms\Components\TextInput::make('capacity_kg')
                    ->numeric()->required()->suffix('kg'),
                Forms\Components\TextInput::make('capacity_m3')
                    ->numeric()->suffix('m³'),
                Forms\Components\DatePicker::make('available_from')->required(),
                Forms\Components\DatePicker::make('available_to'),
                Forms\Components\TextInput::make('price_per_km')
                    ->numeric()->prefix('€'),
                Forms\Components\TextInput::make('flat_price')
                    ->numeric()->prefix('€'),
            ])->columns(3),

            Forms\Components\Section::make('Equipment & Features')->schema([
                Forms\Components\Toggle::make('has_adr')->label('ADR (Hazardous)'),
                Forms\Components\Toggle::make('has_temperature_control')->label('Temperature Control'),
                Forms\Components\TagsInput::make('equipment')
                    ->placeholder('Add equipment'),
                Forms\Components\Textarea::make('notes')->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('company.name')
                    ->searchable()->sortable()->label('Company'),
                Tables\Columns\TextColumn::make('vehicle_type')
                    ->badge()->sortable(),
                Tables\Columns\TextColumn::make('current_city')
                    ->description(fn (VehicleOffer $r) => $r->current_country)
                    ->searchable(),
                Tables\Columns\TextColumn::make('destination_city')
                    ->description(fn (VehicleOffer $r) => $r->destination_country)
                    ->searchable()->placeholder('-'),
                Tables\Columns\TextColumn::make('capacity_kg')
                    ->numeric()->suffix(' kg')->sortable(),
                Tables\Columns\TextColumn::make('available_from')
                    ->date()->sortable(),
                Tables\Columns\TextColumn::make('price_per_km')
                    ->money('eur')->sortable()->placeholder('-'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'available',
                        'warning' => 'booked',
                        'primary' => 'in_transit',
                        'danger' => 'maintenance',
                        'gray' => 'expired',
                    ]),
                Tables\Columns\IconColumn::make('has_adr')
                    ->boolean()->label('ADR'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('vehicle_type')
                    ->options([
                        'standard_truck' => 'Standard Truck',
                        'mega_trailer' => 'Mega Trailer',
                        'refrigerated' => 'Refrigerated',
                        'tanker' => 'Tanker',
                        'flatbed' => 'Flatbed',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'available' => 'Available',
                        'booked' => 'Booked',
                        'in_transit' => 'In Transit',
                        'maintenance' => 'Maintenance',
                    ]),
            ])
            ->actions([
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
            'index' => Pages\ListVehicleOffers::route('/'),
            'create' => Pages\CreateVehicleOffer::route('/create'),
            'edit' => Pages\EditVehicleOffer::route('/{record}/edit'),
        ];
    }
}
