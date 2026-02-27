<?php

namespace App\Notifications;

use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShipmentDelayNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Shipment $shipment,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $order = $this->shipment->transportOrder;

        return (new MailMessage)
            ->subject("Shipment Delay — {$this->shipment->tracking_code}")
            ->greeting('Shipment Delay Alert')
            ->line("Shipment **{$this->shipment->tracking_code}** may be delayed.")
            ->line("Current location: " . ($this->shipment->current_location_name ?? 'Unknown'))
            ->line("ETA: " . ($this->shipment->eta ? $this->shipment->eta->format('d M Y H:i') : 'Unknown'))
            ->when($order, fn ($mail) => $mail->line("Order: {$order->order_number}"))
            ->action('Track Shipment', config('app.frontend_url', 'http://localhost:3000') . "/tracking/{$this->shipment->tracking_code}")
            ->salutation('Best regards, The LogiMarket Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'shipment_delay',
            'shipment_id' => $this->shipment->id,
            'tracking_code' => $this->shipment->tracking_code,
            'location' => $this->shipment->current_location_name,
            'eta' => $this->shipment->eta?->toISOString(),
            'message' => "Shipment {$this->shipment->tracking_code} may be delayed",
        ];
    }
}
