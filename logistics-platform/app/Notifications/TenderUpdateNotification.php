<?php

namespace App\Notifications;

use App\Models\Tender;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TenderUpdateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Tender $tender,
        protected string $event,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $eventLabels = [
            'new_bid' => 'New Bid Received',
            'bid_awarded' => 'Bid Awarded',
            'tender_closed' => 'Tender Closed',
            'tender_cancelled' => 'Tender Cancelled',
            'deadline_approaching' => 'Submission Deadline Approaching',
        ];

        $label = $eventLabels[$this->event] ?? ucfirst(str_replace('_', ' ', $this->event));

        return (new MailMessage)
            ->subject("Tender {$this->tender->reference_number} — {$label}")
            ->greeting('Tender Update')
            ->line("Tender **{$this->tender->title}** (Ref: {$this->tender->reference_number})")
            ->line("Event: **{$label}**")
            ->line("Route: {$this->tender->route_origin_city} → {$this->tender->route_destination_city}")
            ->action('View Tender', config('app.frontend_url', 'http://localhost:3000') . "/tenders/{$this->tender->id}")
            ->salutation('Best regards, The LogiMarket Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'tender_update',
            'tender_id' => $this->tender->id,
            'reference' => $this->tender->reference_number,
            'title' => $this->tender->title,
            'event' => $this->event,
            'route' => "{$this->tender->route_origin_city} → {$this->tender->route_destination_city}",
            'message' => "Tender {$this->tender->reference_number}: " . ($eventLabels[$this->event] ?? $this->event),
        ];
    }
}
