<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AiPredictionResource\Pages;
use App\Models\AiPrediction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AiPredictionResource extends Resource
{
    protected static ?string $model = AiPrediction::class;

    protected static ?string $navigationIcon = 'heroicon-o-light-bulb';

    protected static ?string $navigationGroup = 'AI & Analytics';

    protected static ?int $navigationSort = 4;
    protected static ?string $recordTitleAttribute = 'id';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Prediction Details')
                    ->schema([
                        Forms\Components\Select::make('prediction_type')
                            ->options([
                                'price' => 'Price',
                                'demand' => 'Demand',
                                'transit_time' => 'Transit Time',
                                'capacity' => 'Capacity',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('vehicle_type')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Origin')
                    ->schema([
                        Forms\Components\TextInput::make('origin_country')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('origin_city')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Destination')
                    ->schema([
                        Forms\Components\TextInput::make('destination_country')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('destination_city')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Dates')
                    ->schema([
                        Forms\Components\DatePicker::make('prediction_date'),
                        Forms\Components\DatePicker::make('target_date'),
                    ])->columns(2),

                Forms\Components\Section::make('Values')
                    ->schema([
                        Forms\Components\TextInput::make('predicted_value')
                            ->numeric(),
                        Forms\Components\TextInput::make('confidence')
                            ->numeric()
                            ->suffix('%'),
                        Forms\Components\TextInput::make('lower_bound')
                            ->numeric(),
                        Forms\Components\TextInput::make('upper_bound')
                            ->numeric(),
                        Forms\Components\TextInput::make('actual_value')
                            ->numeric(),
                        Forms\Components\TextInput::make('accuracy_pct')
                            ->numeric()
                            ->suffix('%'),
                        Forms\Components\TextInput::make('model_version')
                            ->maxLength(255),
                    ])->columns(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('prediction_date', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('prediction_type')
                    ->badge(),
                Tables\Columns\TextColumn::make('origin')
                    ->label('Origin')
                    ->formatStateUsing(fn ($record) => $record->origin_city . ', ' . $record->origin_country)
                    ->getStateUsing(fn ($record) => $record->origin_city),
                Tables\Columns\TextColumn::make('destination')
                    ->label('Destination')
                    ->formatStateUsing(fn ($record) => $record->destination_city . ', ' . $record->destination_country)
                    ->getStateUsing(fn ($record) => $record->destination_city),
                Tables\Columns\TextColumn::make('predicted_value')
                    ->sortable(),
                Tables\Columns\TextColumn::make('confidence')
                    ->suffix('%'),
                Tables\Columns\TextColumn::make('actual_value'),
                Tables\Columns\TextColumn::make('accuracy_pct')
                    ->suffix('%')
                    ->color(fn ($state): string => match (true) {
                        $state === null => 'gray',
                        $state >= 90 => 'success',
                        $state >= 70 => 'warning',
                        default => 'danger',
                    }),
                Tables\Columns\TextColumn::make('target_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('model_version'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('prediction_type')
                    ->options([
                        'price' => 'Price',
                        'demand' => 'Demand',
                        'transit_time' => 'Transit Time',
                        'capacity' => 'Capacity',
                    ]),
                Tables\Filters\SelectFilter::make('vehicle_type'),
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
        return ['prediction_type'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAiPredictions::route('/'),
            'create' => Pages\CreateAiPrediction::route('/create'),
            'edit' => Pages\EditAiPrediction::route('/{record}/edit'),
        ];
    }
}
