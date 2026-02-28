<?php

namespace App\Filament\Widgets;

use App\Models\FreightOffer;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;

class TopRoutesWidget extends BaseWidget
{
    protected static ?string $heading = 'Top Routes (Last 30 Days)';
    protected static ?int $sort = 6;
    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                FreightOffer::query()
                    ->selectRaw('origin_country, origin_city, destination_country, destination_city, COUNT(*) as offers_count, AVG(price) as avg_price')
                    ->where('created_at', '>=', now()->subDays(30))
                    ->groupBy('origin_country', 'origin_city', 'destination_country', 'destination_city')
                    ->orderByDesc('offers_count')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('origin_city')
                    ->formatStateUsing(fn ($record) => "{$record->origin_city}, {$record->origin_country}")
                    ->label('Origin'),
                Tables\Columns\TextColumn::make('destination_city')
                    ->formatStateUsing(fn ($record) => "{$record->destination_city}, {$record->destination_country}")
                    ->label('Destination'),
                Tables\Columns\TextColumn::make('offers_count')
                    ->label('Offers')
                    ->sortable(),
                Tables\Columns\TextColumn::make('avg_price')
                    ->money('eur')
                    ->label('Avg Price'),
            ])
            ->paginated(false);
    }
}
