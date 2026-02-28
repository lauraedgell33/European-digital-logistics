<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CompanyResource\Pages;
use App\Filament\Resources\CompanyResource\RelationManagers;
use App\Models\Company;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Notifications\Notification;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use App\Enums\CompanyVerificationStatus;

class CompanyResource extends Resource
{
    protected static ?string $model = Company::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationGroup = 'Platform';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'name';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('verification_status', 'pending')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Company')->schema([
                Forms\Components\Tabs\Tab::make('Company')
                    ->icon('heroicon-o-building-office')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()->maxLength(255)
                            ->placeholder('Company legal name'),
                        Forms\Components\TextInput::make('vat_number')
                            ->required()->unique(ignoreRecord: true)->maxLength(50)
                            ->placeholder('e.g. DE123456789')
                            ->helperText('EU VAT identification number'),
                        Forms\Components\TextInput::make('registration_number')
                            ->maxLength(100),
                        Forms\Components\Select::make('type')
                            ->options([
                                'shipper' => 'Shipper',
                                'carrier' => 'Carrier',
                                'forwarder' => 'Forwarder',
                            ])->required(),
                        Forms\Components\Select::make('verification_status')
                            ->options(CompanyVerificationStatus::class)
                            ->required()
                            ->default('pending'),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Address')
                    ->icon('heroicon-o-map-pin')
                    ->schema([
                        Forms\Components\Select::make('country_code')
                            ->options(\App\Support\CountryHelper::europeanCountries())
                            ->searchable()
                            ->preload()
                            ->required()
                            ->label('Country Code'),
                        Forms\Components\TextInput::make('city')
                            ->required()->maxLength(100),
                        Forms\Components\TextInput::make('postal_code')
                            ->required()->maxLength(20),
                        Forms\Components\Textarea::make('address')
                            ->required()->columnSpanFull(),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Contact')
                    ->icon('heroicon-o-phone')
                    ->schema([
                        Forms\Components\TextInput::make('phone')->tel()
                            ->placeholder('+49 123 456 7890'),
                        Forms\Components\TextInput::make('email')->email(),
                        Forms\Components\TextInput::make('website')->url(),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Status')
                    ->icon('heroicon-o-check-badge')
                    ->schema([
                        Forms\Components\Toggle::make('is_active')->default(true),
                        Forms\Components\TextInput::make('rating')
                            ->numeric()->minValue(0)->maxValue(5)->step(0.01)->disabled(),
                        Forms\Components\DateTimePicker::make('verified_at'),
                        Forms\Components\Placeholder::make('member_since')
                            ->content(fn ($record) => $record?->created_at?->diffForHumans() ?? '-')
                            ->visibleOn('edit'),
                        Forms\Components\Placeholder::make('total_orders')
                            ->content(fn ($record) => $record ? \App\Models\TransportOrder::where('shipper_id', $record->id)->orWhere('carrier_id', $record->id)->count() . ' orders' : '-')
                            ->visibleOn('edit'),
                    ])->columns(3),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('vat_number')->searchable(),
                Tables\Columns\TextColumn::make('type')->badge()->color(fn (string $state): string => match ($state) {
                    'shipper' => 'primary',
                    'carrier' => 'success',
                    'forwarder' => 'warning',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('verification_status')->badge(),
                Tables\Columns\TextColumn::make('country_code')->label('Country'),
                Tables\Columns\TextColumn::make('city')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('rating')->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('users_count')->counts('users')->label('Users'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'shipper' => 'Shipper',
                        'carrier' => 'Carrier',
                        'forwarder' => 'Forwarder',
                    ]),
                Tables\Filters\SelectFilter::make('verification_status')
                    ->options(CompanyVerificationStatus::class),
                Tables\Filters\TernaryFilter::make('is_active'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('verify')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn(Company $record) => $record->verification_status === 'pending')
                    ->action(fn(Company $record) => $record->update([
                        'verification_status' => 'verified',
                        'verified_at' => now(),
                    ])),
                Tables\Actions\Action::make('suspend')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalDescription('This will deactivate the company and all its users.')
                    ->visible(fn (Company $record) => $record->is_active)
                    ->action(function (Company $record) {
                        $record->update(['is_active' => false]);
                        $record->users()->update(['is_active' => false]);
                        Notification::make()->title('Company Suspended')->warning()->send();
                    }),
                Tables\Actions\Action::make('reactivate')
                    ->icon('heroicon-o-arrow-path')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Company $record) => !$record->is_active)
                    ->action(function (Company $record) {
                        $record->update(['is_active' => true]);
                        Notification::make()->title('Company Reactivated')->success()->send();
                    }),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('bulkVerify')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion()
                        ->action(function (\Illuminate\Database\Eloquent\Collection $records) {
                            $records->each(fn ($r) => $r->verification_status === 'pending' && $r->update(['verification_status' => 'verified', 'verified_at' => now()]));
                            Notification::make()->title($records->count() . ' companies processed')->success()->send();
                        }),
                ]),
            ])
            ->emptyStateHeading('No companies registered')
            ->emptyStateDescription('Companies will appear once they register on the platform.')
            ->emptyStateIcon('heroicon-o-building-office')
            ->emptyStateActions([
                Tables\Actions\CreateAction::make(),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('Company')->schema([
                Infolists\Components\Tabs\Tab::make('Company')->icon('heroicon-o-building-office')->schema([
                    Infolists\Components\TextEntry::make('name'),
                    Infolists\Components\TextEntry::make('vat_number')->label('VAT Number')->copyable(),
                    Infolists\Components\TextEntry::make('registration_number')->label('Registration Number'),
                    Infolists\Components\TextEntry::make('type')->badge()->color(fn (string $state): string => match ($state) {
                        'shipper' => 'primary', 'carrier' => 'success', 'forwarder' => 'warning', default => 'gray',
                    }),
                    Infolists\Components\TextEntry::make('verification_status')->badge()->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning', 'verified' => 'success', 'rejected' => 'danger', default => 'gray',
                    }),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Address')->icon('heroicon-o-map-pin')->schema([
                    Infolists\Components\TextEntry::make('country_code')->label('Country Code'),
                    Infolists\Components\TextEntry::make('city'),
                    Infolists\Components\TextEntry::make('postal_code')->label('Postal Code'),
                    Infolists\Components\TextEntry::make('address')->columnSpanFull(),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Contact')->icon('heroicon-o-phone')->schema([
                    Infolists\Components\TextEntry::make('phone'),
                    Infolists\Components\TextEntry::make('email'),
                    Infolists\Components\TextEntry::make('website')->url(),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Status')->icon('heroicon-o-check-badge')->schema([
                    Infolists\Components\IconEntry::make('is_active')->boolean()->label('Active'),
                    Infolists\Components\TextEntry::make('rating'),
                    Infolists\Components\TextEntry::make('verified_at')->dateTime(),
                    Infolists\Components\TextEntry::make('created_at')->dateTime(),
                ])->columns(3),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'vat_number', 'email', 'city'];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        return [
            'Type' => ucfirst($record->type ?? '-'),
            'Country' => $record->country_code ?? '-',
            'Status' => ucfirst($record->verification_status ?? '-'),
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
            RelationManagers\UsersRelationManager::class,
            RelationManagers\TransportOrdersRelationManager::class,
            RelationManagers\InvoicesRelationManager::class,
            RelationManagers\FreightOffersRelationManager::class,
            RelationManagers\VehicleOffersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCompanies::route('/'),
            'create' => Pages\CreateCompany::route('/create'),
            'view' => Pages\ViewCompany::route('/{record}'),
            'edit' => Pages\EditCompany::route('/{record}/edit'),
        ];
    }
}
