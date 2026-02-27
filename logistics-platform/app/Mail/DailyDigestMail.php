<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyDigestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public array $stats,
        public array $recentOrders,
        public array $newMatches,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'LogiMarket — Your Daily Logistics Digest',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.daily-digest',
            with: [
                'userName' => $this->userName,
                'stats' => $this->stats,
                'recentOrders' => $this->recentOrders,
                'newMatches' => $this->newMatches,
                'dashboardUrl' => config('app.frontend_url', 'http://localhost:3000') . '/dashboard',
            ],
        );
    }
}
