<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FreightOfferResource\Pages;
use App\Models\FreightOffer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FreightOfferResource extends Resource
{
    protected static ?string $model = FreightOffer::class;
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $navigationGroup = 'Marketplace';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Origin')->schema([
                Forms\Components\TextInput::make('origin_country')->required()->maxLength(2),
                Forms\Components\TextInput::make('origin_city')->required()->maxLength(100),
                Forms\Components\TextInput::make('origin_postal_code')->required()->maxLength(20),
                Forms\Components\Textarea::make('origin_address'),
            ])->columns(3),

            Forms\Components\Section::make('Destination')->schema([
                Forms\Components\TextInput::make('destination_country')->required()->maxLength(2),
                Forms\Components\TextInput::make('destination_city')->required()->maxLength(100),
                Forms\Components\TextInput::make('destination_postal_code')->required()->maxLength(20),
                Forms\Components\Textarea::make('destination_address'),
            ])->columns(3),

            Forms\Components\Section::make('Cargo Details')->schema([
                Forms\Components\TextInput::make('cargo_type')->required(),
                Forms\Components\TextInput::make('weight')->required()->numeric()->suffix('kg'),
                Forms\Components\TextInput::make('volume')->numeric()->suffix('m³'),
                Forms\Components\TextInput::make('pallet_count')->numeric(),
                Forms\Components\Toggle::make('is_hazardous'),
                Forms\Components\TextInput::make('adr_class')->visible(fn($get) => $get('is_hazardous')),
                Forms\Components\Toggle::make('requires_temperature_control'),
            ])->columns(3),

            Forms\Components\Section::make('Schedule & Vehicle')->schema([
                Forms\Components\DatePicker::make('loading_date')->required(),
                Forms\Components\DatePicker::make('unloading_date')->required(),
                Forms\Components\Select::make('vehicle_type')->options([
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
            ])->columns(3),

            Forms\Components\Section::make('Pricing & Status')->schema([
                Forms\Components\TextInput::make('price')->numeric()->prefix('€'),
                Forms\Components\Select::make('currency')->options([
                    'EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP', 'PLN' => 'PLN', 'CZK' => 'CZK', 'RON' => 'RON',
                ])->default('EUR'),
                Forms\Components\Select::make('price_type')->options([
                    'fixed' => 'Fixed', 'per_km' => 'Per KM', 'negotiable' => 'Negotiable',
                ])->default('fixed'),
                Forms\Components\Select::make('status')->options([
                    'active' => 'Active', 'matched' => 'Matched', 'completed' => 'Completed', 'cancelled' => 'Cancelled',
                ])->default('active'),
                Forms\Components\Toggle::make('is_public')->default(true),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('#')->sortable(),
                Tables\Columns\TextColumn::make('company.name')->searchable()->limit(20),
                Tables\Columns\TextColumn::make('origin_city')
                    ->formatStateUsing(fn($record) => "{$record->origin_city}, {$record->origin_country}")
                    ->label('Origin'),
                Tables\Columns\TextColumn::make('destination_city')
                    ->formatStateUsing(fn($record) => "{$record->destination_city}, {$record->destination_country}")
                    ->label('Destination'),
                Tables\Columns\TextColumn::make('cargo_type'),
                Tables\Columns\TextColumn::make('weight')->suffix(' kg')->sortable(),
                Tables\Columns\TextColumn::make('loading_date')->date()->sortable(),
                Tables\Columns\TextColumn::make('vehicle_type'),
                Tables\Columns\TextColumn::make('price')->money('eur')->sortable(),
                Tables\Columns\BadgeColumn::make('status')->colors([
                    'success' => 'active',
                    'primary' => 'matched',
                    'info' => 'completed',
                    'danger' => 'cancelled',
                ]),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active' => 'Active', 'matched' => 'Matched',
                        'completed' => 'Completed', 'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('vehicle_type')
                    ->options([
                        'standard_truck' => 'Standard Truck', 'refrigerated' => 'Refrigerated',
                        'flatbed' => 'Flatbed', 'container' => 'Container',
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
            'index' => Pages\ListFreightOffers::route('/'),
            'create' => Pages\CreateFreightOffer::route('/create'),
            'edit' => Pages\EditFreightOffer::route('/{record}/edit'),
        ];
    }
}
