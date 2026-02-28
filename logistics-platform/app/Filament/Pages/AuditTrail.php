<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Spatie\Activitylog\Models\Activity;

class AuditTrail extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-finger-print';

    public static function canAccess(): bool
    {
        return auth()->user()?->role === 'admin';
    }
    protected static ?string $navigationGroup = 'Administration';
    protected static ?int $navigationSort = 14;
    protected static ?string $title = 'Audit Trail';
    protected static string $view = 'filament.pages.audit-trail';

    public function getViewData(): array
    {
        return [
            'activities' => Activity::with('causer')
                ->latest()
                ->limit(50)
                ->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'description' => $a->description,
                    'event' => $a->event,
                    'subject_type' => $a->subject_type ? class_basename($a->subject_type) : null,
                    'subject_id' => $a->subject_id,
                    'causer' => $a->causer?->name ?? 'System',
                    'properties' => $a->properties->toArray(),
                    'created_at' => $a->created_at,
                ]),
            'stats' => [
                'today' => Activity::whereDate('created_at', today())->count(),
                'week' => Activity::where('created_at', '>=', now()->subWeek())->count(),
                'total' => Activity::count(),
            ],
        ];
    }
}
