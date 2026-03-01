<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DocumentScanResource\Pages;
use App\Filament\Resources\DocumentScanResource\RelationManagers;
use App\Models\DocumentScan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DocumentScanResource extends Resource
{
    protected static ?string $model = DocumentScan::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-arrow-up';
    protected static ?string $navigationGroup = 'Documents';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'original_filename';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Document Information')->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('transport_order_id')
                    ->relationship('transportOrder', 'order_number')
                    ->searchable()->preload(),
                Forms\Components\Select::make('document_type')
                    ->options([
                        'invoice' => 'Invoice',
                        'cmr' => 'CMR',
                        'delivery_note' => 'Delivery Note',
                        'customs' => 'Customs',
                        'insurance' => 'Insurance',
                        'other' => 'Other',
                    ])->required(),
            ])->columns(2),

            Forms\Components\Section::make('File Details')->schema([
                Forms\Components\TextInput::make('original_filename')
                    ->required()->maxLength(255),
                Forms\Components\TextInput::make('file_path')
                    ->required()->maxLength(500),
                Forms\Components\TextInput::make('mime_type')
                    ->maxLength(100),
                Forms\Components\TextInput::make('file_size_bytes')
                    ->numeric()->label('File Size (bytes)'),
            ])->columns(2),

            Forms\Components\Section::make('Processing')->schema([
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                    ])->required()->default('pending'),
                Forms\Components\TextInput::make('confidence_score')
                    ->numeric()->minValue(0)->maxValue(100)->suffix('%'),
                Forms\Components\Toggle::make('is_validated')
                    ->default(false),
                Forms\Components\Textarea::make('processing_notes')
                    ->rows(3)->columnSpanFull(),
            ])->columns(2),

            Forms\Components\Section::make('Extracted Data')->schema([
                Forms\Components\Hidden::make('extracted_data'),
                Forms\Components\Hidden::make('raw_ocr_text'),
            ])->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('company.name')
                    ->searchable()->sortable()->label('Company'),
                Tables\Columns\TextColumn::make('document_type')->badge()->color(fn (string $state): string => match ($state) {
                    'invoice' => 'primary',
                    'cmr' => 'info',
                    'delivery_note' => 'success',
                    'customs' => 'warning',
                    'insurance' => 'secondary',
                    'other' => 'gray',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('original_filename')
                    ->searchable()->sortable()->limit(30),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'gray',
                    'processing' => 'warning',
                    'completed' => 'success',
                    'failed' => 'danger',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('confidence_score')
                    ->suffix('%')->sortable(),
                Tables\Columns\IconColumn::make('is_validated')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                    ]),
                Tables\Filters\SelectFilter::make('document_type')
                    ->options([
                        'invoice' => 'Invoice',
                        'cmr' => 'CMR',
                        'delivery_note' => 'Delivery Note',
                        'customs' => 'Customs',
                        'insurance' => 'Insurance',
                        'other' => 'Other',
                    ]),
                Tables\Filters\TernaryFilter::make('is_validated'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['transportOrder']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Document Information')->schema([
                Infolists\Components\TextEntry::make('company.name')->label('Company'),
                Infolists\Components\TextEntry::make('user.name')->label('User'),
                Infolists\Components\TextEntry::make('transportOrder.order_number')->label('Transport Order'),
                Infolists\Components\TextEntry::make('document_type')->badge()->color(fn (string $state): string => match ($state) {
                    'invoice' => 'primary', 'cmr' => 'info', 'delivery_note' => 'success',
                    'customs' => 'warning', 'insurance' => 'secondary', 'other' => 'gray', default => 'gray',
                })->label('Document Type'),
            ])->columns(2),
            Infolists\Components\Section::make('File Details')->schema([
                Infolists\Components\TextEntry::make('original_filename')->label('Filename'),
                Infolists\Components\TextEntry::make('file_path')->label('File Path')->copyable(),
                Infolists\Components\TextEntry::make('mime_type')->label('MIME Type'),
                Infolists\Components\TextEntry::make('file_size_bytes')->label('File Size (bytes)'),
            ])->columns(2),
            Infolists\Components\Section::make('Processing')->schema([
                Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'gray', 'processing' => 'warning', 'completed' => 'success', 'failed' => 'danger', default => 'gray',
                }),
                Infolists\Components\TextEntry::make('confidence_score')->suffix('%')->label('Confidence Score'),
                Infolists\Components\IconEntry::make('is_validated')->boolean()->label('Validated'),
                Infolists\Components\TextEntry::make('processing_notes')->label('Processing Notes')->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['original_filename', 'status'];
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
            'index' => Pages\ListDocumentScans::route('/'),
            'create' => Pages\CreateDocumentScan::route('/create'),
            'view' => Pages\ViewDocumentScan::route('/{record}'),
            'edit' => Pages\EditDocumentScan::route('/{record}/edit'),
        ];
    }
}
