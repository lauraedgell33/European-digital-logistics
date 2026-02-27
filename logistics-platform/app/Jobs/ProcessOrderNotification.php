<?php

namespace App\Jobs;

use App\Models\TransportOrder;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessOrderNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly TransportOrder $order,
        public readonly string $status
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $notificationService->notifyOrderStatus($this->order, $this->status);
    }

    public function tags(): array
    {
        return [
            'order-notification',
            'order:' . $this->order->id,
            'status:' . $this->status,
        ];
    }
}
