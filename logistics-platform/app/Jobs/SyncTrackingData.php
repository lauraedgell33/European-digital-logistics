<?php

namespace App\Jobs;

use App\Models\Shipment;
use App\Events\ShipmentLocationUpdated;
use App\Events\ShipmentPositionUpdated;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncTrackingData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public readonly Shipment $shipment,
        public readonly float $lat,
        public readonly float $lng,
        public readonly array $extras = []
    ) {
        $this->onQueue('tracking');
    }

    public function handle(NotificationService $notificationService): void
    {
        // Update shipment position
        $this->shipment->updatePosition($this->lat, $this->lng, $this->extras);

        // Broadcast real-time position update
        event(new ShipmentPositionUpdated($this->shipment));
        event(new ShipmentLocationUpdated($this->shipment));

        // Check for delays and notify if needed
        if ($this->shipment->isDelayed()) {
            $notificationService->notifyShipmentDelay($this->shipment);
        }

        // Check geofence events
        $this->checkGeofenceEvents();
    }

    /**
     * Check if shipment has entered or left any geofence zones.
     */
    private function checkGeofenceEvents(): void
    {
        $order = $this->shipment->transportOrder;
        if (!$order) {
            return;
        }

        // Check proximity to pickup location
        if ($order->pickup_lat && $order->pickup_lng) {
            $distanceToPickup = $this->haversineDistance(
                $this->lat, $this->lng,
                $order->pickup_lat, $order->pickup_lng
            );

            if ($distanceToPickup <= 1.0 && $this->shipment->status === 'in_transit') {
                $this->shipment->addEvent('approaching_pickup', 'Vehicle approaching pickup location', [
                    'distance_km' => round($distanceToPickup, 2),
                ]);
            }
        }

        // Check proximity to delivery location
        if ($order->delivery_lat && $order->delivery_lng) {
            $distanceToDelivery = $this->haversineDistance(
                $this->lat, $this->lng,
                $order->delivery_lat, $order->delivery_lng
            );

            if ($distanceToDelivery <= 1.0 && $this->shipment->status === 'in_transit') {
                $this->shipment->addEvent('approaching_delivery', 'Vehicle approaching delivery location', [
                    'distance_km' => round($distanceToDelivery, 2),
                ]);
            }
        }
    }

    /**
     * Calculate distance between two GPS coordinates in km.
     */
    private function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function tags(): array
    {
        return [
            'tracking-sync',
            'shipment:' . $this->shipment->id,
        ];
    }
}
