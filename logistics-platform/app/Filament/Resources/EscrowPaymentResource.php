<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EscrowPaymentResource\Pages;
use App\Models\EscrowPayment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class EscrowPaymentResource extends Resource
{
    protected static ?string $model = EscrowPayment::class;
    protected static ?string $navigationIcon = 'heroicon-o-lock-closed';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Escrow Details')->schema([
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

            Forms\Components\Section::make('Timeline')->schema([
                Forms\Components\DateTimePicker::make('funded_at'),
                Forms\Components\DateTimePicker::make('released_at'),
                Forms\Components\DateTimePicker::make('disputed_at'),
            ])->columns(3),

            Forms\Components\Section::make('Dispute Info')->schema([
                Forms\Components\Textarea::make('dispute_reason')->rows(2),
                Forms\Components\Textarea::make('resolution_notes')->rows(2),
                Forms\Components\Textarea::make('release_conditions')->rows(2),
            ])->collapsed(),
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
                Tables\Columns\BadgeColumn::make('status')
                    ->colors(['secondary' => 'pending', 'primary' => 'funded', 'success' => 'released', 'danger' => 'disputed', 'warning' => 'refunded']),
                Tables\Columns\TextColumn::make('funded_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('released_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Pending', 'funded' => 'Funded', 'released' => 'Released', 'disputed' => 'Disputed']),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('release')
                    ->icon('heroicon-o-arrow-up-tray')->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (EscrowPayment $record) => $record->status === 'funded')
                    ->action(fn (EscrowPayment $record) => $record->update(['status' => 'released', 'released_at' => now()])),
            ])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEscrowPayments::route('/'),
            'create' => Pages\CreateEscrowPayment::route('/create'),
            'edit' => Pages\EditEscrowPayment::route('/{record}/edit'),
        ];
    }
}
