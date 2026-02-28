<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RouteResource\Pages;
use App\Models\Route;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RouteResource extends Resource
{
    protected static ?string $model = Route::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-long-right';

    protected static ?string $navigationGroup = 'Tracking & Logistics';

    protected static ?int $navigationSort = 4;
    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('origin_country')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('origin_city')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('origin_lat')
                    ->numeric()
                    ->label('Origin Latitude'),

                Forms\Components\TextInput::make('origin_lng')
                    ->numeric()
                    ->label('Origin Longitude'),

                Forms\Components\TextInput::make('destination_country')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('destination_city')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('destination_lat')
                    ->numeric()
                    ->label('Destination Latitude'),

                Forms\Components\TextInput::make('destination_lng')
                    ->numeric()
                    ->label('Destination Longitude'),

                Forms\Components\TextInput::make('distance_km')
                    ->numeric()
                    ->suffix('km'),

                Forms\Components\TextInput::make('duration_minutes')
                    ->numeric()
                    ->suffix('min'),

                Forms\Components\Hidden::make('toll_costs'),

                Forms\Components\TextInput::make('fuel_cost_estimate')
                    ->numeric()
                    ->prefix('€'),

                Forms\Components\Select::make('currency')
                    ->options([
                        'EUR' => 'EUR',
                        'USD' => 'USD',
                        'GBP' => 'GBP',
                    ])
                    ->default('EUR')
                    ->required(),

                Forms\Components\Hidden::make('country_crossings'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('distance_km', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),

                Tables\Columns\TextColumn::make('origin_city')
                    ->label('Origin')
                    ->formatStateUsing(fn ($record) => $record->origin_city . ', ' . $record->origin_country)
                    ->searchable(),

                Tables\Columns\TextColumn::make('destination_city')
                    ->label('Destination')
                    ->formatStateUsing(fn ($record) => $record->destination_city . ', ' . $record->destination_country)
                    ->searchable(),

                Tables\Columns\TextColumn::make('distance_km')
                    ->suffix(' km')
                    ->sortable(),

                Tables\Columns\TextColumn::make('duration_minutes')
                    ->label('Duration')
                    ->formatStateUsing(function ($state) {
                        if (!$state) return '-';
                        $hours = intdiv((int) $state, 60);
                        $minutes = (int) $state % 60;
                        return $hours > 0 ? "{$hours}h {$minutes}min" : "{$minutes}min";
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('fuel_cost_estimate')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('origin_country'),

                Tables\Filters\SelectFilter::make('destination_country'),
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
        return ['name', 'origin_city', 'destination_city'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRoutes::route('/'),
            'create' => Pages\CreateRoute::route('/create'),
            'edit' => Pages\EditRoute::route('/{record}/edit'),
        ];
    }
}
