<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VehicleOfferResource\Pages;
use App\Models\VehicleOffer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class VehicleOfferResource extends Resource
{
    protected static ?string $model = VehicleOffer::class;
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $navigationGroup = 'Marketplace';
    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('VehicleOffer')->schema([
                Forms\Components\Tabs\Tab::make('Vehicle')
                    ->icon('heroicon-o-truck')
                    ->schema([
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
                Forms\Components\Tabs\Tab::make('Location')
                    ->icon('heroicon-o-map-pin')
                    ->schema([
                        Forms\Components\TextInput::make('current_country')
                            ->required()->maxLength(2)->label('Current Country'),
                        Forms\Components\TextInput::make('current_city')
                            ->required()->maxLength(100),
                        Forms\Components\TextInput::make('destination_country')
                            ->maxLength(2)->label('Dest. Country'),
                        Forms\Components\TextInput::make('destination_city')
                            ->maxLength(100),
                    ])->columns(4),
                Forms\Components\Tabs\Tab::make('Capacity')
                    ->icon('heroicon-o-scale')
                    ->schema([
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
                Forms\Components\Tabs\Tab::make('Equipment')
                    ->icon('heroicon-o-wrench-screwdriver')
                    ->schema([
                        Forms\Components\Toggle::make('has_adr')->label('ADR (Hazardous)'),
                        Forms\Components\Toggle::make('has_temperature_control')->label('Temperature Control'),
                        Forms\Components\TagsInput::make('equipment')
                            ->placeholder('Add equipment'),
                        Forms\Components\Textarea::make('notes')->columnSpanFull(),
                    ])->columns(2),
            ])->columnSpanFull(),
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
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'available' => 'success',
                    'booked' => 'warning',
                    'in_transit' => 'primary',
                    'maintenance' => 'danger',
                    'expired' => 'gray',
                    default => 'gray',
                }),
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
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['company']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('VehicleOffer')->schema([
                Infolists\Components\Tabs\Tab::make('Vehicle')->icon('heroicon-o-truck')->schema([
                    Infolists\Components\TextEntry::make('company.name')->label('Company'),
                    Infolists\Components\TextEntry::make('user.name')->label('User'),
                    Infolists\Components\TextEntry::make('vehicle_type')->badge()->label('Vehicle Type'),
                    Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                        'available' => 'success', 'booked' => 'warning', 'in_transit' => 'primary',
                        'maintenance' => 'danger', 'expired' => 'gray', default => 'gray',
                    }),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Location')->icon('heroicon-o-map-pin')->schema([
                    Infolists\Components\TextEntry::make('current_country')->label('Current Country'),
                    Infolists\Components\TextEntry::make('current_city')->label('Current City'),
                    Infolists\Components\TextEntry::make('destination_country')->label('Dest. Country'),
                    Infolists\Components\TextEntry::make('destination_city')->label('Dest. City'),
                ])->columns(4),
                Infolists\Components\Tabs\Tab::make('Capacity')->icon('heroicon-o-scale')->schema([
                    Infolists\Components\TextEntry::make('capacity_kg')->suffix(' kg')->label('Capacity (kg)'),
                    Infolists\Components\TextEntry::make('capacity_m3')->suffix(' m³')->label('Capacity (m³)'),
                    Infolists\Components\TextEntry::make('available_from')->date()->label('Available From'),
                    Infolists\Components\TextEntry::make('available_to')->date()->label('Available To'),
                    Infolists\Components\TextEntry::make('price_per_km')->money('EUR')->label('Price/km'),
                    Infolists\Components\TextEntry::make('flat_price')->money('EUR')->label('Flat Price'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Equipment')->icon('heroicon-o-wrench-screwdriver')->schema([
                    Infolists\Components\IconEntry::make('has_adr')->boolean()->label('ADR (Hazardous)'),
                    Infolists\Components\IconEntry::make('has_temperature_control')->boolean()->label('Temperature Control'),
                    Infolists\Components\TextEntry::make('equipment')->label('Equipment'),
                    Infolists\Components\TextEntry::make('notes'),
                ])->columns(2),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'current_city', 'vehicle_type'];
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
            'index' => Pages\ListVehicleOffers::route('/'),
            'create' => Pages\CreateVehicleOffer::route('/create'),
            'view' => Pages\ViewVehicleOffer::route('/{record}'),
            'edit' => Pages\EditVehicleOffer::route('/{record}/edit'),
        ];
    }
}
