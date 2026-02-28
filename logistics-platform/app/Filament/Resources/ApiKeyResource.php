<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ApiKeyResource\Pages;
use App\Models\ApiKey;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Notifications\Notification;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ApiKeyResource extends Resource
{
    protected static ?string $model = ApiKey::class;

    protected static ?string $navigationIcon = 'heroicon-o-key';

    protected static ?string $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),

                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('key_prefix')
                    ->disabled()
                    ->maxLength(255),

                Forms\Components\Hidden::make('key_hash'),

                Forms\Components\Hidden::make('permissions'),

                Forms\Components\Hidden::make('rate_limits'),

                Forms\Components\TagsInput::make('allowed_ips')
                    ->placeholder('Add IP address'),

                Forms\Components\TagsInput::make('allowed_origins')
                    ->placeholder('Add origin'),

                Forms\Components\TextInput::make('requests_today')
                    ->numeric()
                    ->disabled(),

                Forms\Components\TextInput::make('requests_total')
                    ->numeric()
                    ->disabled(),

                Forms\Components\Toggle::make('is_active')
                    ->default(true),

                Forms\Components\DateTimePicker::make('last_used_at')
                    ->disabled(),

                Forms\Components\DateTimePicker::make('expires_at'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),

                Tables\Columns\TextColumn::make('company.name')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('name')
                    ->searchable(),

                Tables\Columns\TextColumn::make('key_prefix')
                    ->searchable(),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),

                Tables\Columns\TextColumn::make('requests_today')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('requests_total')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('last_used_at')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('expires_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('regenerate')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalDescription('This will generate a new API key. The old key will stop working immediately.')
                    ->action(function (ApiKey $record) {
                        $newKey = \Illuminate\Support\Str::random(64);
                        $record->update([
                            'key_hash' => hash('sha256', $newKey),
                            'key_prefix' => substr($newKey, 0, 8),
                        ]);
                        Notification::make()->title('New API Key: ' . $newKey)->success()->persistent()->send();
                    }),
                Tables\Actions\Action::make('revoke')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalDescription('This will permanently revoke this API key.')
                    ->visible(fn (ApiKey $record) => $record->is_active)
                    ->action(function (ApiKey $record) {
                        $record->update(['is_active' => false]);
                        Notification::make()->title('API Key Revoked')->danger()->send();
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
            ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name'];
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
            'index' => Pages\ListApiKeys::route('/'),
            'create' => Pages\CreateApiKey::route('/create'),
            'edit' => Pages\EditApiKey::route('/{record}/edit'),
        ];
    }
}
