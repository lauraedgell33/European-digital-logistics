<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LexiconArticleResource\Pages;
use App\Models\LexiconArticle;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class LexiconArticleResource extends Resource
{
    protected static ?string $model = LexiconArticle::class;
    protected static ?string $navigationIcon = 'heroicon-o-book-open';
    protected static ?string $navigationGroup = 'Platform';
    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Article')->schema([
                Forms\Components\TextInput::make('title')->required()->maxLength(255)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn ($state, Forms\Set $set) => $set('slug', \Str::slug($state))),
                Forms\Components\TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true),
                Forms\Components\Textarea::make('excerpt')->rows(2)->maxLength(500),
                Forms\Components\RichEditor::make('content')->required()->columnSpanFull(),
                Forms\Components\Select::make('category')
                    ->options([
                        'transport' => 'Transport', 'logistics' => 'Logistics',
                        'customs' => 'Customs & Trade', 'legal' => 'Legal & Compliance',
                        'technology' => 'Technology', 'sustainability' => 'Sustainability',
                        'finance' => 'Finance', 'insurance' => 'Insurance',
                    ])->required(),
                Forms\Components\TagsInput::make('tags'),
                Forms\Components\Select::make('language')
                    ->options(['en' => 'English', 'de' => 'Deutsch', 'fr' => 'Français', 'ro' => 'Română', 'es' => 'Español', 'it' => 'Italiano', 'pl' => 'Polski'])
                    ->default('en'),
                Forms\Components\Select::make('author_id')
                    ->relationship('author', 'name')->searchable()->preload(),
                Forms\Components\Toggle::make('is_published')->default(false),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->sortable()->limit(50),
                Tables\Columns\TextColumn::make('slug')->searchable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('category')->badge()->sortable(),
                Tables\Columns\TextColumn::make('language')->label('Lang'),
                Tables\Columns\TextColumn::make('author.name')->label('Author'),
                Tables\Columns\TextColumn::make('view_count')->sortable()->label('Views'),
                Tables\Columns\IconColumn::make('is_published')->boolean(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category')
                    ->options([
                        'transport' => 'Transport', 'logistics' => 'Logistics',
                        'customs' => 'Customs', 'legal' => 'Legal',
                        'technology' => 'Technology', 'sustainability' => 'Sustainability',
                    ]),
                Tables\Filters\SelectFilter::make('language')
                    ->options(['en' => 'English', 'de' => 'Deutsch', 'fr' => 'Français', 'ro' => 'Română']),
                Tables\Filters\TernaryFilter::make('is_published'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'slug'];
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLexiconArticles::route('/'),
            'create' => Pages\CreateLexiconArticle::route('/create'),
            'edit' => Pages\EditLexiconArticle::route('/{record}/edit'),
        ];
    }
}
