<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TrackingPositionResource\Pages;
use App\Models\TrackingPosition;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TrackingPositionResource extends Resource
{
    protected static ?string $model = TrackingPosition::class;
    protected static ?string $navigationIcon = 'heroicon-o-map-pin';
    protected static ?string $navigationGroup = 'Tracking & Logistics';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Tracking Position')->schema([
                Forms\Components\Select::make('shipment_id')
                    ->relationship('shipment', 'tracking_code')
                    ->searchable()->preload()->required(),
                Forms\Components\TextInput::make('lat')
                    ->numeric()->required()->label('Latitude'),
                Forms\Components\TextInput::make('lng')
                    ->numeric()->required()->label('Longitude'),
                Forms\Components\TextInput::make('speed_kmh')
                    ->numeric()->suffix('km/h')->label('Speed'),
                Forms\Components\TextInput::make('heading')
                    ->numeric()->suffix('°')->label('Heading'),
                Forms\Components\TextInput::make('temperature')
                    ->numeric()->suffix('°C'),
                Forms\Components\DateTimePicker::make('recorded_at')
                    ->required(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('shipment.tracking_code')
                    ->searchable()->sortable()->label('Shipment'),
                Tables\Columns\TextColumn::make('lat')
                    ->sortable()->label('Latitude'),
                Tables\Columns\TextColumn::make('lng')
                    ->sortable()->label('Longitude'),
                Tables\Columns\TextColumn::make('speed_kmh')
                    ->suffix(' km/h')->sortable()->label('Speed'),
                Tables\Columns\TextColumn::make('temperature')
                    ->suffix(' °C')->sortable(),
                Tables\Columns\TextColumn::make('recorded_at')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('recorded_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('shipment_id')
                    ->relationship('shipment', 'tracking_code')
                    ->searchable()->preload()->label('Shipment'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
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
            'index' => Pages\ListTrackingPositions::route('/'),
            'create' => Pages\CreateTrackingPosition::route('/create'),
            'edit' => Pages\EditTrackingPosition::route('/{record}/edit'),
        ];
    }
}
