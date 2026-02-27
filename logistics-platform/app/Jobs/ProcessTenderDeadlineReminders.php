<?php

namespace App\Jobs;

use App\Models\Tender;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessTenderDeadlineReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 300;

    public function handle(NotificationService $notificationService): void
    {
        // Find tenders with deadlines approaching within 24 hours
        $expiringTenders = Tender::where('status', 'open')
            ->where('submission_deadline', '>=', now())
            ->where('submission_deadline', '<=', now()->addDay())
            ->with(['company', 'bids'])
            ->get();

        foreach ($expiringTenders as $tender) {
            $notificationService->notifyTenderUpdate($tender, 'deadline_approaching');
        }

        // Auto-close expired tenders
        $expiredTenders = Tender::where('status', 'open')
            ->where('submission_deadline', '<', now())
            ->get();

        foreach ($expiredTenders as $tender) {
            $tender->update(['status' => 'closed']);
            $notificationService->notifyTenderUpdate($tender, 'tender_closed');
        }
    }

    public function tags(): array
    {
        return ['tender-deadlines'];
    }
}
