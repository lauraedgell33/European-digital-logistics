<?php

namespace Database\Factories;

use App\Models\Shipment;
use App\Models\ShipmentEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShipmentEventFactory extends Factory
{
    protected $model = ShipmentEvent::class;

    public function definition(): array
    {
        return [
            'shipment_id' => Shipment::factory(),
            'event_type' => fake()->randomElement([
                'created', 'picked_up', 'in_transit', 'at_checkpoint',
                'customs_clearance', 'delayed', 'delivered', 'exception',
            ]),
            'description' => fake()->sentence(),
            'lat' => fake()->latitude(42, 55),
            'lng' => fake()->longitude(-5, 25),
            'location_name' => fake()->city() . ', ' . fake()->randomElement(['DE', 'FR', 'PL', 'ES']),
            'metadata' => null,
            'occurred_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ];
    }

    public function pickedUp(): static
    {
        return $this->state(fn () => [
            'event_type' => 'picked_up',
            'description' => 'Shipment picked up from origin location.',
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn () => [
            'event_type' => 'delivered',
            'description' => 'Shipment delivered successfully to destination.',
        ]);
    }

    public function delayed(): static
    {
        return $this->state(fn () => [
            'event_type' => 'delayed',
            'description' => fake()->randomElement([
                'Delayed due to traffic congestion.',
                'Weather-related delay.',
                'Customs inspection delay.',
                'Driver rest period.',
            ]),
            'metadata' => ['estimated_delay_hours' => fake()->numberBetween(1, 8)],
        ]);
    }

    public function checkpoint(): static
    {
        return $this->state(fn () => [
            'event_type' => 'at_checkpoint',
            'description' => 'Arrived at transit checkpoint.',
        ]);
    }
}
