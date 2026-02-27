<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\TransportOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransportOrderFactory extends Factory
{
    protected $model = TransportOrder::class;

    public function definition(): array
    {
        return [
            'order_number' => 'ORD-' . fake()->unique()->numerify('########'),
            'shipper_id' => Company::factory()->shipper(),
            'carrier_id' => Company::factory()->carrier(),
            'created_by' => User::factory(),
            'pickup_country' => fake()->randomElement(['DE', 'FR', 'PL', 'NL']),
            'pickup_city' => fake()->city(),
            'pickup_address' => fake()->streetAddress(),
            'pickup_postal_code' => fake()->postcode(),
            'pickup_contact_name' => fake()->name(),
            'pickup_contact_phone' => fake()->phoneNumber(),
            'pickup_date' => now()->addDays(rand(1, 14)),
            'delivery_country' => fake()->randomElement(['ES', 'IT', 'RO', 'BE']),
            'delivery_city' => fake()->city(),
            'delivery_address' => fake()->streetAddress(),
            'delivery_postal_code' => fake()->postcode(),
            'delivery_contact_name' => fake()->name(),
            'delivery_contact_phone' => fake()->phoneNumber(),
            'delivery_date' => now()->addDays(rand(15, 30)),
            'cargo_type' => fake()->randomElement(['general', 'palletized', 'bulk', 'container']),
            'weight' => fake()->randomFloat(2, 100, 24000),
            'volume' => fake()->randomFloat(2, 1, 90),
            'total_price' => fake()->randomFloat(2, 200, 5000),
            'currency' => 'EUR',
            'payment_terms' => fake()->randomElement(['prepaid', '30_days', '60_days']),
            'payment_status' => 'pending',
            'status' => 'pending',
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn () => [
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }

    public function inTransit(): static
    {
        return $this->state(fn () => [
            'status' => 'in_transit',
            'accepted_at' => now()->subDays(2),
            'picked_up_at' => now()->subDay(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'accepted_at' => now()->subDays(5),
            'picked_up_at' => now()->subDays(4),
            'delivered_at' => now()->subDays(1),
            'completed_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => 'Test cancellation',
        ]);
    }
}
