<?php

namespace Database\Factories;

use App\Models\Shipment;
use App\Models\TransportOrder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ShipmentFactory extends Factory
{
    protected $model = Shipment::class;

    public function definition(): array
    {
        return [
            'transport_order_id' => TransportOrder::factory(),
            'tracking_code' => 'SH-' . strtoupper(Str::random(8)),
            'current_lat' => fake()->latitude(42, 55),
            'current_lng' => fake()->longitude(-5, 25),
            'current_location_name' => fake()->city() . ', ' . fake()->randomElement(['DE', 'FR', 'PL', 'ES', 'IT']),
            'eta' => now()->addHours(rand(4, 48)),
            'status' => 'in_transit',
            'tracking_device_id' => 'DEV-' . fake()->numerify('######'),
            'speed_kmh' => fake()->randomFloat(2, 0, 90),
            'heading' => fake()->randomFloat(2, 0, 359),
            'temperature' => null,
            'battery_level' => fake()->numberBetween(20, 100),
            'last_update' => now()->subMinutes(rand(1, 30)),
            'route_waypoints' => null,
            'total_distance_km' => fake()->numberBetween(200, 2500),
            'remaining_distance_km' => fake()->numberBetween(50, 1500),
            'notes' => null,
        ];
    }

    public function inTransit(): static
    {
        return $this->state(fn () => [
            'status' => 'in_transit',
            'speed_kmh' => fake()->randomFloat(2, 60, 90),
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn () => [
            'status' => 'delivered',
            'speed_kmh' => 0,
            'remaining_distance_km' => 0,
            'eta' => now()->subHours(1),
        ]);
    }

    public function delayed(): static
    {
        return $this->state(fn () => [
            'status' => 'in_transit',
            'eta' => now()->subHours(2),
        ]);
    }

    public function withTemperature(): static
    {
        return $this->state(fn () => [
            'temperature' => fake()->randomFloat(2, -25, 8),
        ]);
    }

    public function atPickup(): static
    {
        return $this->state(fn () => [
            'status' => 'at_pickup',
            'speed_kmh' => 0,
        ]);
    }
}
