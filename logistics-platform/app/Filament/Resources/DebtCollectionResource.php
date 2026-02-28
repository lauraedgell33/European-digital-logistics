<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DebtCollectionResource\Pages;
use App\Models\DebtCollection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DebtCollectionResource extends Resource
{
    protected static ?string $model = DebtCollection::class;
    protected static ?string $navigationIcon = 'heroicon-o-exclamation-triangle';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Case Details')->schema([
                Forms\Components\Select::make('creditor_company_id')
                    ->relationship('creditor', 'name')->searchable()->preload()->required()->label('Creditor'),
                Forms\Components\Select::make('debtor_company_id')
                    ->relationship('debtor', 'name')->searchable()->preload()->label('Debtor Company'),
                Forms\Components\TextInput::make('debtor_name')->maxLength(255),
                Forms\Components\TextInput::make('debtor_email')->email(),
                Forms\Components\TextInput::make('debtor_phone')->tel(),
                Forms\Components\TextInput::make('debtor_country')->maxLength(2),
                Forms\Components\Select::make('status')
                    ->options([
                        'opened' => 'Opened', 'reminder_sent' => 'Reminder Sent',
                        'collection' => 'In Collection', 'legal' => 'Legal Action',
                        'resolved' => 'Resolved', 'written_off' => 'Written Off',
                    ])->default('opened')->required(),
            ])->columns(2),

            Forms\Components\Section::make('Invoice Details')->schema([
                Forms\Components\TextInput::make('invoice_number')->maxLength(50),
                Forms\Components\DatePicker::make('invoice_date'),
                Forms\Components\DatePicker::make('due_date'),
                Forms\Components\TextInput::make('original_amount')->numeric()->prefix('€')->required(),
                Forms\Components\TextInput::make('outstanding_amount')->numeric()->prefix('€')->required(),
                Forms\Components\TextInput::make('collected_amount')->numeric()->prefix('€')->default(0),
                Forms\Components\TextInput::make('collection_fee')->numeric()->prefix('€'),
                Forms\Components\Select::make('currency')
                    ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP'])->default('EUR'),
            ])->columns(4),

            Forms\Components\Section::make('Reminders & Notes')->schema([
                Forms\Components\TextInput::make('reminder_count')->numeric()->default(0),
                Forms\Components\DatePicker::make('last_reminder_date'),
                Forms\Components\Textarea::make('notes')->rows(3),
                Forms\Components\Textarea::make('resolution_notes')->rows(2),
                Forms\Components\DateTimePicker::make('resolved_at'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('creditor.name')->searchable()->label('Creditor'),
                Tables\Columns\TextColumn::make('debtor_name')->searchable()->label('Debtor'),
                Tables\Columns\TextColumn::make('invoice_number')->searchable(),
                Tables\Columns\TextColumn::make('original_amount')->money('EUR')->sortable(),
                Tables\Columns\TextColumn::make('outstanding_amount')->money('EUR')->sortable()
                    ->color(fn ($state) => $state > 0 ? 'danger' : 'success'),
                Tables\Columns\TextColumn::make('collected_amount')->money('EUR'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'secondary' => 'opened', 'warning' => 'reminder_sent',
                        'primary' => 'collection', 'danger' => 'legal',
                        'success' => 'resolved', 'gray' => 'written_off',
                    ]),
                Tables\Columns\TextColumn::make('reminder_count')->label('Reminders'),
                Tables\Columns\TextColumn::make('due_date')->date()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['opened' => 'Opened', 'reminder_sent' => 'Reminder Sent', 'collection' => 'Collection', 'legal' => 'Legal', 'resolved' => 'Resolved']),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('sendReminder')
                    ->icon('heroicon-o-envelope')->color('primary')
                    ->requiresConfirmation()
                    ->visible(fn (DebtCollection $record) => !in_array($record->status, ['resolved', 'written_off']))
                    ->action(fn (DebtCollection $record) => $record->update([
                        'reminder_count' => $record->reminder_count + 1,
                        'last_reminder_date' => now(),
                        'status' => 'reminder_sent',
                    ])),
            ])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDebtCollections::route('/'),
            'create' => Pages\CreateDebtCollection::route('/create'),
            'edit' => Pages\EditDebtCollection::route('/{record}/edit'),
        ];
    }
}
