<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DigitalIdentityResource\Pages;
use App\Models\DigitalIdentity;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DigitalIdentityResource extends Resource
{
    protected static ?string $model = DigitalIdentity::class;

    protected static ?string $navigationIcon = 'heroicon-o-finger-print';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Forms\Components\TextInput::make('did_identifier')
                    ->disabled()
                    ->maxLength(255),
                Forms\Components\Select::make('verification_level')
                    ->options([
                        'none' => 'None',
                        'basic' => 'Basic',
                        'standard' => 'Standard',
                        'enhanced' => 'Enhanced',
                        'full' => 'Full',
                    ])
                    ->required(),
                Forms\Components\Hidden::make('credentials')
                    ->default('{}'),
                Forms\Components\Hidden::make('attestations')
                    ->default('{}'),
                Forms\Components\Toggle::make('is_verified')
                    ->default(false),
                Forms\Components\DateTimePicker::make('verified_at')
                    ->disabled(),
                Forms\Components\TextInput::make('verified_by')
                    ->disabled()
                    ->maxLength(255),
                Forms\Components\DateTimePicker::make('expires_at'),
                Forms\Components\Hidden::make('verification_documents')
                    ->default('{}'),
                Forms\Components\TextInput::make('public_key_hash')
                    ->disabled()
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
                Tables\Columns\TextColumn::make('user.name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('did_identifier')
                    ->searchable()
                    ->copyable()
                    ->limit(20),
                Tables\Columns\TextColumn::make('verification_level')
                    ->badge(),
                Tables\Columns\IconColumn::make('is_verified')
                    ->boolean(),
                Tables\Columns\TextColumn::make('verified_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('expires_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('verification_level')
                    ->options([
                        'none' => 'None',
                        'basic' => 'Basic',
                        'standard' => 'Standard',
                        'enhanced' => 'Enhanced',
                        'full' => 'Full',
                    ]),
                Tables\Filters\TernaryFilter::make('is_verified'),
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
            'index' => Pages\ListDigitalIdentities::route('/'),
            'create' => Pages\CreateDigitalIdentity::route('/create'),
            'edit' => Pages\EditDigitalIdentity::route('/{record}/edit'),
        ];
    }
}
