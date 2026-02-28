<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InsuranceQuoteResource\Pages;
use App\Models\InsuranceQuote;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class InsuranceQuoteResource extends Resource
{
    protected static ?string $model = InsuranceQuote::class;
    protected static ?string $navigationIcon = 'heroicon-o-shield-check';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Quote Details')->schema([
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')->searchable()->preload()->required(),
                Forms\Components\Select::make('transport_order_id')
                    ->relationship('transportOrder', 'order_number')->searchable()->preload(),
                Forms\Components\TextInput::make('provider_name')->required()->maxLength(255),
                Forms\Components\Select::make('coverage_type')
                    ->options([
                        'basic' => 'Basic', 'standard' => 'Standard',
                        'comprehensive' => 'Comprehensive', 'all_risk' => 'All Risk',
                    ])->required(),
                Forms\Components\Select::make('status')
                    ->options(['pending' => 'Pending', 'quoted' => 'Quoted', 'accepted' => 'Accepted', 'expired' => 'Expired', 'declined' => 'Declined'])
                    ->default('pending')->required(),
            ])->columns(2),

            Forms\Components\Section::make('Financials')->schema([
                Forms\Components\TextInput::make('cargo_value')->numeric()->prefix('€')->required(),
                Forms\Components\TextInput::make('premium_amount')->numeric()->prefix('€'),
                Forms\Components\TextInput::make('deductible')->numeric()->prefix('€'),
                Forms\Components\TextInput::make('policy_number')->maxLength(50),
                Forms\Components\DateTimePicker::make('valid_until'),
                Forms\Components\DateTimePicker::make('accepted_at'),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('company.name')->searchable()->label('Company'),
                Tables\Columns\TextColumn::make('provider_name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('coverage_type')->badge(),
                Tables\Columns\TextColumn::make('cargo_value')->money('EUR')->sortable(),
                Tables\Columns\TextColumn::make('premium_amount')->money('EUR')->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors(['secondary' => 'pending', 'primary' => 'quoted', 'success' => 'accepted', 'warning' => 'expired', 'danger' => 'declined']),
                Tables\Columns\TextColumn::make('valid_until')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('policy_number')->searchable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Pending', 'quoted' => 'Quoted', 'accepted' => 'Accepted', 'expired' => 'Expired']),
                Tables\Filters\SelectFilter::make('coverage_type')
                    ->options(['basic' => 'Basic', 'standard' => 'Standard', 'comprehensive' => 'Comprehensive', 'all_risk' => 'All Risk']),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInsuranceQuotes::route('/'),
            'create' => Pages\CreateInsuranceQuote::route('/create'),
            'edit' => Pages\EditInsuranceQuote::route('/{record}/edit'),
        ];
    }
}
