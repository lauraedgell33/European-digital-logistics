<?php

namespace Database\Seeders;

use App\Models\Shipment;
use App\Models\ShipmentEvent;
use App\Models\TrackingPosition;
use App\Models\TransportOrder;
use Illuminate\Database\Seeder;

class ShipmentSeeder extends Seeder
{
    public function run(): void
    {
        $inTransitOrders = TransportOrder::whereIn('status', ['in_transit', 'delivered', 'completed'])->get();

        foreach ($inTransitOrders as $order) {
            $shipment = Shipment::create([
                'transport_order_id' => $order->id,
                'tracking_code' => 'TRK-' . strtoupper(substr(md5($order->id), 0, 8)),
                'status' => match ($order->status) {
                    'completed' => 'delivered',
                    'delivered' => 'delivered',
                    default => 'in_transit',
                },
                'current_location_name' => $order->status === 'in_transit'
                    ? 'Near Strasbourg, FR'
                    : $order->delivery_city,
                'eta' => $order->status === 'in_transit'
                    ? now()->addHours(rand(4, 24))
                    : null,
            ]);

            // Events
            $events = [
                ['picked_up', 'Cargo picked up at origin', $order->pickup_date],
                ['departed', 'Departed from origin facility', $order->pickup_date->copy()->addHours(1)],
                ['in_transit', 'In transit', $order->pickup_date->copy()->addHours(6)],
            ];

            if ($order->status === 'delivered' || $order->status === 'completed') {
                $events[] = ['arrived', 'Arrived at destination', $order->delivery_date?->copy()->subHours(1) ?? now()];
                $events[] = ['delivered', 'Delivered successfully', $order->delivery_date ?? now()];
            }

            foreach ($events as $e) {
                ShipmentEvent::create([
                    'shipment_id' => $shipment->id,
                    'event_type' => $e[0],
                    'description' => $e[1],
                    'occurred_at' => $e[2],
                ]);
            }

            // Tracking positions (simulated route points)
            $startLat = $this->cityCoords($order->pickup_city)['lat'];
            $startLng = $this->cityCoords($order->pickup_city)['lng'];
            $endLat = $this->cityCoords($order->delivery_city)['lat'];
            $endLng = $this->cityCoords($order->delivery_city)['lng'];

            $steps = 10;
            for ($i = 0; $i <= $steps; $i++) {
                $progress = $order->status === 'in_transit' ? min($i / $steps, 0.65) : $i / $steps;
                TrackingPosition::create([
                    'shipment_id' => $shipment->id,
                    'lat' => $startLat + ($endLat - $startLat) * $progress + (rand(-10, 10) / 100),
                    'lng' => $startLng + ($endLng - $startLng) * $progress + (rand(-10, 10) / 100),
                    'speed_kmh' => rand(60, 95),
                    'heading' => rand(0, 360),
                    'recorded_at' => $order->pickup_date->copy()->addHours($i * 2),
                ]);
            }
        }
    }

    private function cityCoords(string $city): array
    {
        $coords = [
            'Hamburg' => ['lat' => 53.55, 'lng' => 9.99],
            'Paris' => ['lat' => 48.86, 'lng' => 2.35],
            'Lyon' => ['lat' => 45.76, 'lng' => 4.83],
            'Milan' => ['lat' => 45.46, 'lng' => 9.19],
            'Warsaw' => ['lat' => 52.23, 'lng' => 21.01],
            'Munich' => ['lat' => 48.14, 'lng' => 11.58],
            'Rotterdam' => ['lat' => 51.92, 'lng' => 4.48],
            'Barcelona' => ['lat' => 41.39, 'lng' => 2.17],
            'Berlin' => ['lat' => 52.52, 'lng' => 13.40],
            'Gdansk' => ['lat' => 54.35, 'lng' => 18.65],
            'Frankfurt' => ['lat' => 50.11, 'lng' => 8.68],
            'Madrid' => ['lat' => 40.42, 'lng' => -3.70],
            'Marseille' => ['lat' => 43.30, 'lng' => 5.37],
            'Amsterdam' => ['lat' => 52.37, 'lng' => 4.90],
        ];

        return $coords[$city] ?? ['lat' => 50.0, 'lng' => 10.0];
    }
}
