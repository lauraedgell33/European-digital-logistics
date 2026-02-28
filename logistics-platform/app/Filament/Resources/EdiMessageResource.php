<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EdiMessageResource\Pages;
use App\Models\EdiMessage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class EdiMessageResource extends Resource
{
    protected static ?string $model = EdiMessage::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 4;
    protected static ?string $recordTitleAttribute = 'message_id';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->required(),
                Forms\Components\Select::make('erp_integration_id')
                    ->relationship('erpIntegration', 'name'),
                Forms\Components\Select::make('message_type')
                    ->options([
                        'IFTMIN' => 'IFTMIN',
                        'IFTSTA' => 'IFTSTA',
                        'INVOIC' => 'INVOIC',
                        'DESADV' => 'DESADV',
                        'COPARN' => 'COPARN',
                        'CUSTOM' => 'CUSTOM',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('message_reference')
                    ->maxLength(255),
                Forms\Components\Select::make('direction')
                    ->options([
                        'inbound' => 'Inbound',
                        'outbound' => 'Outbound',
                    ])
                    ->required(),
                Forms\Components\Select::make('format')
                    ->options([
                        'EDIFACT' => 'EDIFACT',
                        'XML' => 'XML',
                        'JSON' => 'JSON',
                        'CSV' => 'CSV',
                    ])
                    ->required(),
                Forms\Components\Textarea::make('raw_content')
                    ->columnSpanFull(),
                Forms\Components\Hidden::make('parsed_content')
                    ->default('{}'),
                Forms\Components\Hidden::make('validation_results')
                    ->default('{}'),
                Forms\Components\Toggle::make('is_valid')
                    ->disabled()
                    ->default(false),
                Forms\Components\Select::make('status')
                    ->options([
                        'received' => 'Received',
                        'parsed' => 'Parsed',
                        'validated' => 'Validated',
                        'processed' => 'Processed',
                        'failed' => 'Failed',
                    ])
                    ->required(),
                Forms\Components\Textarea::make('error_message')
                    ->columnSpanFull(),
                Forms\Components\Select::make('transport_order_id')
                    ->relationship('transportOrder', 'order_number'),
                Forms\Components\Select::make('invoice_id')
                    ->relationship('invoice', 'invoice_number'),
                Forms\Components\DateTimePicker::make('processed_at')
                    ->disabled(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('company.name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('message_type')
                    ->badge(),
                Tables\Columns\TextColumn::make('direction')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'inbound' => 'info',
                        'outbound' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('format'),
                Tables\Columns\IconColumn::make('is_valid')
                    ->boolean(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'received' => 'gray',
                        'parsed' => 'info',
                        'validated' => 'info',
                        'processed' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('processed_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'received' => 'Received',
                        'parsed' => 'Parsed',
                        'validated' => 'Validated',
                        'processed' => 'Processed',
                        'failed' => 'Failed',
                    ]),
                Tables\Filters\SelectFilter::make('direction')
                    ->options([
                        'inbound' => 'Inbound',
                        'outbound' => 'Outbound',
                    ]),
                Tables\Filters\SelectFilter::make('format')
                    ->options([
                        'EDIFACT' => 'EDIFACT',
                        'XML' => 'XML',
                        'JSON' => 'JSON',
                        'CSV' => 'CSV',
                    ]),
                Tables\Filters\SelectFilter::make('message_type')
                    ->options([
                        'IFTMIN' => 'IFTMIN',
                        'IFTSTA' => 'IFTSTA',
                        'INVOIC' => 'INVOIC',
                        'DESADV' => 'DESADV',
                        'COPARN' => 'COPARN',
                        'CUSTOM' => 'CUSTOM',
                    ]),
                Tables\Filters\TernaryFilter::make('is_valid'),
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
        return ['message_id', 'message_type'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEdiMessages::route('/'),
            'create' => Pages\CreateEdiMessage::route('/create'),
            'edit' => Pages\EditEdiMessage::route('/{record}/edit'),
        ];
    }
}
