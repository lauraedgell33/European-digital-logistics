<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SmartContractResource\Pages;
use App\Filament\Resources\SmartContractResource\RelationManagers;
use App\Models\SmartContract;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SmartContractResource extends Resource
{
    protected static ?string $model = SmartContract::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-check';

    protected static ?string $navigationGroup = 'Platform';

    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'contract_name';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Contract Details')
                    ->schema([
                        Forms\Components\TextInput::make('contract_hash')
                            ->disabled()
                            ->dehydrated()
                            ->copyable(),
                        Forms\Components\Select::make('transport_order_id')
                            ->relationship('transportOrder', 'order_number')
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('party_a_company_id')
                            ->relationship('partyA', 'name')
                            ->label('Party A')
                            ->required()
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('party_b_company_id')
                            ->relationship('partyB', 'name')
                            ->label('Party B')
                            ->required()
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('contract_type')
                            ->options([
                                'delivery_guarantee' => 'Delivery Guarantee',
                                'payment_escrow' => 'Payment Escrow',
                                'penalty_clause' => 'Penalty Clause',
                                'temperature_sla' => 'Temperature SLA',
                            ])
                            ->required(),
                    ])->columns(2),

                Forms\Components\Section::make('Conditions & Actions')
                    ->schema([
                        Forms\Components\Repeater::make('conditions')
                            ->schema([
                                Forms\Components\TextInput::make('key')
                                    ->required(),
                                Forms\Components\TextInput::make('value')
                                    ->required(),
                            ])
                            ->columns(2)
                            ->hidden(),
                        Forms\Components\Repeater::make('actions')
                            ->schema([
                                Forms\Components\TextInput::make('key')
                                    ->required(),
                                Forms\Components\TextInput::make('value')
                                    ->required(),
                            ])
                            ->columns(2)
                            ->hidden(),
                    ]),

                Forms\Components\Section::make('Value & Status')
                    ->schema([
                        Forms\Components\TextInput::make('value')
                            ->numeric()
                            ->prefix('€'),
                        Forms\Components\Select::make('currency')
                            ->options([
                                'EUR' => 'EUR',
                                'USD' => 'USD',
                                'GBP' => 'GBP',
                            ])
                            ->default('EUR'),
                        Forms\Components\Toggle::make('condition_met')
                            ->disabled()
                            ->dehydrated(),
                        Forms\Components\Toggle::make('action_executed')
                            ->disabled()
                            ->dehydrated(),
                        Forms\Components\DateTimePicker::make('triggered_at')
                            ->disabled()
                            ->dehydrated(),
                        Forms\Components\DateTimePicker::make('executed_at')
                            ->disabled()
                            ->dehydrated(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'draft' => 'Draft',
                                'active' => 'Active',
                                'triggered' => 'Triggered',
                                'executed' => 'Executed',
                                'expired' => 'Expired',
                                'cancelled' => 'Cancelled',
                            ])
                            ->default('draft')
                            ->required(),
                        Forms\Components\DateTimePicker::make('expires_at'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('contract_hash')
                    ->limit(12)
                    ->copyable(),
                Tables\Columns\TextColumn::make('transportOrder.order_number')
                    ->label('Order #')
                    ->sortable(),
                Tables\Columns\TextColumn::make('contract_type')
                    ->badge(),
                Tables\Columns\TextColumn::make('partyA.name')
                    ->label('Party A'),
                Tables\Columns\TextColumn::make('partyB.name')
                    ->label('Party B'),
                Tables\Columns\TextColumn::make('value')
                    ->money('EUR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'active' => 'info',
                        'triggered' => 'warning',
                        'executed' => 'success',
                        'expired' => 'gray',
                        'cancelled' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('expires_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'active' => 'Active',
                        'triggered' => 'Triggered',
                        'executed' => 'Executed',
                        'expired' => 'Expired',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('contract_type')
                    ->options([
                        'delivery_guarantee' => 'Delivery Guarantee',
                        'payment_escrow' => 'Payment Escrow',
                        'penalty_clause' => 'Penalty Clause',
                        'temperature_sla' => 'Temperature SLA',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['transportOrder']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Contract Details')->schema([
                Infolists\Components\TextEntry::make('contract_hash')->label('Contract Hash')->copyable(),
                Infolists\Components\TextEntry::make('transportOrder.order_number')->label('Transport Order'),
                Infolists\Components\TextEntry::make('partyA.name')->label('Party A'),
                Infolists\Components\TextEntry::make('partyB.name')->label('Party B'),
                Infolists\Components\TextEntry::make('contract_type')->badge()->label('Contract Type'),
            ])->columns(2),
            Infolists\Components\Section::make('Value & Status')->schema([
                Infolists\Components\TextEntry::make('value')->money('EUR'),
                Infolists\Components\TextEntry::make('currency'),
                Infolists\Components\IconEntry::make('condition_met')->boolean()->label('Condition Met'),
                Infolists\Components\IconEntry::make('action_executed')->boolean()->label('Action Executed'),
                Infolists\Components\TextEntry::make('triggered_at')->dateTime()->label('Triggered At'),
                Infolists\Components\TextEntry::make('executed_at')->dateTime()->label('Executed At'),
                Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'gray', 'active' => 'info', 'triggered' => 'warning',
                    'executed' => 'success', 'expired' => 'gray', 'cancelled' => 'danger', default => 'gray',
                }),
                Infolists\Components\TextEntry::make('expires_at')->dateTime()->label('Expires At'),
            ])->columns(2),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['contract_name', 'status'];
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\TransportOrderRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSmartContracts::route('/'),
            'create' => Pages\CreateSmartContract::route('/create'),
            'view' => Pages\ViewSmartContract::route('/{record}'),
            'edit' => Pages\EditSmartContract::route('/{record}/edit'),
        ];
    }
}
