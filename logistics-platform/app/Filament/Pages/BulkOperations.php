<?php

namespace App\Filament\Pages;

use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class BulkOperations extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-wrench-screwdriver';

    public static function canAccess(): bool
    {
        return auth()->user()?->role === 'admin';
    }
    protected static ?string $navigationGroup = 'Administration';
    protected static ?int $navigationSort = 13;
    protected static ?string $title = 'Bulk Operations';
    protected static string $view = 'filament.pages.bulk-operations';

    public function clearAllCache(): void
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('view:clear');
        Artisan::call('route:clear');
        Cache::flush();
        Notification::make()->title('All caches cleared successfully')->success()->send();
    }

    public function optimizeApplication(): void
    {
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        Notification::make()->title('Application optimized successfully')->success()->send();
    }

    public function clearWidgetCache(): void
    {
        $keys = ['revenue-chart', 'pending-actions-widget', 'financial-summary', 'analytics-dashboard', 'company-growth-chart', 'geographic-distribution'];
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        Notification::make()->title('Widget caches cleared')->success()->send();
    }

    public function getViewData(): array
    {
        return [
            'cacheDriver' => config('cache.default'),
            'queueDriver' => config('queue.default'),
            'phpVersion' => PHP_VERSION,
            'laravelVersion' => app()->version(),
        ];
    }
}
