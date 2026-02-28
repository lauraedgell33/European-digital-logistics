<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentTransactionResource\Pages;
use App\Models\PaymentTransaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PaymentTransactionResource extends Resource
{
    protected static ?string $model = PaymentTransaction::class;
    protected static ?string $navigationIcon = 'heroicon-o-credit-card';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Transaction Details')->schema([
                Forms\Components\TextInput::make('transaction_reference')->required()->maxLength(50),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')->searchable()->preload()->required(),
                Forms\Components\Select::make('invoice_id')
                    ->relationship('invoice', 'invoice_number')->searchable()->preload(),
                Forms\Components\Select::make('payment_provider')
                    ->options(['stripe' => 'Stripe', 'sepa' => 'SEPA', 'paypal' => 'PayPal', 'bank_transfer' => 'Bank Transfer'])
                    ->required(),
                Forms\Components\TextInput::make('provider_transaction_id')->maxLength(255),
                Forms\Components\Select::make('type')
                    ->options(['payment' => 'Payment', 'refund' => 'Refund', 'payout' => 'Payout', 'fee' => 'Fee'])
                    ->required(),
                Forms\Components\Select::make('status')
                    ->options(['pending' => 'Pending', 'processing' => 'Processing', 'completed' => 'Completed', 'failed' => 'Failed', 'refunded' => 'Refunded'])
                    ->required()->default('pending'),
            ])->columns(2),

            Forms\Components\Section::make('Amounts')->schema([
                Forms\Components\TextInput::make('amount')->numeric()->prefix('€')->required(),
                Forms\Components\TextInput::make('fee_amount')->numeric()->prefix('€')->default(0),
                Forms\Components\TextInput::make('net_amount')->numeric()->prefix('€'),
                Forms\Components\Select::make('currency')
                    ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP', 'RON' => 'RON', 'PLN' => 'PLN'])
                    ->default('EUR'),
                Forms\Components\DateTimePicker::make('completed_at'),
            ])->columns(3),

            Forms\Components\Section::make('Additional Info')->schema([
                Forms\Components\Textarea::make('failure_reason')->rows(2),
            ])->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('transaction_reference')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('company.name')->searchable()->label('Company'),
                Tables\Columns\TextColumn::make('invoice.invoice_number')->label('Invoice'),
                Tables\Columns\TextColumn::make('payment_provider')->badge(),
                Tables\Columns\TextColumn::make('amount')->money('EUR')->sortable(),
                Tables\Columns\TextColumn::make('fee_amount')->money('EUR')->label('Fee'),
                Tables\Columns\BadgeColumn::make('type')
                    ->colors(['primary' => 'payment', 'warning' => 'refund', 'success' => 'payout', 'gray' => 'fee']),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors(['secondary' => 'pending', 'primary' => 'processing', 'success' => 'completed', 'danger' => 'failed', 'warning' => 'refunded']),
                Tables\Columns\TextColumn::make('completed_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Pending', 'completed' => 'Completed', 'failed' => 'Failed']),
                Tables\Filters\SelectFilter::make('payment_provider')
                    ->options(['stripe' => 'Stripe', 'sepa' => 'SEPA', 'bank_transfer' => 'Bank Transfer']),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPaymentTransactions::route('/'),
            'create' => Pages\CreatePaymentTransaction::route('/create'),
            'edit' => Pages\EditPaymentTransaction::route('/{record}/edit'),
        ];
    }
}
