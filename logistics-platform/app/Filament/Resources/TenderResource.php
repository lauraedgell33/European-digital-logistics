<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TenderResource\Pages;
use App\Filament\Resources\TenderResource\RelationManagers;
use App\Models\Tender;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Notifications\Notification;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class TenderResource extends Resource
{
    protected static ?string $model = Tender::class;
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationGroup = 'Marketplace';
    protected static ?int $navigationSort = 3;
    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Tender Information')->schema([
                Forms\Components\TextInput::make('title')
                    ->required()->maxLength(255)->columnSpanFull(),
                Forms\Components\Textarea::make('description')
                    ->rows(3)->columnSpanFull(),
                Forms\Components\TextInput::make('reference_number')
                    ->disabled()->dehydrated(false)->label('Reference'),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'open' => 'Open',
                        'closed' => 'Closed',
                        'awarded' => 'Awarded',
                        'cancelled' => 'Cancelled',
                    ])->required()->default('draft'),
            ])->columns(2),

            Forms\Components\Section::make('Route')->schema([
                Forms\Components\TextInput::make('route_origin_country')
                    ->required()->maxLength(2)->label('Origin Country'),
                Forms\Components\TextInput::make('route_origin_city')
                    ->required()->maxLength(100)->label('Origin City'),
                Forms\Components\TextInput::make('route_destination_country')
                    ->required()->maxLength(2)->label('Dest. Country'),
                Forms\Components\TextInput::make('route_destination_city')
                    ->required()->maxLength(100)->label('Dest. City'),
            ])->columns(4),

            Forms\Components\Section::make('Cargo & Vehicle')->schema([
                Forms\Components\Select::make('cargo_type')
                    ->options([
                        'general' => 'General',
                        'palletized' => 'Palletized',
                        'bulk' => 'Bulk',
                        'liquid' => 'Liquid',
                        'refrigerated' => 'Refrigerated',
                        'hazardous' => 'Hazardous',
                    ]),
                Forms\Components\Select::make('vehicle_type')
                    ->options([
                        'standard_truck' => 'Standard Truck',
                        'mega_trailer' => 'Mega Trailer',
                        'refrigerated' => 'Refrigerated',
                        'tanker' => 'Tanker',
                        'flatbed' => 'Flatbed',
                    ]),
                Forms\Components\TextInput::make('estimated_weight')
                    ->numeric()->suffix('kg'),
                Forms\Components\TextInput::make('estimated_volume')
                    ->numeric()->suffix('m³'),
            ])->columns(4),

            Forms\Components\Section::make('Schedule & Budget')->schema([
                Forms\Components\Select::make('frequency')
                    ->options([
                        'one_time' => 'One Time',
                        'daily' => 'Daily',
                        'weekly' => 'Weekly',
                        'monthly' => 'Monthly',
                    ]),
                Forms\Components\TextInput::make('shipments_per_period')->numeric(),
                Forms\Components\DatePicker::make('start_date')->required(),
                Forms\Components\DatePicker::make('end_date')->required(),
                Forms\Components\DatePicker::make('submission_deadline')->required(),
                Forms\Components\TextInput::make('budget')
                    ->numeric()->prefix('€'),
                Forms\Components\Select::make('currency')
                    ->options(['EUR' => 'EUR', 'USD' => 'USD', 'GBP' => 'GBP', 'PLN' => 'PLN'])
                    ->default('EUR'),
                Forms\Components\Select::make('budget_type')
                    ->options([
                        'total' => 'Total Budget',
                        'per_shipment' => 'Per Shipment',
                        'per_km' => 'Per Kilometer',
                    ]),
            ])->columns(4),

            Forms\Components\Section::make('Settings')->schema([
                Forms\Components\Toggle::make('is_public')->default(true),
                Forms\Components\TextInput::make('max_bidders')->numeric(),
                Forms\Components\Textarea::make('terms_conditions')
                    ->rows(3)->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reference_number')
                    ->searchable()->sortable()->label('Ref.'),
                Tables\Columns\TextColumn::make('title')
                    ->searchable()->sortable()->limit(40),
                Tables\Columns\TextColumn::make('company.name')
                    ->searchable()->sortable()->label('Company'),
                Tables\Columns\TextColumn::make('route_origin_city')
                    ->description(fn (Tender $r) => $r->route_destination_city)
                    ->label('Route'),
                Tables\Columns\TextColumn::make('budget')
                    ->money('eur')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'gray',
                    'open' => 'success',
                    'closed' => 'warning',
                    'awarded' => 'primary',
                    'cancelled' => 'danger',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('submission_deadline')
                    ->date()->sortable(),
                Tables\Columns\TextColumn::make('bids_count')
                    ->counts('bids')->label('Bids'),
                Tables\Columns\IconColumn::make('is_public')->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'open' => 'Open',
                        'closed' => 'Closed',
                        'awarded' => 'Awarded',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\TernaryFilter::make('is_public'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('close')
                    ->icon('heroicon-o-lock-closed')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->visible(fn (Tender $record) => in_array($record->status, ['open', 'active']))
                    ->action(function (Tender $record) {
                        $record->update(['status' => 'closed', 'closed_at' => now()]);
                        Notification::make()->title('Tender Closed')->warning()->send();
                    }),
                Tables\Actions\Action::make('extend')
                    ->icon('heroicon-o-clock')
                    ->color('info')
                    ->form([
                        Forms\Components\DatePicker::make('submission_deadline')->required()->label('New Deadline'),
                    ])
                    ->visible(fn (Tender $record) => in_array($record->status, ['open', 'active']))
                    ->action(function (Tender $record, array $data) {
                        $record->update(['submission_deadline' => $data['submission_deadline']]);
                        Notification::make()->title('Tender Deadline Extended')->success()->send();
                    }),
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
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['company']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Tender Information')->schema([
                Infolists\Components\TextEntry::make('title')->columnSpanFull(),
                Infolists\Components\TextEntry::make('description')->columnSpanFull(),
                Infolists\Components\TextEntry::make('reference_number')->label('Reference')->copyable(),
                Infolists\Components\TextEntry::make('company.name')->label('Company'),
                Infolists\Components\TextEntry::make('user.name')->label('User'),
                Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'gray', 'open' => 'success', 'closed' => 'warning',
                    'awarded' => 'primary', 'cancelled' => 'danger', default => 'gray',
                }),
            ])->columns(2),
            Infolists\Components\Section::make('Route')->schema([
                Infolists\Components\TextEntry::make('route_origin_country')->label('Origin Country'),
                Infolists\Components\TextEntry::make('route_origin_city')->label('Origin City'),
                Infolists\Components\TextEntry::make('route_destination_country')->label('Dest. Country'),
                Infolists\Components\TextEntry::make('route_destination_city')->label('Dest. City'),
            ])->columns(4),
            Infolists\Components\Section::make('Cargo & Vehicle')->schema([
                Infolists\Components\TextEntry::make('cargo_type')->label('Cargo Type'),
                Infolists\Components\TextEntry::make('vehicle_type')->label('Vehicle Type'),
                Infolists\Components\TextEntry::make('estimated_weight')->suffix(' kg')->label('Est. Weight'),
                Infolists\Components\TextEntry::make('estimated_volume')->suffix(' m³')->label('Est. Volume'),
            ])->columns(4),
            Infolists\Components\Section::make('Schedule & Budget')->schema([
                Infolists\Components\TextEntry::make('frequency'),
                Infolists\Components\TextEntry::make('shipments_per_period')->label('Shipments/Period'),
                Infolists\Components\TextEntry::make('start_date')->date()->label('Start Date'),
                Infolists\Components\TextEntry::make('end_date')->date()->label('End Date'),
                Infolists\Components\TextEntry::make('submission_deadline')->date()->label('Submission Deadline'),
                Infolists\Components\TextEntry::make('budget')->money('EUR'),
                Infolists\Components\TextEntry::make('currency'),
                Infolists\Components\TextEntry::make('budget_type')->label('Budget Type'),
            ])->columns(4),
            Infolists\Components\Section::make('Settings')->schema([
                Infolists\Components\IconEntry::make('is_public')->boolean()->label('Public'),
                Infolists\Components\TextEntry::make('max_bidders')->label('Max Bidders'),
                Infolists\Components\TextEntry::make('terms_conditions')->label('Terms & Conditions')->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'reference_number', 'status'];
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
            RelationManagers\BidsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTenders::route('/'),
            'create' => Pages\CreateTender::route('/create'),
            'view' => Pages\ViewTender::route('/{record}'),
            'edit' => Pages\EditTender::route('/{record}/edit'),
        ];
    }
}
