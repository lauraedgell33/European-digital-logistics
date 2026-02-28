<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers;
use App\Models\User;
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

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Administration';
    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'name';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count() ?: null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'gray';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('User Information')->schema([
                Forms\Components\TextInput::make('name')
                    ->required()->maxLength(255),
                Forms\Components\TextInput::make('email')
                    ->email()->required()->unique(ignoreRecord: true)->maxLength(255),
                Forms\Components\TextInput::make('password')
                    ->password()->revealable()
                    ->dehydrateStateUsing(fn ($state) => filled($state) ? bcrypt($state) : null)
                    ->dehydrated(fn ($state) => filled($state))
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->maxLength(255),
                Forms\Components\Select::make('role')
                    ->options([
                        'admin' => 'Admin',
                        'manager' => 'Manager',
                        'operator' => 'Operator',
                        'driver' => 'Driver',
                    ])->required()->default('operator'),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()->preload()->required(),
            ])->columns(2),

            Forms\Components\Section::make('Contact & Preferences')->schema([
                Forms\Components\TextInput::make('phone')->tel(),
                Forms\Components\Select::make('language')
                    ->options([
                        'en' => 'English',
                        'de' => 'Deutsch',
                        'fr' => 'Français',
                        'ro' => 'Română',
                        'es' => 'Español',
                        'it' => 'Italiano',
                        'pl' => 'Polski',
                    ])->default('en'),
                Forms\Components\Toggle::make('is_active')->default(true),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('company.name')
                    ->searchable()->sortable()->label('Company'),
                Tables\Columns\TextColumn::make('role')->badge()->color(fn (string $state): string => match ($state) {
                    'admin' => 'danger',
                    'manager' => 'warning',
                    'operator' => 'primary',
                    'driver' => 'success',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('language')->label('Lang'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('last_login_at')
                    ->dateTime()->sortable()->label('Last Login'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options([
                        'admin' => 'Admin',
                        'manager' => 'Manager',
                        'operator' => 'Operator',
                        'driver' => 'Driver',
                    ]),
                Tables\Filters\SelectFilter::make('company')
                    ->relationship('company', 'name'),
                Tables\Filters\TernaryFilter::make('is_active'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('activate')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (User $record) => !$record->is_active)
                    ->action(fn (User $record) => $record->update(['is_active' => true])),
                Tables\Actions\Action::make('deactivate')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (User $record) => $record->is_active && !$record->isPermanentAdmin())
                    ->action(fn (User $record) => $record->update(['is_active' => false])),
                Tables\Actions\Action::make('resetPassword')
                    ->icon('heroicon-o-key')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalDescription('Send a password reset email to this user?')
                    ->action(function (User $record) {
                        \Illuminate\Support\Facades\Password::sendResetLink(['email' => $record->email]);
                        Notification::make()->title('Password Reset Email Sent')->success()->send();
                    }),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('bulkActivate')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion()
                        ->action(function (\Illuminate\Database\Eloquent\Collection $records) {
                            $records->each(fn ($r) => $r->update(['is_active' => true]));
                            Notification::make()->title($records->count() . ' users activated')->success()->send();
                        }),
                    Tables\Actions\BulkAction::make('bulkDeactivate')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion()
                        ->action(function (\Illuminate\Database\Eloquent\Collection $records) {
                            $records->each(fn ($r) => !$r->isPermanentAdmin() && $r->update(['is_active' => false]));
                            Notification::make()->title($records->count() . ' users deactivated')->warning()->send();
                        }),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['company']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('User Information')->schema([
                Infolists\Components\TextEntry::make('name'),
                Infolists\Components\TextEntry::make('email')->copyable(),
                Infolists\Components\TextEntry::make('role')->badge()->color(fn (string $state): string => match ($state) {
                    'admin' => 'danger', 'manager' => 'warning', 'operator' => 'primary', 'driver' => 'success', default => 'gray',
                }),
                Infolists\Components\TextEntry::make('company.name')->label('Company'),
            ])->columns(2),
            Infolists\Components\Section::make('Contact & Preferences')->schema([
                Infolists\Components\TextEntry::make('phone'),
                Infolists\Components\TextEntry::make('language'),
                Infolists\Components\IconEntry::make('is_active')->boolean()->label('Active'),
                Infolists\Components\TextEntry::make('last_login_at')->dateTime()->label('Last Login'),
                Infolists\Components\TextEntry::make('created_at')->dateTime(),
            ])->columns(3),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'email', 'role'];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        return [
            'Company' => $record->company?->name ?? '-',
            'Role' => ucfirst($record->role ?? '-'),
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
            RelationManagers\CreatedOrdersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'view' => Pages\ViewUser::route('/{record}'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
