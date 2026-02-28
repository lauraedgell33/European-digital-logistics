<?php

namespace App\Filament\Resources;

use App\Filament\Resources\IntermodalPlanResource\Pages;
use App\Models\IntermodalPlan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class IntermodalPlanResource extends Resource
{
    protected static ?string $model = IntermodalPlan::class;

    protected static ?string $navigationIcon = 'heroicon-o-queue-list';

    protected static ?string $navigationGroup = 'Operations';

    protected static ?int $navigationSort = 6;
    protected static ?string $recordTitleAttribute = 'plan_reference';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Plan Info')
                    ->schema([
                        Forms\Components\Select::make('company_id')
                            ->relationship('company', 'name')
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('transport_order_id')
                            ->relationship('transportOrder', 'order_number')
                            ->searchable()
                            ->preload(),
                        Forms\Components\TextInput::make('plan_reference')
                            ->disabled(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'draft' => 'Draft',
                                'calculating' => 'Calculating',
                                'completed' => 'Completed',
                                'failed' => 'Failed',
                                'expired' => 'Expired',
                            ]),
                        Forms\Components\Select::make('optimization_priority')
                            ->options([
                                'cost' => 'Cost',
                                'time' => 'Time',
                                'co2' => 'CO2',
                                'balanced' => 'Balanced',
                            ]),
                    ])->columns(2),

                Forms\Components\Section::make('Origin')
                    ->schema([
                        Forms\Components\TextInput::make('origin_address'),
                        Forms\Components\TextInput::make('origin_country'),
                        Forms\Components\TextInput::make('origin_city'),
                        Forms\Components\TextInput::make('origin_lat')
                            ->numeric(),
                        Forms\Components\TextInput::make('origin_lng')
                            ->numeric(),
                    ])->columns(2),

                Forms\Components\Section::make('Destination')
                    ->schema([
                        Forms\Components\TextInput::make('destination_address'),
                        Forms\Components\TextInput::make('destination_country'),
                        Forms\Components\TextInput::make('destination_city'),
                        Forms\Components\TextInput::make('destination_lat')
                            ->numeric(),
                        Forms\Components\TextInput::make('destination_lng')
                            ->numeric(),
                    ])->columns(2),

                Forms\Components\Section::make('Cargo')
                    ->schema([
                        Forms\Components\TextInput::make('weight_kg')
                            ->numeric()
                            ->suffix('kg'),
                        Forms\Components\TextInput::make('volume_m3')
                            ->numeric()
                            ->suffix('m³'),
                        Forms\Components\TextInput::make('cargo_type'),
                    ])->columns(2),

                Forms\Components\Section::make('Results')
                    ->schema([
                        Forms\Components\TextInput::make('total_legs')
                            ->numeric()
                            ->disabled(),
                        Forms\Components\TextInput::make('total_distance_km')
                            ->numeric()
                            ->suffix('km')
                            ->disabled(),
                        Forms\Components\TextInput::make('total_duration_hours')
                            ->numeric()
                            ->suffix('h')
                            ->disabled(),
                        Forms\Components\TextInput::make('total_cost')
                            ->numeric()
                            ->prefix('€')
                            ->disabled(),
                        Forms\Components\TextInput::make('total_co2_kg')
                            ->numeric()
                            ->suffix('kg')
                            ->disabled(),
                        Forms\Components\TextInput::make('currency'),
                        Forms\Components\TextInput::make('road_only_cost')
                            ->numeric()
                            ->prefix('€')
                            ->disabled(),
                        Forms\Components\TextInput::make('road_only_co2_kg')
                            ->numeric()
                            ->suffix('kg')
                            ->disabled(),
                        Forms\Components\TextInput::make('cost_savings_pct')
                            ->numeric()
                            ->suffix('%')
                            ->disabled(),
                        Forms\Components\TextInput::make('co2_savings_pct')
                            ->numeric()
                            ->suffix('%')
                            ->disabled(),
                    ])->columns(2),

                Forms\Components\Section::make('Legs & Alternatives')
                    ->schema([
                        Forms\Components\Hidden::make('legs')
                            ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                        Forms\Components\Hidden::make('alternative_plans')
                            ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
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
                Tables\Columns\TextColumn::make('plan_reference')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('company.name'),
                Tables\Columns\TextColumn::make('origin_city'),
                Tables\Columns\TextColumn::make('destination_city'),
                Tables\Columns\TextColumn::make('total_distance_km')
                    ->suffix(' km')
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_cost')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('co2_savings_pct')
                    ->suffix('%')
                    ->color(fn ($state) => $state > 20 ? 'success' : ($state > 10 ? 'info' : 'gray')),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'calculating' => 'warning',
                        'completed' => 'success',
                        'failed' => 'danger',
                        'expired' => 'gray',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('optimization_priority')
                    ->badge(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'calculating' => 'Calculating',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                        'expired' => 'Expired',
                    ]),
                Tables\Filters\SelectFilter::make('optimization_priority')
                    ->options([
                        'cost' => 'Cost',
                        'time' => 'Time',
                        'co2' => 'CO2',
                        'balanced' => 'Balanced',
                    ]),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
        return ['plan_reference', 'status'];
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
            'index' => Pages\ListIntermodalPlans::route('/'),
            'create' => Pages\CreateIntermodalPlan::route('/create'),
            'edit' => Pages\EditIntermodalPlan::route('/{record}/edit'),
        ];
    }
}
