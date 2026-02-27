<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TenderResource\Pages;
use App\Models\Tender;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TenderResource extends Resource
{
    protected static ?string $model = Tender::class;
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationGroup = 'Marketplace';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Tender Information')->schema([
                Forms\Components\TextInput::make('title')
                    ->required()->maxLength(255)->columnSpanFull(),
                Forms\Components\Textarea::make('description')
                    ->rows(3)->columnSpanFull(),
                Forms\Components\TextInput::make('reference_number')
                    ->disabled()->dehydrated(false)->label('Reference'),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'open' => 'Open',
                        'closed' => 'Closed',
                        'awarded' => 'Awarded',
                        'cancelled' => 'Cancelled',
                    ])->required()->default('draft'),
            ])->columns(2),

            Forms\Components\Section::make('Route')->schema([
                Forms\Components\TextInput::make('route_origin_country')
                    ->required()->maxLength(2)->label('Origin Country'),
                Forms\Components\TextInput::make('route_origin_city')
                    ->required()->maxLength(100)->label('Origin City'),
                Forms\Components\TextInput::make('route_destination_country')
                    ->required()->maxLength(2)->label('Dest. Country'),
                Forms\Components\TextInput::make('route_destination_city')
                    ->required()->maxLength(100)->label('Dest. City'),
            ])->columns(4),

            Forms\Components\Section::make('Cargo & Vehicle')->schema([
                Forms\Components\Select::make('cargo_type')
                    ->options([
                        'general' => 'General',
                        'palletized' => 'Palletized',
                        'bulk' => 'Bulk',
                        'liquid' => 'Liquid',
                        'refrigerated' => 'Refrigerated',
                        'hazardous' => 'Hazardous',
                    ]),
                Forms\Components\Select::make('vehicle_type')
                    ->options([
                        'standard_truck' => 'Standard Truck',
                        'mega_trailer' => 'Mega Trailer',
                        'refrigerated' => 'Refrigerated',
                        'tanker' => 'Tanker',
                        'flatbed' => 'Flatbed',
                    ]),
                Forms\Components\TextInput::make('estimated_weight')
                    ->numeric()->suffix('kg'),
                Forms\Components\TextInput::make('estimated_volume')
                    ->numeric()->suffix('m³'),
            ])->columns(4),

            Forms\Components\Section::make('Schedule & Budget')->schema([
                Forms\Components\Select::make('frequency')
                    ->options([
                        'one_time' => 'One Time',
                        'daily' => 'Daily',
                        'weekly' => 'Weekly',
                        'monthly' => 'Monthly',
                    ]),
                Forms\Components\TextInput::make('shipments_per_period')->numeric(),
                Forms\Components\DatePicker::make('start_date')->required(),
                Forms\Components\DatePicker::make('end_date')->required(),
                Forms\Components\DatePicker::make('submission_deadline')->required(),
                Forms\Components\TextInput::make('budget')
                    ->numeric()->prefix('€'),
                Forms\Components\Select::make('currency')
                    ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP', 'PLN' => 'PLN'])
                    ->default('EUR'),
                Forms\Components\Select::make('budget_type')
                    ->options([
                        'total' => 'Total Budget',
                        'per_shipment' => 'Per Shipment',
                        'per_km' => 'Per Kilometer',
                    ]),
            ])->columns(4),

            Forms\Components\Section::make('Settings')->schema([
                Forms\Components\Toggle::make('is_public')->default(true),
                Forms\Components\TextInput::make('max_bidders')->numeric(),
                Forms\Components\Textarea::make('terms_conditions')
                    ->rows(3)->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reference_number')
                    ->searchable()->sortable()->label('Ref.'),
                Tables\Columns\TextColumn::make('title')
                    ->searchable()->sortable()->limit(40),
                Tables\Columns\TextColumn::make('company.name')
                    ->searchable()->sortable()->label('Company'),
                Tables\Columns\TextColumn::make('route_origin_city')
                    ->description(fn (Tender $r) => $r->route_destination_city)
                    ->label('Route'),
                Tables\Columns\TextColumn::make('budget')
                    ->money('eur')->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'gray' => 'draft',
                        'success' => 'open',
                        'warning' => 'closed',
                        'primary' => 'awarded',
                        'danger' => 'cancelled',
                    ]),
                Tables\Columns\TextColumn::make('submission_deadline')
                    ->date()->sortable(),
                Tables\Columns\TextColumn::make('bids_count')
                    ->counts('bids')->label('Bids'),
                Tables\Columns\IconColumn::make('is_public')->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'open' => 'Open',
                        'closed' => 'Closed',
                        'awarded' => 'Awarded',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\TernaryFilter::make('is_public'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('close')
                    ->icon('heroicon-o-lock-closed')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->visible(fn (Tender $record) => $record->status === 'open')
                    ->action(fn (Tender $record) => $record->update(['status' => 'closed'])),
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
            'index' => Pages\ListTenders::route('/'),
            'create' => Pages\CreateTender::route('/create'),
            'edit' => Pages\EditTender::route('/{record}/edit'),
        ];
    }
}
