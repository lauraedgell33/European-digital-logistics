<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMatchNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected array $matchData,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $type = $this->matchData['type'] ?? 'offer';
        $route = ($this->matchData['origin_city'] ?? '?') . ' → ' . ($this->matchData['destination_city'] ?? '?');

        return (new MailMessage)
            ->subject("New {$type} match found — {$route}")
            ->greeting('New Match Found!')
            ->line("A new matching {$type} has been found for your listing.")
            ->line("Route: **{$route}**")
            ->line("Match score: **" . ($this->matchData['score'] ?? 'N/A') . "**")
            ->action('View Matches', config('app.frontend_url', 'http://localhost:3000') . '/matching')
            ->salutation('Best regards, The LogiMarket Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_match',
            'match_type' => $this->matchData['type'] ?? 'offer',
            'offer_id' => $this->matchData['offer_id'] ?? null,
            'score' => $this->matchData['score'] ?? null,
            'route' => ($this->matchData['origin_city'] ?? '?') . ' → ' . ($this->matchData['destination_city'] ?? '?'),
            'message' => 'New matching offer found for your listing',
        ];
    }
}
