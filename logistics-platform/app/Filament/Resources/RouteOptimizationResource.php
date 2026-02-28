<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RouteOptimizationResource\Pages;
use App\Models\RouteOptimization;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RouteOptimizationResource extends Resource
{
    protected static ?string $model = RouteOptimization::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationGroup = 'Tracking & Logistics';

    protected static ?int $navigationSort = 6;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('optimization_type')
                    ->options([
                        'shortest' => 'Shortest',
                        'fastest' => 'Fastest',
                        'cheapest' => 'Cheapest',
                        'greenest' => 'Greenest',
                    ]),
                Forms\Components\Hidden::make('waypoints')
                    ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                Forms\Components\Hidden::make('constraints')
                    ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                Forms\Components\Hidden::make('optimized_route')
                    ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                Forms\Components\TextInput::make('original_distance_km')
                    ->numeric()
                    ->suffix('km')
                    ->disabled(),
                Forms\Components\TextInput::make('optimized_distance_km')
                    ->numeric()
                    ->suffix('km')
                    ->disabled(),
                Forms\Components\TextInput::make('distance_saved_km')
                    ->numeric()
                    ->suffix('km')
                    ->disabled(),
                Forms\Components\TextInput::make('distance_saved_pct')
                    ->numeric()
                    ->suffix('%')
                    ->disabled(),
                Forms\Components\TextInput::make('original_duration_hours')
                    ->numeric()
                    ->suffix('h')
                    ->disabled(),
                Forms\Components\TextInput::make('optimized_duration_hours')
                    ->numeric()
                    ->suffix('h')
                    ->disabled(),
                Forms\Components\TextInput::make('time_saved_hours')
                    ->numeric()
                    ->suffix('h')
                    ->disabled(),
                Forms\Components\TextInput::make('estimated_co2_saved_kg')
                    ->numeric()
                    ->suffix('kg')
                    ->disabled(),
                Forms\Components\TextInput::make('estimated_cost_saved_eur')
                    ->numeric()
                    ->prefix('€')
                    ->disabled(),
                Forms\Components\Hidden::make('alternative_routes')
                    ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                Forms\Components\Hidden::make('warnings')
                    ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('company.name'),
                Tables\Columns\TextColumn::make('optimization_type')
                    ->badge(),
                Tables\Columns\TextColumn::make('original_distance_km')
                    ->suffix(' km'),
                Tables\Columns\TextColumn::make('optimized_distance_km')
                    ->suffix(' km'),
                Tables\Columns\TextColumn::make('distance_saved_pct')
                    ->suffix('%')
                    ->sortable()
                    ->color(fn ($state) => $state > 20 ? 'success' : ($state > 10 ? 'info' : 'gray')),
                Tables\Columns\TextColumn::make('time_saved_hours')
                    ->suffix(' h'),
                Tables\Columns\TextColumn::make('estimated_cost_saved_eur')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray',
                        'processing' => 'warning',
                        'completed' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                    ]),
                Tables\Filters\SelectFilter::make('optimization_type')
                    ->options([
                        'shortest' => 'Shortest',
                        'fastest' => 'Fastest',
                        'cheapest' => 'Cheapest',
                        'greenest' => 'Greenest',
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

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRouteOptimizations::route('/'),
            'create' => Pages\CreateRouteOptimization::route('/create'),
            'edit' => Pages\EditRouteOptimization::route('/{record}/edit'),
        ];
    }
}
