<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ErpIntegrationResource\Pages;
use App\Models\ErpIntegration;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ErpIntegrationResource extends Resource
{
    protected static ?string $model = ErpIntegration::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 5;
    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->required(),
                Forms\Components\Select::make('integration_type')
                    ->options([
                        'SAP' => 'SAP',
                        'Oracle' => 'Oracle',
                        'Microsoft_Dynamics' => 'Microsoft Dynamics',
                        'Sage' => 'Sage',
                        'Custom_API' => 'Custom API',
                        'FTP' => 'FTP',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Hidden::make('field_mappings')
                    ->default('{}'),
                Forms\Components\Hidden::make('sync_settings')
                    ->default('{}'),
                Forms\Components\Toggle::make('is_active')
                    ->default(true),
                Forms\Components\DateTimePicker::make('last_sync_at')
                    ->disabled(),
                Forms\Components\TextInput::make('sync_success_count')
                    ->numeric()
                    ->disabled(),
                Forms\Components\TextInput::make('sync_error_count')
                    ->numeric()
                    ->disabled(),
                Forms\Components\Hidden::make('last_sync_errors')
                    ->default('{}'),
                Forms\Components\Select::make('sync_direction')
                    ->options([
                        'inbound' => 'Inbound',
                        'outbound' => 'Outbound',
                        'bidirectional' => 'Bidirectional',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('webhook_url')
                    ->url()
                    ->maxLength(500),
                Forms\Components\TextInput::make('webhook_secret')
                    ->password()
                    ->maxLength(255),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('company.name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('integration_type')
                    ->badge(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('sync_direction'),
                Tables\Columns\TextColumn::make('sync_success_count')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('sync_error_count')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('last_sync_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('integration_type')
                    ->options([
                        'SAP' => 'SAP',
                        'Oracle' => 'Oracle',
                        'Microsoft_Dynamics' => 'Microsoft Dynamics',
                        'Sage' => 'Sage',
                        'Custom_API' => 'Custom API',
                        'FTP' => 'FTP',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active'),
                Tables\Filters\SelectFilter::make('sync_direction')
                    ->options([
                        'inbound' => 'Inbound',
                        'outbound' => 'Outbound',
                        'bidirectional' => 'Bidirectional',
                    ]),
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

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'provider', 'status'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListErpIntegrations::route('/'),
            'create' => Pages\CreateErpIntegration::route('/create'),
            'edit' => Pages\EditErpIntegration::route('/{record}/edit'),
        ];
    }
}
