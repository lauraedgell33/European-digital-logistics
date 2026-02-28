<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EcmrDocumentResource\Pages;
use App\Models\EcmrDocument;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class EcmrDocumentResource extends Resource
{
    protected static ?string $model = EcmrDocument::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-check';
    protected static ?string $navigationGroup = 'Logistics';
    protected static ?string $navigationLabel = 'eCMR Documents';
    protected static ?int $navigationSort = 6;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('eCMR Info')->schema([
                Forms\Components\TextInput::make('ecmr_number')->required()->maxLength(50),
                Forms\Components\Select::make('transport_order_id')
                    ->relationship('transportOrder', 'order_number')->searchable()->preload(),
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft', 'issued' => 'Issued', 'in_transit' => 'In Transit',
                        'delivered' => 'Delivered', 'completed' => 'Completed', 'cancelled' => 'Cancelled',
                    ])->default('draft')->required(),
            ])->columns(3),

            Forms\Components\Section::make('Sender')->schema([
                Forms\Components\Select::make('sender_company_id')
                    ->relationship('senderCompany', 'name')->searchable()->preload(),
                Forms\Components\TextInput::make('sender_name')->maxLength(255),
                Forms\Components\TextInput::make('sender_address')->maxLength(500),
                Forms\Components\TextInput::make('sender_country')->maxLength(2),
            ])->columns(2),

            Forms\Components\Section::make('Carrier')->schema([
                Forms\Components\Select::make('carrier_company_id')
                    ->relationship('carrierCompany', 'name')->searchable()->preload(),
                Forms\Components\TextInput::make('carrier_name')->maxLength(255),
                Forms\Components\TextInput::make('carrier_address')->maxLength(500),
                Forms\Components\TextInput::make('carrier_country')->maxLength(2),
            ])->columns(2),

            Forms\Components\Section::make('Consignee')->schema([
                Forms\Components\Select::make('consignee_company_id')
                    ->relationship('consigneeCompany', 'name')->searchable()->preload(),
                Forms\Components\TextInput::make('consignee_name')->maxLength(255),
                Forms\Components\TextInput::make('consignee_address')->maxLength(500),
                Forms\Components\TextInput::make('consignee_country')->maxLength(2),
            ])->columns(2),

            Forms\Components\Section::make('Transport Details')->schema([
                Forms\Components\TextInput::make('place_of_taking_over')->maxLength(255),
                Forms\Components\DatePicker::make('date_of_taking_over'),
                Forms\Components\TextInput::make('place_of_delivery')->maxLength(255),
                Forms\Components\DatePicker::make('date_of_delivery'),
                Forms\Components\TextInput::make('gross_weight_kg')->numeric()->suffix('kg'),
                Forms\Components\TextInput::make('number_of_packages')->numeric(),
                Forms\Components\TextInput::make('packaging_method')->maxLength(255),
                Forms\Components\Toggle::make('is_hazardous'),
                Forms\Components\TextInput::make('adr_class')->maxLength(10)
                    ->visible(fn (Forms\Get $get) => $get('is_hazardous')),
                Forms\Components\Textarea::make('special_instructions')->rows(2),
            ])->columns(2),

            Forms\Components\Section::make('Blockchain')->schema([
                Forms\Components\TextInput::make('blockchain_tx_hash')->maxLength(255)->disabled(),
                Forms\Components\TextInput::make('blockchain_network')->maxLength(50)->disabled(),
                Forms\Components\TextInput::make('ipfs_hash')->maxLength(255)->disabled(),
            ])->columns(3)->collapsed(),

            Forms\Components\Section::make('Signatures')->schema([
                Forms\Components\TextInput::make('sender_signature_hash')->disabled(),
                Forms\Components\DateTimePicker::make('sender_signed_at')->disabled(),
                Forms\Components\TextInput::make('carrier_signature_hash')->disabled(),
                Forms\Components\DateTimePicker::make('carrier_signed_at')->disabled(),
                Forms\Components\TextInput::make('consignee_signature_hash')->disabled(),
                Forms\Components\DateTimePicker::make('consignee_signed_at')->disabled(),
            ])->columns(2)->collapsed(),
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
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'secondary' => 'draft', 'primary' => 'issued', 'warning' => 'in_transit',
                        'success' => 'delivered', 'success' => 'completed', 'danger' => 'cancelled',
                    ]),
                Tables\Columns\IconColumn::make('is_hazardous')->boolean()->label('ADR'),
                Tables\Columns\TextColumn::make('date_of_taking_over')->date()->label('Pickup'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'issued' => 'Issued', 'in_transit' => 'In Transit', 'delivered' => 'Delivered', 'completed' => 'Completed']),
                Tables\Filters\TernaryFilter::make('is_hazardous'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEcmrDocuments::route('/'),
            'create' => Pages\CreateEcmrDocument::route('/create'),
            'edit' => Pages\EditEcmrDocument::route('/{record}/edit'),
        ];
    }
}
