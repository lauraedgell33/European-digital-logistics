<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VatRecordResource\Pages;
use App\Models\VatRecord;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class VatRecordResource extends Resource
{
    protected static ?string $model = VatRecord::class;

    protected static ?string $navigationIcon = 'heroicon-o-receipt-percent';

    protected static ?string $navigationGroup = 'Finance';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('invoice_id')
                    ->relationship('invoice', 'invoice_number')
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('transport_order_id')
                    ->relationship('transportOrder', 'order_number')
                    ->searchable()
                    ->preload(),

                Forms\Components\TextInput::make('origin_country')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('destination_country')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('taxable_amount')
                    ->required()
                    ->numeric()
                    ->prefix('€'),

                Forms\Components\TextInput::make('vat_rate')
                    ->required()
                    ->numeric()
                    ->suffix('%'),

                Forms\Components\TextInput::make('vat_amount')
                    ->required()
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

                Forms\Components\TextInput::make('vat_number_seller')
                    ->maxLength(255),

                Forms\Components\TextInput::make('vat_number_buyer')
                    ->maxLength(255),

                Forms\Components\Toggle::make('is_reverse_charge')
                    ->default(false),

                Forms\Components\Toggle::make('is_intra_community')
                    ->default(false),

                Forms\Components\Select::make('vat_scheme')
                    ->options([
                        'standard' => 'Standard',
                        'reverse_charge' => 'Reverse Charge',
                        'intra_community' => 'Intra-Community',
                        'exempt' => 'Exempt',
                    ])
                    ->required(),

                Forms\Components\DatePicker::make('tax_period')
                    ->required(),

                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'submitted' => 'Submitted',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ])
                    ->default('draft')
                    ->required(),

                Forms\Components\Hidden::make('supporting_documents'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),

                Tables\Columns\TextColumn::make('company.name')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('origin_country')
                    ->searchable(),

                Tables\Columns\TextColumn::make('destination_country')
                    ->searchable(),

                Tables\Columns\TextColumn::make('taxable_amount')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('vat_rate')
                    ->suffix('%')
                    ->sortable(),

                Tables\Columns\TextColumn::make('vat_amount')
                    ->money('EUR')
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_reverse_charge')
                    ->boolean(),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'submitted' => 'warning',
                        'approved' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('tax_period')
                    ->date()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'submitted' => 'Submitted',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ]),

                Tables\Filters\TernaryFilter::make('is_reverse_charge'),

                Tables\Filters\TernaryFilter::make('is_intra_community'),

                Tables\Filters\SelectFilter::make('vat_scheme')
                    ->options([
                        'standard' => 'Standard',
                        'reverse_charge' => 'Reverse Charge',
                        'intra_community' => 'Intra-Community',
                        'exempt' => 'Exempt',
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
            'index' => Pages\ListVatRecords::route('/'),
            'create' => Pages\CreateVatRecord::route('/create'),
            'edit' => Pages\EditVatRecord::route('/{record}/edit'),
        ];
    }
}
