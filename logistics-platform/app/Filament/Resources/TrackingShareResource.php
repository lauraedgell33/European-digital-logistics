<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TrackingShareResource\Pages;
use App\Models\TrackingShare;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TrackingShareResource extends Resource
{
    protected static ?string $model = TrackingShare::class;

    protected static ?string $navigationIcon = 'heroicon-o-share';

    protected static ?string $navigationGroup = 'Tracking & Logistics';

    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('shipment_id')
                    ->relationship('shipment', 'tracking_code')
                    ->required()
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('created_by')
                    ->relationship('creator', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),

                Forms\Components\TextInput::make('share_token')
                    ->disabled()
                    ->maxLength(255),

                Forms\Components\TextInput::make('recipient_email')
                    ->email()
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('recipient_name')
                    ->maxLength(255),

                Forms\Components\Hidden::make('permissions'),

                Forms\Components\Toggle::make('is_active')
                    ->default(true),

                Forms\Components\TextInput::make('view_count')
                    ->numeric()
                    ->disabled()
                    ->default(0),

                Forms\Components\DateTimePicker::make('expires_at'),

                Forms\Components\DateTimePicker::make('last_viewed_at')
                    ->disabled(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),

                Tables\Columns\TextColumn::make('shipment.tracking_code')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('recipient_email')
                    ->searchable(),

                Tables\Columns\TextColumn::make('recipient_name')
                    ->searchable(),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),

                Tables\Columns\TextColumn::make('view_count')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('expires_at')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('last_viewed_at')
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
            'index' => Pages\ListTrackingShares::route('/'),
            'create' => Pages\CreateTrackingShare::route('/create'),
            'edit' => Pages\EditTrackingShare::route('/{record}/edit'),
        ];
    }
}
