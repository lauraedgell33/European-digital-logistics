<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentTransactionResource\Pages;
use App\Models\PaymentTransaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PaymentTransactionResource extends Resource
{
    protected static ?string $model = PaymentTransaction::class;
    protected static ?string $navigationIcon = 'heroicon-o-credit-card';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'transaction_reference';

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
                Tables\Columns\TextColumn::make('type')->badge()->color(fn (string $state): string => match ($state) {
                    'payment' => 'primary', 'refund' => 'warning', 'payout' => 'success', 'fee' => 'gray',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'secondary', 'processing' => 'primary', 'completed' => 'success', 'failed' => 'danger', 'refunded' => 'warning',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('completed_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Pending', 'completed' => 'Completed', 'failed' => 'Failed']),
                Tables\Filters\SelectFilter::make('payment_provider')
                    ->options(['stripe' => 'Stripe', 'sepa' => 'SEPA', 'bank_transfer' => 'Bank Transfer']),
                Tables\Filters\Filter::make('completed_at')
                    ->form([
                        Forms\Components\DatePicker::make('from')->label('From'),
                        Forms\Components\DatePicker::make('until')->label('Until'),
                    ])
                    ->query(function (\Illuminate\Database\Eloquent\Builder $query, array $data): \Illuminate\Database\Eloquent\Builder {
                        return $query
                            ->when($data['from'], fn ($q, $date) => $q->whereDate('completed_at', '>=', $date))
                            ->when($data['until'], fn ($q, $date) => $q->whereDate('completed_at', '<=', $date));
                    })
                    ->indicateUsing(function (array $data): array {
                        $indicators = [];
                        if ($data['from'] ?? null) $indicators[] = 'From ' . \Carbon\Carbon::parse($data['from'])->format('M d, Y');
                        if ($data['until'] ?? null) $indicators[] = 'Until ' . \Carbon\Carbon::parse($data['until'])->format('M d, Y');
                        return $indicators;
                    }),
            ])
            ->actions([Tables\Actions\ViewAction::make(), Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])])
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['invoice', 'company']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Transaction Details')->schema([
                Infolists\Components\TextEntry::make('transaction_reference')->label('Transaction Reference')->copyable(),
                Infolists\Components\TextEntry::make('company.name')->label('Company'),
                Infolists\Components\TextEntry::make('invoice.invoice_number')->label('Invoice'),
                Infolists\Components\TextEntry::make('payment_provider')->badge()->label('Payment Provider'),
                Infolists\Components\TextEntry::make('provider_transaction_id')->label('Provider Transaction ID')->copyable(),
                Infolists\Components\TextEntry::make('type')->badge()->color(fn (string $state): string => match ($state) {
                    'payment' => 'primary', 'refund' => 'warning', 'payout' => 'success', 'fee' => 'gray', default => 'gray',
                }),
                Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'secondary', 'processing' => 'primary', 'completed' => 'success',
                    'failed' => 'danger', 'refunded' => 'warning', default => 'gray',
                }),
            ])->columns(2),
            Infolists\Components\Section::make('Amounts')->schema([
                Infolists\Components\TextEntry::make('amount')->money('EUR'),
                Infolists\Components\TextEntry::make('fee_amount')->money('EUR')->label('Fee'),
                Infolists\Components\TextEntry::make('net_amount')->money('EUR')->label('Net Amount'),
                Infolists\Components\TextEntry::make('currency'),
                Infolists\Components\TextEntry::make('completed_at')->dateTime()->label('Completed At'),
            ])->columns(3),
            Infolists\Components\Section::make('Additional Info')->schema([
                Infolists\Components\TextEntry::make('failure_reason')->label('Failure Reason'),
                Infolists\Components\TextEntry::make('created_at')->dateTime(),
            ])->columns(2),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['transaction_reference', 'status'];
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPaymentTransactions::route('/'),
            'create' => Pages\CreatePaymentTransaction::route('/create'),
            'view' => Pages\ViewPaymentTransaction::route('/{record}'),
            'edit' => Pages\EditPaymentTransaction::route('/{record}/edit'),
        ];
    }
}
