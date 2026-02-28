<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FreightOfferResource\Pages;
use App\Filament\Resources\FreightOfferResource\RelationManagers;
use App\Models\FreightOffer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Notifications\Notification;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class FreightOfferResource extends Resource
{
    protected static ?string $model = FreightOffer::class;
    protected static ?string $navigationIcon = 'heroicon-o-cube';
    protected static ?string $navigationGroup = 'Marketplace';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'title';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'active')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('FreightOffer')->schema([
                Forms\Components\Tabs\Tab::make('Origin')
                    ->icon('heroicon-o-arrow-up-tray')
                    ->schema([
                        Forms\Components\Select::make('origin_country')
                            ->options(\App\Support\CountryHelper::europeanCountries())
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('origin_city')->required()->maxLength(100),
                        Forms\Components\TextInput::make('origin_postal_code')->required()->maxLength(20),
                        Forms\Components\Textarea::make('origin_address'),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Destination')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->schema([
                        Forms\Components\Select::make('destination_country')
                            ->options(\App\Support\CountryHelper::europeanCountries())
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('destination_city')->required()->maxLength(100),
                        Forms\Components\TextInput::make('destination_postal_code')->required()->maxLength(20),
                        Forms\Components\Textarea::make('destination_address'),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Cargo')
                    ->icon('heroicon-o-cube')
                    ->schema([
                        Forms\Components\TextInput::make('cargo_type')->required(),
                        Forms\Components\TextInput::make('weight')->required()->numeric()->suffix('kg'),
                        Forms\Components\TextInput::make('volume')->numeric()->suffix('m³'),
                        Forms\Components\TextInput::make('pallet_count')->numeric(),
                        Forms\Components\Toggle::make('is_hazardous')
                            ->live(),
                        Forms\Components\TextInput::make('adr_class')
                            ->visible(fn (Get $get) => $get('is_hazardous')),
                        Forms\Components\TextInput::make('adr_un_number')
                            ->visible(fn (Get $get) => $get('is_hazardous')),
                        Forms\Components\Toggle::make('requires_temperature_control'),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Schedule')
                    ->icon('heroicon-o-calendar')
                    ->schema([
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
                Forms\Components\Tabs\Tab::make('Pricing')
                    ->icon('heroicon-o-currency-euro')
                    ->schema([
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
            ])->columnSpanFull(),
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
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'active' => 'success',
                    'matched' => 'primary',
                    'completed' => 'info',
                    'cancelled' => 'danger',
                    default => 'gray',
                }),
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
                Tables\Filters\TrashedFilter::make(),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('from')->label('From'),
                        Forms\Components\DatePicker::make('until')->label('Until'),
                    ])
                    ->query(function (\Illuminate\Database\Eloquent\Builder $query, array $data): \Illuminate\Database\Eloquent\Builder {
                        return $query
                            ->when($data['from'], fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
                            ->when($data['until'], fn ($q, $date) => $q->whereDate('created_at', '<=', $date));
                    })
                    ->indicateUsing(function (array $data): array {
                        $indicators = [];
                        if ($data['from'] ?? null) $indicators[] = 'From ' . \Carbon\Carbon::parse($data['from'])->format('M d, Y');
                        if ($data['until'] ?? null) $indicators[] = 'Until ' . \Carbon\Carbon::parse($data['until'])->format('M d, Y');
                        return $indicators;
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('publish')
                    ->icon('heroicon-o-globe-alt')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (FreightOffer $record) => $record->status === 'draft')
                    ->action(function (FreightOffer $record) {
                        $record->update(['status' => 'active']);
                        Notification::make()->title('Offer Published')->success()->send();
                    }),
                Tables\Actions\Action::make('expire')
                    ->icon('heroicon-o-clock')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->visible(fn (FreightOffer $record) => $record->status === 'active')
                    ->action(function (FreightOffer $record) {
                        $record->update(['status' => 'expired']);
                        Notification::make()->title('Offer Expired')->warning()->send();
                    }),
                Tables\Actions\Action::make('duplicate')
                    ->icon('heroicon-o-document-duplicate')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('Create a copy of this offer as a new draft?')
                    ->action(function (FreightOffer $record) {
                        $new = $record->replicate(['status']);
                        $new->status = 'draft';
                        $new->save();
                        Notification::make()->title('Offer Duplicated')->success()->send();
                    }),
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
            ->emptyStateHeading('No freight offers yet')
            ->emptyStateDescription('Create your first freight offer to find carriers.')
            ->emptyStateIcon('heroicon-o-cube')
            ->emptyStateActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['company']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('FreightOffer')->schema([
                Infolists\Components\Tabs\Tab::make('Origin')->icon('heroicon-o-arrow-up-tray')->schema([
                    Infolists\Components\TextEntry::make('origin_country')->label('Country'),
                    Infolists\Components\TextEntry::make('origin_city')->label('City'),
                    Infolists\Components\TextEntry::make('origin_postal_code')->label('Postal Code'),
                    Infolists\Components\TextEntry::make('origin_address')->label('Address'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Destination')->icon('heroicon-o-arrow-down-tray')->schema([
                    Infolists\Components\TextEntry::make('destination_country')->label('Country'),
                    Infolists\Components\TextEntry::make('destination_city')->label('City'),
                    Infolists\Components\TextEntry::make('destination_postal_code')->label('Postal Code'),
                    Infolists\Components\TextEntry::make('destination_address')->label('Address'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Cargo')->icon('heroicon-o-cube')->schema([
                    Infolists\Components\TextEntry::make('cargo_type')->label('Cargo Type'),
                    Infolists\Components\TextEntry::make('weight')->suffix(' kg'),
                    Infolists\Components\TextEntry::make('volume')->suffix(' m³'),
                    Infolists\Components\TextEntry::make('pallet_count')->label('Pallet Count'),
                    Infolists\Components\IconEntry::make('is_hazardous')->boolean()->label('Hazardous'),
                    Infolists\Components\TextEntry::make('adr_class')->label('ADR Class'),
                    Infolists\Components\IconEntry::make('requires_temperature_control')->boolean()->label('Temp Control'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Schedule')->icon('heroicon-o-calendar')->schema([
                    Infolists\Components\TextEntry::make('loading_date')->date()->label('Loading Date'),
                    Infolists\Components\TextEntry::make('unloading_date')->date()->label('Unloading Date'),
                    Infolists\Components\TextEntry::make('vehicle_type')->label('Vehicle Type'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Pricing')->icon('heroicon-o-currency-euro')->schema([
                    Infolists\Components\TextEntry::make('price')->money('EUR'),
                    Infolists\Components\TextEntry::make('currency'),
                    Infolists\Components\TextEntry::make('price_type')->label('Price Type'),
                    Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                        'active' => 'success', 'matched' => 'primary', 'completed' => 'info', 'cancelled' => 'danger', default => 'gray',
                    }),
                    Infolists\Components\IconEntry::make('is_public')->boolean()->label('Public'),
                ])->columns(3),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'origin_city', 'destination_city'];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        return [
            'Company' => $record->company?->name ?? '-',
            'Price' => $record->price ? '€' . number_format($record->price, 2) : '-',
        ];
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
            RelationManagers\MatchResultsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFreightOffers::route('/'),
            'create' => Pages\CreateFreightOffer::route('/create'),
            'view' => Pages\ViewFreightOffer::route('/{record}'),
            'edit' => Pages\EditFreightOffer::route('/{record}/edit'),
        ];
    }
}
