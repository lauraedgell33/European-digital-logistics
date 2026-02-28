<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WarehouseResource\Pages;
use App\Models\Warehouse;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WarehouseResource extends Resource
{
    protected static ?string $model = Warehouse::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-storefront';
    protected static ?string $navigationGroup = 'Logistics';
    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('General')->schema([
                Forms\Components\TextInput::make('name')->required()->maxLength(255),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')->searchable()->preload()->required(),
                Forms\Components\Textarea::make('description')->rows(3),
                Forms\Components\Select::make('status')
                    ->options(['active' => 'Active', 'inactive' => 'Inactive', 'maintenance' => 'Maintenance'])
                    ->default('active')->required(),
                Forms\Components\Toggle::make('is_public')->default(true),
            ])->columns(2),

            Forms\Components\Section::make('Location')->schema([
                Forms\Components\TextInput::make('country_code')->maxLength(2)->required(),
                Forms\Components\TextInput::make('city')->required()->maxLength(255),
                Forms\Components\TextInput::make('postal_code')->maxLength(20),
                Forms\Components\TextInput::make('address')->maxLength(500),
                Forms\Components\TextInput::make('lat')->numeric(),
                Forms\Components\TextInput::make('lng')->numeric(),
            ])->columns(3),

            Forms\Components\Section::make('Capacity & Specs')->schema([
                Forms\Components\TextInput::make('total_area_m2')->numeric()->suffix('m²'),
                Forms\Components\TextInput::make('available_area_m2')->numeric()->suffix('m²'),
                Forms\Components\TextInput::make('ceiling_height_m')->numeric()->suffix('m'),
                Forms\Components\TextInput::make('pallet_spaces')->numeric(),
                Forms\Components\TextInput::make('available_pallet_spaces')->numeric(),
                Forms\Components\TextInput::make('loading_docks_count')->numeric(),
            ])->columns(3),

            Forms\Components\Section::make('Features')->schema([
                Forms\Components\Toggle::make('has_loading_dock'),
                Forms\Components\Toggle::make('has_rail_access'),
                Forms\Components\Toggle::make('has_temperature_control'),
                Forms\Components\Toggle::make('has_hazardous_storage'),
                Forms\Components\Toggle::make('has_customs_warehouse'),
                Forms\Components\Toggle::make('is_bonded'),
                Forms\Components\Toggle::make('has_cross_docking'),
                Forms\Components\Toggle::make('has_pick_pack'),
                Forms\Components\Toggle::make('has_security_24h'),
                Forms\Components\Toggle::make('has_cctv'),
                Forms\Components\Toggle::make('has_fire_protection'),
            ])->columns(4),

            Forms\Components\Section::make('Pricing')->schema([
                Forms\Components\TextInput::make('price_per_m2_month')->numeric()->prefix('€'),
                Forms\Components\TextInput::make('price_per_pallet_month')->numeric()->prefix('€'),
                Forms\Components\Select::make('currency')
                    ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP', 'RON' => 'RON', 'PLN' => 'PLN'])
                    ->default('EUR'),
                Forms\Components\DatePicker::make('available_from'),
                Forms\Components\DatePicker::make('available_to'),
                Forms\Components\TextInput::make('min_rental_months')->numeric(),
            ])->columns(3),

            Forms\Components\Section::make('Contact')->schema([
                Forms\Components\TextInput::make('contact_name')->maxLength(255),
                Forms\Components\TextInput::make('contact_phone')->tel(),
                Forms\Components\TextInput::make('contact_email')->email(),
                Forms\Components\Textarea::make('notes')->rows(2),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('company.name')->searchable()->label('Company'),
                Tables\Columns\TextColumn::make('city')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('country_code')->label('Country'),
                Tables\Columns\TextColumn::make('total_area_m2')->suffix(' m²')->sortable(),
                Tables\Columns\TextColumn::make('available_area_m2')->suffix(' m²')->sortable(),
                Tables\Columns\TextColumn::make('price_per_m2_month')->money('EUR')->label('€/m²/mo'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors(['success' => 'active', 'danger' => 'inactive', 'warning' => 'maintenance']),
                Tables\Columns\IconColumn::make('is_public')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['active' => 'Active', 'inactive' => 'Inactive', 'maintenance' => 'Maintenance']),
                Tables\Filters\SelectFilter::make('country_code')
                    ->options(['DE' => 'Germany', 'FR' => 'France', 'RO' => 'Romania', 'PL' => 'Poland', 'IT' => 'Italy', 'ES' => 'Spain']),
                Tables\Filters\TernaryFilter::make('has_temperature_control'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWarehouses::route('/'),
            'create' => Pages\CreateWarehouse::route('/create'),
            'edit' => Pages\EditWarehouse::route('/{record}/edit'),
        ];
    }
}
