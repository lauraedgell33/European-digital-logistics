<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InvoiceResource\Pages;
use App\Filament\Resources\InvoiceResource\RelationManagers;
use App\Models\Invoice;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Notifications\Notification;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class InvoiceResource extends Resource
{
    protected static ?string $model = Invoice::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'invoice_number';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Invoice')->schema([
                Forms\Components\Tabs\Tab::make('Invoice')
                    ->icon('heroicon-o-document-text')
                    ->schema([
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
                Forms\Components\Tabs\Tab::make('Customer')
                    ->icon('heroicon-o-user')
                    ->schema([
                        Forms\Components\TextInput::make('customer_name')->maxLength(255),
                        Forms\Components\Textarea::make('customer_address')->rows(2),
                        Forms\Components\TextInput::make('customer_vat_number')->maxLength(50),
                        Forms\Components\TextInput::make('customer_country')->maxLength(2),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Amounts')
                    ->icon('heroicon-o-calculator')
                    ->schema([
                        Forms\Components\DatePicker::make('issue_date')->required(),
                        Forms\Components\DatePicker::make('due_date')->required()
                            ->helperText('Payment expected by this date'),
                        Forms\Components\TextInput::make('subtotal')->numeric()->prefix('€')->required(),
                        Forms\Components\TextInput::make('tax_rate')->numeric()->suffix('%'),
                        Forms\Components\TextInput::make('tax_amount')->numeric()->prefix('€'),
                        Forms\Components\TextInput::make('total_amount')->numeric()->prefix('€')->required()
                            ->placeholder('0.00'),
                        Forms\Components\TextInput::make('paid_amount')->numeric()->prefix('€')->default(0)
                            ->placeholder('0.00'),
                        Forms\Components\Select::make('currency')
                            ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP', 'RON' => 'RON', 'PLN' => 'PLN'])
                            ->default('EUR'),
                    ])->columns(4),
                Forms\Components\Tabs\Tab::make('Payment')
                    ->icon('heroicon-o-credit-card')
                    ->schema([
                        Forms\Components\TextInput::make('payment_terms')->maxLength(255),
                        Forms\Components\TextInput::make('payment_method')->maxLength(50),
                        Forms\Components\TextInput::make('bank_iban')->maxLength(34),
                        Forms\Components\TextInput::make('bank_bic')->maxLength(11),
                        Forms\Components\Textarea::make('notes')->rows(3),
                    ])->columns(2),
            ])->columnSpanFull(),
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
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'secondary', 'sent' => 'primary', 'paid' => 'success',
                    'overdue' => 'danger', 'cancelled' => 'warning', 'refunded' => 'gray',
                    default => 'gray',
                }),
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
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('generatePdf')
                    ->icon('heroicon-o-document-arrow-down')
                    ->color('gray')
                    ->label('PDF')
                    ->action(function (Invoice $record) {
                        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', ['invoice' => $record->load(['company', 'customerCompany', 'transportOrder'])]);
                        return response()->streamDownload(fn () => print($pdf->output()), $record->invoice_number . '.pdf');
                    }),
                Tables\Actions\Action::make('markPaid')
                    ->icon('heroicon-o-check-circle')->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Invoice $record) => $record->status !== 'paid')
                    ->action(fn (Invoice $record) => $record->update([
                        'status' => 'paid', 'paid_amount' => $record->total_amount, 'paid_at' => now(),
                    ])),
                Tables\Actions\Action::make('sendInvoice')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('primary')
                    ->requiresConfirmation()
                    ->visible(fn (Invoice $record) => in_array($record->status, ['draft']))
                    ->action(function (Invoice $record) {
                        $record->update(['status' => 'sent', 'sent_at' => now()]);
                        Notification::make()->title('Invoice Sent')->success()->send();
                    }),
                Tables\Actions\Action::make('recordPayment')
                    ->icon('heroicon-o-banknotes')
                    ->color('success')
                    ->form([
                        Forms\Components\TextInput::make('amount')->numeric()->prefix('€')->required(),
                        Forms\Components\DatePicker::make('paid_at')->required()->default(now()),
                        Forms\Components\Select::make('payment_method')->options(['bank_transfer' => 'Bank Transfer', 'stripe' => 'Stripe', 'paypal' => 'PayPal', 'sepa' => 'SEPA'])->required(),
                    ])
                    ->visible(fn (Invoice $record) => !in_array($record->status, ['paid', 'cancelled']))
                    ->action(function (Invoice $record, array $data) {
                        $newPaid = $record->paid_amount + $data['amount'];
                        $status = $newPaid >= $record->total_amount ? 'paid' : $record->status;
                        $record->update(['paid_amount' => $newPaid, 'status' => $status, 'paid_at' => $data['paid_at']]);
                        Notification::make()->title('Payment of €' . number_format($data['amount'], 2) . ' recorded')->success()->send();
                    }),
                Tables\Actions\Action::make('sendReminder')
                    ->icon('heroicon-o-bell-alert')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->visible(fn (Invoice $record) => in_array($record->status, ['sent', 'overdue']))
                    ->action(function (Invoice $record) {
                        Notification::make()->title('Payment Reminder Sent')->success()->send();
                    }),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('bulkMarkPaid')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion()
                        ->action(function (\Illuminate\Database\Eloquent\Collection $records) {
                            $records->each(fn ($r) => $r->update(['status' => 'paid', 'paid_amount' => $r->total_amount, 'paid_at' => now()]));
                            Notification::make()->title($records->count() . ' invoices marked as paid')->success()->send();
                        }),
                ]),
            ])
            ->emptyStateHeading('No invoices found')
            ->emptyStateDescription('Invoices will appear here once created.')
            ->emptyStateIcon('heroicon-o-document-text')
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['company', 'customerCompany', 'creator']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('Invoice')->schema([
                Infolists\Components\Tabs\Tab::make('Invoice')->icon('heroicon-o-document-text')->schema([
                    Infolists\Components\TextEntry::make('invoice_number')->label('Invoice Number')->copyable(),
                    Infolists\Components\TextEntry::make('company.name')->label('Issuer'),
                    Infolists\Components\TextEntry::make('customerCompany.name')->label('Customer Company'),
                    Infolists\Components\TextEntry::make('transportOrder.order_number')->label('Transport Order'),
                    Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                        'draft' => 'secondary', 'sent' => 'primary', 'paid' => 'success',
                        'overdue' => 'danger', 'cancelled' => 'warning', 'refunded' => 'gray', default => 'gray',
                    }),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Customer')->icon('heroicon-o-user')->schema([
                    Infolists\Components\TextEntry::make('customer_name')->label('Customer Name'),
                    Infolists\Components\TextEntry::make('customer_address')->label('Customer Address'),
                    Infolists\Components\TextEntry::make('customer_vat_number')->label('VAT Number')->copyable(),
                    Infolists\Components\TextEntry::make('customer_country')->label('Country'),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Amounts')->icon('heroicon-o-calculator')->schema([
                    Infolists\Components\TextEntry::make('issue_date')->date()->label('Issue Date'),
                    Infolists\Components\TextEntry::make('due_date')->date()->label('Due Date'),
                    Infolists\Components\TextEntry::make('subtotal')->money('EUR'),
                    Infolists\Components\TextEntry::make('tax_rate')->suffix('%')->label('Tax Rate'),
                    Infolists\Components\TextEntry::make('tax_amount')->money('EUR')->label('Tax Amount'),
                    Infolists\Components\TextEntry::make('total_amount')->money('EUR')->label('Total Amount'),
                    Infolists\Components\TextEntry::make('paid_amount')->money('EUR')->label('Paid Amount'),
                    Infolists\Components\TextEntry::make('currency'),
                ])->columns(4),
                Infolists\Components\Tabs\Tab::make('Payment')->icon('heroicon-o-credit-card')->schema([
                    Infolists\Components\TextEntry::make('payment_terms')->label('Payment Terms'),
                    Infolists\Components\TextEntry::make('payment_method')->label('Payment Method'),
                    Infolists\Components\TextEntry::make('bank_iban')->label('IBAN')->copyable(),
                    Infolists\Components\TextEntry::make('bank_bic')->label('BIC')->copyable(),
                    Infolists\Components\TextEntry::make('notes'),
                ])->columns(2),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['invoice_number', 'customer_name', 'status'];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        return [
            'Company' => $record->company?->name ?? '-',
            'Amount' => $record->total_amount ? '€' . number_format($record->total_amount, 2) : '-',
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\PaymentsRelationManager::class,
            RelationManagers\VatRecordsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInvoices::route('/'),
            'create' => Pages\CreateInvoice::route('/create'),
            'view' => Pages\ViewInvoice::route('/{record}'),
            'edit' => Pages\EditInvoice::route('/{record}/edit'),
        ];
    }
}
