<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransportOrderResource\Pages;
use App\Filament\Resources\TransportOrderResource\RelationManagers;
use App\Models\TransportOrder;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Notifications\Notification;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class TransportOrderResource extends Resource
{
    protected static ?string $model = TransportOrder::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Operations';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'order_number';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Order')->schema([
                Forms\Components\Tabs\Tab::make('Order Details')
                    ->icon('heroicon-o-document-text')
                    ->schema([
                        Forms\Components\TextInput::make('order_number')->disabled()
                            ->placeholder('Auto-generated if empty'),
                        Forms\Components\Select::make('shipper_id')
                            ->relationship('shipper', 'name')->required()
                            ->helperText('Select the company shipping the goods'),
                        Forms\Components\Select::make('carrier_id')
                            ->relationship('carrier', 'name')->required()
                            ->helperText('Select the transport carrier'),
                        Forms\Components\Select::make('status')->options([
                            'draft' => 'Draft', 'pending' => 'Pending', 'accepted' => 'Accepted',
                            'rejected' => 'Rejected', 'picked_up' => 'Picked Up', 'in_transit' => 'In Transit',
                            'delivered' => 'Delivered', 'completed' => 'Completed', 'cancelled' => 'Cancelled',
                        ])->required(),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Pickup')
                    ->icon('heroicon-o-arrow-up-tray')
                    ->schema([
                        Forms\Components\TextInput::make('pickup_country')->required()->maxLength(2),
                        Forms\Components\TextInput::make('pickup_city')->required(),
                        Forms\Components\Textarea::make('pickup_address')->required(),
                        Forms\Components\DateTimePicker::make('pickup_date')->required(),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Delivery')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->schema([
                        Forms\Components\TextInput::make('delivery_country')->required()->maxLength(2),
                        Forms\Components\TextInput::make('delivery_city')->required(),
                        Forms\Components\Textarea::make('delivery_address')->required(),
                        Forms\Components\DateTimePicker::make('delivery_date')->required(),
                    ])->columns(2),
                Forms\Components\Tabs\Tab::make('Cargo & Payment')
                    ->icon('heroicon-o-currency-euro')
                    ->schema([
                        Forms\Components\TextInput::make('cargo_type')->required()
                            ->helperText('Select the primary cargo classification'),
                        Forms\Components\TextInput::make('weight')->numeric()->suffix('kg')
                            ->placeholder('e.g. 24000')
                            ->helperText('Total weight including packaging'),
                        Forms\Components\TextInput::make('total_price')->numeric()->prefix('€')->required()
                            ->placeholder('0.00')
                            ->helperText('Total price including all surcharges'),
                        Forms\Components\Select::make('payment_terms')->options([
                            'prepaid' => 'Prepaid', '30_days' => '30 Days',
                            '60_days' => '60 Days', '90_days' => '90 Days',
                        ]),
                        Forms\Components\Select::make('payment_status')->options([
                            'pending' => 'Pending', 'invoiced' => 'Invoiced',
                            'paid' => 'Paid', 'overdue' => 'Overdue',
                        ]),
                    ])->columns(3),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('shipper.name')->limit(15),
                Tables\Columns\TextColumn::make('carrier.name')->limit(15),
                Tables\Columns\TextColumn::make('pickup_city')
                    ->formatStateUsing(fn($record) => "{$record->pickup_city}, {$record->pickup_country}"),
                Tables\Columns\TextColumn::make('delivery_city')
                    ->formatStateUsing(fn($record) => "{$record->delivery_city}, {$record->delivery_country}"),
                Tables\Columns\TextColumn::make('pickup_date')->dateTime('d M Y'),
                Tables\Columns\TextColumn::make('total_price')->money('eur')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) {
                    'draft' => 'gray', 'pending' => 'warning', 'accepted' => 'success',
                    'rejected' => 'danger', 'in_transit' => 'info', 'delivered' => 'primary',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('payment_status')->badge()->color(fn (string $state): string => match ($state) {
                    'pending' => 'warning', 'invoiced' => 'info',
                    'paid' => 'success', 'overdue' => 'danger',
                    default => 'gray',
                }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending', 'accepted' => 'Accepted',
                        'in_transit' => 'In Transit', 'delivered' => 'Delivered',
                        'completed' => 'Completed', 'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('accept')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalDescription('Are you sure you want to accept this order?')
                    ->visible(fn (TransportOrder $record) => $record->status === 'pending')
                    ->action(function (TransportOrder $record) {
                        $record->update(['status' => 'accepted', 'accepted_at' => now()]);
                        Notification::make()->title('Order Accepted')->success()->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('cancellation_reason')->required()->label('Reason for Rejection'),
                    ])
                    ->visible(fn (TransportOrder $record) => $record->status === 'pending')
                    ->action(function (TransportOrder $record, array $data) {
                        $record->update(['status' => 'rejected', 'cancellation_reason' => $data['cancellation_reason'], 'cancelled_at' => now()]);
                        Notification::make()->title('Order Rejected')->danger()->send();
                    }),
                Tables\Actions\Action::make('markPickedUp')
                    ->icon('heroicon-o-truck')
                    ->color('info')
                    ->requiresConfirmation()
                    ->visible(fn (TransportOrder $record) => $record->status === 'accepted')
                    ->action(function (TransportOrder $record) {
                        $record->update(['status' => 'picked_up', 'picked_up_at' => now()]);
                        Notification::make()->title('Marked as Picked Up')->success()->send();
                    }),
                Tables\Actions\Action::make('markDelivered')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (TransportOrder $record) => in_array($record->status, ['picked_up', 'in_transit']))
                    ->action(function (TransportOrder $record) {
                        $record->update(['status' => 'delivered', 'delivered_at' => now()]);
                        Notification::make()->title('Marked as Delivered')->success()->send();
                    }),
                Tables\Actions\Action::make('cancel')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalDescription('This action cannot be undone.')
                    ->form([
                        Forms\Components\Textarea::make('cancellation_reason')->required()->label('Cancellation Reason'),
                    ])
                    ->visible(fn (TransportOrder $record) => !in_array($record->status, ['completed', 'cancelled', 'delivered']))
                    ->action(function (TransportOrder $record, array $data) {
                        $record->update(['status' => 'cancelled', 'cancellation_reason' => $data['cancellation_reason'], 'cancelled_at' => now()]);
                        Notification::make()->title('Order Cancelled')->warning()->send();
                    }),
                Tables\Actions\Action::make('duplicate')
                    ->icon('heroicon-o-document-duplicate')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('Create a copy of this order as a new draft?')
                    ->action(function (TransportOrder $record) {
                        $new = $record->replicate(['order_number', 'status', 'accepted_at', 'picked_up_at', 'delivered_at', 'completed_at', 'cancelled_at']);
                        $new->status = 'draft';
                        $new->save();
                        Notification::make()->title('Order Duplicated: ' . $new->order_number)->success()->send();
                    }),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('bulkAccept')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion()
                        ->action(function (\Illuminate\Database\Eloquent\Collection $records) {
                            $records->each(fn ($record) => $record->status === 'pending' && $record->update(['status' => 'accepted', 'accepted_at' => now()]));
                            Notification::make()->title($records->count() . ' orders processed')->success()->send();
                        }),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('No transport orders yet')
            ->emptyStateDescription('Create your first transport order to get started.')
            ->emptyStateIcon('heroicon-o-truck')
            ->modifyQueryUsing(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->with(['shipper', 'carrier', 'createdBy']))
            ->defaultPaginationPageOption(25);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Tabs::make('Order')->schema([
                Infolists\Components\Tabs\Tab::make('Order Details')->icon('heroicon-o-document-text')->schema([
                    Infolists\Components\TextEntry::make('order_number')->label('Order Number')->copyable(),
                    Infolists\Components\TextEntry::make('shipper.name')->label('Shipper'),
                    Infolists\Components\TextEntry::make('carrier.name')->label('Carrier'),
                    Infolists\Components\TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray', 'pending' => 'warning', 'accepted' => 'success',
                        'rejected' => 'danger', 'in_transit' => 'info', 'delivered' => 'primary',
                        'completed' => 'success', 'cancelled' => 'danger', default => 'gray',
                    }),
                    Infolists\Components\TextEntry::make('created_at')->dateTime(),
                ])->columns(3),
                Infolists\Components\Tabs\Tab::make('Pickup')->icon('heroicon-o-arrow-up-tray')->schema([
                    Infolists\Components\TextEntry::make('pickup_country')->label('Country'),
                    Infolists\Components\TextEntry::make('pickup_city')->label('City'),
                    Infolists\Components\TextEntry::make('pickup_address')->label('Address'),
                    Infolists\Components\TextEntry::make('pickup_date')->dateTime()->label('Date'),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Delivery')->icon('heroicon-o-arrow-down-tray')->schema([
                    Infolists\Components\TextEntry::make('delivery_country')->label('Country'),
                    Infolists\Components\TextEntry::make('delivery_city')->label('City'),
                    Infolists\Components\TextEntry::make('delivery_address')->label('Address'),
                    Infolists\Components\TextEntry::make('delivery_date')->dateTime()->label('Date'),
                ])->columns(2),
                Infolists\Components\Tabs\Tab::make('Cargo & Payment')->icon('heroicon-o-currency-euro')->schema([
                    Infolists\Components\TextEntry::make('cargo_type'),
                    Infolists\Components\TextEntry::make('weight')->suffix(' kg'),
                    Infolists\Components\TextEntry::make('total_price')->money('EUR'),
                    Infolists\Components\TextEntry::make('payment_terms'),
                    Infolists\Components\TextEntry::make('payment_status')->badge()->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning', 'invoiced' => 'info', 'paid' => 'success', 'overdue' => 'danger', default => 'gray',
                    }),
                ])->columns(3),
            ])->columnSpanFull(),
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['order_number', 'pickup_city', 'delivery_city', 'status'];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        return [
            'Shipper' => $record->shipper?->name ?? '-',
            'Status' => $record->status ?? '-',
        ];
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
            RelationManagers\ShipmentRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTransportOrders::route('/'),
            'create' => Pages\CreateTransportOrder::route('/create'),
            'view' => Pages\ViewTransportOrder::route('/{record}'),
            'edit' => Pages\EditTransportOrder::route('/{record}/edit'),
        ];
    }
}
