<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EcmrDocumentResource\Pages;
use App\Filament\Resources\EcmrDocumentResource\RelationManagers;
use App\Models\EcmrDocument;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class EcmrDocumentResource extends Resource
{
    protected static ?string $model = EcmrDocument::class;
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';
    protected static ?string $navigationGroup = 'Documents';
    protected static ?string $navigationLabel = 'eCMR Documents';
    protected static ?int $navigationSort = 6;
    protected static ?string $recordTitleAttribute = 'document_number';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('eCMR')->schema([
                Forms\Components\Tabs\Tab::make('General')
                    ->icon('heroicon-o-document-check')
                    ->schema([
                        Forms\Components\TextInput::make('ecmr_number')->required()->maxLength(50),
                        Forms\Components\Select::make('transport_order_id')
                            ->relationship('transportOrder', 'order_number')->searchable()->preload(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'draft' => 'Draft', 'issued' => 'Issued', 'in_transit' => 'In Transit',
                                'delivered' => 'Delivered', 'completed' => 'Completed', 'cancelled' => 'Cancelled',
                            ])->default('draft')->required(),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Parties')
                    ->icon('heroicon-o-user-group')
                    ->schema([
                        Forms\Components\Section::make('Sender')->schema([
                            Forms\Components\Select::make('sender_company_id')
                                ->relationship('senderCompany', 'name')->searchable()->preload(),
                            Forms\Components\TextInput::make('sender_name')->maxLength(255),
                            Forms\Components\TextInput::make('sender_address')->maxLength(500),
                            Forms\Components\Select::make('sender_country')
                                ->options(\App\Support\CountryHelper::europeanCountries())
                                ->searchable()
                                ->preload(),
                        ])->columns(2),
                        Forms\Components\Section::make('Carrier')->schema([
                            Forms\Components\Select::make('carrier_company_id')
                                ->relationship('carrierCompany', 'name')->searchable()->preload(),
                            Forms\Components\TextInput::make('carrier_name')->maxLength(255),
                            Forms\Components\TextInput::make('carrier_address')->maxLength(500),
                            Forms\Components\Select::make('carrier_country')
                                ->options(\App\Support\CountryHelper::europeanCountries())
                                ->searchable()
                                ->preload(),
                        ])->columns(2),
                        Forms\Components\Section::make('Consignee')->schema([
                            Forms\Components\Select::make('consignee_company_id')
                                ->relationship('consigneeCompany', 'name')->searchable()->preload(),
                            Forms\Components\TextInput::make('consignee_name')->maxLength(255),
                            Forms\Components\TextInput::make('consignee_address')->maxLength(500),
                            Forms\Components\Select::make('consignee_country')
                                ->options(\App\Support\CountryHelper::europeanCountries())
                                ->searchable()
                                ->preload(),
                        ])->columns(2),
                    ]),
                Forms\Components\Tabs\Tab::make('Cargo')
                    ->icon('heroicon-o-cube')
                    ->schema([
                        Forms\Components\TextInput::make('gross_weight_kg')->numeric()->suffix('kg'),
                        Forms\Components\TextInput::make('number_of_packages')->numeric(),
                        Forms\Components\TextInput::make('packaging_method')->maxLength(255),
                        Forms\Components\Toggle::make('is_hazardous'),
                        Forms\Components\TextInput::make('adr_class')->maxLength(10)
                            ->visible(fn (Forms\Get $get) => $get('is_hazardous')),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Transport')
                    ->icon('heroicon-o-truck')
                    ->schema([
                        Forms\Components\TextInput::make('place_of_taking_over')->maxLength(255),
                        Forms\Components\DatePicker::make('date_of_taking_over'),
                        Forms\Components\TextInput::make('place_of_delivery')->maxLength(255),
                        Forms\Components\DatePicker::make('date_of_delivery'),
                        Forms\Components\Textarea::make('special_instructions')->rows(2)->columnSpanFull(),
                        Forms\Components\TextInput::make('blockchain_tx_hash')->maxLength(255)->disabled(),
                        Forms\Components\TextInput::make('blockchain_network')->maxLength(50)->disabled(),
                        Forms\Components\TextInput::make('ipfs_hash')->maxLength(255)->disabled(),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Signatures')
                    ->icon('heroicon-o-pencil-square')
                    ->schema([
                        Forms\Components\TextInput::make('sender_signature_hash')->disabled(),
                        Forms\Components\DateTimePicker::make('sender_signed_at')->disabled(),
                        Forms\Components\TextInput::make('carrier_signature_hash')->disabled(),
                        Forms\Components\DateTimePicker::make('carrier_signed_at')->disabled(),
                        Forms\Components\TextInput::make('consignee_signature_hash')->disabled(),
                        Forms\Components\DateTimePicker::make('consignee_signed_at')->disabled(),
                    ])->columns(2),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('ecmr_number')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('transportOrder.order_number')->label('Order'),
                Tables\Columns\TextColumn::make('senderCompany.name')->label('Sender')->limit(20),
                Tables\Columns\TextColumn::make('carrierCompany.name')->label('Carrier')->limit(20),
                Tables\Columns\TextColumn::make('consigneeCompany.name')->label('Consignee')->limit(20),
                Tables\Columns\TextColumn::make('gross_weight_kg')->suffix(' kg')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'secondary', 'issued' => 'primary', 'in_transit' => 'warning',
                    'delivered' => 'success', 'completed' => 'success', 'cancelled' => 'danger',
                    default => 'gray',
                }),
                Tables\Columns\IconColumn::make('is_hazardous')->boolean()->label('ADR'),
                Tables\Columns\TextColumn::make('date_of_taking_over')->date()->label('Pickup'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'issued' => 'Issued', 'in_transit' => 'In Transit', 'delivered' => 'Delivered', 'completed' => 'Completed']),
                Tables\Filters\TernaryFilter::make('is_hazardous'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('eCMR')->schema([
                Infolists\Components\Tabs\Tab::make('General')->icon('heroicon-o-document-check')->schema([
                    Infolists\Components\TextEntry::make('ecmr_number')->label('eCMR Number')->copyable(),
                    Infolists\Components\TextEntry::make('transportOrder.order_number')->label('Transport Order'),
                    Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                        'draft' => 'secondary', 'issued' => 'primary', 'in_transit' => 'warning',
                        'delivered' => 'success', 'completed' => 'success', 'cancelled' => 'danger', default => 'gray',
                    }),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Parties')->icon('heroicon-o-user-group')->schema([
                    Infolists\Components\TextEntry::make('senderCompany.name')->label('Sender Company'),
                    Infolists\Components\TextEntry::make('sender_name')->label('Sender Name'),
                    Infolists\Components\TextEntry::make('sender_address')->label('Sender Address'),
                    Infolists\Components\TextEntry::make('sender_country')->label('Sender Country'),
                    Infolists\Components\TextEntry::make('carrierCompany.name')->label('Carrier Company'),
                    Infolists\Components\TextEntry::make('carrier_name')->label('Carrier Name'),
                    Infolists\Components\TextEntry::make('carrier_address')->label('Carrier Address'),
                    Infolists\Components\TextEntry::make('carrier_country')->label('Carrier Country'),
                    Infolists\Components\TextEntry::make('consigneeCompany.name')->label('Consignee Company'),
                    Infolists\Components\TextEntry::make('consignee_name')->label('Consignee Name'),
                    Infolists\Components\TextEntry::make('consignee_address')->label('Consignee Address'),
                    Infolists\Components\TextEntry::make('consignee_country')->label('Consignee Country'),
                ])->columns(4),
                Infolists\Components\Tabs\Tab::make('Cargo')->icon('heroicon-o-cube')->schema([
                    Infolists\Components\TextEntry::make('gross_weight_kg')->suffix(' kg')->label('Gross Weight'),
                    Infolists\Components\TextEntry::make('number_of_packages')->label('Number of Packages'),
                    Infolists\Components\TextEntry::make('packaging_method')->label('Packaging Method'),
                    Infolists\Components\IconEntry::make('is_hazardous')->boolean()->label('Hazardous'),
                    Infolists\Components\TextEntry::make('adr_class')->label('ADR Class'),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Transport')->icon('heroicon-o-truck')->schema([
                    Infolists\Components\TextEntry::make('place_of_taking_over')->label('Place of Taking Over'),
                    Infolists\Components\TextEntry::make('date_of_taking_over')->date()->label('Date of Taking Over'),
                    Infolists\Components\TextEntry::make('place_of_delivery')->label('Place of Delivery'),
                    Infolists\Components\TextEntry::make('date_of_delivery')->date()->label('Date of Delivery'),
                    Infolists\Components\TextEntry::make('special_instructions')->label('Special Instructions')->columnSpanFull(),
                    Infolists\Components\TextEntry::make('blockchain_tx_hash')->label('Blockchain TX Hash')->copyable(),
                    Infolists\Components\TextEntry::make('blockchain_network')->label('Blockchain Network'),
                    Infolists\Components\TextEntry::make('ipfs_hash')->label('IPFS Hash')->copyable(),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Signatures')->icon('heroicon-o-pencil-square')->schema([
                    Infolists\Components\TextEntry::make('sender_signature_hash')->label('Sender Signature'),
                    Infolists\Components\TextEntry::make('sender_signed_at')->dateTime()->label('Sender Signed At'),
                    Infolists\Components\TextEntry::make('carrier_signature_hash')->label('Carrier Signature'),
                    Infolists\Components\TextEntry::make('carrier_signed_at')->dateTime()->label('Carrier Signed At'),
                    Infolists\Components\TextEntry::make('consignee_signature_hash')->label('Consignee Signature'),
                    Infolists\Components\TextEntry::make('consignee_signed_at')->dateTime()->label('Consignee Signed At'),
                ])->columns(2),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['document_number', 'shipper_name', 'carrier_name'];
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
            RelationManagers\TransportOrderRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEcmrDocuments::route('/'),
            'create' => Pages\CreateEcmrDocument::route('/create'),
            'view' => Pages\ViewEcmrDocument::route('/{record}'),
            'edit' => Pages\EditEcmrDocument::route('/{record}/edit'),
        ];
    }
}
