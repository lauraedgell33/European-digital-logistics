<?php

namespace App\Jobs;

use App\Models\FreightOffer;
use App\Services\MatchingService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessMatchingNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 120;

    public function __construct(
        public readonly FreightOffer $freightOffer
    ) {}

    public function handle(
        MatchingService $matchingService,
        NotificationService $notificationService
    ): void {
        $matches = $matchingService->findMatchingVehicles($this->freightOffer, 5);

        if ($matches->isEmpty()) {
            return;
        }

        // Notify freight owner about matching vehicles
        $notificationService->notifyNewMatch($this->freightOffer->company_id, [
            'type' => 'freight_to_vehicle',
            'freight_id' => $this->freightOffer->id,
            'match_count' => $matches->count(),
            'best_score' => $matches->first()->match_score ?? 0,
            'route' => "{$this->freightOffer->origin_city} → {$this->freightOffer->destination_city}",
        ]);

        // Notify vehicle owners about matching freight
        $notifiedCompanies = [];
        foreach ($matches as $vehicle) {
            if (!in_array($vehicle->company_id, $notifiedCompanies)) {
                $notificationService->notifyNewMatch($vehicle->company_id, [
                    'type' => 'vehicle_to_freight',
                    'vehicle_id' => $vehicle->id,
                    'freight_id' => $this->freightOffer->id,
                    'match_score' => $vehicle->match_score ?? 0,
                    'route' => "{$this->freightOffer->origin_city} → {$this->freightOffer->destination_city}",
                ]);
                $notifiedCompanies[] = $vehicle->company_id;
            }
        }
    }

    public function tags(): array
    {
        return [
            'matching',
            'freight:' . $this->freightOffer->id,
        ];
    }
}
