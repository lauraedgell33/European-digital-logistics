<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WarehouseResource\Pages;
use App\Filament\Resources\WarehouseResource\RelationManagers;
use App\Models\Warehouse;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class WarehouseResource extends Resource
{
    protected static ?string $model = Warehouse::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-storefront';
    protected static ?string $navigationGroup = 'Operations';
    protected static ?int $navigationSort = 5;
    protected static ?string $recordTitleAttribute = 'name';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'active')->count() ?: null;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Warehouse')->schema([
                Forms\Components\Tabs\Tab::make('General')
                    ->icon('heroicon-o-information-circle')
                    ->schema([
                        Forms\Components\TextInput::make('name')->required()->maxLength(255),
                        Forms\Components\Select::make('company_id')
                            ->relationship('company', 'name')->searchable()->preload()->required(),
                        Forms\Components\Textarea::make('description')->rows(3),
                        Forms\Components\Select::make('status')
                            ->options(['active' => 'Active', 'inactive' => 'Inactive', 'maintenance' => 'Maintenance'])
                            ->default('active')->required(),
                        Forms\Components\Toggle::make('is_public')->default(true),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Location')
                    ->icon('heroicon-o-map-pin')
                    ->schema([
                        Forms\Components\Select::make('country_code')
                            ->options(\App\Support\CountryHelper::europeanCountries())
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('city')->required()->maxLength(255),
                        Forms\Components\TextInput::make('postal_code')->maxLength(20),
                        Forms\Components\TextInput::make('address')->maxLength(500),
                        Forms\Components\TextInput::make('lat')->numeric(),
                        Forms\Components\TextInput::make('lng')->numeric(),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Capacity')
                    ->icon('heroicon-o-cube')
                    ->schema([
                        Forms\Components\TextInput::make('total_area_m2')->numeric()->suffix('m²'),
                        Forms\Components\TextInput::make('available_area_m2')->numeric()->suffix('m²'),
                        Forms\Components\TextInput::make('ceiling_height_m')->numeric()->suffix('m'),
                        Forms\Components\TextInput::make('pallet_spaces')->numeric(),
                        Forms\Components\TextInput::make('available_pallet_spaces')->numeric(),
                        Forms\Components\TextInput::make('loading_docks_count')->numeric(),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Features')
                    ->icon('heroicon-o-wrench-screwdriver')
                    ->schema([
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
                Forms\Components\Tabs\Tab::make('Pricing')
                    ->icon('heroicon-o-currency-euro')
                    ->schema([
                        Forms\Components\TextInput::make('price_per_m2_month')->numeric()->prefix('€'),
                        Forms\Components\TextInput::make('price_per_pallet_month')->numeric()->prefix('€'),
                        Forms\Components\Select::make('currency')
                            ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP', 'RON' => 'RON', 'PLN' => 'PLN'])
                            ->default('EUR'),
                        Forms\Components\DatePicker::make('available_from'),
                        Forms\Components\DatePicker::make('available_to'),
                        Forms\Components\TextInput::make('min_rental_months')->numeric(),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Contact')
                    ->icon('heroicon-o-phone')
                    ->schema([
                        Forms\Components\TextInput::make('contact_name')->maxLength(255),
                        Forms\Components\TextInput::make('contact_phone')->tel(),
                        Forms\Components\TextInput::make('contact_email')->email(),
                        Forms\Components\Textarea::make('notes')->rows(2),
                    ])->columns(2),
            ])->columnSpanFull(),
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
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'active' => 'success', 'inactive' => 'danger', 'maintenance' => 'warning',
                    default => 'gray',
                }),
                Tables\Columns\IconColumn::make('is_public')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['active' => 'Active', 'inactive' => 'Inactive', 'maintenance' => 'Maintenance']),
                Tables\Filters\SelectFilter::make('country_code')
                    ->options(['DE' => 'Germany', 'FR' => 'France', 'RO' => 'Romania', 'PL' => 'Poland', 'IT' => 'Italy', 'ES' => 'Spain']),
                Tables\Filters\TernaryFilter::make('has_temperature_control'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
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
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('No warehouses yet')
            ->emptyStateDescription('Add your first warehouse to start managing storage.')
            ->emptyStateIcon('heroicon-o-building-storefront')
            ->emptyStateActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['company']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('Warehouse')->schema([
                Infolists\Components\Tabs\Tab::make('General')->icon('heroicon-o-information-circle')->schema([
                    Infolists\Components\TextEntry::make('name'),
                    Infolists\Components\TextEntry::make('company.name')->label('Company'),
                    Infolists\Components\TextEntry::make('description'),
                    Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                        'active' => 'success', 'inactive' => 'danger', 'maintenance' => 'warning', default => 'gray',
                    }),
                    Infolists\Components\IconEntry::make('is_public')->boolean()->label('Public'),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Location')->icon('heroicon-o-map-pin')->schema([
                    Infolists\Components\TextEntry::make('country_code')->label('Country'),
                    Infolists\Components\TextEntry::make('city'),
                    Infolists\Components\TextEntry::make('postal_code')->label('Postal Code'),
                    Infolists\Components\TextEntry::make('address'),
                    Infolists\Components\TextEntry::make('lat')->label('Latitude'),
                    Infolists\Components\TextEntry::make('lng')->label('Longitude'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Capacity')->icon('heroicon-o-cube')->schema([
                    Infolists\Components\TextEntry::make('total_area_m2')->suffix(' m²')->label('Total Area'),
                    Infolists\Components\TextEntry::make('available_area_m2')->suffix(' m²')->label('Available Area'),
                    Infolists\Components\TextEntry::make('ceiling_height_m')->suffix(' m')->label('Ceiling Height'),
                    Infolists\Components\TextEntry::make('pallet_spaces')->label('Pallet Spaces'),
                    Infolists\Components\TextEntry::make('available_pallet_spaces')->label('Available Pallet Spaces'),
                    Infolists\Components\TextEntry::make('loading_docks_count')->label('Loading Docks'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Features')->icon('heroicon-o-wrench-screwdriver')->schema([
                    Infolists\Components\IconEntry::make('has_loading_dock')->boolean()->label('Loading Dock'),
                    Infolists\Components\IconEntry::make('has_rail_access')->boolean()->label('Rail Access'),
                    Infolists\Components\IconEntry::make('has_temperature_control')->boolean()->label('Temperature Control'),
                    Infolists\Components\IconEntry::make('has_hazardous_storage')->boolean()->label('Hazardous Storage'),
                    Infolists\Components\IconEntry::make('has_customs_warehouse')->boolean()->label('Customs Warehouse'),
                    Infolists\Components\IconEntry::make('is_bonded')->boolean()->label('Bonded'),
                    Infolists\Components\IconEntry::make('has_cross_docking')->boolean()->label('Cross Docking'),
                    Infolists\Components\IconEntry::make('has_pick_pack')->boolean()->label('Pick & Pack'),
                    Infolists\Components\IconEntry::make('has_security_24h')->boolean()->label('24h Security'),
                    Infolists\Components\IconEntry::make('has_cctv')->boolean()->label('CCTV'),
                    Infolists\Components\IconEntry::make('has_fire_protection')->boolean()->label('Fire Protection'),
                ])->columns(4),
                Infolists\Components\Tabs\Tab::make('Pricing')->icon('heroicon-o-currency-euro')->schema([
                    Infolists\Components\TextEntry::make('price_per_m2_month')->money('EUR')->label('€/m²/month'),
                    Infolists\Components\TextEntry::make('price_per_pallet_month')->money('EUR')->label('€/pallet/month'),
                    Infolists\Components\TextEntry::make('currency'),
                    Infolists\Components\TextEntry::make('available_from')->date()->label('Available From'),
                    Infolists\Components\TextEntry::make('available_to')->date()->label('Available To'),
                    Infolists\Components\TextEntry::make('min_rental_months')->label('Min Rental (months)'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Contact')->icon('heroicon-o-phone')->schema([
                    Infolists\Components\TextEntry::make('contact_name')->label('Contact Name'),
                    Infolists\Components\TextEntry::make('contact_phone')->label('Phone'),
                    Infolists\Components\TextEntry::make('contact_email')->label('Email'),
                    Infolists\Components\TextEntry::make('notes'),
                ])->columns(2),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'city', 'country_code'];
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
        return [
            RelationManagers\BookingsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWarehouses::route('/'),
            'create' => Pages\CreateWarehouse::route('/create'),
            'view' => Pages\ViewWarehouse::route('/{record}'),
            'edit' => Pages\EditWarehouse::route('/{record}/edit'),
        ];
    }
}
