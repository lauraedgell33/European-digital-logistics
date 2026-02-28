<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ApiKeyResource\Pages;
use App\Models\ApiKey;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ApiKeyResource extends Resource
{
    protected static ?string $model = ApiKey::class;

    protected static ?string $navigationIcon = 'heroicon-o-key';

    protected static ?string $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 2;

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
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListApiKeys::route('/'),
            'create' => Pages\CreateApiKey::route('/create'),
            'edit' => Pages\EditApiKey::route('/{record}/edit'),
        ];
    }
}
