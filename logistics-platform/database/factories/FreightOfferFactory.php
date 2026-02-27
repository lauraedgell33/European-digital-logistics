<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\FreightOffer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class FreightOfferFactory extends Factory
{
    protected $model = FreightOffer::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'origin_country' => fake()->randomElement(['DE', 'FR', 'PL', 'NL']),
            'origin_city' => fake()->city(),
            'origin_postal_code' => fake()->postcode(),
            'destination_country' => fake()->randomElement(['ES', 'IT', 'RO', 'BE']),
            'destination_city' => fake()->city(),
            'destination_postal_code' => fake()->postcode(),
            'cargo_type' => fake()->randomElement(['general', 'palletized', 'bulk']),
            'weight' => fake()->randomFloat(2, 100, 24000),
            'volume' => fake()->randomFloat(2, 1, 90),
            'loading_date' => now()->addDays(rand(1, 14)),
            'unloading_date' => now()->addDays(rand(15, 28)),
            'vehicle_type' => fake()->randomElement(['tautliner', 'box', 'refrigerated', 'flatbed']),
            'price' => fake()->randomFloat(2, 200, 5000),
            'currency' => 'EUR',
            'price_type' => 'fixed',
            'status' => 'active',
            'is_public' => true,
        ];
    }
}
