<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DrivingBanResource\Pages;
use App\Models\DrivingBan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DrivingBanResource extends Resource
{
    protected static ?string $model = DrivingBan::class;
    protected static ?string $navigationIcon = 'heroicon-o-no-symbol';
    protected static ?string $navigationGroup = 'Tracking & Logistics';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Ban Details')->schema([
                Forms\Components\TextInput::make('title')->required()->maxLength(255),
                Forms\Components\TextInput::make('country_code')->required()->maxLength(2),
                Forms\Components\TextInput::make('country_name')->required()->maxLength(100),
                Forms\Components\TextInput::make('region')->maxLength(100),
                Forms\Components\Select::make('ban_type')
                    ->options([
                        'weekend' => 'Weekend Ban', 'night' => 'Night Ban',
                        'holiday' => 'Holiday Ban', 'seasonal' => 'Seasonal',
                        'weight' => 'Weight Restriction', 'zone' => 'Zone Restriction',
                    ])->required(),
                Forms\Components\Textarea::make('description')->rows(3),
                Forms\Components\Toggle::make('is_recurring'),
                Forms\Components\Toggle::make('is_active')->default(true),
            ])->columns(2),

            Forms\Components\Section::make('Schedule')->schema([
                Forms\Components\TimePicker::make('start_time'),
                Forms\Components\TimePicker::make('end_time'),
                Forms\Components\DatePicker::make('start_date'),
                Forms\Components\DatePicker::make('end_date'),
            ])->columns(4),

            Forms\Components\Section::make('Restrictions')->schema([
                Forms\Components\TextInput::make('min_weight_tons')->numeric()->suffix('t'),
                Forms\Components\TextInput::make('max_height_m')->numeric()->suffix('m'),
                Forms\Components\TextInput::make('max_width_m')->numeric()->suffix('m'),
                Forms\Components\TextInput::make('max_length_m')->numeric()->suffix('m'),
            ])->columns(4),

            Forms\Components\Section::make('Penalties')->schema([
                Forms\Components\TextInput::make('fine_min')->numeric()->prefix('€'),
                Forms\Components\TextInput::make('fine_max')->numeric()->prefix('€'),
                Forms\Components\TextInput::make('fine_currency')->maxLength(3)->default('EUR'),
                Forms\Components\TextInput::make('source_url')->url()->maxLength(500),
                Forms\Components\DatePicker::make('last_verified'),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->sortable()->limit(40),
                Tables\Columns\TextColumn::make('country_name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('region')->searchable(),
                Tables\Columns\TextColumn::make('ban_type')->badge(),
                Tables\Columns\TextColumn::make('start_time')->time(),
                Tables\Columns\TextColumn::make('end_time')->time(),
                Tables\Columns\TextColumn::make('min_weight_tons')->suffix('t'),
                Tables\Columns\TextColumn::make('fine_max')->money('EUR')->label('Max Fine'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\IconColumn::make('is_recurring')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('country_code')
                    ->options(['DE' => 'Germany', 'FR' => 'France', 'AT' => 'Austria', 'IT' => 'Italy', 'ES' => 'Spain', 'CH' => 'Switzerland', 'PL' => 'Poland', 'RO' => 'Romania']),
                Tables\Filters\SelectFilter::make('ban_type')
                    ->options(['weekend' => 'Weekend', 'night' => 'Night', 'holiday' => 'Holiday', 'seasonal' => 'Seasonal']),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDrivingBans::route('/'),
            'create' => Pages\CreateDrivingBan::route('/create'),
            'edit' => Pages\EditDrivingBan::route('/{record}/edit'),
        ];
    }
}
