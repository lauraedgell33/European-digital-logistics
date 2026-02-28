<?php

namespace App\Filament\Widgets;

use App\Models\AiMatchResult;
use App\Models\AiPrediction;
use App\Models\DocumentScan;
use App\Models\RouteOptimization;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AiInsightsWidget extends StatsOverviewWidget
{
    protected ?string $heading = 'AI & Automation';
    protected static ?int $sort = 7;

    protected function getStats(): array
    {
        $matchesTotal = AiMatchResult::count();
        $matchesAccepted = AiMatchResult::where('status', 'accepted')->count();
        $acceptRate = $matchesTotal > 0 ? round(($matchesAccepted / $matchesTotal) * 100, 1) : 0;

        $predictionsCount = AiPrediction::count();
        $avgAccuracy = AiPrediction::whereNotNull('accuracy_pct')->avg('accuracy_pct');

        $scansTotal = DocumentScan::count();
        $scansCompleted = DocumentScan::where('status', 'completed')->count();
        $avgConfidence = DocumentScan::where('status', 'completed')->avg('confidence_score');

        $optimizations = RouteOptimization::where('status', 'completed')->count();
        $avgSaving = RouteOptimization::where('status', 'completed')->avg('distance_saved_pct');

        return [
            Stat::make('AI Matches', $matchesTotal)
                ->description("Accept rate: {$acceptRate}%")
                ->icon('heroicon-o-sparkles')
                ->color('success'),

            Stat::make('Predictions', $predictionsCount)
                ->description('Avg accuracy: ' . ($avgAccuracy ? round($avgAccuracy, 1) . '%' : 'N/A'))
                ->icon('heroicon-o-light-bulb')
                ->color('info'),

            Stat::make('Document Scans', "{$scansCompleted}/{$scansTotal}")
                ->description('Avg confidence: ' . ($avgConfidence ? round($avgConfidence, 1) . '%' : 'N/A'))
                ->icon('heroicon-o-document-magnifying-glass')
                ->color('warning'),

            Stat::make('Route Optimizations', $optimizations)
                ->description('Avg distance saved: ' . ($avgSaving ? round($avgSaving, 1) . '%' : 'N/A'))
                ->icon('heroicon-o-map')
                ->color('primary'),
        ];
    }
}
