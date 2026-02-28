<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WhiteLabelResource\Pages;
use App\Models\WhiteLabel;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WhiteLabelResource extends Resource
{
    protected static ?string $model = WhiteLabel::class;

    protected static ?string $navigationIcon = 'heroicon-o-paint-brush';

    protected static ?string $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 4;
    protected static ?string $recordTitleAttribute = 'company_name';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('subdomain'),
                Forms\Components\TextInput::make('custom_domain'),
                Forms\Components\TextInput::make('brand_name')
                    ->required(),
                Forms\Components\TextInput::make('logo_url')
                    ->url(),
                Forms\Components\TextInput::make('favicon_url')
                    ->url(),
                Forms\Components\Hidden::make('brand_colors')
                    ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                Forms\Components\Hidden::make('features_enabled')
                    ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                Forms\Components\Hidden::make('custom_translations')
                    ->dehydrateStateUsing(fn ($state) => is_string($state) ? $state : json_encode($state)),
                Forms\Components\TextInput::make('support_email')
                    ->email(),
                Forms\Components\TextInput::make('support_phone')
                    ->tel(),
                Forms\Components\RichEditor::make('terms_of_service')
                    ->columnSpanFull(),
                Forms\Components\RichEditor::make('privacy_policy')
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('is_active'),
                Forms\Components\Select::make('plan')
                    ->options([
                        'basic' => 'Basic',
                        'professional' => 'Professional',
                        'enterprise' => 'Enterprise',
                    ]),
                Forms\Components\TextInput::make('monthly_fee')
                    ->numeric()
                    ->prefix('€'),
                Forms\Components\Select::make('currency')
                    ->options([
                        'EUR' => 'EUR',
                        'USD' => 'USD',
                        'GBP' => 'GBP',
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('company.name'),
                Tables\Columns\TextColumn::make('brand_name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('subdomain'),
                Tables\Columns\TextColumn::make('custom_domain'),
                Tables\Columns\TextColumn::make('plan')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'basic' => 'gray',
                        'professional' => 'info',
                        'enterprise' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('monthly_fee')
                    ->money('EUR'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('plan')
                    ->options([
                        'basic' => 'Basic',
                        'professional' => 'Professional',
                        'enterprise' => 'Enterprise',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['company_name', 'domain'];
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWhiteLabels::route('/'),
            'create' => Pages\CreateWhiteLabel::route('/create'),
            'edit' => Pages\EditWhiteLabel::route('/{record}/edit'),
        ];
    }
}
