<?php

namespace App\Notifications;

use App\Models\TransportOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected TransportOrder $order,
        protected string $newStatus,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $statusLabels = [
            'pending' => 'Pending',
            'accepted' => 'Accepted',
            'rejected' => 'Rejected',
            'pickup_scheduled' => 'Pickup Scheduled',
            'picked_up' => 'Picked Up',
            'in_transit' => 'In Transit',
            'delivered' => 'Delivered',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'disputed' => 'Disputed',
        ];

        $label = $statusLabels[$this->newStatus] ?? ucfirst($this->newStatus);

        return (new MailMessage)
            ->subject("Order {$this->order->order_number} — Status: {$label}")
            ->greeting("Transport Order Update")
            ->line("Order **{$this->order->order_number}** has been updated to: **{$label}**.")
            ->line("Route: {$this->order->pickup_city} → {$this->order->delivery_city}")
            ->action('View Order', config('app.frontend_url', 'http://localhost:3000') . "/orders/{$this->order->id}")
            ->salutation('Best regards, The LogiMarket Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'order_status',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'new_status' => $this->newStatus,
            'route' => "{$this->order->pickup_city} → {$this->order->delivery_city}",
            'message' => "Order {$this->order->order_number} status changed to {$this->newStatus}",
        ];
    }
}
