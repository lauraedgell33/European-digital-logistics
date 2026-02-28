<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EscrowPaymentResource\Pages;
use App\Filament\Resources\EscrowPaymentResource\RelationManagers;
use App\Models\EscrowPayment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class EscrowPaymentResource extends Resource
{
    protected static ?string $model = EscrowPayment::class;
    protected static ?string $navigationIcon = 'heroicon-o-lock-closed';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 3;
    protected static ?string $recordTitleAttribute = 'payment_reference';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Escrow')->schema([
                Forms\Components\Tabs\Tab::make('Details')
                    ->icon('heroicon-o-lock-closed')
                    ->schema([
                        Forms\Components\Select::make('transport_order_id')
                            ->relationship('transportOrder', 'order_number')->searchable()->preload()->required(),
                        Forms\Components\Select::make('payer_company_id')
                            ->relationship('payer', 'name')->searchable()->preload()->required()->label('Payer'),
                        Forms\Components\Select::make('payee_company_id')
                            ->relationship('payee', 'name')->searchable()->preload()->required()->label('Payee'),
                        Forms\Components\TextInput::make('amount')->numeric()->prefix('€')->required(),
                        Forms\Components\Select::make('currency')
                            ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP'])->default('EUR'),
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending', 'funded' => 'Funded', 'released' => 'Released',
                                'disputed' => 'Disputed', 'refunded' => 'Refunded',
                            ])->default('pending')->required(),
                        Forms\Components\TextInput::make('payment_reference')->maxLength(100),
                        Forms\Components\TextInput::make('payment_method')->maxLength(50),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Timeline')
                    ->icon('heroicon-o-clock')
                    ->schema([
                        Forms\Components\DateTimePicker::make('funded_at'),
                        Forms\Components\DateTimePicker::make('released_at'),
                        Forms\Components\DateTimePicker::make('disputed_at'),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Dispute')
                    ->icon('heroicon-o-exclamation-triangle')
                    ->schema([
                        Forms\Components\Textarea::make('dispute_reason')->rows(2),
                        Forms\Components\Textarea::make('resolution_notes')->rows(2),
                        Forms\Components\Textarea::make('release_conditions')->rows(2),
                    ]),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('transportOrder.order_number')->searchable()->label('Order'),
                Tables\Columns\TextColumn::make('payer.name')->label('Payer'),
                Tables\Columns\TextColumn::make('payee.name')->label('Payee'),
                Tables\Columns\TextColumn::make('amount')->money('EUR')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'secondary', 'funded' => 'primary', 'released' => 'success', 'disputed' => 'danger', 'refunded' => 'warning',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('funded_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('released_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Pending', 'funded' => 'Funded', 'released' => 'Released', 'disputed' => 'Disputed']),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('release')
                    ->icon('heroicon-o-arrow-up-tray')->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (EscrowPayment $record) => $record->status === 'funded')
                    ->action(fn (EscrowPayment $record) => $record->update(['status' => 'released', 'released_at' => now()])),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['transportOrder', 'payer', 'payee']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('Escrow')->schema([
                Infolists\Components\Tabs\Tab::make('Details')->icon('heroicon-o-lock-closed')->schema([
                    Infolists\Components\TextEntry::make('transportOrder.order_number')->label('Transport Order'),
                    Infolists\Components\TextEntry::make('payer.name')->label('Payer'),
                    Infolists\Components\TextEntry::make('payee.name')->label('Payee'),
                    Infolists\Components\TextEntry::make('amount')->money('EUR'),
                    Infolists\Components\TextEntry::make('currency'),
                    Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                        'pending' => 'secondary', 'funded' => 'primary', 'released' => 'success',
                        'disputed' => 'danger', 'refunded' => 'warning', default => 'gray',
                    }),
                    Infolists\Components\TextEntry::make('payment_reference')->label('Payment Reference')->copyable(),
                    Infolists\Components\TextEntry::make('payment_method')->label('Payment Method'),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Timeline')->icon('heroicon-o-clock')->schema([
                    Infolists\Components\TextEntry::make('funded_at')->dateTime()->label('Funded At'),
                    Infolists\Components\TextEntry::make('released_at')->dateTime()->label('Released At'),
                    Infolists\Components\TextEntry::make('disputed_at')->dateTime()->label('Disputed At'),
                    Infolists\Components\TextEntry::make('created_at')->dateTime()->label('Created At'),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Dispute')->icon('heroicon-o-exclamation-triangle')->schema([
                    Infolists\Components\TextEntry::make('dispute_reason')->label('Dispute Reason'),
                    Infolists\Components\TextEntry::make('resolution_notes')->label('Resolution Notes'),
                    Infolists\Components\TextEntry::make('release_conditions')->label('Release Conditions'),
                ]),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['payment_reference', 'status'];
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
            RelationManagers\TransactionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEscrowPayments::route('/'),
            'create' => Pages\CreateEscrowPayment::route('/create'),
            'view' => Pages\ViewEscrowPayment::route('/{record}'),
            'edit' => Pages\EditEscrowPayment::route('/{record}/edit'),
        ];
    }
}
