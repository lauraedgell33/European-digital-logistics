<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Tender;
use App\Models\TenderBid;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenderBidFactory extends Factory
{
    protected $model = TenderBid::class;

    public function definition(): array
    {
        return [
            'tender_id' => Tender::factory(),
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'proposed_price' => fake()->randomFloat(2, 1000, 50000),
            'currency' => 'EUR',
            'proposal' => fake()->paragraph(3),
            'transit_time_hours' => fake()->numberBetween(8, 96),
            'additional_services' => fake()->randomElement([
                null,
                'GPS tracking, insurance included',
                'Temperature monitoring, priority handling',
            ]),
            'pricing_breakdown' => [
                'base_price' => fake()->randomFloat(2, 800, 40000),
                'fuel_surcharge' => fake()->randomFloat(2, 50, 2000),
                'insurance' => fake()->randomFloat(2, 30, 500),
                'toll_costs' => fake()->randomFloat(2, 20, 300),
            ],
            'status' => 'submitted',
            'score' => null,
            'evaluation_notes' => null,
            'submitted_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'status' => 'draft',
            'submitted_at' => null,
        ]);
    }

    public function submitted(): static
    {
        return $this->state(fn () => [
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn () => [
            'status' => 'accepted',
            'score' => fake()->randomFloat(2, 70, 100),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => 'rejected',
            'score' => fake()->randomFloat(2, 20, 60),
            'evaluation_notes' => 'Price exceeded budget threshold.',
        ]);
    }
}
