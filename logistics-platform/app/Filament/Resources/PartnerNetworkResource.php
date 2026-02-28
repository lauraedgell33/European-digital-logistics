<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PartnerNetworkResource\Pages;
use App\Models\PartnerNetwork;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PartnerNetworkResource extends Resource
{
    protected static ?string $model = PartnerNetwork::class;
    protected static ?string $navigationIcon = 'heroicon-o-globe-alt';
    protected static ?string $navigationGroup = 'Platform';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Network Information')->schema([
                Forms\Components\TextInput::make('name')
                    ->required()->maxLength(255),
                Forms\Components\Textarea::make('description')
                    ->rows(3)->columnSpanFull(),
                Forms\Components\Select::make('owner_company_id')
                    ->relationship('owner', 'name')
                    ->searchable()->preload()->required()
                    ->label('Owner Company'),
                Forms\Components\TextInput::make('access_code')
                    ->disabled()->dehydrated(false)
                    ->label('Access Code')
                    ->helperText('Auto-generated on creation'),
            ])->columns(2),

            Forms\Components\Section::make('Settings')->schema([
                Forms\Components\Toggle::make('is_active')->default(true),
                Forms\Components\TextInput::make('max_members')
                    ->numeric()->placeholder('Unlimited'),
                Forms\Components\KeyValue::make('settings')
                    ->keyLabel('Setting')
                    ->valueLabel('Value')
                    ->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()->sortable(),
                Tables\Columns\TextColumn::make('owner.name')
                    ->searchable()->sortable()->label('Owner'),
                Tables\Columns\TextColumn::make('access_code')
                    ->copyable()->label('Access Code'),
                Tables\Columns\TextColumn::make('active_members_count')
                    ->counts('activeMembers')
                    ->label('Members'),
                Tables\Columns\TextColumn::make('max_members')
                    ->placeholder('∞')->label('Max'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListPartnerNetworks::route('/'),
            'create' => Pages\CreatePartnerNetwork::route('/create'),
            'edit' => Pages\EditPartnerNetwork::route('/{record}/edit'),
        ];
    }
}
