<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ApiUsageLogResource\Pages;
use App\Models\ApiUsageLog;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ApiUsageLogResource extends Resource
{
    protected static ?string $model = ApiUsageLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?string $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('api_key_id')
                    ->relationship('apiKey', 'name')
                    ->required(),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->required(),
                Forms\Components\TextInput::make('endpoint')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Select::make('method')
                    ->options([
                        'GET' => 'GET',
                        'POST' => 'POST',
                        'PUT' => 'PUT',
                        'PATCH' => 'PATCH',
                        'DELETE' => 'DELETE',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('response_code')
                    ->numeric()
                    ->required(),
                Forms\Components\TextInput::make('response_time_ms')
                    ->numeric()
                    ->suffix('ms'),
                Forms\Components\TextInput::make('request_size_bytes')
                    ->numeric(),
                Forms\Components\TextInput::make('response_size_bytes')
                    ->numeric(),
                Forms\Components\TextInput::make('ip_address')
                    ->maxLength(45),
                Forms\Components\TextInput::make('user_agent')
                    ->maxLength(500),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('apiKey.name')
                    ->sortable(),
                Tables\Columns\TextColumn::make('endpoint')
                    ->searchable()
                    ->limit(40),
                Tables\Columns\TextColumn::make('method')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'GET' => 'info',
                        'POST' => 'success',
                        'PUT' => 'warning',
                        'DELETE' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('response_code')
                    ->badge()
                    ->color(fn (int $state): string => $state >= 400 ? 'danger' : ($state >= 300 ? 'warning' : 'success')),
                Tables\Columns\TextColumn::make('response_time_ms')
                    ->suffix(' ms')
                    ->sortable(),
                Tables\Columns\TextColumn::make('ip_address'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('method')
                    ->options([
                        'GET' => 'GET',
                        'POST' => 'POST',
                        'PUT' => 'PUT',
                        'PATCH' => 'PATCH',
                        'DELETE' => 'DELETE',
                    ]),
                Tables\Filters\Filter::make('response_code')
                    ->form([
                        Forms\Components\TextInput::make('response_code_from')
                            ->numeric()
                            ->placeholder('From'),
                        Forms\Components\TextInput::make('response_code_to')
                            ->numeric()
                            ->placeholder('To'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['response_code_from'], fn ($q, $v) => $q->where('response_code', '>=', $v))
                            ->when($data['response_code_to'], fn ($q, $v) => $q->where('response_code', '<=', $v));
                    }),
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
            'index' => Pages\ListApiUsageLogs::route('/'),
            'create' => Pages\CreateApiUsageLog::route('/create'),
            'edit' => Pages\EditApiUsageLog::route('/{record}/edit'),
        ];
    }
}
