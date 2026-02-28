<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ConversationResource\Pages;
use App\Models\Conversation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ConversationResource extends Resource
{
    protected static ?string $model = Conversation::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationGroup = 'Platform';
    protected static ?string $navigationLabel = 'Messages';
    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'subject';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Conversation Details')->schema([
                Forms\Components\TextInput::make('subject')
                    ->maxLength(255),
                Forms\Components\Select::make('type')
                    ->options([
                        'direct' => 'Direct Message',
                        'freight_inquiry' => 'Freight Inquiry',
                        'order_discussion' => 'Order Discussion',
                        'tender_discussion' => 'Tender Discussion',
                    ])->required()->default('direct'),
                Forms\Components\Select::make('created_by')
                    ->relationship('creator', 'name')
                    ->searchable()->preload()->required()
                    ->label('Created By'),
                Forms\Components\TextInput::make('reference_type')
                    ->maxLength(255)->label('Reference Model'),
                Forms\Components\TextInput::make('reference_id')
                    ->numeric()->label('Reference ID'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable()->label('#'),
                Tables\Columns\TextColumn::make('subject')
                    ->searchable()->limit(40)->placeholder('(No subject)'),
                Tables\Columns\TextColumn::make('type')->badge()->color(fn (string $state): string => match ($state) {
                    'direct' => 'primary',
                    'freight_inquiry' => 'success',
                    'order_discussion' => 'warning',
                    'tender_discussion' => 'info',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('creator.name')
                    ->searchable()->label('Started By'),
                Tables\Columns\TextColumn::make('messages_count')
                    ->counts('messages')
                    ->label('Messages'),
                Tables\Columns\TextColumn::make('latestMessage.created_at')
                    ->dateTime()->sortable()->label('Last Activity'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'direct' => 'Direct Message',
                        'freight_inquiry' => 'Freight Inquiry',
                        'order_discussion' => 'Order Discussion',
                        'tender_discussion' => 'Tender Discussion',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['subject'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListConversations::route('/'),
        ];
    }
}
