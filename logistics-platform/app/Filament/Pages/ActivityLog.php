<?php

namespace App\Filament\Pages;

use App\Models\ApiUsageLog;
use App\Models\DocumentScan;
use App\Models\ShipmentEvent;
use App\Models\TransportOrder;
use App\Models\User;
use Filament\Pages\Page;
use Illuminate\Support\Carbon;

class ActivityLog extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    public static function canAccess(): bool
    {
        return auth()->user()?->role === 'admin';
    }
    protected static ?string $navigationGroup = 'Administration';
    protected static ?int $navigationSort = 12;
    protected static ?string $title = 'Activity Log';
    protected static string $view = 'filament.pages.activity-log';

    public function getViewData(): array
    {
        return [
            'recentActivities' => $this->getRecentActivities(),
            'todayStats' => $this->getTodayStats(),
        ];
    }

    protected function getRecentActivities(): array
    {
        $activities = [];

        // Recent transport orders
        TransportOrder::latest()
            ->take(10)
            ->get()
            ->each(function ($order) use (&$activities) {
                $activities[] = [
                    'type' => 'order',
                    'icon' => 'heroicon-o-document-text',
                    'color' => 'blue',
                    'message' => "Transport order #{$order->order_number} — {$order->status}",
                    'time' => $order->created_at,
                ];
            });

        // Recent shipment events
        ShipmentEvent::with('shipment')
            ->latest('occurred_at')
            ->take(10)
            ->get()
            ->each(function ($event) use (&$activities) {
                $tracking = $event->shipment?->tracking_code ?? 'N/A';
                $activities[] = [
                    'type' => 'event',
                    'icon' => 'heroicon-o-bell',
                    'color' => 'amber',
                    'message' => "Shipment {$tracking}: {$event->event_type}" . ($event->location_name ? " at {$event->location_name}" : ''),
                    'time' => $event->occurred_at ?? $event->created_at,
                ];
            });

        // Recent document scans
        DocumentScan::latest()
            ->take(5)
            ->get()
            ->each(function ($scan) use (&$activities) {
                $activities[] = [
                    'type' => 'scan',
                    'icon' => 'heroicon-o-document',
                    'color' => 'green',
                    'message' => "Document scanned: {$scan->original_filename} — {$scan->status}",
                    'time' => $scan->created_at,
                ];
            });

        // Recent API usage
        ApiUsageLog::latest()
            ->take(5)
            ->get()
            ->each(function ($log) use (&$activities) {
                $activities[] = [
                    'type' => 'api',
                    'icon' => 'heroicon-o-code-bracket',
                    'color' => 'purple',
                    'message' => "{$log->method} {$log->endpoint} — {$log->response_code} ({$log->response_time_ms}ms)",
                    'time' => $log->created_at,
                ];
            });

        // Recent user registrations
        User::latest()
            ->take(5)
            ->get()
            ->each(function ($user) use (&$activities) {
                $activities[] = [
                    'type' => 'user',
                    'icon' => 'heroicon-o-user-plus',
                    'color' => 'teal',
                    'message' => "User registered: {$user->name} ({$user->email})",
                    'time' => $user->created_at,
                ];
            });

        // Sort by time descending
        usort($activities, fn ($a, $b) => $b['time']?->timestamp <=> $a['time']?->timestamp);

        return array_slice($activities, 0, 30);
    }

    protected function getTodayStats(): array
    {
        return [
            'New Users' => User::whereDate('created_at', today())->count(),
            'New Orders' => TransportOrder::whereDate('created_at', today())->count(),
            'Shipment Events' => ShipmentEvent::whereDate('created_at', today())->count(),
            'API Requests' => ApiUsageLog::whereDate('created_at', today())->count(),
            'Document Scans' => DocumentScan::whereDate('created_at', today())->count(),
        ];
    }
}
