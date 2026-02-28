<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CompanyResource\Pages;
use App\Models\Company;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CompanyResource extends Resource
{
    protected static ?string $model = Company::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-office';
    protected static ?string $navigationGroup = 'Platform';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Company Information')->schema([
                Forms\Components\TextInput::make('name')
                    ->required()->maxLength(255),
                Forms\Components\TextInput::make('vat_number')
                    ->required()->unique(ignoreRecord: true)->maxLength(50),
                Forms\Components\TextInput::make('registration_number')
                    ->maxLength(100),
                Forms\Components\Select::make('type')
                    ->options([
                        'shipper' => 'Shipper',
                        'carrier' => 'Carrier',
                        'forwarder' => 'Forwarder',
                    ])->required(),
                Forms\Components\Select::make('verification_status')
                    ->options([
                        'pending' => 'Pending',
                        'verified' => 'Verified',
                        'rejected' => 'Rejected',
                    ])->required()->default('pending'),
            ])->columns(2),

            Forms\Components\Section::make('Address')->schema([
                Forms\Components\TextInput::make('country_code')
                    ->required()->maxLength(2)->label('Country Code'),
                Forms\Components\TextInput::make('city')
                    ->required()->maxLength(100),
                Forms\Components\TextInput::make('postal_code')
                    ->required()->maxLength(20),
                Forms\Components\Textarea::make('address')
                    ->required()->columnSpanFull(),
            ])->columns(3),

            Forms\Components\Section::make('Contact')->schema([
                Forms\Components\TextInput::make('phone')->tel(),
                Forms\Components\TextInput::make('email')->email(),
                Forms\Components\TextInput::make('website')->url(),
            ])->columns(3),

            Forms\Components\Section::make('Status')->schema([
                Forms\Components\Toggle::make('is_active')->default(true),
                Forms\Components\TextInput::make('rating')
                    ->numeric()->minValue(0)->maxValue(5)->step(0.01)->disabled(),
                Forms\Components\DateTimePicker::make('verified_at'),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('vat_number')->searchable(),
                Tables\Columns\BadgeColumn::make('type')
                    ->colors([
                        'primary' => 'shipper',
                        'success' => 'carrier',
                        'warning' => 'forwarder',
                    ]),
                Tables\Columns\BadgeColumn::make('verification_status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'verified',
                        'danger' => 'rejected',
                    ]),
                Tables\Columns\TextColumn::make('country_code')->label('Country'),
                Tables\Columns\TextColumn::make('city'),
                Tables\Columns\TextColumn::make('rating')->sortable(),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('users_count')->counts('users')->label('Users'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'shipper' => 'Shipper',
                        'carrier' => 'Carrier',
                        'forwarder' => 'Forwarder',
                    ]),
                Tables\Filters\SelectFilter::make('verification_status')
                    ->options([
                        'pending' => 'Pending',
                        'verified' => 'Verified',
                        'rejected' => 'Rejected',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('verify')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn(Company $record) => $record->verification_status === 'pending')
                    ->action(fn(Company $record) => $record->update([
                        'verification_status' => 'verified',
                        'verified_at' => now(),
                    ])),
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
            'index' => Pages\ListCompanies::route('/'),
            'create' => Pages\CreateCompany::route('/create'),
            'edit' => Pages\EditCompany::route('/{record}/edit'),
        ];
    }
}
