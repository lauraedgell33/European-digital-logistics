<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Tender;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenderFactory extends Factory
{
    protected $model = Tender::class;

    public function definition(): array
    {
        $startDate = now()->addDays(rand(7, 30));

        return [
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'title' => fake()->sentence(4) . ' Transport Tender',
            'description' => fake()->paragraph(3),
            'route_origin_country' => fake()->randomElement(['DE', 'FR', 'PL', 'NL', 'BE']),
            'route_origin_city' => fake()->city(),
            'route_destination_country' => fake()->randomElement(['ES', 'IT', 'RO', 'AT', 'CZ']),
            'route_destination_city' => fake()->city(),
            'additional_stops' => null,
            'cargo_type' => fake()->randomElement(['general', 'palletized', 'bulk', 'liquid', 'refrigerated']),
            'vehicle_type' => fake()->randomElement(['standard_truck', 'mega_trailer', 'refrigerated', 'tanker', 'flatbed']),
            'estimated_weight' => fake()->randomFloat(2, 1000, 24000),
            'estimated_volume' => fake()->randomFloat(2, 5, 90),
            'frequency' => fake()->randomElement(['one_time', 'daily', 'weekly', 'monthly']),
            'shipments_per_period' => fake()->numberBetween(1, 20),
            'start_date' => $startDate,
            'end_date' => $startDate->copy()->addMonths(rand(3, 12)),
            'submission_deadline' => now()->addDays(rand(5, 20)),
            'budget' => fake()->randomFloat(2, 5000, 100000),
            'currency' => 'EUR',
            'budget_type' => fake()->randomElement(['total', 'per_shipment', 'per_month']),
            'status' => 'open',
            'max_bidders' => fake()->randomElement([null, 5, 10, 20]),
            'is_public' => true,
            'evaluation_criteria' => [
                ['name' => 'Price', 'weight' => 40],
                ['name' => 'Transit Time', 'weight' => 30],
                ['name' => 'Reliability', 'weight' => 20],
                ['name' => 'Insurance', 'weight' => 10],
            ],
            'terms_conditions' => fake()->paragraph(2),
        ];
    }

    public function open(): static
    {
        return $this->state(fn () => [
            'status' => 'open',
            'submission_deadline' => now()->addDays(10),
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn () => [
            'status' => 'closed',
            'submission_deadline' => now()->subDays(2),
        ]);
    }

    public function awarded(): static
    {
        return $this->state(fn () => [
            'status' => 'awarded',
            'submission_deadline' => now()->subDays(5),
        ]);
    }

    public function private(): static
    {
        return $this->state(fn () => ['is_public' => false]);
    }
}
