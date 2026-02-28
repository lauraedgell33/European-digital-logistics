<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InvoiceResource\Pages;
use App\Models\Invoice;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class InvoiceResource extends Resource
{
    protected static ?string $model = Invoice::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Invoice Details')->schema([
                Forms\Components\TextInput::make('invoice_number')
                    ->required()->maxLength(50)->unique(ignoreRecord: true),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')->searchable()->preload()->required(),
                Forms\Components\Select::make('customer_company_id')
                    ->relationship('customerCompany', 'name')->searchable()->preload()->required()
                    ->label('Customer Company'),
                Forms\Components\Select::make('transport_order_id')
                    ->relationship('transportOrder', 'order_number')->searchable()->preload()
                    ->label('Transport Order'),
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft', 'sent' => 'Sent', 'paid' => 'Paid',
                        'overdue' => 'Overdue', 'cancelled' => 'Cancelled', 'refunded' => 'Refunded',
                    ])->default('draft')->required(),
            ])->columns(2),

            Forms\Components\Section::make('Customer Info')->schema([
                Forms\Components\TextInput::make('customer_name')->maxLength(255),
                Forms\Components\Textarea::make('customer_address')->rows(2),
                Forms\Components\TextInput::make('customer_vat_number')->maxLength(50),
                Forms\Components\TextInput::make('customer_country')->maxLength(2),
            ])->columns(2),

            Forms\Components\Section::make('Amounts')->schema([
                Forms\Components\DatePicker::make('issue_date')->required(),
                Forms\Components\DatePicker::make('due_date')->required(),
                Forms\Components\TextInput::make('subtotal')->numeric()->prefix('€')->required(),
                Forms\Components\TextInput::make('tax_rate')->numeric()->suffix('%'),
                Forms\Components\TextInput::make('tax_amount')->numeric()->prefix('€'),
                Forms\Components\TextInput::make('total_amount')->numeric()->prefix('€')->required(),
                Forms\Components\TextInput::make('paid_amount')->numeric()->prefix('€')->default(0),
                Forms\Components\Select::make('currency')
                    ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP', 'RON' => 'RON', 'PLN' => 'PLN'])
                    ->default('EUR'),
            ])->columns(4),

            Forms\Components\Section::make('Payment Details')->schema([
                Forms\Components\TextInput::make('payment_terms')->maxLength(255),
                Forms\Components\TextInput::make('payment_method')->maxLength(50),
                Forms\Components\TextInput::make('bank_iban')->maxLength(34),
                Forms\Components\TextInput::make('bank_bic')->maxLength(11),
                Forms\Components\Textarea::make('notes')->rows(3),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('invoice_number')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('company.name')->searchable()->sortable()->label('Issuer'),
                Tables\Columns\TextColumn::make('customerCompany.name')->searchable()->label('Customer'),
                Tables\Columns\TextColumn::make('total_amount')->money('EUR')->sortable(),
                Tables\Columns\TextColumn::make('paid_amount')->money('EUR')->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'secondary' => 'draft', 'primary' => 'sent', 'success' => 'paid',
                        'danger' => 'overdue', 'warning' => 'cancelled', 'gray' => 'refunded',
                    ]),
                Tables\Columns\TextColumn::make('issue_date')->date()->sortable(),
                Tables\Columns\TextColumn::make('due_date')->date()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft', 'sent' => 'Sent', 'paid' => 'Paid',
                        'overdue' => 'Overdue', 'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('company')->relationship('company', 'name'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('markPaid')
                    ->icon('heroicon-o-check-circle')->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Invoice $record) => $record->status !== 'paid')
                    ->action(fn (Invoice $record) => $record->update([
                        'status' => 'paid', 'paid_amount' => $record->total_amount, 'paid_at' => now(),
                    ])),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()]),
            ]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInvoices::route('/'),
            'create' => Pages\CreateInvoice::route('/create'),
            'edit' => Pages\EditInvoice::route('/{record}/edit'),
        ];
    }
}
