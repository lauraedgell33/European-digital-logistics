<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TenderBidResource\Pages;
use App\Models\TenderBid;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class TenderBidResource extends Resource
{
    protected static ?string $model = TenderBid::class;
    protected static ?string $navigationIcon = 'heroicon-o-hand-raised';
    protected static ?string $navigationGroup = 'Marketplace';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Bid Information')->schema([
                Forms\Components\Select::make('tender_id')
                    ->relationship('tender', 'title')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()->preload()->required(),
            ])->columns(3),

            Forms\Components\Section::make('Proposal')->schema([
                Forms\Components\TextInput::make('proposed_price')
                    ->numeric()->prefix('€')->required(),
                Forms\Components\Select::make('currency')
                    ->options([
                        'EUR' => 'EUR',
                        'USD' => 'USD',
                        'GBP' => 'GBP',
                        'PLN' => 'PLN',
                        'RON' => 'RON',
                    ])->default('EUR')->required(),
                Forms\Components\TextInput::make('transit_time_hours')
                    ->numeric()->suffix('h')->label('Transit Time'),
                Forms\Components\Textarea::make('proposal')
                    ->rows(4)->columnSpanFull(),
            ])->columns(3),

            Forms\Components\Section::make('Status & Evaluation')->schema([
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'submitted' => 'Submitted',
                        'under_review' => 'Under Review',
                        'accepted' => 'Accepted',
                        'rejected' => 'Rejected',
                        'withdrawn' => 'Withdrawn',
                    ])->required()->default('draft'),
                Forms\Components\TextInput::make('score')
                    ->numeric(),
                Forms\Components\DateTimePicker::make('submitted_at'),
                Forms\Components\Textarea::make('evaluation_notes')
                    ->rows(3)->columnSpanFull(),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('tender.title')
                    ->searchable()->sortable()->limit(25)->label('Tender'),
                Tables\Columns\TextColumn::make('company.name')
                    ->searchable()->sortable()->label('Company'),
                Tables\Columns\TextColumn::make('proposed_price')
                    ->money('EUR')->sortable()->label('Price'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'gray' => fn ($state) => in_array($state, ['draft', 'withdrawn']),
                        'info' => 'submitted',
                        'warning' => 'under_review',
                        'success' => 'accepted',
                        'danger' => 'rejected',
                    ]),
                Tables\Columns\TextColumn::make('score')
                    ->sortable(),
                Tables\Columns\TextColumn::make('submitted_at')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('submitted_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'submitted' => 'Submitted',
                        'under_review' => 'Under Review',
                        'accepted' => 'Accepted',
                        'rejected' => 'Rejected',
                        'withdrawn' => 'Withdrawn',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('accept_selected')
                        ->label('Accept Selected')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(fn (Collection $records) => $records->each(fn ($record) => $record->update(['status' => 'accepted']))),
                    Tables\Actions\BulkAction::make('reject_selected')
                        ->label('Reject Selected')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(fn (Collection $records) => $records->each(fn ($record) => $record->update(['status' => 'rejected']))),
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
            'index' => Pages\ListTenderBids::route('/'),
            'create' => Pages\CreateTenderBid::route('/create'),
            'edit' => Pages\EditTenderBid::route('/{record}/edit'),
        ];
    }
}
