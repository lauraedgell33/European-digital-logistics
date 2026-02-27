<?php

namespace App\Jobs;

use App\Mail\DailyDigestMail;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendDailyDigest implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 300;
    public int $timeout = 600;

    public function __construct()
    {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $users = User::active()
            ->whereNotNull('email')
            ->whereHas('company')
            ->where(function ($query) {
                $query->whereNull('preferences->daily_digest')
                    ->orWhere('preferences->daily_digest', true);
            })
            ->with('company')
            ->cursor();

        foreach ($users as $user) {
            try {
                $digest = $this->buildDigestData($user);

                if ($digest['has_content']) {
                    Mail::to($user->email)->send(new DailyDigestMail($user, $digest));
                }
            } catch (\Exception $e) {
                report($e);
            }
        }
    }

    private function buildDigestData(User $user): array
    {
        $companyId = $user->company_id;
        $yesterday = now()->subDay();

        $newOrders = \App\Models\TransportOrder::where(function ($q) use ($companyId) {
            $q->where('shipper_company_id', $companyId)
                ->orWhere('carrier_company_id', $companyId);
        })->where('created_at', '>=', $yesterday)->count();

        $newFreight = \App\Models\FreightOffer::where('created_at', '>=', $yesterday)
            ->where('status', 'active')->count();

        $newVehicles = \App\Models\VehicleOffer::where('created_at', '>=', $yesterday)
            ->where('status', 'available')->count();

        $pendingTenders = \App\Models\Tender::where('company_id', $companyId)
            ->where('status', 'open')
            ->where('submission_deadline', '>=', now())
            ->where('submission_deadline', '<=', now()->addDays(3))
            ->count();

        $unreadMessages = \App\Models\Message::whereHas('conversation.participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('created_at', '>=', $yesterday)->where('user_id', '!=', $user->id)->count();

        return [
            'has_content' => ($newOrders + $newFreight + $newVehicles + $pendingTenders + $unreadMessages) > 0,
            'new_orders' => $newOrders,
            'new_freight' => $newFreight,
            'new_vehicles' => $newVehicles,
            'pending_tenders' => $pendingTenders,
            'unread_messages' => $unreadMessages,
        ];
    }

    public function tags(): array
    {
        return ['daily-digest', 'emails'];
    }
}
