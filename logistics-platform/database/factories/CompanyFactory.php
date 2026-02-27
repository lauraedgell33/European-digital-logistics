<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'vat_number' => 'EU' . fake()->numerify('##########'),
            'registration_number' => fake()->numerify('REG-########'),
            'type' => fake()->randomElement(['shipper', 'carrier', 'forwarder']),
            'verification_status' => 'verified',
            'country_code' => fake()->randomElement(['DE', 'FR', 'PL', 'RO', 'ES', 'IT', 'NL', 'BE']),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'is_active' => true,
            'rating' => fake()->randomFloat(2, 3.0, 5.0),
        ];
    }

    public function shipper(): static
    {
        return $this->state(fn () => ['type' => 'shipper']);
    }

    public function carrier(): static
    {
        return $this->state(fn () => ['type' => 'carrier']);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['verification_status' => 'pending']);
    }
}
