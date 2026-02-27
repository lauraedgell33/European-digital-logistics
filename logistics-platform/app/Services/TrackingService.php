<?php

namespace App\Services;

use App\Models\Shipment;
use App\Models\TrackingPosition;
use App\Events\ShipmentLocationUpdated;
use App\Events\ShipmentPositionUpdated;
use Illuminate\Support\Facades\Cache;

class TrackingService
{
    /**
     * Update shipment position and broadcast the update.
     */
    public function updatePosition(Shipment $shipment, float $lat, float $lng, array $extras = []): void
    {
        // Update the shipment
        $updateData = array_filter([
            'current_lat' => $lat,
            'current_lng' => $lng,
            'last_update' => now(),
            'speed_kmh' => $extras['speed_kmh'] ?? null,
            'heading' => $extras['heading'] ?? null,
            'temperature' => $extras['temperature'] ?? null,
            'battery_level' => $extras['battery_level'] ?? null,
        ], fn($v) => $v !== null);

        $shipment->update($updateData);

        // Store tracking position
        TrackingPosition::create([
            'shipment_id' => $shipment->id,
            'lat' => $lat,
            'lng' => $lng,
            'speed_kmh' => $extras['speed_kmh'] ?? null,
            'heading' => $extras['heading'] ?? null,
            'temperature' => $extras['temperature'] ?? null,
            'recorded_at' => now(),
        ]);

        // Update remaining distance and ETA
        $this->updateEta($shipment);

        // Reverse geocode the location name
        $this->updateLocationName($shipment, $lat, $lng);

        // Broadcast real-time update
        event(new ShipmentLocationUpdated($shipment));

        // Broadcast position update via WebSocket
        ShipmentPositionUpdated::dispatch($shipment->id, [
            'lat' => $lat,
            'lng' => $lng,
            'speed_kmh' => $extras['speed_kmh'] ?? null,
            'heading' => $extras['heading'] ?? null,
            'temperature' => $extras['temperature'] ?? null,
            'recorded_at' => now()->toISOString(),
        ]);

        // Check for geofence events
        $this->checkGeofences($shipment);
    }

    /**
     * Calculate and update ETA based on current position and speed.
     */
    public function calculateEta(Shipment $shipment): ?string
    {
        $order = $shipment->transportOrder;

        if (!$shipment->current_lat || !$shipment->current_lng || !$order) {
            return null;
        }

        $destLat = null;
        $destLng = null;

        // Try to get destination coordinates
        if ($order->freightOffer) {
            $destLat = $order->freightOffer->destination_lat;
            $destLng = $order->freightOffer->destination_lng;
        }

        if (!$destLat || !$destLng) {
            return $shipment->eta?->toIso8601String();
        }

        $remainingKm = $this->calculateDistance(
            $shipment->current_lat, $shipment->current_lng,
            $destLat, $destLng
        );

        $shipment->update(['remaining_distance_km' => round($remainingKm)]);

        // Calculate ETA based on average speed
        $avgSpeed = $this->getAverageSpeed($shipment);
        if ($avgSpeed > 0) {
            $hoursRemaining = $remainingKm / $avgSpeed;
            $eta = now()->addHours($hoursRemaining);
            $shipment->update(['eta' => $eta]);
            return $eta->toIso8601String();
        }

        return $shipment->eta?->toIso8601String();
    }

    /**
     * Update ETA internally.
     */
    private function updateEta(Shipment $shipment): void
    {
        $this->calculateEta($shipment);
    }

    /**
     * Get average speed from recent positions.
     */
    private function getAverageSpeed(Shipment $shipment): float
    {
        $recentPositions = $shipment->positions()
            ->whereNotNull('speed_kmh')
            ->where('speed_kmh', '>', 0)
            ->orderBy('recorded_at', 'desc')
            ->limit(10)
            ->pluck('speed_kmh');

        if ($recentPositions->isEmpty()) {
            return 60; // Default avg speed in km/h
        }

        return $recentPositions->avg();
    }

    /**
     * Calculate distance between two coordinates (Haversine formula).
     */
    public function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Update location name via reverse geocoding (cached).
     */
    private function updateLocationName(Shipment $shipment, float $lat, float $lng): void
    {
        $cacheKey = "geocode:" . round($lat, 3) . ":" . round($lng, 3);

        $locationName = Cache::remember($cacheKey, 3600, function () use ($lat, $lng) {
            // Basic reverse geocoding - in production, use Google Maps or similar
            return $this->reverseGeocode($lat, $lng);
        });

        if ($locationName) {
            $shipment->update(['current_location_name' => $locationName]);
        }
    }

    /**
     * Reverse geocode coordinates to a location name.
     */
    private function reverseGeocode(float $lat, float $lng): ?string
    {
        // Placeholder - integrate with Google Maps Geocoding API
        try {
            $apiKey = config('services.google_maps.key');
            if (!$apiKey) return null;

            $url = "https://maps.googleapis.com/maps/api/geocode/json?latlng={$lat},{$lng}&key={$apiKey}&result_type=locality";
            $response = file_get_contents($url);
            $data = json_decode($response, true);

            if ($data['status'] === 'OK' && !empty($data['results'])) {
                return $data['results'][0]['formatted_address'] ?? null;
            }
        } catch (\Exception $e) {
            // Silently fail
        }

        return null;
    }

    /**
     * Check if shipment has entered/exited any geofences.
     */
    private function checkGeofences(Shipment $shipment): void
    {
        $order = $shipment->transportOrder;
        if (!$order) return;

        // Check if near pickup point
        if ($order->freightOffer && $order->freightOffer->origin_lat) {
            $distToPickup = $this->calculateDistance(
                $shipment->current_lat, $shipment->current_lng,
                $order->freightOffer->origin_lat, $order->freightOffer->origin_lng
            );

            if ($distToPickup < 1) { // Within 1km
                $shipment->addEvent('near_pickup', 'Vehicle is approaching pickup location');
            }
        }

        // Check if near delivery point
        if ($order->freightOffer && $order->freightOffer->destination_lat) {
            $distToDelivery = $this->calculateDistance(
                $shipment->current_lat, $shipment->current_lng,
                $order->freightOffer->destination_lat, $order->freightOffer->destination_lng
            );

            if ($distToDelivery < 1) { // Within 1km
                $shipment->addEvent('near_delivery', 'Vehicle is approaching delivery location');
            }
        }
    }

    /**
     * Get all active shipment positions for a map view.
     */
    public function getActivePositions(int $companyId): array
    {
        return Shipment::whereHas('transportOrder', function ($q) use ($companyId) {
                $q->where('shipper_id', $companyId)->orWhere('carrier_id', $companyId);
            })
            ->whereNotIn('status', ['delivered'])
            ->whereNotNull('current_lat')
            ->with('transportOrder:id,order_number,pickup_city,delivery_city')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'tracking_code' => $s->tracking_code,
                'lat' => $s->current_lat,
                'lng' => $s->current_lng,
                'status' => $s->status,
                'speed' => $s->speed_kmh,
                'heading' => $s->heading,
                'order' => $s->transportOrder?->order_number,
                'destination' => $s->transportOrder?->delivery_city,
                'eta' => $s->eta?->toIso8601String(),
                'last_update' => $s->last_update?->toIso8601String(),
            ])
            ->toArray();
    }
}
