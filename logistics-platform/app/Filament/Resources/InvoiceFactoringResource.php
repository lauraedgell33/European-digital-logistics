<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InvoiceFactoringResource\Pages;
use App\Models\InvoiceFactoring;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class InvoiceFactoringResource extends Resource
{
    protected static ?string $model = InvoiceFactoring::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationGroup = 'Finance';

    protected static ?int $navigationSort = 4;
    protected static ?string $recordTitleAttribute = 'id';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('invoice_id')
                    ->relationship('invoice', 'invoice_number')
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('invoice_amount')
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\TextInput::make('advance_rate_pct')
                    ->numeric()
                    ->suffix('%'),
                Forms\Components\TextInput::make('advance_amount')
                    ->numeric()
                    ->prefix('€')
                    ->disabled(),
                Forms\Components\TextInput::make('fee_pct')
                    ->numeric()
                    ->suffix('%'),
                Forms\Components\TextInput::make('fee_amount')
                    ->numeric()
                    ->prefix('€')
                    ->disabled(),
                Forms\Components\TextInput::make('net_amount')
                    ->numeric()
                    ->prefix('€')
                    ->disabled(),
                Forms\Components\Select::make('currency')
                    ->options([
                        'EUR' => 'EUR',
                        'USD' => 'USD',
                        'GBP' => 'GBP',
                    ]),
                Forms\Components\Select::make('status')
                    ->options([
                        'requested' => 'Requested',
                        'under_review' => 'Under Review',
                        'approved' => 'Approved',
                        'funded' => 'Funded',
                        'collected' => 'Collected',
                        'rejected' => 'Rejected',
                    ]),
                Forms\Components\DateTimePicker::make('approved_at')
                    ->disabled(),
                Forms\Components\DateTimePicker::make('funded_at')
                    ->disabled(),
                Forms\Components\DateTimePicker::make('collected_at')
                    ->disabled(),
                Forms\Components\TextInput::make('days_to_maturity')
                    ->numeric(),
                Forms\Components\Textarea::make('notes')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('invoice.invoice_number'),
                Tables\Columns\TextColumn::make('company.name'),
                Tables\Columns\TextColumn::make('invoice_amount')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('advance_amount')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('fee_pct')
                    ->suffix('%'),
                Tables\Columns\TextColumn::make('net_amount')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'requested' => 'gray',
                        'under_review' => 'warning',
                        'approved' => 'info',
                        'funded' => 'success',
                        'collected' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('funded_at')
                    ->dateTime(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'requested' => 'Requested',
                        'under_review' => 'Under Review',
                        'approved' => 'Approved',
                        'funded' => 'Funded',
                        'collected' => 'Collected',
                        'rejected' => 'Rejected',
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
            'index' => Pages\ListInvoiceFactorings::route('/'),
            'create' => Pages\CreateInvoiceFactoring::route('/create'),
            'edit' => Pages\EditInvoiceFactoring::route('/{record}/edit'),
        ];
    }
}
