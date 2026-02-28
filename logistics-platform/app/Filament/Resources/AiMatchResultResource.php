<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AiMatchResultResource\Pages;
use App\Models\AiMatchResult;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AiMatchResultResource extends Resource
{
    protected static ?string $model = AiMatchResult::class;

    protected static ?string $navigationIcon = 'heroicon-o-sparkles';

    protected static ?string $navigationGroup = 'AI & Analytics';

    protected static ?int $navigationSort = 3;
    protected static ?string $recordTitleAttribute = 'id';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('AiMatch')->schema([
                    Forms\Components\Tabs\Tab::make('References')
                        ->icon('heroicon-o-link')
                        ->schema([
                            Forms\Components\Select::make('freight_offer_id')
                                ->relationship('freightOffer', 'id')
                                ->searchable()
                                ->preload(),
                            Forms\Components\Select::make('vehicle_offer_id')
                                ->relationship('vehicleOffer', 'id')
                                ->searchable()
                                ->preload(),
                            Forms\Components\Select::make('company_id')
                                ->relationship('company', 'name')
                                ->searchable()
                                ->preload(),
                        ])->columns(3),
                    Forms\Components\Tabs\Tab::make('AI Scores')
                        ->icon('heroicon-o-sparkles')
                        ->schema([
                            Forms\Components\TextInput::make('ai_score')
                                ->numeric()
                                ->required(),
                            Forms\Components\TextInput::make('distance_score')
                                ->numeric(),
                            Forms\Components\TextInput::make('capacity_score')
                                ->numeric(),
                            Forms\Components\TextInput::make('timing_score')
                                ->numeric(),
                            Forms\Components\TextInput::make('reliability_score')
                                ->numeric(),
                            Forms\Components\TextInput::make('price_score')
                                ->numeric(),
                            Forms\Components\TextInput::make('carbon_score')
                                ->numeric(),
                        ])->columns(3),
                    Forms\Components\Tabs\Tab::make('Status')
                        ->icon('heroicon-o-check-circle')
                        ->schema([
                            Forms\Components\TextInput::make('model_version')
                                ->maxLength(255),
                            Forms\Components\Select::make('status')
                                ->options([
                                    'pending' => 'Pending',
                                    'accepted' => 'Accepted',
                                    'rejected' => 'Rejected',
                                    'expired' => 'Expired',
                                ])
                                ->default('pending')
                                ->required(),
                            Forms\Components\DateTimePicker::make('accepted_at')
                                ->disabled()
                                ->dehydrated(),
                            Forms\Components\DateTimePicker::make('rejected_at')
                                ->disabled()
                                ->dehydrated(),
                            Forms\Components\Textarea::make('rejection_reason')
                                ->columnSpanFull(),
                        ])->columns(2),
                ])->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('ai_score', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('freightOffer.id')
                    ->label('Freight#')
                    ->sortable(),
                Tables\Columns\TextColumn::make('vehicleOffer.id')
                    ->label('Vehicle#')
                    ->sortable(),
                Tables\Columns\TextColumn::make('company.name')
                    ->sortable(),
                Tables\Columns\TextColumn::make('ai_score')
                    ->sortable()
                    ->color(fn ($state): string => match (true) {
                        $state >= 80 => 'success',
                        $state >= 60 => 'warning',
                        default => 'danger',
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray',
                        'accepted' => 'success',
                        'rejected' => 'danger',
                        'expired' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('model_version'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'accepted' => 'Accepted',
                        'rejected' => 'Rejected',
                        'expired' => 'Expired',
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
        return ['status'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAiMatchResults::route('/'),
            'create' => Pages\CreateAiMatchResult::route('/create'),
            'edit' => Pages\EditAiMatchResult::route('/{record}/edit'),
        ];
    }
}
