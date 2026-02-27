<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\User;
use App\Models\VehicleOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleOfferFactory extends Factory
{
    protected $model = VehicleOffer::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'vehicle_type' => fake()->randomElement(['tautliner', 'box', 'refrigerated', 'flatbed', 'tanker']),
            'vehicle_registration' => strtoupper(fake()->bothify('??-###-??')),
            'capacity_kg' => fake()->randomFloat(2, 5000, 24000),
            'capacity_m3' => fake()->randomFloat(2, 20, 90),
            'pallet_spaces' => fake()->numberBetween(10, 33),
            'current_country' => fake()->randomElement(['DE', 'FR', 'PL', 'NL', 'BE']),
            'current_city' => fake()->city(),
            'available_from' => now(),
            'available_to' => now()->addDays(rand(7, 30)),
            'price_per_km' => fake()->randomFloat(2, 0.80, 2.50),
            'currency' => 'EUR',
            'status' => 'active',
            'is_public' => true,
            'driver_name' => fake()->name(),
            'driver_phone' => fake()->phoneNumber(),
        ];
    }
}
