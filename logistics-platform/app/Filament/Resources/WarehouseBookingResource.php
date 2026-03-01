<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WarehouseBookingResource\Pages;
use App\Models\WarehouseBooking;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Notifications\Notification;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class WarehouseBookingResource extends Resource
{
    protected static ?string $model = WarehouseBooking::class;
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationGroup = 'Operations';
    protected static ?int $navigationSort = 4;
    protected static ?string $recordTitleAttribute = 'id';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'pending')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Booking')->schema([
                Forms\Components\Tabs\Tab::make('Booking')
                    ->icon('heroicon-o-calendar-days')
                    ->schema([
                        Forms\Components\Select::make('warehouse_id')
                            ->relationship('warehouse', 'name')
                            ->searchable()->preload()->required(),
                        Forms\Components\Select::make('tenant_company_id')
                            ->relationship('tenant', 'name')
                            ->searchable()->preload()->required()->label('Tenant Company'),
                        Forms\Components\Select::make('created_by')
                            ->relationship('user', 'name')
                            ->searchable()->preload()->required()->label('Created By'),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Space & Duration')
                    ->icon('heroicon-o-cube')
                    ->schema([
                        Forms\Components\TextInput::make('booked_area_m2')
                            ->numeric()->suffix('m²')->label('Booked Area'),
                        Forms\Components\TextInput::make('booked_pallet_spaces')
                            ->numeric()->label('Pallet Spaces'),
                        Forms\Components\DatePicker::make('start_date')
                            ->required(),
                        Forms\Components\DatePicker::make('end_date')
                            ->required(),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Pricing')
                    ->icon('heroicon-o-currency-euro')
                    ->schema([
                        Forms\Components\TextInput::make('agreed_price')
                            ->numeric()->prefix('€')->required(),
                        Forms\Components\Select::make('currency')
                            ->options([
                                'EUR' => 'EUR',
                                'USD' => 'USD',
                                'GBP' => 'GBP',
                                'PLN' => 'PLN',
                                'RON' => 'RON',
                            ])->default('EUR')->required(),
                        Forms\Components\Select::make('price_period')
                            ->options([
                                'daily' => 'Daily',
                                'weekly' => 'Weekly',
                                'monthly' => 'Monthly',
                            ])->required(),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Status')
                    ->icon('heroicon-o-check-circle')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'confirmed' => 'Confirmed',
                                'active' => 'Active',
                                'completed' => 'Completed',
                                'cancelled' => 'Cancelled',
                            ])->required()->default('pending'),
                        Forms\Components\DateTimePicker::make('confirmed_at')
                            ->disabled(),
                        Forms\Components\DateTimePicker::make('cancelled_at')
                            ->disabled(),
                        Forms\Components\Textarea::make('cancellation_reason')
                            ->rows(2)->columnSpanFull(),
                    ])->columns(3),
                Forms\Components\Tabs\Tab::make('Notes')
                    ->icon('heroicon-o-chat-bubble-left-ellipsis')
                    ->schema([
                        Forms\Components\Textarea::make('special_requirements')
                            ->rows(3),
                        Forms\Components\Textarea::make('notes')
                            ->rows(3),
                    ])->columns(2),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('warehouse.name')
                    ->searchable()->sortable()->label('Warehouse'),
                Tables\Columns\TextColumn::make('tenant.name')
                    ->searchable()->sortable()->label('Tenant'),
                Tables\Columns\TextColumn::make('booked_area_m2')
                    ->suffix(' m²')->sortable()->label('Area'),
                Tables\Columns\TextColumn::make('start_date')
                    ->date()->sortable(),
                Tables\Columns\TextColumn::make('end_date')
                    ->date()->sortable(),
                Tables\Columns\TextColumn::make('agreed_price')
                    ->money('EUR')->sortable()->label('Price'),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'gray',
                    'confirmed' => 'info',
                    'active' => 'success',
                    'completed' => 'primary',
                    'cancelled' => 'danger',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('confirmed_at')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'active' => 'Active',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('warehouse_id')
                    ->relationship('warehouse', 'name')
                    ->searchable()->preload()->label('Warehouse'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('confirm')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (WarehouseBooking $record) => $record->status === 'pending')
                    ->action(function (WarehouseBooking $record) {
                        $record->update(['status' => 'confirmed', 'confirmed_at' => now()]);
                        Notification::make()->title('Booking Confirmed')->success()->send();
                    }),
                Tables\Actions\Action::make('cancelBooking')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('cancellation_reason')->required()->label('Cancellation Reason'),
                    ])
                    ->visible(fn (WarehouseBooking $record) => !in_array($record->status, ['cancelled', 'completed']))
                    ->action(function (WarehouseBooking $record, array $data) {
                        $record->update(['status' => 'cancelled', 'cancelled_at' => now(), 'cancellation_reason' => $data['cancellation_reason']]);
                        Notification::make()->title('Booking Cancelled')->warning()->send();
                    }),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                ]),
            ])
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['warehouse', 'tenant']))
            ->defaultPaginationPageOption(25);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['status'];
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
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWarehouseBookings::route('/'),
            'create' => Pages\CreateWarehouseBooking::route('/create'),
            'edit' => Pages\EditWarehouseBooking::route('/{record}/edit'),
        ];
    }
}
