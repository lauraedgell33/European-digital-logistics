<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DocumentScanResource\Pages;
use App\Models\DocumentScan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DocumentScanResource extends Resource
{
    protected static ?string $model = DocumentScan::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-magnifying-glass';
    protected static ?string $navigationGroup = 'Documents';
    protected static ?int $navigationSort = 1;

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
                Tables\Columns\BadgeColumn::make('document_type')
                    ->colors([
                        'primary' => 'invoice',
                        'info' => 'cmr',
                        'success' => 'delivery_note',
                        'warning' => 'customs',
                        'secondary' => 'insurance',
                        'gray' => 'other',
                    ]),
                Tables\Columns\TextColumn::make('original_filename')
                    ->searchable()->sortable()->limit(30),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'gray' => 'pending',
                        'warning' => 'processing',
                        'success' => 'completed',
                        'danger' => 'failed',
                    ]),
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
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDocumentScans::route('/'),
            'create' => Pages\CreateDocumentScan::route('/create'),
            'edit' => Pages\EditDocumentScan::route('/{record}/edit'),
        ];
    }
}
